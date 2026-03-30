require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// 🚨 IMPORT ALERT ENGINE
const { registerError } = require("./utils/alertEngine");


// ==============================
// 🚨 GLOBAL ERROR TRACKING
// ==============================
const originalError = console.error;

console.error = (...args) => {
  originalError(...args);
  
  // Format the error message to pass to alertEngine
  const message = args.map(arg => 
    typeof arg === "object" ? (arg.message || JSON.stringify(arg)) : String(arg)
  ).join(" ");
  
  registerError(message);
};


// ==============================
// ✅ MIDDLEWARE
// ==============================
app.use(cors());
app.use(express.json());


// ==============================
// ✅ DATABASE
// ==============================
const pool = require("./config/db");


// ==============================
// ✅ ROUTES
// ==============================

// 👉 Settings
const settingsRoutes = require("./routes/settings");
app.use("/api/settings", settingsRoutes);

// 👉 Metrics
const metricsRoutes = require("./routes/metrics");
app.use("/api/metrics", metricsRoutes);

// 👉 Latest metrics
const getMetricsRoute = require("./routes/getMetrics");
app.use("/api/metrics/latest", getMetricsRoute);

// 👉 Logs
const logsRoute = require("./routes/logs");
app.use("/api/logs", logsRoute);

// 👉 Projects
const projectsRoute = require("./routes/projects");
app.use("/api/projects", projectsRoute);

// 👉 Predictions
const getPredictionsRoute = require("./routes/getPredictions");
app.use("/api/predictions", getPredictionsRoute);

// 👉 Log Configuration
const logConfigRoutes = require("./routes/logConfig");
app.use("/api/log-config", logConfigRoutes);

// 👉 Monitor Start/Stop
const monitorRoutes = require("./routes/monitor");
app.use("/api/monitor", monitorRoutes.router);

// 👉 Test email
const testEmailRoute = require("./routes/testEmail");
app.use("/api/test-email", testEmailRoute);


// ==============================
// ✅ HEALTH CHECK
// ==============================
app.get("/", (req, res) => {
  res.send("🚀 Backend is running...");
});


// ==============================
// ✅ START SERVER
// ==============================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});


// ==============================
// ✅ GLOBAL EXPRESS ERROR HANDLER
// ==============================
app.use((err, req, res, next) => {
  console.error("Unhandled Express Error:", err.message);
  // Feed undetected API crashes into the alert engine natively
  registerError(`API Error: ${err.message}`);
  res.status(500).json({ error: "Internal Server Error" });
});

// ==============================
// ✅ DATABASE CONNECTION TEST
// ==============================
pool.connect()
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch(err => console.error("❌ DB connection error:", err));