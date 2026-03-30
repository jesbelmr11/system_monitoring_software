const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { processMetricAlert } = require("../utils/alertEngine");

router.post("/", async (req, res) => {
  try {
    const { system_id, cpu, memory, disk, network } = req.body;

    await pool.query(
      "INSERT INTO metrics (system_id, cpu, memory, disk, network) VALUES ($1,$2,$3,$4,$5)",
      [system_id, cpu, memory, disk, network]
    );

    // DELEGATE logic to core alertEngine
    processMetricAlert(cpu, memory, disk);

    res.json({ message: "Metrics stored successfully" });

  } catch (error) {
    console.error("Metrics error:", error);
    res.status(500).json({ error: "Failed to store metrics" });
  }
});

module.exports = router;