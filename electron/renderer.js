try {
  const btnStart = document.getElementById('btn-start');
  const btnStop = document.getElementById('btn-stop');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const logOutput = document.getElementById('log-output');

  addLog('Controller', 'info', 'Renderer initialized.');

  function addLog(name, type, data) {
    const line = document.createElement('div');
    line.className = 'log-line' + (type === 'error' ? ' log-error' : '');
    
    const spanName = document.createElement('span');
    spanName.className = 'log-name';
    spanName.textContent = `[${name}]`;
    
    const spanData = document.createElement('span');
    // Convert newlines to break tags for clean terminal output rendering
    spanData.innerHTML = data.trim().replace(/\n/g, '<br>');
    
    line.appendChild(spanName);
    line.appendChild(spanData);
    logOutput.appendChild(line);
    logOutput.scrollTop = logOutput.scrollHeight;
  }

  function setStatus(isRunning) {
    if (isRunning) {
      statusDot.className = 'status-dot running';
      statusText.textContent = 'Running';
      btnStart.disabled = true;
      btnStop.disabled = false;
    } else {
      statusDot.className = 'status-dot stopped';
      statusText.textContent = 'Stopped';
      btnStart.disabled = false;
      btnStop.disabled = true;
    }
  }

  window.addLog = addLog; // Expose manually for probes

  btnStart.addEventListener('click', async () => {
    btnStart.disabled = true;
    addLog('Controller', 'info', 'Starting all services. Waiting for frontend to be ready on port 3000...');
    
    const res = await window.electronAPI.startServices();
    if (res.success) {
      setStatus(true);
      addLog('Controller', 'info', '✅ Services ready! Loading embedded dashboard...');
      
      // Hide logs, show dashboard
      document.getElementById('log-output').style.display = 'none';
      const frame = document.getElementById('dashboard-frame');
      frame.style.display = 'block';
      frame.src = 'http://localhost:3000';
    } else {
      addLog('Controller', 'error', '❌ Start failed: ' + res.message);
      setStatus(false);
    }
  });

  btnStop.addEventListener('click', async () => {
    btnStop.disabled = true;
    addLog('Controller', 'info', 'Stopping all services...');
    
    // Hide dashboard, show logs
    const frame = document.getElementById('dashboard-frame');
    frame.src = 'about:blank';
    frame.style.display = 'none';
    document.getElementById('log-output').style.display = 'block';
    
    const res = await window.electronAPI.stopServices();
    if (res.success) {
      setStatus(false);
      addLog('Controller', 'info', '🛑 All services stopped.');
    }
  });

  if (!window.electronAPI) {
    throw new Error("window.electronAPI is undefined! Preload script failed to load.");
  }

  window.electronAPI.onServiceStatus((status) => {
    if (status.type === 'stopped') {
      setStatus(false);
      addLog('Controller', 'info', 'Services have been stopped externally.');
    }
  });

  window.electronAPI.onServiceLog((log) => {
    addLog(log.name, log.type, log.data);
  });
} catch (e) {
  console.error("CRITICAL RENDERER ERROR", e.message, e.stack);
  const logOutput = document.getElementById('log-output');
  if (logOutput) {
    logOutput.innerHTML += `<div style="color:red; font-family:monospace; margin-top: 10px; border-top:1px solid red; padding-top:10px;"><b>CRITICAL RENDERER ERROR</b><br/>${e.message}<br/><br/>${e.stack}</div>`;
  } else {
    alert("Critical script error: " + e.message);
  }
}
