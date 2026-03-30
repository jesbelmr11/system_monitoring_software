const fs = require("fs");
const fetch = require("node-fetch");
const { collectMetrics } = require("./metricsMonitor");
const { sendMetrics } = require("./sender");

const LOG_PATH = "/Users/jesbelmr/Desktop/test-website/logs/test-website.log";

let lastSize = 0;

console.log("🚀 Monitoring started...");
console.log("📂 Path:", LOG_PATH);

// START METRICS COLLECTION
setInterval(async () => {
  const metrics = await collectMetrics();
  await sendMetrics(metrics);
}, 2000);

setInterval(() => {

  if (!fs.existsSync(LOG_PATH)) {
    console.log("❌ File NOT found");
    return;
  }

  const stats = fs.statSync(LOG_PATH);

  console.log("📏 File size:", stats.size);

  // FIRST TIME LOAD (IMPORTANT)
  if (lastSize === 0) {
    lastSize = stats.size;
    console.log("⚡ Initial load skip");
    return;
  }

  // CHECK NEW DATA
  if (stats.size > lastSize) {

    const stream = fs.createReadStream(LOG_PATH, {
      start: lastSize,
      end: stats.size
    });

    let data = "";

    stream.on("data", chunk => {
      data += chunk;
    });

    stream.on("end", () => {

      const lines = data.split("\n").filter(Boolean);

      console.log("📥 NEW LOGS DETECTED:", lines);

      const parsedLogs = lines.map(line => {

        if (line.includes("ERROR")) {
          return { status: "ERROR", message: line, project: "test-site" };
        }

        if (line.includes("WARNING")) {
          return { status: "WARNING", message: line, project: "test-site" };
        }

        return { status: "NORMAL", message: line, project: "test-site" };

      });

      // SEND TO BACKEND
      fetch("http://localhost:5001/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedLogs)
      })
      .then(res => res.json())
      .then(data => console.log("✅ Sent logs:", data))
      .catch(err => console.log("❌ ERROR SENDING:", err));

    });

    lastSize = stats.size;
  }

}, 2000);