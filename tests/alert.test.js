function shouldTriggerAlert(log) {
  return log.level === "ERROR";
}

test("should trigger alert on ERROR", () => {
  const log = { level: "ERROR" };
  expect(shouldTriggerAlert(log)).toBe(true);
});

test("should not trigger alert on INFO", () => {
  const log = { level: "INFO" };
  expect(shouldTriggerAlert(log)).toBe(false);
});
