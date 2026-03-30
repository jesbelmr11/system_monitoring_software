const request = require("supertest");
const express = require("express");

const app = express();
app.use(express.json());

let logs = [];

app.post("/api/logs", (req, res) => {
  logs.push(...req.body);
  res.json({ success: true });
});

app.get("/api/logs", (req, res) => {
  res.json(logs);
});

describe("API Routes", () => {
  test("POST /api/logs should save logs", async () => {
    const res = await request(app)
      .post("/api/logs")
      .send([{ message: "Test log" }]);

    expect(res.body.success).toBe(true);
  });

  test("GET /api/logs should return logs", async () => {
    const res = await request(app).get("/api/logs");

    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].message).toBe("Test log");
  });
});
