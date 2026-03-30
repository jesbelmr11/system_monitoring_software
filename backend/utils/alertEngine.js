const { sendAlertEmail, getSettings } = require("./mailer");
const pool = require("../config/db");

// ==============================
// ✅ EMAIL CONTROL (COOLDOWN ONLY)
// ==============================
let lastEmailTime = 0;
const EMAIL_COOLDOWN = 60 * 1000;

// ==============================
// ✅ ROOT CAUSE ML MAPPING
// ==============================
function getPredictionForError(message) {
  const msg = (message || "").toLowerCase();
  
  if (msg.includes("cpu")) {
    return {
      rootCause: "High CPU usage",
      prob: 90,
      topPredictions: [
        { root_cause: "High CPU usage", probability: "90%" },
        { root_cause: "Too many processes", probability: "85%" },
        { root_cause: "Process deadlock", probability: "80%" },
        { root_cause: "Memory bottleneck", probability: "60%" }
      ]
    };
  }
  if (msg.includes("memory")) {
    return {
      rootCause: "Memory leak",
      prob: 95,
      topPredictions: [
        { root_cause: "Memory leak", probability: "95%" },
        { root_cause: "Too many processes", probability: "88%" },
        { root_cause: "Cache overflow", probability: "80%" },
        { root_cause: "Garbage collection failure", probability: "68%" }
      ]
    };
  }
  if (msg.includes("database") || msg.includes("connection refused")) {
    return {
      rootCause: "Database connection failure",
      prob: 92,
      topPredictions: [
        { root_cause: "Database connection failure", probability: "92%" },
        { root_cause: "Connection pool exhausted", probability: "85%" },
        { root_cause: "Network issue", probability: "78%" },
        { root_cause: "Query syntax error", probability: "65%" }
      ]
    };
  }
  if (msg.includes("network") || msg.includes("timeout") || msg.includes("api")) {
    return {
      rootCause: "Network issue",
      prob: 88,
      topPredictions: [
        { root_cause: "Network latency spike", probability: "88%" },
        { root_cause: "Upstream server timeout", probability: "82%" },
        { root_cause: "DNS resolution failure", probability: "76%" },
        { root_cause: "Service unavailable", probability: "60%" }
      ]
    };
  }
  if (msg.includes("disk") || msg.includes("space") || msg.includes("enospc")) {
    return {
      rootCause: "Disk space full",
      prob: 98,
      topPredictions: [
        { root_cause: "Disk space full", probability: "98%" },
        { root_cause: "Log files too large", probability: "90%" },
        { root_cause: "Temp files buildup", probability: "82%" },
        { root_cause: "Backup failure", probability: "70%" }
      ]
    };
  }
  
  // Default prediction for unknown errors
  return {
    rootCause: "Unknown System Anomaly",
    prob: 80,
    topPredictions: [
      { root_cause: "Unknown System Anomaly", probability: "80%" },
      { root_cause: "Unhandled internal error", probability: "77%" },
      { root_cause: "External dependency failure", probability: "76%" }
    ]
  };
}

// ==============================
// ✅ CORE PREDICTION LOGIC
// ==============================
async function processLogAlert(logId, message, severity, project_name = "System", status = "Normal") {
  const now = Date.now();
  const statusUpper = (status || "NORMAL").toUpperCase();

  try {
    const settings = getSettings();
    console.log("🚨 ALERT ENGINE PROCESSING ->", message, severity, "Status:", status);

    let predictionData;
    const isErrorMsg = /error|failed|high|leak|usage|critical|fail/i.test(message);

    if (statusUpper === "NORMAL" && !isErrorMsg) {
      predictionData = {
        rootCause: "System nominal",
        prob: 100,
        topPredictions: [
          { root_cause: "System operating normally", probability: "100%" }
        ]
      };
    } else {
      predictionData = getPredictionForError(message);
    }

    const rootCause = predictionData.rootCause || "Monitoring event";
    let probVal = predictionData.prob || 0;
    
    // Default Probabilities if AI is uncertain
    if (probVal === 0 || probVal === 50) {
      if (statusUpper === "ERROR") probVal = 95;
      else if (statusUpper === "WARNING") probVal = 75;
      else probVal = 30;
    }

    const probStr = `${probVal}%`;
    
      // REMOVED ML-BASED FILTERING (Show all top predictions)
      const allTopPredictions = predictionData.topPredictions || [];

      // Insert into predictions table
      await pool.query(
        `INSERT INTO predictions (log_id, root_cause, probability_percentage, top_predictions, predicted_at, project_name)
         VALUES ($1, $2, $3, $4, NOW(), $5)`,
        [logId, rootCause, probStr, JSON.stringify(allTopPredictions), project_name]
      );

      console.log(`Prediction saved -> Cause: ${rootCause}, Prob: ${probStr}, Status: ${status}`);

    // Email alert based on content-based status
    if (statusUpper === "ERROR" && settings.alertEmail && (now - lastEmailTime) > EMAIL_COOLDOWN) {
      sendAlertEmail(message, rootCause, probStr);
      lastEmailTime = now;
    }
  } catch (err) {
    console.error("Failed to process alert predictions:", err.message);
  }
}

// ==============================
// ✅ PROCESS METRICS ALERT
// ==============================
async function processMetricAlert(cpu, memory, disk) {
  const settings = getSettings();
  const cpuThresh = settings?.cpuThreshold || 85;
  const memThresh = settings?.memThreshold || 85;

  const createMetricLog = async (msg) => {
    try {
      const { getSeverity } = require("./statusHelper");
      const status = getSeverity(msg);

      const logResult = await pool.query(
        "INSERT INTO logs (system_id, log_type, severity, message, status) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [1, "system", "error", msg, status]
      );
      const logId = logResult.rows[0].id;
      await processLogAlert(logId, msg, "error", "System", status);
    } catch (err) {
      console.error("Failed to create metric alert:", err.message);
    }
  };

  if (cpu > cpuThresh) {
    await createMetricLog(`High CPU usage detected: ${cpu}%`);
  }
  if (memory > memThresh) {
    await createMetricLog(`Memory leak / high usage: ${memory}%`);
  }
  if (disk > 95) {
    await createMetricLog(`Disk usage critical: ${disk}%`);
  }
}

// ==============================
// ✅ APP ERROR CATCHALL (Fallback)
// ==============================
async function registerError(message) {
  try {
    const { getSeverity } = require("./statusHelper");
    const status = getSeverity(message);

    const logResult = await pool.query(
      "INSERT INTO logs (system_id, log_type, severity, message, status) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [1, "backend", "error", message, status]
    );
    const logId = logResult.rows[0].id;
    await processLogAlert(logId, message, "error", "System", status);
  } catch (err) {
     console.error("Fallback error logging failed:", err);
  }
}

module.exports = { 
  getPredictionForError, 
  processMetricAlert, 
  processLogAlert,
  registerError
};