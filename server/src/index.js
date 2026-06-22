const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth.routes");
const healthRoutes = require("./routes/health.routes");
const trackingRoutes = require("./routes/tracking.routes");
const notificationRoutes = require("./routes/notifications.routes");
const gymOwnerRoutes = require("./routes/gym-owner.routes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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
app.use("/api/gym-owner", gymOwnerRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("SE7EN FIT API running on port " + PORT);
});
