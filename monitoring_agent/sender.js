const axios = require("axios");
const { collectMetrics } = require("./metricsMonitor");

// Send error logs to backend
async function sendLog(message, severity = "info", project_name = "System", status = "Normal", timestamp = new Date().toISOString()) {
  try {
    await axios.post("http://localhost:5001/api/logs", {
      message: message,
      severity: severity,
      project_name: project_name,
      status: status,
      level: severity.toUpperCase(),
      timestamp: timestamp
    });
    console.log(`Log sent to backend: [${status}] ${message}`);
  } catch (error) {
    if (error.response) {
      console.error(`Error sending log: ${error.response.status} ${error.response.statusText}`);
    } else {
      console.error("Error sending log:", error.message);
    }
  }
}


// Send system metrics to backend
async function sendMetrics(metrics) {

  try {

    await axios.post("http://localhost:5001/api/metrics", {
      system_id: 1,
      cpu: metrics.cpu,
      memory: metrics.memory,
      disk: metrics.disk,
      network: metrics.network
    });

    console.log("Metrics sent successfully");

  } catch (error) {

    console.error("Error sending metrics:", error.message);

  }

}

module.exports = { sendLog, sendMetrics };