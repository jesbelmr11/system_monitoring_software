const express = require("express");
const router = express.Router();
const { sendAlertEmail } = require("../services/emailService");

router.get("/", async (req, res) => {

  await sendAlertEmail(
    "ERROR: database connection failed",
    "Database server down",
    0.95
  );

  res.send("Test email sent!");
});

module.exports = router;