/**
 * Resume Model
 * Stores uploaded resume data and analysis results for each user
 */

const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    // Reference to the user who uploaded this resume
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Original filename of the uploaded PDF
    fileName: {
      type: String,
      required: true,
    },

    // Path where the file is stored on the server
    filePath: {
      type: String,
      required: true,
    },

    // Raw extracted text from the PDF
    extractedText: {
      type: String,
      default: "",
    },

    // ─── Analysis Results ───────────────────────────────────────────────────

    // ATS compatibility score (0–100)
    atsScore: {
      type: Number,
      default: 0,
    },

    // Skills detected in the resume
    detectedSkills: {
      type: [String],
      default: [],
    },

    // Skills that are commonly expected but missing from the resume
    missingSkills: {
      type: [String],
      default: [],
    },

    // Keywords found in the resume
    keywords: {
      type: [String],
      default: [],
    },

    // Short summary / feedback about the resume
    feedback: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resume", resumeSchema);
