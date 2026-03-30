const { parseLog } = require("../utils/logParser");

test("should parse valid log", () => {
  const log = "2026-03-25T16:46:21.321Z - ERROR: Database failed";
  const result = parseLog(log);

  expect(result.level).toBe("ERROR");
  expect(result.message).toBe("Database failed");
});

test("should handle invalid log", () => {
  const log = "Random message";
  const result = parseLog(log);

  expect(result.level).toBe("INFO");
  expect(result.message).toBe("Random message");
});
