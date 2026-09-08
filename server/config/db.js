/**
 * MongoDB connection setup using Mongoose
 * Called once at server startup
 */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hospitality";
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn("⚠️ MongoDB connection notice:", error.message);
    console.log("ℹ️ Server running in stateless/standalone mode. Note: MongoDB persistence requires a running MONGO_URI.");
  }
};

module.exports = connectDB;
