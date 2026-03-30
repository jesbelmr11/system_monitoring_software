let logConfig = {
  projectName: "Test Website",
  logPath: ""
};

module.exports = {
  getLogConfig: () => logConfig,
  setLogConfig: (config) => {
    logConfig = config;
  }
};
