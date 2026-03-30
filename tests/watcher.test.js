const fs = require("fs");
const path = require("path");

const testFile = path.join(__dirname, "test.log");

afterAll(() => {
  if (fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
  }
});

test("should detect new log entries", (done) => {
  fs.writeFileSync(testFile, "Initial log\n");

  let detected = false;

  const watcher = fs.watch(testFile, () => {
    detected = true;
    watcher.close();
    expect(detected).toBe(true);
    done();
  });

  setTimeout(() => {
    fs.appendFileSync(testFile, "ERROR: Test log\n");
  }, 500);
});
