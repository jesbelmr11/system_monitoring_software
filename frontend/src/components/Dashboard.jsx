import React, { useEffect, useState } from "react";
import axios from "axios";

const STYLES = `
  .dash {
    min-height: 100vh;
    background: #f0f2f7;
  }

  .main {
    padding: 28px 32px;
    min-height: 100vh;
    width: 100%;
  }

  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px;
  }
  .topbar-title {
    font-size: 22px; font-weight: 600;
    color: #1a1d2e; letter-spacing: -.3px;
  }
  .topbar-sub {
    font-size: 13px; color: #8a94ad; margin-top: 3px;
    font-family: 'DM Mono', monospace;
  }
  .topbar-right { display: flex; align-items: center; gap: 12px; }

  .live-pill {
    display: flex; align-items: center; gap: 6px;
    background: #e8faf2;
    border: 1px solid #a7e8c8;
    border-radius: 20px;
    padding: 5px 14px;
    font-size: 12px; font-weight: 600;
    color: #16a361; letter-spacing: .4px;
  }
  .live-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #16a361;
    animation: blink 1.4s ease-in-out infinite;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

  .refresh-btn {
    background: #fff;
    border: 1px solid #e2e6f0;
    border-radius: 8px;
    padding: 7px 16px;
    font-size: 13px; font-weight: 500;
    color: #374060; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: box-shadow .2s, border-color .2s;
  }
  .refresh-btn:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,.08);
    border-color: #c8cfe0;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }
  .stat-card {
    background: #fff;
    border-radius: 14px;
    padding: 22px 24px;
    border: 1px solid #e8ecf4;
    box-shadow: 0 1px 4px rgba(0,0,0,.04);
    transition: box-shadow .2s, transform .2s;
    animation: fadeUp .4s ease both;
  }
  .stat-card:hover {
    box-shadow: 0 6px 20px rgba(0,0,0,.07);
    transform: translateY(-2px);
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .stat-value {
    font-size: 30px; font-weight: 600;
    color: #1a1d2e; letter-spacing: -.5px;
    line-height: 1; margin-bottom: 6px;
  }
  .stat-label {
    font-size: 13px; color: #8a94ad; font-weight: 500;
  }

  .panel-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  .panel {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #e8ecf4;
    box-shadow: 0 1px 4px rgba(0,0,0,.04);
    overflow: hidden;
  }
  .panel-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #f0f2f7;
  }
  .panel-title {
    font-size: 14px; font-weight: 600; color: #1a1d2e;
  }

  .panel-full {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #e8ecf4;
    box-shadow: 0 1px 4px rgba(0,0,0,.04);
    overflow: hidden;
    margin-bottom: 20px;
  }
  .panel-count {
    font-size: 12px; font-weight: 600;
    background: #f0f2f7; color: #6b7a99;
    border-radius: 20px; padding: 2px 10px;
  }

  .data-table { width: 100%; border-collapse: collapse; }
  .data-table thead th {
    font-size: 11px; font-weight: 600;
    letter-spacing: .8px; text-transform: uppercase;
    color: #aab2c8;
    padding: 10px 20px;
    text-align: left;
    border-bottom: 1px solid #f0f2f7;
    background: #fafbfd;
  }
  .data-table tbody tr {
    border-bottom: 1px solid #f6f7fb;
    transition: background .15s;
  }
  .data-table tbody tr:last-child { border-bottom: none; }
  .data-table tbody tr:hover { background: #fafbff; }
  .data-table tbody td {
    padding: 11px 20px;
    font-size: 13px;
    color: #374060;
    font-family: 'DM Mono', monospace;
  }
  .td-time { color: #aab2c8; font-size: 12px; }

  .chip {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600;
    padding: 3px 10px; border-radius: 20px;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: .2px;
    white-space: nowrap;
  }
  .chip-dot {
    width: 6px; height: 6px; border-radius: 50%;
    flex-shrink: 0;
  }
  .chip-normal, .chip-info { background: #e8faf2; color: #16a361; }
  .chip-normal .chip-dot, .chip-info .chip-dot { background: #16a361; }
  .chip-warning { background: #fff7e6; color: #d97706; }
  .chip-warning .chip-dot { background: #d97706; }
  .chip-error   { background: #fef2f2; color: #dc2626; }
  .chip-error   .chip-dot { background: #dc2626; animation: blink 1.2s ease-in-out infinite; }

  .val-normal, .val-info { color: #374060; }
  .val-warning { color: #d97706; font-weight: 600; }
  .val-error   { color: #dc2626; font-weight: 600; }

  .row-error   { background: #fff8f8 !important; }
  .row-warning { background: #fffdf5 !important; }
  .row-info, .row-normal { background: transparent; }

  .sparkline-wrap { padding: 16px 20px 20px; }
  .sparkline-labels {
    display: flex; justify-content: space-between;
    margin-top: 6px;
    font-size: 11px; color: #aab2c8;
    font-family: 'DM Mono', monospace;
  }

  @media (max-width: 900px) {
    .stat-grid  { grid-template-columns: repeat(2, 1fr); }
    .panel-row  { grid-template-columns: 1fr; }
  }
`;

