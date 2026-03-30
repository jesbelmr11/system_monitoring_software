const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let processes = {
  backend: null,
  frontend: null,
  agent: null,
  ml: null
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.loadFile('index.html');
  
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer Line ${line}] ${message}`);
  });

  setTimeout(() => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.webContents.executeJavaScript(`
      (function() {
         const hasAPI = typeof window.electronAPI !== 'undefined';
         const hasElectron = typeof window.electron !== 'undefined';
         const hasRenderer = typeof addLog === 'function';
         return { hasAPI, hasElectron, hasRenderer };
      })()
    `).then(res => console.log('DUMP STATE:', res)).catch(err => console.error('DUMP ERR:', err));
  }, 3000);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  stopAllServices();
  if (process.platform !== 'darwin') app.quit();
});

// Fix environment PATH for packaged apps on macOS
function fixPath() {
  if (process.platform !== 'darwin') return;
  const shellPaths = [
    '/usr/local/bin',
    '/usr/bin',
    '/bin',
    '/usr/sbin',
    '/sbin',
    '/opt/homebrew/bin'
  ];
  const currentPath = process.env.PATH || '';
  const newPath = Array.from(new Set([...shellPaths, ...currentPath.split(':')])).join(':');
  process.env.PATH = newPath;
}

fixPath();

// IPC Communication
ipcMain.handle('start-services', async (event) => {
  if (Object.values(processes).some(p => p !== null)) {
    return { success: false, message: 'Services already running' };
  }

  // When packaged, __dirname is .../app. we need to go up to project root.
  // Packaged: .../System Monitor.app/Contents/Resources/app 
  // Levels: app(1), Resources(2), Contents(3), App.app(4), arch(5), dist(6), electron(7), root(8)? 
  // Actually from dist/mac-arm64/App.app:
  // 1: app, 2: Resources, 3: Contents, 4: System Monitor.app, 5: mac-arm64, 6: dist, 7: electron, 8: system_monitoring_software
  const rootPath = app.isPackaged 
    ? path.join(app.getAppPath(), '../../../../../../..') 
    : path.join(__dirname, '..');

  console.log(`[Controller] System Root: ${rootPath}`);

  try {
    // 1. Backend
    processes.backend = spawn('npm', ['run', 'dev'], {
      cwd: path.join(rootPath, 'backend'),
      shell: true,
      detached: process.platform !== 'win32'
    });
    monitorProcess(processes.backend, 'Backend');

    // 2. Frontend
    processes.frontend = spawn('npm', ['start'], {
      cwd: path.join(rootPath, 'frontend'),
      shell: true,
      detached: process.platform !== 'win32',
      env: { ...process.env, BROWSER: 'none' }
    });
    monitorProcess(processes.frontend, 'Frontend');

    // 3. Monitoring Agent
    processes.agent = spawn('node', ['engine.js'], {
      cwd: path.join(rootPath, 'monitoring_agent'),
      shell: true,
      detached: process.platform !== 'win32'
    });
    monitorProcess(processes.agent, 'Agent');

    // 4. ML Service
    processes.ml = spawn('python3', ['app.py'], {
      cwd: path.join(rootPath, 'ML'),
      shell: true,
      detached: process.platform !== 'win32'
    });
    monitorProcess(processes.ml, 'ML Service');

    // Wait for Frontend to serve index.html
    await waitForServer('http://localhost:3000');
    // Wait for Backend API to be ready to avoid skipping auto-restore due to ECONNREFUSED
    await waitForServer('http://localhost:5001');
    
    // Auto-restore file watchers for all projects
    try {
      http.get('http://localhost:5001/api/projects', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', async () => {
          try {
            const projects = JSON.parse(data);
            for (const p of projects) {
               if (p.project_name && p.log_path) {
                  const chokidar = await import('chokidar');
                  // Fake IPC event format for our internal call 
                  // But wait, we can just export a startWatching function or call the IPC internally
                  // Actually since start-monitor IPC is heavily bound to main.js scope, let's just trigger it!
                  console.log(`[Controller] Auto-restoring watcher for ${p.project_name}: ${p.log_path}`);
                  startMonitorCore(p.project_name, p.log_path);
               }
            }
          } catch(e) {}
        });
      }).on('error', () => {});
    } catch(e) {}

    return { success: true, message: 'All services started and frontend is ready' };
  } catch (error) {
    stopAllServices();
    return { success: false, message: `Failed to start: ${error.message}` };
  }
});

function waitForServer(url) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          clearInterval(interval);
          resolve();
        }
      }).on('error', () => { /* wait */ });
    }, 1000);
  });
}

ipcMain.handle('stop-services', async (event) => {
  stopAllServices();
  return { success: true, message: 'All services stopped' };
});

function stopAllServices() {
  for (const key in processes) {
    if (processes[key]) {
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', processes[key].pid, '/f', '/t']);
        } else {
          process.kill(-processes[key].pid, 'SIGKILL');
        } // Send kill to process group
      } catch (e) {
        try { processes[key].kill(); } catch (e2) {}
      }
      processes[key] = null;
    }
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      mainWindow.webContents.send('service-status', { type: 'stopped' });
    } catch (e) {
      console.warn('Could not send service-status: webContents destroyed');
    }
  }
}

function monitorProcess(child, name) {
  child.stdout.on('data', (data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        mainWindow.webContents.send('service-log', { name, type: 'info', data: data.toString() });
      } catch (e) {}
    }
  });

  child.stderr.on('data', (data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        mainWindow.webContents.send('service-log', { name, type: 'error', data: data.toString() });
      } catch (e) {}
    }
  });

  child.on('close', (code) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        mainWindow.webContents.send('service-log', { name, type: 'exit', data: `Exited with code ${code}` });
      } catch (e) {}
    }
  });
}

// ============================================
// 📁 NATIVE LOG FILE WATCHING (REAL-TIME TAIL)
// ============================================
const fs = require('fs');
const activeWatchers = {};

function analyzeLog(log) {
  const msg = log.message.toLowerCase();
  let causes = [];

  // 🔴 ERROR CAUSES
  if (msg.includes("database")) {
    causes.push({ cause: "Database Failure", probability: 95, issue: "Database connection issue or DB down" });
    causes.push({ cause: "Too Many Connections", probability: 80, issue: "Connection pool exhausted" });
    causes.push({ cause: "Query Timeout", probability: 70, issue: "Slow DB query execution" });
  }

  if (msg.includes("timeout")) {
    causes.push({ cause: "Network Timeout", probability: 90, issue: "Slow or unreachable server" });
    causes.push({ cause: "Server Overload", probability: 85, issue: "Server not responding in time" });
    causes.push({ cause: "DNS Issue", probability: 70, issue: "DNS resolution delay" });
  }

  if (msg.includes("memory")) {
    causes.push({ cause: "Memory Leak", probability: 95, issue: "Memory usage continuously increasing" });
    causes.push({ cause: "Too Many Processes", probability: 88, issue: "Excessive background processes" });
    causes.push({ cause: "Cache Overflow", probability: 80, issue: "Cache exceeding limit" });
  }

  if (msg.includes("error")) {
    causes.push({ cause: "Generic Error", probability: 85, issue: log.message });
  }

  // 🟡 WARNING CAUSES
  if (causes.length === 0 && (msg.includes("warning") || msg.includes("slow") || msg.includes("high usage"))) {
    causes.push({
      cause: "System Warning",
      probability: 70,
      issue: "Performance degradation or non-critical issue"
    });
  }

  // 🟢 NORMAL
  if (causes.length === 0) {
    causes.push({
      cause: "Normal Operation",
      probability: 10,
      issue: "System running normally"
    });
  }

  return causes.slice(0, 3);
}

async function startMonitorCore(projectName, logPath) {
  if (!logPath || !fs.existsSync(logPath)) {
    return { success: false, message: 'File not found or missing path' };
  }

  try {
    console.log("Start monitoring clicked");
    if (activeWatchers[projectName]) {
      activeWatchers[projectName].close();
    }
    console.log(`🚀 Start monitoring triggered for ${projectName}`);
    console.log(`Watching file: ${logPath}`);
    let lastSize = 0;

    const processLogDelta = (newSize) => {
      if (newSize > lastSize) {
        const stream = fs.createReadStream(logPath, { start: lastSize, end: newSize });
        let data = '';
        stream.on('data', chunk => data += chunk);
        stream.on('end', () => {
          const lines = data.split('\n').filter(Boolean);
          console.log(`New lines read: ${lines.length}`);
          
          const parsedLogs = [];

          lines.forEach(line => {
             const match = line.match(/^([^\s]+)\s+-\s+([^:]+):\s+(.*)$/);
             let timestamp = new Date().toISOString();
             let level = 'INFO';
             let message = line;
             
             if (match) {
               timestamp = match[1];
               level = match[2].trim();
               message = match[3].trim();
             } else {
               if (line.includes('ERROR')) level = 'ERROR';
               else if (line.includes('WARNING')) level = 'WARNING';
             }
            
            const parsedLog = {
              timestamp,
              level,
              status: level,
              project: projectName,
              projectName: projectName,
              message
            };
            
            const analysis = analyzeLog(parsedLog);
            parsedLog.causes = analysis;
            
            parsedLogs.push(parsedLog);

            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('new-log', parsedLog);
            }
          });

          // Sync back to Express API so the "Refresh Logs" button works
          if (parsedLogs.length > 0) {
            try {
              const postData = JSON.stringify(parsedLogs);
              const req = http.request({
                hostname: 'localhost',
                port: 5001,
                path: '/api/logs',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(postData)
                }
              });
              req.on('error', (e) => console.error('Failed to sync via API:', e.message));
              req.write(postData);
              req.end();
            } catch (err) {
              console.error('API sync error:', err.message);
            }
          }

          lastSize = newSize;
        });
      }
    };

    // Initial read
    if (fs.existsSync(logPath)) {
      processLogDelta(fs.statSync(logPath).size);
    }

    const startChokidar = async () => {
      const chokidarMod = await import('chokidar');
      const watchFn = chokidarMod.default ? chokidarMod.default.watch : chokidarMod.watch;
      const watcher = watchFn(logPath, { persistent: true, ignoreInitial: true });

      watcher.on('change', (path, stats) => {
         console.log('File change detected');
         if (!stats) stats = fs.statSync(logPath);
         processLogDelta(stats.size);
      });

      watcher.on('error', error => {
         console.error(`Watcher error: ${error}. Retrying in 5s...`);
         watcher.close();
         setTimeout(startChokidar, 5000);
      });

      activeWatchers[projectName] = watcher;
    };

    startChokidar();

    return { success: true, message: 'Monitoring started successfully' };
  } catch (error) {
    console.error('Watch error:', error);
    return { success: false, message: `No permission or error: ${error.message}` };
  }
}

ipcMain.handle('start-monitor', async (event, config) => {
  const { projectName, logPath } = config;
  return await startMonitorCore(projectName, logPath);
});
