const { parseLog } = require("../utils/logParser");
const { analyzeLog } = require("../utils/analyzer");

test("end-to-end system test", () => {
  const rawLog = "2026-03-25T10:00:00Z - ERROR: Database failed";

  const parsed = parseLog(rawLog);
  const analyzed = analyzeLog(parsed);

  const finalOutput = {
    ...parsed,
    causes: analyzed
  };

  expect(finalOutput.level).toBe("ERROR");
  expect(finalOutput.causes[0].cause).toBe("Database Failure");
});
