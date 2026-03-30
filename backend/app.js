const express = require('express');
const cors = require('cors');
const logRoutes = require("./routes/logs");

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send("Backend is running 🚀");
});

app.use("/api/logs", logRoutes);

module.exports = app;
