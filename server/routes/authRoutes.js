/**
 * Auth Routes
 * /api/auth/register  - Create new account
 * /api/auth/login     - Login and get token
 * /api/auth/me        - Get current user (protected)
 */

const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe); // Protected route — requires valid JWT

module.exports = router;
