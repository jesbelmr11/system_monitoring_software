function parseLog(line) {
  const regex = /^(.+) - (INFO|ERROR|WARNING): (.+)$/;
  const match = line.match(regex);

  if (!match) {
    return {
      timestamp: new Date().toISOString(),
      level: "INFO",
      message: line
    };
  }

  return {
    timestamp: match[1],
    level: match[2],
    message: match[3]
  };
}

module.exports = { parseLog };
