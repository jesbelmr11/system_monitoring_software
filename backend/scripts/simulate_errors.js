const { registerError } = require("../utils/alertEngine");

const ERROR_TEMPLATES = [
  "CPU usage exceeded 90%",
  "Memory leak detected",
  "Database connection refused",
  "Network timeout error",
  "Disk usage critical"
];

async function simulateRealWorldErrors() {
  console.log("🚀 Starting Real-World Error Simulation...");
  
  // Pick a random error to spam (to simulate a specific system failure hitting threshold)
  const randomError = ERROR_TEMPLATES[Math.floor(Math.random() * ERROR_TEMPLATES.length)];
  console.log(`⚠️ Simulating system failure: "${randomError}"`);

  // We need to trigger ERROR_THRESHOLD (20) within WINDOW_TIME (10s) to generate a prediction.
  for (let i = 0; i < 21; i++) {
    await registerError(randomError);
    // slight delay
    await new Promise(res => setTimeout(res, 50));
  }

  console.log("✅ Simulation complete! The alertEngine should have generated and stored a prediction.");
  console.log("Check the Recent Alerts UI or GET /api/predictions to view the intelligence layer output.");
  process.exit(0);
}

simulateRealWorldErrors();
