const mongoose = require("mongoose");

const CaseSchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    defendant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    court: {
      type: String,
      required: true,
    },
    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    filingDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Scheduled", "Approved", "Rejected"],
      default: "Pending",
    },
    offenseType: {
      type: String,
      required: true,
    },
    sections: {
      type: [String],
      required: true,
    },
    allegations: {
      type: String,
      required: true,
    },
    arrestDate: {
      type: Date,
    },
    custodyStatus: {
      type: String,
      enum: ["Police Custody", "Judicial Custody", "Not Arrested"],
    },
    custodyPeriod: {
      type: Number, // in days
    },
    bailGrounds: {
      type: String,
    },
    previousBailApplications: {
      type: Number,
      default: 0,
    },
    proposedBailConditions: {
      type: [String],
    },
    riskAssessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RiskAssessment",
    },
    hearings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hearing",
      },
    ],
    updates: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        description: {
          type: String,
          required: true,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    documents: [
      {
        name: {
          type: String,
          required: true,
        },
        fileUrl: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    dcmCategory: {
      type: String,
      enum: ["Standard", "Complex", "Expedited"],
      default: "Standard",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Case", CaseSchema);