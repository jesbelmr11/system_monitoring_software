const fs = require("fs");
const path = require("path");
const { sendLog } = require("./sender");

// Track last-read byte position per file to avoid re-processing old data
const lastSizes = new Map();
// Track actively watched files to prevent duplicates
const watchedFiles = new Set();

// ─── Parse a single log line ───────────────────────────────────────────────
function parseLogLine(line) {
  try {
    // Expected format: 2026-03-25T09:02:55.422Z - ERROR: Database connection failed
    const regex = /^(.*?) - (ERROR|WARNING|INFO): (.*)$/;
    const match = line.match(regex);
    if (!match) return null;

    const [, timestamp, level, message] = match;
    return {
      timestamp,
      level,
      message,
      status: level === "ERROR" ? "Error" : level === "WARNING" ? "Warning" : "Normal"
    };
  } catch (err) {
    return null;
  }
}

// ─── Read only the NEW tail of a file ─────────────────────────────────────
function readNewLines(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const lastSize = lastSizes.get(filePath) || 0;

    if (stats.size <= lastSize) return [];

    const buffer = Buffer.alloc(stats.size - lastSize);
    const fd = fs.openSync(filePath, "r");
    fs.readSync(fd, buffer, 0, buffer.length, lastSize);
    fs.closeSync(fd);

    lastSizes.set(filePath, stats.size);

    return buffer.toString("utf-8")
      .split("\n")
      .filter(line => line.trim() !== "");
  } catch (err) {
    console.error("❌ Failed to read log file:", err.message);
    return [];
  }
}

// ─── Process and send new log lines ────────────────────────────────────────
function processLines(lines, project_name) {
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const parsed = parseLogLine(trimmed);
    if (parsed) {
      sendLog(parsed.message, parsed.level.toLowerCase(), project_name, parsed.status, parsed.timestamp);
    } else {
      // Unrecognised format → send as Normal
      sendLog(trimmed, "normal", project_name, "Normal", new Date().toISOString());
    }
  });
}

// ─── Watch a single log file (uses fs.watchFile for reliability) ───────────
function watchLogFile(filePath, project_name = "System") {
  if (watchedFiles.has(filePath)) return;
  watchedFiles.add(filePath);

  console.log(`Watching log file for [${project_name}]:`, filePath);

  // Initialise byte offset to current file end so we only tail new content
  try {
    lastSizes.set(filePath, fs.statSync(filePath).size);
  } catch (e) {
    lastSizes.set(filePath, 0);
  }

  // fs.watchFile is polling-based and works reliably across macOS/Linux
  fs.watchFile(filePath, { interval: 2000, persistent: true }, (curr, prev) => {
    if (curr.size === prev.size) return; // no change

    console.log(`📡 Log file updated: ${filePath}`);
    const lines = readNewLines(filePath);
    processLines(lines, project_name);
  });
}

// ─── Watch all .log files in a directory ───────────────────────────────────
function watchLogDirectory(dirPath, project_name = "System") {

  console.log(`Scanning directory for [${project_name}]:`, dirPath);

  if (!fs.existsSync(dirPath)) {
    console.log("Directory not found:", dirPath);
    return;
  }

  fs.readdirSync(dirPath).forEach(file => {
    if (file.endsWith(".log")) {
      const fullPath = path.join(dirPath, file);
      watchLogFile(fullPath, project_name);
    }
  });
}

module.exports = { watchLogFile, watchLogDirectory };