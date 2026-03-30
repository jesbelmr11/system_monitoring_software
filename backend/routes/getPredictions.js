const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { getStatus } = require("../utils/statusHelper");

router.get("/", async (req, res) => {

  console.log("🔍 GET /api/predictions called");

  try {

    const result = await pool.query(`
      SELECT logs.message,
             logs.severity,
             logs.status as log_status,
             predictions.root_cause,
             predictions.probability_percentage,
             predictions.top_predictions,
             predictions.predicted_at,
             predictions.project_name
      FROM predictions
      LEFT JOIN logs ON logs.id = predictions.log_id
      ORDER BY predicted_at DESC
      LIMIT 50
    `);

    const rows = result.rows.map(row => {
      let topPredictions;

      // ✅ EXISTING LOGIC (kept)
      if (!row.top_predictions) {
        topPredictions = [];
      } else if (typeof row.top_predictions === "string") {
        try {
          topPredictions = JSON.parse(row.top_predictions);
        } catch {
          topPredictions = [];
        }
      } else {
        topPredictions = row.top_predictions;
      }

      // ✅ Ensure array
      if (!Array.isArray(topPredictions)) {
        topPredictions = [];
      }

      // ✅ FIX: Normalize safely
      topPredictions = topPredictions.map(p => ({
        root_cause: String(p.root_cause || "Unknown issue"),
        probability: String(p.probability || "0%")
      }));

      // ✅ Fallback if empty
      if (topPredictions.length === 0) {
        topPredictions = [
          {
            root_cause: String(row.root_cause || "Unknown issue"),
            probability: String(row.probability_percentage || "0%")
          }
        ];
      }

      // 1. Extract Metrics from message (fallback to 0)
      const msg = (row.message || "").toLowerCase();
      let cpu = 0, memory = 0, disk = 0;
      
      const match = (row.message || "").match(/(\d+\.?\d*)%/);
      const val = match ? parseFloat(match[1]) : 0;

      if (msg.includes("cpu")) cpu = val;
      else if (msg.includes("memory")) memory = val;
      else if (msg.includes("disk")) disk = val;

      // 2. Call User's Positional getStatus
      const computedStatus = getStatus(
        row.message,
        row.severity,
        cpu,
        memory,
        disk
      );

      console.log(`DEBUG STATUS for [${row.message}]: ${computedStatus}`);

      const status = computedStatus;

      return {
        message: row.message || "Unknown log",
        root_cause: String(row.root_cause || "Unknown issue"),
        probability_percentage: String(row.probability_percentage || "0%"),
        top_predictions: topPredictions,
        predicted_at: row.predicted_at || new Date().toISOString(),
        status: row.log_status || "Normal",
        project_name: row.project_name || "System"
      };
    });

    console.log("📊 Returning", rows.length, "predictions");

    res.json(rows);

  } catch (error) {

    console.error("Prediction fetch error:", error);

    res.status(500).json({
      error: "Failed to fetch predictions"
    });

  }

});

module.exports = router;