const mongoose = require("mongoose")

const RiskAssessmentSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assessmentDate: {
      type: Date,
      default: Date.now,
    },
    overallScore: {
      type: Number,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    factors: [
      {
        name: {
          type: String,
          required: true,
        },
        score: {
          type: Number,
          required: true,
        },
        weight: {
          type: Number,
          required: true,
        },
        weightedScore: {
          type: Number,
          required: true,
        },
        direction: {
          type: String,
          enum: ["positive", "negative"],
          required: true,
        },
      },
    ],
    criminalHistory: {
      level: {
        type: String,
        enum: ["low", "medium", "high"],
        required: true,
      },
      details: {
        type: String,
      },
    },
    flightRisk: {
      level: {
        type: String,
        enum: ["low", "medium", "high"],
        required: true,
      },
      details: {
        type: String,
      },
    },
    severityOfCharges: {
      level: {
        type: String,
        enum: ["low", "medium", "high"],
        required: true,
      },
      details: {
        type: String,
      },
    },
    socialEconomicBackground: {
      level: {
        type: String,
        enum: ["low", "medium", "high"],
        required: true,
      },
      details: {
        type: String,
      },
    },
    recommendation: {
      type: String,
      required: true,
    },
    similarCases: [
      {
        caseNumber: {
          type: String,
        },
        court: {
          type: String,
        },
        outcome: {
          type: String,
          enum: ["Approved", "Rejected"],
        },
        similarity: {
          type: Number,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("RiskAssessment", RiskAssessmentSchema)
