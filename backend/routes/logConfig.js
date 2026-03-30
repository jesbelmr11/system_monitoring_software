const express = require("express");
const router = express.Router();
const { setLogConfig, getLogConfig } = require("../config/logConfig");

router.post("/set-log-path", (req, res) => {
  const { projectName, logPath } = req.body;

  if (!logPath) {
    return res.status(400).json({ error: "Log path required" });
  }

  setLogConfig({ projectName, logPath });

  res.json({ message: "Log path set successfully", config: getLogConfig() });
});

router.get("/get-log-path", (req, res) => {
  res.json(getLogConfig());
});

module.exports = router;
