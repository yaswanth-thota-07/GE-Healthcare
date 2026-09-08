/**
 * Policy Routes
 * All routes protected via JWT auth
 *
 * POST   /api/policy/upload   - Upload and analyze an insurance policy PDF
 * GET    /api/policy/history  - Get past policy analyses
 * GET    /api/policy/:id      - Get single policy analysis by ID
 * DELETE /api/policy/:id      - Delete a policy analysis and its stored document
 */

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  uploadPolicy,
  getPolicyHistory,
  getPolicyById,
  deletePolicy,
} = require("../controllers/policyController");

router.use(protect);

router.post("/upload", upload.single("policy"), uploadPolicy);
router.get("/history", getPolicyHistory);
router.get("/:id", getPolicyById);
router.delete("/:id", deletePolicy);

module.exports = router;
