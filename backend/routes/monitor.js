const express = require("express");
const router  = express.Router();

let isMonitoring = false;

// POST /api/monitor/start
router.post("/start", (req, res) => {
  isMonitoring = true;
  console.log("🚀 Monitoring started via API");
  res.json({ status: "started", isMonitoring });
});

// POST /api/monitor/stop
router.post("/stop", (req, res) => {
  isMonitoring = false;
  console.log("🛑 Monitoring stopped via API");
  res.json({ status: "stopped", isMonitoring });
});

// GET /api/monitor/status
router.get("/status", (req, res) => {
  res.json({ isMonitoring });
});

module.exports = { router, getStatus: () => isMonitoring };
