const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "jesbelmr@gmail.com",
    pass: "uhztvgdgwuelxvlf"
  }
});

async function sendAlertEmail(logMessage, rootCause, confidence) {

  try {

    const mailOptions = {
      from: "jesbelmr@gmail.com",
      to: "ahammad8745@gmail.com",
      subject: "🚨 System Monitoring Alert - Issue Detected",

      text: `
Hello,

The monitoring system has detected an issue on the monitored machine.

----------------------------------------
⚠️ Log Message:
${logMessage}

🔍 Predicted Root Cause:
${rootCause}

📊 Confidence Level:
${confidence}

🕒 Time Detected:
${new Date().toLocaleString()}
----------------------------------------

Please check the system or application logs for more details.

This alert was generated automatically by the
AI-Based System Monitoring Software.

Thank you.
`
    };

    await transporter.sendMail(mailOptions);

    console.log("Alert email sent successfully");

  } catch (error) {

    console.error("Email sending failed:", error);

  }

}

module.exports = { sendAlertEmail };