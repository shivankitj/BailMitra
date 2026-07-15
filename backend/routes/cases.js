const express = require("express");
const router = express.Router();
const Case = require("../models/Case");
const User = require("../models/User");
const RiskAssessment = require("../models/RiskAssessment");
const Hearing = require("../models/Hearing"); // Import Hearing model
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

// @route   GET api/cases
// @desc    Get all cases (filtered by role)
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const query = {};

    // Filter cases based on user role
    if (req.user.role === "lawyer") {
      query.lawyer = req.user.id;
    } else if (req.user.role === "user") {
      query.applicant = req.user.id;
    } else if (req.user.role === "judge") {
      query.judge = req.user.id;
    }

    const cases = await Case.find(query)
      .populate("applicant", "firstName lastName")
      .populate("lawyer", "firstName lastName barCouncilNumber")
      .populate("defendant", "firstName lastName")
      .populate("judge", "firstName lastName courtId")
      .populate("riskAssessment")
      .sort({ filingDate: -1 });

    res.json(cases);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/cases/:id
// @desc    Get case by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id)
      .populate("applicant", "firstName lastName email phone address")
      .populate("lawyer", "firstName lastName barCouncilNumber email phone")
      .populate("judge", "firstName lastName courtId")
      .populate("riskAssessment")
      .populate("hearings");

    if (!caseItem) {
      return res.status(404).json({ msg: "Case not found" });
    }

    // Check if user has access to this case
    if (
      (req.user.role === "lawyer" && caseItem.lawyer?.toString() !== req.user.id) ||
      (req.user.role === "user" && caseItem.applicant?.toString() !== req.user.id) ||
      (req.user.role === "judge" && caseItem.judge?.toString() !== req.user.id)
    ) {
      return res.status(403).json({ msg: "Access denied" });
    }

    res.json(caseItem);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Case not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route   POST api/cases
// @desc    Create a new case
// @access  Private (Lawyer only)
router.post("/", [auth, roleCheck(["lawyer"])], async (req, res) => {
  try {
    const {
      applicantId,
      court,
      offenseType,
      sections,
      allegations,
      arrestDate,
      custodyStatus,
      custodyPeriod,
      bailGrounds,
      proposedBailConditions,
      dcmCategory,
    } = req.body;

    // Generate a unique case number
    const date = new Date();
    const year = date.getFullYear();
    const count = await Case.countDocuments();
    const caseNumber = `BA-${count + 1}/${year}`;

    const newCase = new Case({
      caseNumber,
      applicant: applicantId,
      lawyer: req.user.id,
      court,
      filingDate: Date.now(),
      offenseType,
      sections,
      allegations,
      arrestDate,
      custodyStatus,
      custodyPeriod,
      bailGrounds,
      proposedBailConditions,
      dcmCategory,
    });

    const savedCase = await newCase.save();

    res.json(savedCase);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PUT api/cases/:id
// @desc    Update a case
// @access  Private (Lawyer or Judge)
router.put("/:id", [auth, roleCheck(["lawyer", "judge"])], async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({ msg: "Case not found" });
    }

    // Check if user has access to update this case
    if (
      (req.user.role === "lawyer" && caseItem.lawyer?.toString() !== req.user.id) ||
      (req.user.role === "judge" && caseItem.judge?.toString() !== req.user.id)
    ) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Update fields based on role
    if (req.user.role === "lawyer") {
      // Lawyers can update certain fields
      const { bailGrounds, proposedBailConditions, documents } = req.body;

      if (bailGrounds) caseItem.bailGrounds = bailGrounds;
      if (proposedBailConditions)
        caseItem.proposedBailConditions = proposedBailConditions;
      if (documents) caseItem.documents = documents;
    } else if (req.user.role === "judge") {
      // Judges can update status and add updates
      const { status, notes } = req.body;

      if (status) caseItem.status = status;

      // Add update to case history
      if (notes) {
        caseItem.updates.push({
          description: notes,
          updatedBy: req.user.id,
        });
      }
    }

    // Common updates for both roles
    if (req.body.dcmCategory) caseItem.dcmCategory = req.body.dcmCategory;

    const updatedCase = await caseItem.save();

    res.json(updatedCase);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Case not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route   GET api/cases/judge/calendar
// @desc    Get judge's calendar of cases
// @access  Private (Judge only)
router.get(
  "/judge/calendar",
  [auth, roleCheck(["judge"])],
  async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const hearings = await Hearing.find({
        judge: req.user.id,
        date: { $gte: today },
      })
        .populate({
          path: "caseId",
          select: "caseNumber applicant lawyer status dcmCategory",
          populate: [
            { path: "applicant", select: "firstName lastName" },
            { path: "lawyer", select: "firstName lastName barCouncilNumber" },
          ],
        })
        .sort({ date: 1 });

      res.json(hearings);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   GET api/cases/today
// @desc    Get today's cases
// @access  Private (Judge only)
router.get("/judge/today", [auth, roleCheck(["judge"])], async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const hearings = await Hearing.find({
      judge: req.user.id,
      date: { $gte: today, $lt: tomorrow },
    })
      .populate({
        path: "caseId",
        select: "caseNumber applicant lawyer status dcmCategory riskAssessment",
        populate: [
          { path: "applicant", select: "firstName lastName" },
          { path: "lawyer", select: "firstName lastName barCouncilNumber" },
          { path: "riskAssessment" },
        ],
      })
      .sort({ time: 1 });

    // Group by DCM category
    const groupedHearings = {
      Expedited: hearings.filter((h) => h.caseId.dcmCategory === "Expedited"),
      Standard: hearings.filter((h) => h.caseId.dcmCategory === "Standard"),
      Complex: hearings.filter((h) => h.caseId.dcmCategory === "Complex"),
    };

    res.json(groupedHearings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/cases/:id/history
// @desc    Get case history and accused past cases
// @access  Private (Judge only)
router.get("/:id/history", [auth, roleCheck(["judge"])], async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id)
      .populate("applicant", "firstName lastName")
      .populate("riskAssessment");

    if (!caseItem) {
      return res.status(404).json({ msg: "Case not found" });
    }

    // Get past cases for the same applicant
    const pastCases = await Case.find({
      applicant: caseItem.applicant._id,
      _id: { $ne: req.params.id },
    })
      .select("caseNumber status filingDate court sections allegations")
      .sort({ filingDate: -1 });

    res.json({
      currentCase: caseItem,
      pastCases,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Case not found" });
    }
    res.status(500).send("Server error");
  }
});

module.exports = router;