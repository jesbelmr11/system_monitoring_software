const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  startServices: () => ipcRenderer.invoke('start-services'),
  stopServices: () => ipcRenderer.invoke('stop-services'),
  onServiceStatus: (callback) => ipcRenderer.on('service-status', (_event, value) => callback(value)),
  onServiceLog: (callback) => ipcRenderer.on('service-log', (_event, value) => callback(value))
});

contextBridge.exposeInMainWorld("electron", {
  startMonitoring: (projectName, filePath) => ipcRenderer.invoke('start-monitor', { projectName, logPath: filePath }),
  onLog: (callback) => ipcRenderer.on("new-log", (_, data) => callback(data)),
  on: (channel, callback) => ipcRenderer.on(channel, (_, data) => callback(data))
});
