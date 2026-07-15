const express = require("express")
const router = express.Router()
const RiskAssessment = require("../models/RiskAssessment")
const Case = require("../models/Case")
const auth = require("../middleware/auth")
const roleCheck = require("../middleware/roleCheck")

// @route   GET api/risk-assessment/:caseId
// @desc    Get risk assessment for a case
// @access  Private
router.get("/:caseId", auth, async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.caseId)

    if (!caseItem) {
      return res.status(404).json({ msg: "Case not found" })
    }

    // Check if user has access to this case
    if (
      (req.user.role === "lawyer" && caseItem.lawyer?.toString() !== req.user.id) ||
      (req.user.role === "user" && caseItem.applicant?.toString() !== req.user.id) ||
      (req.user.role === "judge" && caseItem.judge && caseItem.judge.toString() !== req.user.id)
    ) {
      return res.status(403).json({ msg: "Access denied" })
    }

    const riskAssessment = await RiskAssessment.findOne({ caseId: req.params.caseId })

    if (!riskAssessment) {
      return res.status(404).json({ msg: "Risk assessment not found" })
    }

    res.json(riskAssessment)
  } catch (err) {
    console.error(err.message)
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Case not found" })
    }
    res.status(500).send("Server error")
  }
})

// @route   POST api/risk-assessment/:caseId
// @desc    Create or update risk assessment for a case
// @access  Private (Lawyer or Judge)
router.post("/:caseId", [auth, roleCheck(["lawyer", "judge"])], async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.caseId)

    if (!caseItem) {
      return res.status(404).json({ msg: "Case not found" })
    }

    // Check if user has access to this case
    if (
      (req.user.role === "lawyer" && caseItem.lawyer?.toString() !== req.user.id) ||
      (req.user.role === "judge" && caseItem.judge && caseItem.judge.toString() !== req.user.id)
    ) {
      return res.status(403).json({ msg: "Access denied" })
    }

    const {
      criminalHistory,
      flightRisk,
      severityOfCharges,
      socialEconomicBackground,
      factors,
      overallScore,
      riskLevel,
      recommendation,
      similarCases,
    } = req.body

    // Check if risk assessment already exists
    let riskAssessment = await RiskAssessment.findOne({ caseId: req.params.caseId })

    if (riskAssessment) {
      // Update existing assessment
      riskAssessment.assessedBy = req.user.id
      riskAssessment.assessmentDate = Date.now()
      riskAssessment.overallScore = overallScore
      riskAssessment.riskLevel = riskLevel
      riskAssessment.factors = factors
      riskAssessment.criminalHistory = criminalHistory
      riskAssessment.flightRisk = flightRisk
      riskAssessment.severityOfCharges = severityOfCharges
      riskAssessment.socialEconomicBackground = socialEconomicBackground
      riskAssessment.recommendation = recommendation
      if (similarCases) riskAssessment.similarCases = similarCases
    } else {
      // Create new assessment
      riskAssessment = new RiskAssessment({
        caseId: req.params.caseId,
        applicantId: caseItem.applicant,
        assessedBy: req.user.id,
        overallScore,
        riskLevel,
        factors,
        criminalHistory,
        flightRisk,
        severityOfCharges,
        socialEconomicBackground,
        recommendation,
        similarCases,
      })
    }

    const savedAssessment = await riskAssessment.save()

    // Update case with risk assessment reference
    if (!caseItem.riskAssessment) {
      caseItem.riskAssessment = savedAssessment._id
      await caseItem.save()
    }

    res.json(savedAssessment)
  } catch (err) {
    console.error(err.message)
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Case not found" })
    }
    res.status(500).send("Server error")
  }
})

