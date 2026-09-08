/**
 * Policy Model
 * Stores uploaded insurance policy PDF metadata and extracted structured analysis
 */

const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    // User who uploaded the insurance policy
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    extractedText: {
      type: String,
      default: "",
    },

    // ── Structured Insurance Information ─────────────────────────────────────
    structuredPolicy: {
      executiveSummary: { type: String, default: null },
      coveredBenefits: { type: [String], default: [] },
      insurer: { type: String, default: null },
      policyType: { type: String, default: null },
      policyNumber: { type: String, default: null },
      sumInsured: { type: Number, default: null },
      roomEligibility: { type: String, default: null },
      networkRequirement: { type: Boolean, default: null },
      cashlessAvailable: { type: Boolean, default: null },
      preHospitalizationDays: { type: Number, default: null },
      postHospitalizationDays: { type: Number, default: null },
      exclusions: { type: [String], default: [] },
      waitingPeriods: { type: [String], default: [] },
      importantClauses: { type: [String], default: [] },
      financialConditions: { type: [String], default: [] },
      claimRequirements: { type: [String], default: [] },
      verificationItems: { type: [String], default: [] },
    },

    summaryText: {
      type: String,
      default: "",
    },

    disclaimerText: {
      type: String,
      default: "",
    },

    nullFields: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Policy", policySchema);
