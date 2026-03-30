const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT system_id,
             MAX(cpu) as cpu,
             MAX(memory) as memory,
             MAX(disk) as disk,
             MAX(recorded_at) as last_updated
      FROM metrics
      GROUP BY system_id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch systems" });
  }
});

module.exports = router;