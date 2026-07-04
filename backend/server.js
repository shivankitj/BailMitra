const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const caseRoutes = require("./routes/cases");
const userRoutes = require("./routes/users");
const hearingRoutes = require("./routes/hearings");
const riskAssessmentRoutes = require("./routes/riskAssessment");
const applicationRoutes = require("./routes/applications");
const seedData = require("./utils/seedData");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI || "mongodb://localhost:27017/bailmitra";
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected...");

    // Check if we need to seed data
    const usersCount = await mongoose.connection.db
      .collection("users")
      .countDocuments();
    if (usersCount === 0) {
      console.log("Seeding database with initial data...");
      await seedData();
      console.log("Data seeding completed.");
    }
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/hearings", hearingRoutes);
app.use("/api/risk-assessment", riskAssessmentRoutes);
app.use("/api/applications", applicationRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Add proper error handling middleware at the end of the file, before app.listen

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: err.message || "An unexpected error occurred",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
