/**
 * Hospital Routes
 * Precision Care Challenge 2026 - Hospitality
 *
 * GET  /api/hospitals/search - Search and rank hospitals using policy constraints
 * POST /api/hospitals/search - Search and rank hospitals (supports JSON request body)
 */

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { searchHospitals, getSpecialties, getLocations } = require("../controllers/hospitalController");

// Require authentication for policy-aware searches
router.use(protect);

router.get("/specialties", getSpecialties);
router.get("/locations", getLocations);
router.get("/search", searchHospitals);
router.post("/search", (req, res, next) => {
  // Merge req.body into req.query so both GET and POST work seamlessly
  req.query = { ...req.query, ...req.body };
  searchHospitals(req, res, next);
});

module.exports = router;
