const axios = require('axios');

async function testLogsAPI() {
  try {
    console.log("🚀 Testing POST /api/logs route mock agent...");
    
    // Simulate what the monitoring agent sends
    const payload = {
      system_id: 1,
      log_type: "system",
      severity: "error",
      message: "ERROR: database connection failed timeout refused"
    };

    const res = await axios.post("http://localhost:5001/api/logs", payload);
    console.log("✅ Backend responded seamlessly!", res.data);
    
    process.exit(0);
  } catch (err) {
    if (err.response) {
      console.error("❌ API Error:", err.response.status, err.response.data);
    } else {
      console.error("❌ Connection Error:", err.message);
    }
    process.exit(1);
  }
}

testLogsAPI();
