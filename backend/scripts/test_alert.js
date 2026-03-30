const { registerError } = require("../utils/alertEngine");
const pool = require("../config/db");

async function runTest() {
  console.log("Starting alertEngine test...");
  
  // Simulate 20 errors to trigger threshold
  for (let i = 0; i < 21; i++) {
    await registerError("CRITICAL: Database connection timeout " + i);
  }
  
  console.log("Waiting a bit for async DB inserts...");
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Fetch from DB
  console.log("Fetching predictions...");
  const res = await pool.query("SELECT * FROM predictions ORDER BY predicted_at DESC LIMIT 5");
  console.log("Recent predictions in DB:", JSON.stringify(res.rows, null, 2));

  console.log("Fetching logs...");
  const logsRes = await pool.query("SELECT * FROM logs ORDER BY created_at DESC LIMIT 5");
  console.log("Recent logs in DB:", JSON.stringify(logsRes.rows, null, 2));

  process.exit(0);
}

runTest();
