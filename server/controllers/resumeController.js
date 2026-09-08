/**
 * Resume Controller
 * Handles PDF upload, text extraction, analysis, and history retrieval
 */

const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const Resume = require("../models/Resume");
const analyzeResume = require("../utils/analyzeResume");

// ─── Upload & Analyze Resume ──────────────────────────────────────────────────

/**
 * POST /api/resume/upload
 * Upload a PDF, extract text, analyze it, and save results to DB
 */
const uploadResume = async (req, res) => {
  try {
    // Multer puts the uploaded file info in req.file
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // ── Step 1: Extract text from PDF ──────────────────────────────────────
    let extractedText = "";
    try {
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(pdfBuffer);
      extractedText = pdfData.text;
    } catch (pdfError) {
      console.error("PDF parsing error:", pdfError.message);
      return res.status(422).json({ message: "Could not read PDF. Make sure it contains selectable text." });
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(422).json({
        message: "PDF appears to be empty or contains only images. Please upload a text-based PDF.",
      });
    }

    // ── Step 2: Analyze the extracted text ─────────────────────────────────
    const analysis = analyzeResume(extractedText);

    // ── Step 3: Save everything to MongoDB ─────────────────────────────────
    const resume = await Resume.create({
      user: req.user._id,
      fileName,
      filePath,
      extractedText,
      atsScore: analysis.atsScore,
      detectedSkills: analysis.detectedSkills,
      missingSkills: analysis.missingSkills,
      keywords: analysis.keywords,
      feedback: analysis.feedback,
    });

    // ── Step 4: Return the full analysis result ─────────────────────────────
    res.status(201).json({
      message: "Resume analyzed successfully",
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        atsScore: resume.atsScore,
        detectedSkills: resume.detectedSkills,
        missingSkills: resume.missingSkills,
        keywords: resume.keywords,
        feedback: resume.feedback,
        wordCount: analysis.wordCount,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload error:", error.message);
    res.status(500).json({ message: "Failed to process resume", error: error.message });
  }
};

// ─── Get All Resumes for Current User ────────────────────────────────────────

/**
 * GET /api/resume/history
 * Return all past resume analyses for the logged-in user
 */
const getResumeHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .sort({ createdAt: -1 }) // Newest first
      .select("-extractedText -filePath"); // Don't send large text fields

    res.json({ resumes });
  } catch (error) {
    console.error("History fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch resume history" });
  }
};

// ─── Get Single Resume by ID ──────────────────────────────────────────────────

/**
 * GET /api/resume/:id
 * Return full details of a single resume analysis
 */
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Make sure the resume belongs to the requesting user
    if (resume.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this resume" });
    }

    res.json({ resume });
  } catch (error) {
    console.error("Get resume error:", error.message);
    res.status(500).json({ message: "Failed to fetch resume" });
  }
};

// ─── Delete Resume ────────────────────────────────────────────────────────────

/**
 * DELETE /api/resume/:id
 * Delete a resume and its uploaded file
 */
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Ensure ownership
    if (resume.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this resume" });
    }

    // Delete the physical file from disk
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    // Delete from database
    await resume.deleteOne();

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({ message: "Failed to delete resume" });
  }
};

module.exports = { uploadResume, getResumeHistory, getResumeById, deleteResume };
