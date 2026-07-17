const express = require("express");
const router = express.Router();
const Application = require("../models/Applications");
const User = require("../models/User");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const { check, validationResult } = require("express-validator");
const PDFDocument = require("pdfkit");

// @route   GET api/applications
// @desc    Get all applications (filtered by role)
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const query = {};

    // Filter applications based on user role
    if (req.user.role === "lawyer") {
      query.assignedLawyer = req.user.id;
    } else if (req.user.role === "user") {
      query.applicantId = req.user.id;
    } else if (req.user.role === "judge") {
      query.assignedJudge = req.user.id;
    }

    const applications = await Application.find(query)
      .populate("createdBy", "firstName lastName")
      .populate("applicantId", "firstName lastName")
      .populate("assignedJudge", "firstName lastName courtId")
      .populate("assignedLawyer", "firstName lastName barCouncilNumber")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/applications/:id
// @desc    Get application by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("createdBy", "firstName lastName")
      .populate("applicantId", "firstName lastName email phone address")
      .populate("assignedJudge", "firstName lastName courtId")
      .populate(
        "assignedLawyer",
        "firstName lastName barCouncilNumber email phone"
      );

    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    // Check if user has access to this application
    if (
      req.user.role === "lawyer" &&
      application.assignedLawyer?.toString() !== req.user.id &&
      req.user.role === "user" &&
      application.applicantId.toString() !== req.user.id &&
      req.user.role === "judge" &&
      application.assignedJudge?.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: "Access denied" });
    }

    res.json(application);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Application not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route   POST api/applications
// @desc    Create a new application
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      check("applicant.name", "Applicant name is required").not().isEmpty(),
      check("applicant.age", "Applicant age is required").isNumeric(),
      check("applicant.gender", "Applicant gender is required").not().isEmpty(),
      check("applicant.address", "Applicant address is required")
        .not()
        .isEmpty(),
      check("case.firNumber", "FIR number is required").not().isEmpty(),
      check("case.policeStation", "Police station is required").not().isEmpty(),
      check("case.court", "Court is required").not().isEmpty(),
      check("case.sections", "Sections are required").isArray(),
      check("case.allegations", "Allegations are required").not().isEmpty(),
      check("bail.grounds", "Bail grounds are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        applicant,
        case: caseDetails,
        bail,
        status,
        applicantId,
        assignedJudge,
        assignedLawyer,
        hearingDate,
        notes,
      } = req.body;

      // Create new application
      const newApplication = new Application({
        applicant,
        case: caseDetails,
        bail,
        status: status || "Pending",
        createdBy: req.user.id,
        applicantId: applicantId || req.user.id,
      });

      // If judge is specified, assign it
      if (assignedJudge) {
        const judge = await User.findOne({ _id: assignedJudge, role: "judge" });
        if (judge) {
          newApplication.assignedJudge = assignedJudge;
        }
      } else {
        // Auto-assign a judge if none specified
        const judge = await User.findOne({ role: "judge" }).sort({ _id: 1 });
        if (judge) {
          newApplication.assignedJudge = judge._id;
        }
      }

      // If lawyer is specified, assign it
      if (assignedLawyer) {
        const lawyer = await User.findOne({
          _id: assignedLawyer,
          role: "lawyer",
        });
        if (lawyer) {
          newApplication.assignedLawyer = assignedLawyer;
        }
      } else if (req.user.role === "lawyer") {
        // If the creator is a lawyer, assign themselves
        newApplication.assignedLawyer = req.user.id;
      }

      // If hearing date is specified, set it
      if (hearingDate) {
        newApplication.hearingDate = hearingDate;
      }

      // If notes are specified, add them
      if (notes) {
        newApplication.notes = notes;
      }

      // Add initial update
      newApplication.updates.push({
        description: "Application created",
        updatedBy: req.user.id,
      });

      const savedApplication = await newApplication.save();

      res.json(savedApplication);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   PUT api/applications/:id
