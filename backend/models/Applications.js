const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    applicant: {
      name: {
        type: String,
        required: true,
      },
      age: {
        type: Number,
        required: true,
      },
      gender: {
        type: String,
        required: true,
      },
      occupation: {
        type: String,
      },
      address: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
      },
      email: {
        type: String,
      },
    },
    case: {
      firNumber: {
        type: String,
        required: true,
      },
      policeStation: {
        type: String,
        required: true,
      },
      court: {
        type: String,
        required: true,
      },
      arrestDate: {
        type: Date,
      },
      sections: {
        type: [String],
        required: true,
      },
      allegations: {
        type: String,
        required: true,
      },
      custodyStatus: {
        type: String,
        enum: ["police", "judicial", "not-arrested"],
      },
      custodyPeriod: {
        type: String,
      },
    },
    bail: {
      grounds: {
        type: String,
        required: true,
      },
      previousApplications: {
        type: String,
        enum: ["none", "one", "multiple"],
        default: "none",
      },
      proposedConditions: {
        type: String,
      },
      customConditions: {
        type: String,
      },
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    applicationNumber: {
      type: String,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedJudge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedLawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    hearingDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
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
  },
  {
    timestamps: true,
  }
);

// Generate application number before saving
ApplicationSchema.pre("save", async function (next) {
  if (!this.applicationNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const count = await mongoose.model("Application").countDocuments();
    this.applicationNumber = `BA-${count + 1}/${year}`;
  }
  next();
});

module.exports = mongoose.model("Application", ApplicationSchema);