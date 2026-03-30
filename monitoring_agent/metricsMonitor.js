const si = require("systeminformation");

async function collectMetrics() {
  const cpu = await si.currentLoad();
  const mem = await si.mem();
  const disk = await si.fsSize();
  const network = await si.networkStats();

  return {
    cpu: cpu.currentLoad,
    memory: ((mem.used ) / mem.total) * 100,
    disk: disk[0].used / disk[0].size * 100,
    network: network[0].rx_sec
  };
}

module.exports = { collectMetrics };