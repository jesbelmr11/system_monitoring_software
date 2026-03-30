function getSeverity(message) {
  const msg = (message || "").toLowerCase();
  if (msg.includes("error") || msg.includes("failed") || msg.includes("critical") || msg.includes("fail") || msg.includes("high") || msg.includes("usage") || msg.includes("leak")) return "Error";
  if (msg.includes("warning") || msg.includes("timeout")) return "Warning";
  return "Normal";
}

function getStatus(message, severity, cpu, memory, disk) {
  const msg = (message || "").toLowerCase();
  const sev = (severity || "").toLowerCase();

  // 🔴 ERROR CONDITIONS
  if (
    sev === "error" ||
    msg.includes("error") ||
    msg.includes("failed") ||
    msg.includes("refused") ||
    msg.includes("critical") ||
    memory > 90 ||
    cpu > 85 ||
    disk > 95
  ) {
    return "ERROR";
  }

  // 🟡 WARNING CONDITIONS
  if (
    sev === "warning" ||
    msg.includes("timeout") ||
    (memory > 75 && memory <= 90)
  ) {
    return "WARNING";
  }

  // 🟢 NORMAL
  return "NORMAL";
}

module.exports = { getStatus, getSeverity };