// @desc    Update an application
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    // Check if user has access to update this application
    if (
      req.user.role === "lawyer" &&
      application.assignedLawyer?.toString() !== req.user.id &&
      req.user.role === "user" &&
      application.applicantId.toString() !== req.user.id &&
      req.user.role === "judge" &&
      application.assignedJudge?.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Update fields based on role
    const { status, notes, hearingDate, assignedJudge, assignedLawyer } =
      req.body;

    // Update status if provided
    if (status && (req.user.role === "judge" || req.user.role === "admin")) {
      application.status = status;
    }

    // Update hearing date if provided
    if (
      hearingDate &&
      (req.user.role === "judge" || req.user.role === "admin")
    ) {
      application.hearingDate = hearingDate;
    }

    // Update assigned judge if provided
    if (assignedJudge && req.user.role === "admin") {
      application.assignedJudge = assignedJudge;
    }

    // Update assigned lawyer if provided
    if (
      assignedLawyer &&
      (req.user.role === "admin" || req.user.role === "judge")
    ) {
      application.assignedLawyer = assignedLawyer;
    }

    // Add notes if provided
    if (notes) {
      application.notes = notes;
    }

    // Add update to history
    application.updates.push({
      description: `Application updated by ${req.user.role}`,
      updatedBy: req.user.id,
    });

    const updatedApplication = await application.save();

    res.json(updatedApplication);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Application not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route   GET api/applications/:id/download
// @desc    Download application as PDF or DOCX
// @access  Private
router.get("/:id/download", auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("createdBy", "firstName lastName")
      .populate("applicantId", "firstName lastName")
      .populate("assignedJudge", "firstName lastName courtId")
      .populate("assignedLawyer", "firstName lastName barCouncilNumber");

    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    // Check if user has access to this application
    if (
      req.user.role === "lawyer" &&
      application.assignedLawyer?.toString() !== req.user.id &&
      req.user.role === "user" &&
      application.applicantId.toString() !== req.user.id &&
      req.user.role === "judge" &&
      application.assignedJudge?.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const format = req.query.format || "PDF";

    if (format.toUpperCase() === "PDF") {
      // Generate PDF
      const doc = new PDFDocument();
      const filename = `bail-application-${application.applicationNumber.replace(
        /\//g,
        "-"
      )}.pdf`;

      // Set response headers
      res.setHeader("Content-disposition", `attachment; filename=${filename}`);
      res.setHeader("Content-type", "application/pdf");

      // Pipe the PDF to the response
      doc.pipe(res);

      // Add content to the PDF
      doc
        .fontSize(16)
        .text(
          `IN THE COURT OF ${application.case.court.toUpperCase()}, DELHI`,
          { align: "center" }
        );
      doc
        .fontSize(12)
        .text(`Bail Application No. ${application.applicationNumber}`, {
          align: "center",
        });
      doc.moveDown(2);

      doc.text("IN THE MATTER OF:");
      doc
        .fontSize(12)
        .text(
          `${application.applicant.name} s/o Sh. _______, aged ${application.applicant.age} years,`
        );
      doc.text(`r/o ${application.applicant.address}`);
      doc.text("...APPLICANT/ACCUSED", { align: "right" });
      doc.moveDown();
      doc.text("VERSUS");
      doc.text("State (NCT of Delhi)");
      doc.text("...RESPONDENT", { align: "right" });
      doc.moveDown(2);

      doc.fontSize(14).text("APPLICATION FOR REGULAR BAIL U/S 439 Cr.P.C.", {
        align: "center",
      });
      doc.moveDown();
      doc.fontSize(12).text("MOST RESPECTFULLY SHOWETH:");
      doc.moveDown();

      // Add grounds
      doc.text(
        `1. That the applicant/accused has been arrested in case FIR No. ${
          application.case.firNumber
        }, PS ${
          application.case.policeStation
        }, Delhi, under Sections ${application.case.sections.join(", ")}.`
      );
      doc.moveDown();
      doc.text(
        `2. That the applicant/accused is in ${
          application.case.custodyStatus
        } custody since ${new Date(
          application.case.arrestDate
        ).toLocaleDateString()} (${application.case.custodyPeriod}).`
      );
      doc.moveDown();
      doc.text(`3. ${application.bail.grounds}`);
      doc.moveDown(2);

      doc.text("PRAYER:");
      doc.moveDown();
      doc.text(
        "It is, therefore, most respectfully prayed that this Hon'ble Court may be pleased to:"
      );
      doc.moveDown();
      doc.text(
        "1. Release the applicant/accused on regular bail on such terms and conditions as this Hon'ble Court may deem fit and proper."
      );
      doc.moveDown();
      doc.text(
        "2. Pass any other order which this Hon'ble Court may deem fit and proper in the interest of justice."
      );
      doc.moveDown(2);

      // Add signature section
      doc.text(`Place: Delhi`, { align: "left" });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: "left" });
      doc.moveDown();
      doc.text("THROUGH", { align: "right" });
      doc.moveDown();
      doc.text("ADVOCATE FOR THE APPLICANT", { align: "right" });

      // Finalize the PDF
      doc.end();
    } else {
      // For DOCX or other formats, just send a JSON response for now
      // In a real implementation, you would generate the appropriate file
      res.json({
        message: `${format} download not implemented yet. Please use PDF format.`,
      });
    }
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Application not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route   POST api/applications/:id/share
// @desc    Share application via email
// @access  Private
router.post("/:id/share", auth, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const application = await Application.findById(req.params.id)
      .populate("createdBy", "firstName lastName")
      .populate("applicantId", "firstName lastName")
      .populate("assignedJudge", "firstName lastName courtId")
      .populate("assignedLawyer", "firstName lastName barCouncilNumber");

    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    // Check if user has access to this application
    if (
      req.user.role === "lawyer" &&
      application.assignedLawyer?.toString() !== req.user.id &&
      req.user.role === "user" &&
      application.applicantId.toString() !== req.user.id &&
      req.user.role === "judge" &&
      application.assignedJudge?.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // In a real implementation, you would send an email here
    // For now, just return a success message
    res.json({
      success: true,
      message: `Application shared with ${email}`,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Application not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route   GET api/applications/judge/pending
// @desc    Get all pending applications for a judge
// @access  Private (Judge only)
router.get("/judge/pending", [auth, roleCheck(["judge"])], async (req, res) => {
  try {
    const applications = await Application.find({
      assignedJudge: req.user.id,
      status: "Pending",
    })
      .populate("createdBy", "firstName lastName")
      .populate("applicantId", "firstName lastName")
      .populate("assignedLawyer", "firstName lastName barCouncilNumber")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;