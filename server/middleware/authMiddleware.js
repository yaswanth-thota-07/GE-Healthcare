/**
 * Pass-Through Authentication Middleware
 * Precision Care Challenge 2026 - Hospitality
 * Bypasses login requirements and attaches a default guest user context to all requests.
 */

const mongoose = require("mongoose");

const defaultGuestUser = {
  _id: new mongoose.Types.ObjectId("658bc1234567890abcdef123"),
  name: "Guest User",
  email: "guest@hospitality.local",
};

const protect = (req, res, next) => {
  req.user = defaultGuestUser;
  next();
};

module.exports = { protect };
