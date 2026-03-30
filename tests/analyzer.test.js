const { analyzeLog } = require("../utils/analyzer");

test("detect database issue", () => {
  const log = { message: "Database connection failed" };
  const result = analyzeLog(log);

  expect(result[0].cause).toBe("Database Failure");
});

test("detect timeout issue", () => {
  const log = { message: "Network timeout detected" };
  const result = analyzeLog(log);

  expect(result[0].cause).toBe("Network Timeout");
});

test("default normal case", () => {
  const log = { message: "System running normally" };
  const result = analyzeLog(log);

  expect(result[0].cause).toBe("Normal Operation");
});

test("multi-cause output", () => {
  const log = { message: "Database timeout error" };
  const result = analyzeLog(log);

  expect(result.length).toBeGreaterThan(1);
});
