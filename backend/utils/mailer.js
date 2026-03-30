const nodemailer = require("nodemailer");

// ==============================
// ✅ STORE CURRENT SETTINGS
// ==============================
let currentSettings = {
  alertEmail: ""
};

// ==============================
// ✅ UPDATE SETTINGS FROM BACKEND
// ==============================
function setSettings(settings) {
  currentSettings = settings || {};
  console.log("📩 Mailer updated with email:", currentSettings.alertEmail);
}

// ==============================
// ✅ GET CURRENT SETTINGS
// ==============================
function getSettings() {
  return currentSettings;
}

// ==============================
// ✅ CREATE MAIL TRANSPORTER
// ==============================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "jesbelmr@gmail.com",
    pass: "uhzt vgdg wuel xvlf", // ⚠️ app password
  },
});

// ==============================
// ✅ SEND ALERT EMAIL
// ==============================
async function sendAlertEmail(message, rootCause, prob) {
  try {
    if (!currentSettings.alertEmail) {
      console.log("⚠️ No alert email set. Skipping email.");
      return;
    }

    const timestamp = new Date().toISOString();

    await transporter.sendMail({
      from: "jesbelmr@gmail.com",
      to: currentSettings.alertEmail,
      subject: "🚨 Critical System Alert",
      text: `
🚨 CRITICAL ALERT DETECTED 🚨

A severe issue has been identified in your system monitoring backend.

📌 Alert Message: ${message || "Unknown log"}
🔍 Predicted Root Cause: ${rootCause || "Unknown issue"}
⚠️ Confidence Probability: ${prob}%
🕒 Timestamp: ${timestamp}

Immediate attention is required to ensure system stability.

— AI System Monitoring Tool
      `,
    });

    console.log("📧 Alert email sent to:", currentSettings.alertEmail);

  } catch (err) {
    console.error("❌ Email error:", err);
  }
}

// ==============================
// ✅ EXPORT
// ==============================
module.exports = {
  sendAlertEmail,
  setSettings,
  getSettings
};