/**
 * Resume Routes
 * All routes are protected — user must be logged in
 *
 * POST   /api/resume/upload    - Upload and analyze a PDF
 * GET    /api/resume/history   - Get all past analyses
 * GET    /api/resume/:id       - Get a single analysis
 * DELETE /api/resume/:id       - Delete a resume
 */

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  uploadResume,
  getResumeHistory,
  getResumeById,
  deleteResume,
} = require("../controllers/resumeController");

// All resume routes require authentication
router.use(protect);

router.post("/upload", upload.single("resume"), uploadResume);
router.get("/history", getResumeHistory);
router.get("/:id", getResumeById);
router.delete("/:id", deleteResume);

module.exports = router;
