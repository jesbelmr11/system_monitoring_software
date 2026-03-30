const pool = require("../config/db");

async function testApi() {
  console.log("Testing getPredictions API query...");
  
  const result = await pool.query(`
    SELECT logs.message,
           predictions.root_cause,
           predictions.probability_percentage,
           predictions.top_predictions,
           predictions.predicted_at
    FROM predictions
    LEFT JOIN logs ON logs.id = predictions.log_id
    ORDER BY predicted_at DESC
    LIMIT 2
  `);

  console.log("API Query Result:");
  console.log(JSON.stringify(result.rows, null, 2));

  process.exit(0);
}

testApi();
