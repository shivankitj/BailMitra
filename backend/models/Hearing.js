const mongoose = require("mongoose")

const HearingSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    court: {
      type: String,
      required: true,
    },
    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Adjourned", "Cancelled"],
      default: "Scheduled",
    },
    purpose: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    outcome: {
      type: String,
    },
    nextHearingDate: {
      type: Date,
    },
    attendees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
        },
        attended: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Hearing", HearingSchema)