// @route   GET api/risk-assessment/calculate/:caseId
// @desc    Calculate risk assessment for a case
// @access  Private (Lawyer or Judge)
router.get("/calculate/:caseId", [auth, roleCheck(["lawyer", "judge"])], async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.caseId).populate("applicant", "firstName lastName")

    if (!caseItem) {
      return res.status(404).json({ msg: "Case not found" })
    }

    // Check if user has access to this case
    if (
      (req.user.role === "lawyer" && caseItem.lawyer?.toString() !== req.user.id) ||
      (req.user.role === "judge" && caseItem.judge && caseItem.judge.toString() !== req.user.id)
    ) {
      return res.status(403).json({ msg: "Access denied" })
    }

    // Get similar cases for comparison
    const similarCases = await Case.find({
      sections: { $in: caseItem.sections },
      _id: { $ne: caseItem.id },
      status: { $in: ["Approved", "Rejected"] },
    })
      .limit(4)
      .select("caseNumber court status")

    // Calculate similarity percentage (simplified)
    const mappedSimilarCases = similarCases.map((sc) => ({
      caseNumber: sc.caseNumber,
      court: sc.court,
      outcome: sc.status,
      similarity: Math.floor(Math.random() * 20) + 70, // Random similarity between 70-90%
    }))

    // Calculate risk factors based on case details
    // This is a simplified calculation - in a real system, this would be more sophisticated
    const criminalHistoryLevel = Math.random() < 0.5 ? "low" : Math.random() < 0.7 ? "medium" : "high"
    const flightRiskLevel = Math.random() < 0.6 ? "low" : Math.random() < 0.8 ? "medium" : "high"
    const severityLevel =
      caseItem.offenseType === "bailable" ? "low" : caseItem.offenseType === "non-bailable" ? "high" : "medium"
    const socialLevel = Math.random() < 0.5 ? "low" : Math.random() < 0.7 ? "medium" : "high"

    // Calculate scores
    const getScoreValue = (level) => {
      switch (level) {
        case "low":
          return 1
        case "medium":
          return 2
        case "high":
          return 3
        default:
          return 1
      }
    }

    const weights = {
      criminalHistory: 0.3,
      flightRisk: 0.25,
      severityOfCharges: 0.3,
      socialEconomic: 0.15,
    }

    const factors = [
      {
        name: "Criminal History",
        score: getScoreValue(criminalHistoryLevel),
        weight: weights.criminalHistory,
        weightedScore: getScoreValue(criminalHistoryLevel) * weights.criminalHistory,
        direction: criminalHistoryLevel === "low" ? "positive" : "negative",
      },
      {
        name: "Flight Risk",
        score: getScoreValue(flightRiskLevel),
        weight: weights.flightRisk,
        weightedScore: getScoreValue(flightRiskLevel) * weights.flightRisk,
        direction: flightRiskLevel === "low" ? "positive" : "negative",
      },
      {
        name: "Severity of Charges",
        score: getScoreValue(severityLevel),
        weight: weights.severityOfCharges,
        weightedScore: getScoreValue(severityLevel) * weights.severityOfCharges,
        direction: severityLevel === "low" ? "positive" : "negative",
      },
      {
        name: "Social/Economic Background",
        score: getScoreValue(socialLevel),
        weight: weights.socialEconomic,
        weightedScore: getScoreValue(socialLevel) * weights.socialEconomic,
        direction: socialLevel === "low" ? "positive" : "negative",
      },
    ]

    const overallScore = factors.reduce((sum, factor) => sum + factor.weightedScore, 0)

    let riskLevel
    if (overallScore < 1.5) {
      riskLevel = "Low"
    } else if (overallScore < 2.5) {
      riskLevel = "Medium"
    } else {
      riskLevel = "High"
    }

    const applicantName = caseItem.applicant
      ? `${caseItem.applicant.firstName} ${caseItem.applicant.lastName}`
      : "Accused";

    // Generate recommendation based on risk level
    let recommendation
    switch (riskLevel) {
      case "Low":
        recommendation = `The accused ${applicantName} presents a low risk level. Consider granting bail with standard conditions such as regular reporting to the police station.`
        break
      case "Medium":
        recommendation = `The accused ${applicantName} presents a medium risk level. Consider imposing conditions such as regular reporting to the police station, surrender of passport, and a substantial surety bond.`
        break
      case "High":
        recommendation = `The accused ${applicantName} presents a high risk level. Bail may not be recommended due to significant flight risk, severity of charges, and/or criminal history. If bail is considered, strict conditions should be imposed.`
        break
    }

    const riskAssessment = {
      caseId: req.params.caseId,
      applicantId: caseItem.applicant ? caseItem.applicant._id : null,
      assessedBy: req.user.id,
      overallScore,
      riskLevel,
      factors,
      criminalHistory: {
        level: criminalHistoryLevel,
        details: `${criminalHistoryLevel === "low" ? "No" : criminalHistoryLevel === "medium" ? "Some" : "Extensive"} prior criminal record`,
      },
      flightRisk: {
        level: flightRiskLevel,
        details: `${flightRiskLevel === "low" ? "Strong" : flightRiskLevel === "medium" ? "Moderate" : "Weak"} community ties`,
      },
      severityOfCharges: {
        level: severityLevel,
        details: `${severityLevel === "low" ? "Minor" : severityLevel === "medium" ? "Moderate" : "Serious"} offense`,
      },
      socialEconomicBackground: {
        level: socialLevel,
        details: `${socialLevel === "low" ? "Stable" : socialLevel === "medium" ? "Moderate" : "Unstable"} social and economic background`,
      },
      recommendation,
      similarCases: mappedSimilarCases,
    }

    res.json(riskAssessment)
  } catch (err) {
    console.error("DEBUG ERROR in calculate:", err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Case not found" })
    }
    res.status(500).json({ msg: "Server error", error: err.message, stack: err.stack })
  }
})

module.exports = router
