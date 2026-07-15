const express = require("express")
const router = express.Router()
const Hearing = require("../models/Hearing")
const Case = require("../models/Case")
const auth = require("../middleware/auth")
const roleCheck = require("../middleware/roleCheck")

// @route   GET api/hearings
// @desc    Get all hearings (filtered by role)
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const query = {}

    // Filter hearings based on user role
    if (req.user.role === "judge") {
      query.judge = req.user.id
    } else {
      // For lawyers and users, we need to find cases first
      const caseQuery = {}

      if (req.user.role === "lawyer") {
        caseQuery.lawyer = req.user.id
      } else if (req.user.role === "user") {
        caseQuery.applicant = req.user.id
      }

      const cases = await Case.find(caseQuery).select("_id")
      const caseIds = cases.map((c) => c._id)

      query.caseId = { $in: caseIds }
    }

    const hearings = await Hearing.find(query)
      .populate({
        path: "caseId",
        select: "caseNumber applicant lawyer status",
        populate: [
          { path: "applicant", select: "firstName lastName" },
          { path: "lawyer", select: "firstName lastName" },
        ],
      })
      .populate("judge", "firstName lastName")
      .sort({ date: 1, time: 1 })

    res.json(hearings)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   GET api/hearings/:id
// @desc    Get hearing by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const hearing = await Hearing.findById(req.params.id)
      .populate({
        path: "caseId",
        select: "caseNumber applicant lawyer status sections allegations",
        populate: [
          { path: "applicant", select: "firstName lastName" },
          { path: "lawyer", select: "firstName lastName barCouncilNumber" },
        ],
      })
      .populate("judge", "firstName lastName courtId")

    if (!hearing) {
      return res.status(404).json({ msg: "Hearing not found" })
    }

    // Check if user has access to this hearing
    const caseItem = await Case.findById(hearing.caseId._id)

    if (
      req.user.role === "lawyer" &&
      caseItem.lawyer.toString() !== req.user.id &&
      req.user.role === "user" &&
      caseItem.applicant.toString() !== req.user.id &&
      req.user.role === "judge" &&
      hearing.judge.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: "Access denied" })
    }

    res.json(hearing)
  } catch (err) {
    console.error(err.message)
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Hearing not found" })
    }
    res.status(500).send("Server error")
  }
})

// @route   POST api/hearings
// @desc    Create a new hearing
// @access  Private (Judge only)
router.post("/", [auth, roleCheck(["judge"])], async (req, res) => {
  try {
    const { caseId, date, time, purpose, notes } = req.body

    // Check if case exists
    const caseItem = await Case.findById(caseId)
    if (!caseItem) {
      return res.status(404).json({ msg: "Case not found" })
    }

    // Create new hearing
    const newHearing = new Hearing({
      caseId,
      date,
      time,
      court: caseItem.court,
      judge: req.user.id,
      purpose,
      notes,
      attendees: [
        { user: caseItem.applicant, role: "Applicant" },
        { user: caseItem.lawyer, role: "Lawyer" },
        { user: req.user.id, role: "Judge" },
      ],
    })

    const hearing = await newHearing.save()

    // Update case with hearing reference
    caseItem.hearings.push(hearing._id)
    caseItem.status = "Scheduled"
    await caseItem.save()

    res.json(hearing)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   PUT api/hearings/:id
// @desc    Update a hearing
// @access  Private (Judge only)
router.put("/:id", [auth, roleCheck(["judge"])], async (req, res) => {
  try {
    const hearing = await Hearing.findById(req.params.id)

    if (!hearing) {
      return res.status(404).json({ msg: "Hearing not found" })
    }

    // Check if user is the assigned judge
    if (hearing.judge.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Access denied" })
    }

    const { date, time, status, purpose, notes, outcome, nextHearingDate, attendees } = req.body

    // Update fields
    if (date) hearing.date = date
    if (time) hearing.time = time
    if (status) hearing.status = status
    if (purpose) hearing.purpose = purpose
    if (notes) hearing.notes = notes
    if (outcome) hearing.outcome = outcome
    if (nextHearingDate) hearing.nextHearingDate = nextHearingDate
    if (attendees) hearing.attendees = attendees

    const updatedHearing = await hearing.save()

    // If hearing is completed and has an outcome, update the case status
    if (status === "Completed" && outcome) {
      const caseItem = await Case.findById(hearing.caseId)
      if (outcome.includes("Approved")) {
        caseItem.status = "Approved"
      } else if (outcome.includes("Rejected")) {
        caseItem.status = "Rejected"
      }

      // Add update to case history
      caseItem.updates.push({
        description: `Hearing completed with outcome: ${outcome}`,
        updatedBy: req.user.id,
      })

      await caseItem.save()
    }

    res.json(updatedHearing)
  } catch (err) {
    console.error(err.message)
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Hearing not found" })
    }
    res.status(500).send("Server error")
  }
})

module.exports = router
