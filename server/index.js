/**
 * Entry point for the Resume Analyzer backend server
 * Sets up Express, connects to MongoDB, and registers all routes
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

// Allow requests from the React frontend (localhost:5173 is Vite's default)
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// Serve uploaded files statically (so frontend can access them if needed)
app.use("/uploads", express.static("uploads"));

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/resume", require("./routes/resumeRoutes"));
app.use("/api/policy", require("./routes/policyRoutes"));
app.use("/api/hospitals", require("./routes/hospitalRoutes"));

// API health check (always available)
app.get("/api/health", (req, res) => {
  res.json({ message: "Hospitality API is running 🚀" });
});

// ─── Static Frontend (Production) ─────────────────────────────────────────────

const clientDist = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDist)) {
  // Serve the built React app — including the root path "/"
  app.use(express.static(clientDist));
  // SPA fallback: any non-API, non-uploads GET request serves the React app
  app.get(/^\/(?!api\/|uploads\/).*/, (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  // No frontend build available — expose API health at root (dev/local use)
  app.get("/", (req, res) => {
    res.json({ message: "Hospitality API is running 🚀" });
  });
}

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
