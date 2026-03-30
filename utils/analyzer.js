function analyzeLog(log) {
  const msg = log.message.toLowerCase();
  let causes = [];

  if (msg.includes("database")) {
    causes.push({ cause: "Database Failure", probability: 95 });
    causes.push({ cause: "Too Many Connections", probability: 80 });
    causes.push({ cause: "Query Timeout", probability: 70 });
  }

  if (msg.includes("timeout")) {
    causes.push({ cause: "Network Timeout", probability: 90 });
    causes.push({ cause: "Server Overload", probability: 85 });
  }

  if (msg.includes("memory")) {
    causes.push({ cause: "Memory Leak", probability: 95 });
    causes.push({ cause: "Cache Overflow", probability: 80 });
  }

  if (msg.includes("error")) {
    causes.push({ cause: "Generic Error", probability: 85 });
  }

  if (causes.length === 0) {
    causes.push({ cause: "Normal Operation", probability: 10 });
  }

  return causes.slice(0, 3);
}

module.exports = { analyzeLog };
