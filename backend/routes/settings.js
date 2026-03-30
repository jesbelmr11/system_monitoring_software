const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// ✅ mailer updater
const { setSettings } = require("../utils/mailer");


// ==============================
// ✅ GET SETTINGS
// ==============================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = 1");

    // 👉 create default if not exists
    if (result.rows.length === 0) {
      const inserted = await pool.query(`
        INSERT INTO settings (id)
        VALUES (1)
        RETURNING
          alert_email    AS "alertEmail",
          cpu_threshold  AS "cpuThreshold",
          mem_threshold  AS "memThreshold",
          alerts_enabled AS "alertsEnabled",
          auto_refresh   AS "autoRefresh"
      `);

      const settings = inserted.rows[0];

      // ✅ update mailer
      setSettings(settings);

      return res.json(settings);
    }

    const s = result.rows[0];

    const settings = {
      alertEmail:    s.alert_email,
      cpuThreshold:  s.cpu_threshold,
      memThreshold:  s.mem_threshold,
      alertsEnabled: s.alerts_enabled,
      autoRefresh:   s.auto_refresh,
    };

    // ✅ keep mailer updated
    setSettings(settings);

    res.json(settings);

  } catch (err) {
    console.error("❌ GET /api/settings error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// ✅ SAVE SETTINGS
// ==============================
router.post("/", async (req, res) => {
  try {
    const {
      alertEmail = "",
      cpuThreshold = 85,
      memThreshold = 85,
      alertsEnabled = true,
      autoRefresh = true,
    } = req.body;

    const result = await pool.query(`
      INSERT INTO settings (
        id, alert_email, cpu_threshold, mem_threshold,
        alerts_enabled, auto_refresh
      )
      VALUES (1, $1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        alert_email    = EXCLUDED.alert_email,
        cpu_threshold  = EXCLUDED.cpu_threshold,
        mem_threshold  = EXCLUDED.mem_threshold,
        alerts_enabled = EXCLUDED.alerts_enabled,
        auto_refresh   = EXCLUDED.auto_refresh,
        updated_at     = NOW()
      RETURNING
        alert_email    AS "alertEmail",
        cpu_threshold  AS "cpuThreshold",
        mem_threshold  AS "memThreshold",
        alerts_enabled AS "alertsEnabled",
        auto_refresh   AS "autoRefresh"
    `, [alertEmail, cpuThreshold, memThreshold, alertsEnabled, autoRefresh]);

    const savedSettings = result.rows[0];

    // ✅ update mailer with latest email
    setSettings(savedSettings);

    console.log("⚙️ Settings saved & mailer updated:", savedSettings);

    res.json({
      success: true,
      settings: savedSettings
    });

  } catch (err) {
    console.error("❌ POST /api/settings error FULL:", err);
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// ✅ SAVE PROJECT (ADD NEW)
// ==============================
router.post("/project", async (req, res) => {
  try {
    const { project_name, log_path } = req.body;

    if (!project_name || !log_path) {
      return res.status(400).json({ error: "project_name and log_path are required" });
    }

    const result = await pool.query(
      "INSERT INTO monitored_projects (project_name, log_path) VALUES ($1, $2) RETURNING *",
      [project_name, log_path]
    );

    res.json({
      success: true,
      project: result.rows[0]
    });

  } catch (err) {
    console.error("❌ POST /api/settings/project error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ==============================
module.exports = router;