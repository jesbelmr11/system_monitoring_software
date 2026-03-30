const { parseLog } = require("../utils/logParser");
const { analyzeLog } = require("../utils/analyzer");

test("full pipeline test", () => {
  const raw = "2026-03-25T10:00:00Z - ERROR: Database failed";

  const parsed = parseLog(raw);
  const analyzed = analyzeLog(parsed);

  expect(parsed.level).toBe("ERROR");
  expect(analyzed[0].cause).toBe("Database Failure");
});
