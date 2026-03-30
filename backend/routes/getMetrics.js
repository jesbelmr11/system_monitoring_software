const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const axios = require("axios");

router.post("/", async (req, res) => {

  try {

    const { cpu, memory, disk, network, message } = req.body;

    // 1️⃣ Save metrics
    const metricsResult = await pool.query(
      `INSERT INTO metrics (system_id, cpu, memory, disk, network, recorded_at)
       VALUES ($1,$2,$3,$4,$5,NOW())
       RETURNING id`,
      [1, cpu, memory, disk, network]
    );

    const metricsId = metricsResult.rows[0].id;

    // 2️⃣ Save log
    const logResult = await pool.query(
      `INSERT INTO logs (message, created_at)
       VALUES ($1,NOW())
       RETURNING id`,
      [message]
    );

    const logId = logResult.rows[0].id;

    // 3️⃣ Send log to ML model
    const mlResponse = await axios.post("http://localhost:5050/predict", {
      log: message
    });

    const prediction = mlResponse.data;

    console.log("ML RESPONSE:", prediction);

    // 4️⃣ Save prediction in DB
    await pool.query(
      `INSERT INTO predictions
      (log_id, root_cause, probability_percentage, top_predictions, predicted_at)
      VALUES ($1,$2,$3,$4,NOW())`,
      [
        logId,
        prediction.predicted_root_cause,
        prediction.probability_percentage,
        JSON.stringify(prediction.top_predictions)
      ]
    );

    res.json({
      message: "Metrics + prediction saved successfully"
    });

  } catch (error) {

    console.error("Metrics route error:", error);

    res.status(500).json({
      error: "Failed to process metrics"
    });

  }

});


router.get("/", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT cpu, memory, disk, network, recorded_at FROM metrics ORDER BY recorded_at DESC LIMIT 10"
    );

    console.log(`📊 GET /api/metrics/latest: returning ${result.rows.length} records`);
    const finalRows = result.rows.map(r => ({ ...r, project_name: "System" }));
    res.json(finalRows);

  } catch (error) {

    console.error("Fetch metrics error:", error);

    res.status(500).json({
      error: "Failed to fetch metrics"
    });

  }

});

module.exports = router;