//to connect backend--> ML
const axios = require("axios");

async function getPrediction(log) {
  const response = await axios.post("http://localhost:5000/predict", {
    log: log
  });

  return response.data;
}

module.exports = { getPrediction };