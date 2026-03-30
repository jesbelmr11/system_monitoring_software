const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  console.log("📥 RECEIVED:", req.body);
  global.logs = [...(global.logs || []), ...req.body];
  res.json({ success: true });
});

router.get("/", (req, res) => {
  const project = req.query.project;
  
  if (!project || project === 'ALL') {
    return res.json(global.logs || []);
  }

  const filtered = (global.logs || []).filter(
    log => log.project === project || log.projectName === project
  );

  res.json(filtered);
});

module.exports = router;