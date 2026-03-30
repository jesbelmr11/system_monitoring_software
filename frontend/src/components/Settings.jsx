import React, { useState, useEffect } from "react";
import axios from "axios";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f0f2f7; font-family: 'DM Sans', sans-serif; color: #1a1d2e; }

  .page { padding: 28px 32px; min-height: 100vh; background: #f0f2f7; }

  .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
  .topbar-title { font-size: 22px; font-weight: 600; color: #1a1d2e; letter-spacing: -.3px; }
  .topbar-sub { font-size: 13px; color: #8a94ad; margin-top: 3px; font-family: 'DM Mono', monospace; }

  .settings-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    width: 100%;
  }

  .panel {
    background: #fff; border-radius: 14px; border: 1px solid #e8ecf4;
    box-shadow: 0 1px 4px rgba(0,0,0,.04); overflow: hidden;
    animation: fadeUp .4s ease both; display: flex; flex-direction: column;
  }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .panel-head {
    display: flex; align-items: center; gap: 10px;
    padding: 18px 24px; border-bottom: 1px solid #f0f2f7;
  }
  .panel-head-icon { font-size: 20px; }
  .panel-title { font-size: 15px; font-weight: 600; color: #1a1d2e; }
  .panel-desc { font-size: 12px; color: #8a94ad; margin-top: 2px; }

  .panel-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; flex: 1; }

  .setting-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 18px; background: #fafbfd; border-radius: 10px;
    border: 1px solid #f0f2f7;
  }
  .setting-row-label { font-size: 14px; font-weight: 500; color: #1a1d2e; }
  .setting-row-sub { font-size: 12px; color: #8a94ad; margin-top: 3px; }

  .toggle-wrap { position: relative; width: 46px; height: 26px; flex-shrink: 0; }
  .toggle-input { opacity: 0; width: 0; height: 0; position: absolute; }
  .toggle-slider {
    position: absolute; inset: 0; border-radius: 99px;
    background: #e2e6f0; cursor: pointer; transition: background .25s;
  }
  .toggle-slider::before {
    content: ''; position: absolute; width: 20px; height: 20px;
    border-radius: 50%; background: #fff; top: 3px; left: 3px;
    box-shadow: 0 1px 4px rgba(0,0,0,.18); transition: transform .25s;
  }
  .toggle-input:checked + .toggle-slider { background: #2563eb; }
  .toggle-input:checked + .toggle-slider::before { transform: translateX(20px); }

  .input-group { display: flex; flex-direction: column; gap: 6px; }
  .input-label { font-size: 13px; font-weight: 600; color: #374060; }
  .input-sub { font-size: 11px; color: #aab2c8; }
  .input-wrap { position: relative; }

  .input-field {
    width: 100%; padding: 11px 44px 11px 14px;
    border: 1px solid #e2e6f0; border-radius: 9px;
    font-size: 15px; font-family: 'DM Mono', monospace;
    color: #1a1d2e; background: #fff; outline: none;
    transition: border-color .2s, box-shadow .2s;
    appearance: none; -moz-appearance: textfield;
  }
  .input-field::-webkit-outer-spin-button,
  .input-field::-webkit-inner-spin-button { -webkit-appearance: none; }
  .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }

  .input-field-email {
    width: 100%; padding: 11px 14px;
    border: 1px solid #e2e6f0; border-radius: 9px;
    font-size: 14px; font-family: 'DM Sans', sans-serif;
    color: #1a1d2e; background: #fff; outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .input-field-email:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
  .input-field-email::placeholder { color: #aab2c8; }

  .input-suffix {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    font-size: 13px; color: #aab2c8; font-family: 'DM Mono', monospace;
    pointer-events: none;
  }

  .input-hint { font-size: 12px; margin-top: 5px; font-weight: 500; }
  .hint-normal  { color: #16a361; }
  .hint-warning { color: #d97706; }
  .hint-error   { color: #dc2626; }

  .email-valid   { font-size: 12px; margin-top: 5px; font-weight: 500; color: #16a361; }
  .email-invalid { font-size: 12px; margin-top: 5px; font-weight: 500; color: #dc2626; }

  .btn-row { display: flex; align-items: center; gap: 10px; }
  .btn-save {
    padding: 11px 28px; background: #2563eb; color: #fff;
    border: none; border-radius: 9px; font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: background .2s, box-shadow .2s;
  }
  .btn-save:hover { background: #1d4ed8; box-shadow: 0 4px 14px rgba(37,99,235,.28); }
  .btn-save:disabled { background: #93c5fd; cursor: not-allowed; }
  .btn-reset {
    padding: 11px 20px; background: #fff; color: #6b7a99;
    border: 1px solid #e2e6f0; border-radius: 9px; font-size: 14px;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: border-color .2s, color .2s;
  }
  .btn-reset:hover { border-color: #c8cfe0; color: #374060; }

  .save-banner {
    padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 500;
    display: flex; align-items: center; gap: 8px;
  }
  .save-banner-success { background: #e8faf2; color: #16a361; border: 1px solid #a7e8c8; }
  .save-banner-error   { background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; }

  .info-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0; border-bottom: 1px solid #f0f2f7; font-size: 13px;
  }
  .info-row:last-child { border-bottom: none; }
  .info-key { color: #8a94ad; font-weight: 500; }
  .info-val { color: #1a1d2e; font-family: 'DM Mono', monospace; font-weight: 500; }

  @media (max-width: 760px) {
    .settings-grid { grid-template-columns: 1fr; }
    .page { padding: 20px 16px; }
  }
`;

const DEFAULT = {
  alertsEnabled: true,
  autoRefresh:   true,
  cpuThreshold:  85,
  memThreshold:  85,
};

function thresholdHint(val) {
  const n = parseFloat(val);
  if (isNaN(n) || n < 1 || n > 100) return { text: "Enter a value between 1–100", cls: "hint-error" };
  if (n > 90) return { text: "Very high — few alerts will trigger",    cls: "hint-warning" };
  if (n < 50) return { text: "Very sensitive — many alerts may fire",  cls: "hint-warning" };
  return { text: "Looks good", cls: "hint-normal" };
}

export default function Settings() {

  const [settings,   setSettings]   = useState({ ...DEFAULT });
  const [alertEmail, setAlertEmail] = useState("");
  const [saved,      setSaved]      = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [loading,    setLoading]    = useState(true);

  // ── Project Monitored State ──────────────────────────────────
  const [projects,   setProjects]   = useState([]);
  const [newProject, setNewProject] = useState({ name: "", path: "" });
  const [addingProj, setAddingProj] = useState(false);
  const [primaryLogConfig, setPrimaryLogConfig] = useState({ projectName: "Test Website", logPath: "" });
  const [pathError, setPathError] = useState("");
  const [startingMonitor, setStartingMonitor] = useState(false);

  // ── Load settings from backend on page load ──────────────────
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/settings");
        const s   = res.data;

        setSettings({
          alertsEnabled: s.alertsEnabled ?? true,
          autoRefresh:   s.autoRefresh   ?? true,
          cpuThreshold:  s.cpuThreshold  ?? 85,
          memThreshold:  s.memThreshold  ?? 85,
        });
        setAlertEmail(s.alertEmail || "");

        // sync to localStorage
        localStorage.setItem("alertEmail",    s.alertEmail    || "");
        localStorage.setItem("cpuThreshold",  s.cpuThreshold  ?? 85);
        localStorage.setItem("memThreshold",  s.memThreshold  ?? 85);
        localStorage.setItem("alertsEnabled", s.alertsEnabled ?? true);
        localStorage.setItem("autoRefresh",   s.autoRefresh   ?? true);

      } catch (err) {
        console.error("Failed to load settings:", err);
        // fallback to localStorage
        setAlertEmail(localStorage.getItem("alertEmail") || "");
        setSettings({
          alertsEnabled: localStorage.getItem("alertsEnabled") !== "false",
          autoRefresh:   localStorage.getItem("autoRefresh")   !== "false",
          cpuThreshold:  Number(localStorage.getItem("cpuThreshold")) || 85,
          memThreshold:  Number(localStorage.getItem("memThreshold")) || 85,
        });
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
    
    // Load projects
    const loadProjects = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/projects");
        setProjects(res.data || []);
      } catch (err) {
        console.error("Failed to load projects:", err);
      }
    };
    loadProjects();
    const loadLogConfig = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/log-config/get-log-path");
        if (res.data.logPath) setPrimaryLogConfig(res.data);
      } catch (err) {
        console.error("Failed to load log config:", err);
      }
    };
    loadLogConfig();
  }, []);

  const handleToggle = key => setSettings(s => ({ ...s, [key]: !s[key] }));
  const handleInput  = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  // ── Save to backend + localStorage ───────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaved(null);
    try {
      const payload = {
        alertEmail,
        cpuThreshold:  settings.cpuThreshold,
        memThreshold:  settings.memThreshold,
        alertsEnabled: settings.alertsEnabled,
        autoRefresh:   settings.autoRefresh,
      };

      console.log("Sending payload:", payload);

      await axios.post("http://localhost:5001/api/settings", payload);

      localStorage.setItem("alertEmail",    alertEmail);
      localStorage.setItem("cpuThreshold",  settings.cpuThreshold);
      localStorage.setItem("memThreshold",  settings.memThreshold);
      localStorage.setItem("alertsEnabled", settings.alertsEnabled);
      localStorage.setItem("autoRefresh",   settings.autoRefresh);

      setSaved("success");
    } catch (err) {
      console.error("Save failed:", err);
      setSaved("error");
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(null), 3500);
    }
  };
  const handleReset = () => {
    setSettings({ ...DEFAULT });
    setAlertEmail("");
    setSaved(null);
  };

  const handleAddProject = async () => {
    if (!newProject.name || !newProject.path) return;
    setAddingProj(true);
    try {
      await axios.post("http://localhost:5001/api/settings/project", {
        project_name: newProject.name,
        log_path:     newProject.path
      });
      // Start monitoring instantly
      if (window.electron && window.electron.startMonitoring) {
        window.electron.startMonitoring(newProject.name, newProject.path);
      }
      // Refresh list
      const res = await axios.get("http://localhost:5001/api/projects");
      setProjects(res.data || []);
      setNewProject({ name: "", path: "" });
    } catch (err) {
      console.error("Failed to add project:", err);
    } finally {
      setAddingProj(false);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };


  const handleStartMonitoring = async () => {
    const lp = primaryLogConfig.logPath.trim();
    if (!lp) return;

    // Validate absolute path (must start with / on macOS/Linux)
    if (!lp.startsWith("/")) {
      setPathError("⚠️ Please enter a full absolute path (e.g. /Users/name/Desktop/project/logs/app.log)");
      return;
    }
    setPathError("");
    setStartingMonitor(true);

    try {
      // Step 1: Save the log path config
      await axios.post("http://localhost:5001/api/log-config/set-log-path", { ...primaryLogConfig, logPath: lp });

      // Step 2: Signal the backend API
      await axios.post("http://localhost:5001/api/monitor/start");

      // Step 3: Trigger native Electron File Watcher via IPC
      if (window.electron && window.electron.startMonitoring) {
        const res = await window.electron.startMonitoring(primaryLogConfig.projectName || "External Site", lp);
        if (!res.success) {
          setPathError(`⚠️ ${res.message}`);
          setSaved("error");
          setStartingMonitor(false);
          return;
        }
      }

      setSaved("success");
      console.log("🚀 Monitoring started for:", lp);
    } catch (err) {
      console.error("Failed to start monitoring:", err);
      setSaved("error");
    } finally {
      setStartingMonitor(false);
      setTimeout(() => setSaved(null), 3500);
    }
  };

  const cpuHint    = thresholdHint(settings.cpuThreshold);
  const memHint    = thresholdHint(settings.memThreshold);
  const emailValid = alertEmail.length === 0
    ? null
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alertEmail);

  if (loading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="page">
          <div style={{ color: "#8a94ad", fontSize: 14, marginTop: 40, textAlign: "center" }}>
            Loading settings…
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="page">

        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="topbar-title">Settings</div>
            <div className="topbar-sub">Configure monitoring preferences</div>
          </div>
        </div>

        <div className="settings-grid">

          {/* ── Alert Preferences ─────────────────────────── */}
          <div className="panel">
            <div className="panel-head">
              <span className="panel-head-icon">🔔</span>
              <div>
                <div className="panel-title">Alert Preferences</div>
                <div className="panel-desc">Control when and how alerts fire</div>
              </div>
            </div>
            <div className="panel-body">
              <div className="setting-row">
                <div>
                  <div className="setting-row-label">Enable Alerts</div>
                  <div className="setting-row-sub">Receive predictions and anomaly alerts</div>
                </div>
                <label className="toggle-wrap">
                  <input type="checkbox" className="toggle-input"
                    checked={settings.alertsEnabled}
                    onChange={() => handleToggle("alertsEnabled")} />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="setting-row">
                <div>
                  <div className="setting-row-label">Auto-Refresh</div>
                  <div className="setting-row-sub">Automatically refresh data every 5 seconds</div>
                </div>
                <label className="toggle-wrap">
                  <input type="checkbox" className="toggle-input"
                    checked={settings.autoRefresh}
                    onChange={() => handleToggle("autoRefresh")} />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          </div>

          {/* ── Alert Thresholds + Email ───────────────────── */}
          <div className="panel">
            <div className="panel-head">
              <span className="panel-head-icon">⚡</span>
              <div>
                <div className="panel-title">Alert Thresholds</div>
                <div className="panel-desc">Set % values that trigger warnings</div>
              </div>
            </div>
            <div className="panel-body">

              {/* CPU */}
              <div className="input-group">
                <div className="input-label">CPU Threshold</div>
                <div className="input-sub">Alert fires when CPU usage exceeds this value</div>
                <div className="input-wrap">
                  <input type="number" className="input-field" min={1} max={100}
                    value={settings.cpuThreshold}
                    onChange={e => handleInput("cpuThreshold", e.target.value)} />
                  <span className="input-suffix">%</span>
                </div>
                <div className={`input-hint ${cpuHint.cls}`}>{cpuHint.text}</div>
              </div>

              {/* Memory */}
              <div className="input-group">
                <div className="input-label">Memory Threshold</div>
                <div className="input-sub">Alert fires when memory usage exceeds this value</div>
                <div className="input-wrap">
                  <input type="number" className="input-field" min={1} max={100}
                    value={settings.memThreshold}
                    onChange={e => handleInput("memThreshold", e.target.value)} />
                  <span className="input-suffix">%</span>
                </div>
                <div className={`input-hint ${memHint.cls}`}>{memHint.text}</div>
              </div>

              {/* Alert Email — NEW */}
              <div className="input-group">
                <div className="input-label">Alert Email</div>
                <div className="input-sub">Receive alert notifications at this address</div>
                <div className="input-wrap">
                  <input
                    type="email"
                    className="input-field-email"
                    placeholder="Enter your email"
                    value={alertEmail}
                    onChange={e => setAlertEmail(e.target.value)}
                  />
                </div>
                {emailValid === true  && <div className="email-valid">✓ Valid email address</div>}
                {emailValid === false && <div className="email-invalid">✗ Please enter a valid email</div>}
              </div>

            </div>
          </div>

          {/* ── System Info ───────────────────────────────── */}
          <div className="panel">
            <div className="panel-head">
              <span className="panel-head-icon">🖥️</span>
              <div>
                <div className="panel-title">System Info</div>
                <div className="panel-desc">Current environment details</div>
              </div>
            </div>
            <div className="panel-body">
              <div className="info-row">
                <span className="info-key">Backend URL</span>
                <span className="info-val">localhost:5001</span>
              </div>
              <div className="info-row">
                <span className="info-key">Refresh Interval</span>
                <span className="info-val">5 000 ms</span>
              </div>
              <div className="info-row">
                <span className="info-key">CPU Alert Level</span>
                <span className="info-val">{settings.cpuThreshold}%</span>
              </div>
              <div className="info-row">
                <span className="info-key">Memory Alert Level</span>
                <span className="info-val">{settings.memThreshold}%</span>
              </div>
              <div className="info-row">
                <span className="info-key">Alert Email</span>
                <span className="info-val">{alertEmail || "—"}</span>
              </div>
              <div className="info-row">
                <span className="info-key">Alerts Enabled</span>
                <span className="info-val" style={{ color: settings.alertsEnabled ? "#16a361" : "#dc2626" }}>
                  {settings.alertsEnabled ? "Yes" : "No"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-key">Auto-Refresh</span>
                <span className="info-val" style={{ color: settings.autoRefresh ? "#16a361" : "#dc2626" }}>
                  {settings.autoRefresh ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>

          {/* ── Save Settings ─────────────────────────────── */}
          <div className="panel">
            <div className="panel-head">
              <span className="panel-head-icon">💾</span>
              <div>
                <div className="panel-title">Save Settings</div>
                <div className="panel-desc">Apply your configuration changes</div>
              </div>
            </div>
            <div className="panel-body">
              {saved === "success" && (
                <div className="save-banner save-banner-success">
                  ✅ Settings saved successfully.
                </div>
              )}
              {saved === "error" && (
                <div className="save-banner save-banner-error">
                  ❌ Failed to save. Please try again.
                </div>
              )}
              <div className="btn-row">
                <button className="btn-save" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save Settings"}
                </button>
                <button className="btn-reset" onClick={handleReset}>
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>

          {/* ── Primary Log Source Config (NEW) ──────────────── */}
          <div className="panel" style={{ gridColumn: "1 / -1" }}>
            <div className="panel-head">
              <span className="panel-head-icon">🚀</span>
              <div>
                <div className="panel-title">Primary Log Configuration</div>
                <div className="panel-desc">Quickly connect to an external website log file</div>
              </div>
            </div>
            <div className="panel-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "10px", alignItems: "end" }}>
                <div className="input-group">
                  <div className="input-label">Project Name</div>
                  <input 
                    className="input-field-email" 
                    placeholder="e.g. Test Website"
                    value={primaryLogConfig.projectName}
                    onChange={e => setPrimaryLogConfig({...primaryLogConfig, projectName: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <div className="input-label">Log File Path (Full Absolute Path)</div>
                  <input 
                    className="input-field-email" 
                    placeholder="/Users/yourname/Desktop/project/logs/app.log"
                    value={primaryLogConfig.logPath}
                    style={pathError ? { borderColor: "#e05252" } : {}}
                    onChange={e => { setPrimaryLogConfig({...primaryLogConfig, logPath: e.target.value}); setPathError(""); }}
                  />
                  {pathError && <div style={{ color: "#e05252", fontSize: "12px", marginTop: "4px" }}>{pathError}</div>}
                </div>
                <button 
                  className="btn-save" 
                  onClick={handleStartMonitoring} 
                  disabled={startingMonitor || !primaryLogConfig.logPath}
                  style={{ height: "42px", background: "#16a361" }}
                >
                  {startingMonitor ? "Starting..." : "Start Monitoring"}
                </button>
              </div>
              <div style={{ fontSize: "12px", color: "#8a94ad", marginTop: "10px" }}>
                Tip: Use the full absolute path to ensure the monitoring agent can locate the file.
              </div>
            </div>
          </div>

          {/* ── Project Log Monitoring (NEW) ──────────────── */}
          <div className="panel" style={{ gridColumn: "1 / -1" }}>
            <div className="panel-head">
              <span className="panel-head-icon">📂</span>
              <div>
                <div className="panel-title">Project Log Monitoring</div>
                <div className="panel-desc">Dynamically watch logs from any project</div>
              </div>
            </div>
            <div className="panel-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "10px", alignItems: "end" }}>
                <div className="input-group">
                  <div className="input-label">Project Name</div>
                  <input 
                    className="input-field-email" 
                    placeholder="e.g. My E-commerce Site"
                    value={newProject.name}
                    onChange={e => setNewProject({...newProject, name: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <div className="input-label">Log File Path</div>
                  <input 
                    className="input-field-email" 
                    placeholder="e.g. /var/log/nginx/error.log"
                    value={newProject.path}
                    onChange={e => setNewProject({...newProject, path: e.target.value})}
                  />
                </div>
                <button 
                  className="btn-save" 
                  onClick={handleAddProject} 
                  disabled={addingProj || !newProject.name || !newProject.path}
                  style={{ height: "42px" }}
                >
                  {addingProj ? "Adding..." : "Add Project"}
                </button>
              </div>

              <div style={{ marginTop: "20px" }}>
                <div className="input-label" style={{ marginBottom: "10px" }}>Active Project Monitors</div>
                {projects.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", background: "#fafbfd", borderRadius: "10px", color: "#8a94ad" }}>
                    No custom project logs being monitored yet.
                  </div>
                ) : (
                  <div style={{ border: "1px solid #f0f2f7", borderRadius: "10px", overflow: "hidden" }}>
                    {projects.map(proj => (
                      <div key={proj.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", background: "#fff", borderBottom: "1px solid #f0f2f7" }}>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a1d2e" }}>{proj.project_name}</div>
                          <div style={{ fontSize: "12px", color: "#8a94ad", fontFamily: "DM Mono" }}>{proj.log_path}</div>
                        </div>
                        <button 
                          onClick={() => handleDeleteProject(proj.id)}
                          style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}