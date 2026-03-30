const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// ==============================
// ✅ GET ALL PROJECTS
// ==============================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM monitored_projects ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET /api/projects error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// ✅ DELETE PROJECT
// ==============================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM monitored_projects WHERE id = $1", [id]);
    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    console.error("❌ DELETE /api/projects error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
