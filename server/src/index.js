const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth.routes");
const healthRoutes = require("./routes/health.routes");
const trackingRoutes = require("./routes/tracking.routes");
const notificationRoutes = require("./routes/notifications.routes");
const emailNotificationRoutes = require("./routes/email-notifications.routes");

dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8081",
      "http://localhost:19000",
      process.env.ALLOWED_ORIGIN || "*",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SE7EN FIT API is running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/gym-owner/email-notifications", emailNotificationRoutes);
app.use("/api/email-notifications", emailNotificationRoutes);

// 404 handler
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[ERROR]", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { error: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SE7EN FIT API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `Database: ${process.env.DATABASE_URL ? "Connected" : "NOT CONFIGURED"}`
  );
});