/* ── Sparkline ── */
function Sparkline({ data, color, gradientId }) {
  if (!data || data.length < 2) {
    return (
      <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: "#aab2c8", fontSize: 13 }}>
        Not enough data
      </div>
    );
  }
  const W = 500, H = 80, PAD = 4;
  const min = Math.min(...data);
  const max = Math.max(...data) || 1;
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return `${x},${y}`;
  });
  const polyline = points.join(" ");
  const firstPt  = points[0].split(",");
  const lastPt   = points[points.length - 1].split(",");
  const areaPath = `M ${points.join(" L ")} L ${lastPt[0]},${H} L ${firstPt[0]},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 80, display: "block" }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((pt, i) => {
        const [x, y] = pt.split(",");
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#fff" stroke={color} strokeWidth="1.5" />;
      })}
      <circle cx={lastPt[0]} cy={lastPt[1]} r="4" fill={color} stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

/* ── Helpers ── */
const fmt  = v => (v === null || v === undefined) ? "—" : Number(v).toFixed(1);
const fmtT = t => t ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";
const fmtD = t => t ? new Date(t).toLocaleDateString([], { month: "short", day: "numeric" }) : "—";



// ✅ REPLACE HERE
function getSeverity(val, threshold) {
  const n = parseFloat(val);

  if (n > threshold) return "error";
  if (n > threshold * 0.8) return "warning";
  return "normal";
}

function rowSeverity(m, cpuThreshold, memThreshold) {
  if (
    parseFloat(m.cpu) > cpuThreshold ||
    parseFloat(m.memory) > memThreshold
  ) return "error";

  if (
    parseFloat(m.cpu) > cpuThreshold * 0.8 ||
    parseFloat(m.memory) > memThreshold * 0.8
  ) return "warning";

  return "normal";
}

function alertSeverity(status) {
  return (status || "normal").toLowerCase();
}

function StatusChip({ level }) {
  const norm = (level || "Normal").toLowerCase();
  const labels = { 
    normal: "Normal", 
    info: "Normal", 
    warning: "Warning", 
    error: "Error",
    "normal operation": "Normal"
  };
  const displayLabel = labels[norm] || (norm.charAt(0).toUpperCase() + norm.slice(1));
  const chipClass = (norm === "info" || norm === "normal operation") ? "normal" : norm;
  
  return (
    <span className={`chip chip-${chipClass}`}>
      <span className="chip-dot" />
      {displayLabel}
    </span>
  );
}



function ValCell({ value, threshold, unit = "" }) {
  const sev = getSeverity(value, threshold); 
  return <td className={`val-${sev}`}>{fmt(value)}{unit}</td>;
}

/* ── Dashboard ── */
export default function Dashboard() {

  console.log("🖥️ Dashboard component rendered");

  const [metrics, setMetrics] = useState([]);
  const [alerts, setAlerts]   = useState([]);
  const [now, setNow]         = useState(new Date());
  const [fetchError, setFetchError] = useState(null);

  // ── Project Filtering ─────────────────────────────────────
  const [projects,        setProjects]        = useState([]);
  const [selectedProject, setSelectedProject] = useState("ALL");

  const cpuThreshold = Number(localStorage.getItem("cpuThreshold") || 85);
  const memThreshold = Number(localStorage.getItem("memThreshold") || 85);
  

  const fetchData = async () => {
    try {
      const metricsRes = await axios.get("http://localhost:5001/api/metrics/latest");
      const alertsRes  = await axios.get("http://localhost:5001/api/predictions");
      const projRes    = await axios.get("http://localhost:5001/api/projects");
      
      const alertsData = alertsRes.data || [];
      setMetrics(metricsRes.data || []);
      setAlerts(alertsData);
      setProjects(projRes.data || []);
      setFetchError(null);
      console.log("📊 Fetched alerts:", alertsData);
    } catch (error) {
      console.error("Dashboard API error:", error);
      setFetchError(error.message || "Unknown error");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/logs");
      console.log("📊 UI logs:", res.data.length);
      setLogs(res.data);
    } catch (e) {
      console.error("Fetch logs error:", e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (window.electron && window.electron.onLog) {
      window.electron.onLog((log) => {
        console.log("Received log:", log);
        setLogs(prev => [...prev, log]);
      });
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const latest = metrics[0] || {};

// ✅ MAP BACKEND PREDICTIONS TO ALERTS
const aiAlertsFormatted = alerts.map((a) => ({
  ...a,
  severity: (a.status || "NORMAL").toLowerCase(),
  type: "ai"
}));

const logsFormatted = logs.map((l) => ({
  project_name: l.project || l.projectName,
  message: l.message,
  status: l.status,
  severity: (l.status === "INFO" ? "normal" : (l.status || "NORMAL").toLowerCase()),
  type: "log",
  predicted_at: l.timestamp || new Date(),
  causes: l.causes || [],
  root_cause: l.rootCause || "Unknown",
  probability_percentage: l.probability ? `${l.probability}%` : "N/A",
  issue: l.issue || l.message
}));

// ✅ MERGE - Show only backend predictions (System + User Projects) and logs
const allAlerts = [...aiAlertsFormatted, ...logsFormatted]
  .filter(a => selectedProject === "ALL" || a.project_name === selectedProject)
  .sort((a, b) => new Date(b.predicted_at) - new Date(a.predicted_at));

const filteredMetrics = metrics.filter(m => selectedProject === "ALL" || (m.project_name || "System") === selectedProject);

  // limit chart to last 10 records
  const cpuHistory = metrics
    .slice(0, 10)
    .map(m => parseFloat(m.cpu || 0))
    .reverse();

  const memHistory = metrics
    .slice(0, 10)
    .map(m => parseFloat(m.memory || 0))
    .reverse();

  return (
    <>
      <style>{STYLES}</style>
      <div className="dash">
        <div className="main">

          {/* Topbar */}
          <div className="topbar">
            <div>
              <div className="topbar-title">System Monitor</div>
              <div className="topbar-sub">{now.toLocaleDateString()} · {now.toLocaleTimeString()}</div>
            </div>
            <div className="topbar-right">
              <select 
                className="refresh-btn" 
                value={selectedProject} 
                onChange={(e) => { setSelectedProject(e.target.value); fetchData(); }}
                style={{ padding: '6px 12px' }}
              >
                <option value="ALL">All Projects</option>
                <option value="System">System</option>
                {projects.map(p => (
                  <option key={p.id} value={p.project_name}>{p.project_name}</option>
                ))}
              </select>
              <div className="live-pill"><div className="live-dot"/>LIVE</div>
              <button className="refresh-btn" onClick={fetchData}>↻ Refresh</button>
            </div>
          </div>

          {fetchError && (
            <div style={{ margin: "12px 0", padding: "12px 16px", background: "#fee2e2", color: "#b91c1c", borderRadius: 12 }}>
              <strong>Fetch error:</strong> {fetchError}
            </div>
          )}

          {/* Stat Cards */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{fmt(latest.cpu)}%</div>
              <div className="stat-label">CPU Usage</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{fmt(latest.memory)}%</div>
              <div className="stat-label">Memory Usage</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{fmt(latest.disk)}%</div>
              <div className="stat-label">Disk Usage</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{fmt(latest.network)}</div>
              <div className="stat-label">Network I/O</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{allAlerts.length}</div>
              <div className="stat-label">Active Alerts</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="panel-row">
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">CPU Trend</div>
                <span className="panel-count">{fmt(latest.cpu)}%</span>
              </div>
              <div className="sparkline-wrap">
                <Sparkline data={cpuHistory} color="#3b82f6" gradientId="cpuGrad" />
                <div className="sparkline-labels">
                  <span>{cpuHistory.length} polls ago</span><span>now</span>
                </div>
              </div>
            </div>
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Memory Trend</div>
                <span className="panel-count">{fmt(latest.memory)}%</span>
              </div>
              <div className="sparkline-wrap">
                <Sparkline data={memHistory} color="#8b5cf6" gradientId="memGrad" />
                <div className="sparkline-labels">
                  <span>{memHistory.length} polls ago</span><span>now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics History */}
          <div className="panel-full">
            <div className="panel-head">
              <div className="panel-title">Recent Metrics History</div>
              <span className="panel-count">{metrics.length} records</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Project</th>
                  <th>CPU %</th>
                  <th>Memory %</th>
                  <th>Disk %</th>
                  <th>Network</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMetrics.map((m, i) => {
                  const sev = rowSeverity(m, cpuThreshold, memThreshold);
                  return (
                    <tr key={i} className={sev !== "normal" ? `row-${sev}` : ""}>
                      <td className="td-time">{fmtD(m.recorded_at)} {fmtT(m.recorded_at)}</td>
                      <td style={{ fontWeight: 600 }}>{m.project_name || "System"}</td>
                      <ValCell value={m.cpu} threshold={cpuThreshold} />
                      <ValCell value={m.memory} threshold={memThreshold} />
                      <ValCell value={m.disk} />
                      <td>{fmt(m.network)}</td>
                      <td><StatusChip level={sev} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Alerts */}
          <div className="panel-full">
            <div className="panel-head">
              <div className="panel-title">Recent Alerts</div>
              <span className="panel-count">{allAlerts.length} alerts</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Log Message</th>
                  <th>Root Cause</th>
                  <th>Probability</th>
                  <th>Issue</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allAlerts.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#8a94ad" }}>
                      No logs yet
                    </td>
                  </tr>
                ) : (
                  allAlerts.map((a, i) => {
                    const prob = parseFloat((a.probability_percentage || "0").replace("%",""));
                    const status = a.status || "Normal";
                    const sev = status.toLowerCase();
                    
                    return (
                      <tr key={i} className={sev === "error" ? "row-error" : sev === "warning" ? "row-warning" : ""}>
                        <td style={{ fontWeight: 600 }}>{a.project_name || "System"}</td>
                        <td>{a.message || "—"}</td>
                        <td>
                          {a.type === "log" && a.causes && a.causes.length > 0 
                            ? a.causes.map((c, idx) => (
                                <div key={idx}>{c.cause} ({c.probability}%)</div>
                              ))
                            : (a.root_cause && a.root_cause !== "Unknown" 
                                ? a.root_cause 
                                : (sev === "warning" ? "System Warning" : sev === "error" ? "Unknown Error" : "Normal Operation"))}
                        </td>
                        <td>
                          {a.type === "log" && a.causes && a.causes.length > 0
                            ? "—" 
                            : (prob > 0 ? prob.toFixed(0) + "%" : (a.probability_percentage && a.probability_percentage !== "N/A" ? a.probability_percentage : (sev === "normal" ? "10%" : sev === "warning" ? "70%" : "N/A")))}
                        </td>
                        <td>
                          {a.type === "log" 
                            ? (a.causes && a.causes.length > 0 
                                ? a.causes.map((c, idx) => (
                                    <div key={idx}>{c.issue}</div>
                                  ))
                                : (a.issue && a.issue !== a.message ? a.issue : (sev === "warning" ? "Performance degradation or non-critical issue" : sev === "error" ? a.message : "System running normally")))
                            : ((a.top_predictions || [])
                                .map(p => `${p.root_cause} (${p.probability})`)
                                .join(", ") || "—")}
                        </td>
                        <td className="td-time">
                          {fmtD(a.predicted_at)} {fmtT(a.predicted_at)}
                        </td>
                        <td>
                          <StatusChip level={sev} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </>
  );
}