import React, { useEffect, useState } from "react";
import axios from "axios";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: #f0f2f7; font-family: 'DM Sans', sans-serif; color: #1a1d2e; }

  .page { padding: 28px 32px; min-height: 100vh; background: #f0f2f7; }

  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px;
  }
  .topbar-title { font-size: 22px; font-weight: 600; color: #1a1d2e; letter-spacing: -.3px; }
  .topbar-sub { font-size: 13px; color: #8a94ad; margin-top: 3px; font-family: 'DM Mono', monospace; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }

  .live-pill {
    display: flex; align-items: center; gap: 6px;
    background: #e8faf2; border: 1px solid #a7e8c8;
    border-radius: 20px; padding: 5px 14px;
    font-size: 12px; font-weight: 600; color: #16a361; letter-spacing: .4px;
  }
  .live-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #16a361;
    animation: blink 1.4s ease-in-out infinite;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

  .refresh-btn {
    background: #fff; border: 1px solid #e2e6f0; border-radius: 8px;
    padding: 7px 16px; font-size: 13px; font-weight: 500; color: #374060;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: box-shadow .2s, border-color .2s;
  }
  .refresh-btn:hover { box-shadow: 0 2px 8px rgba(0,0,0,.08); border-color: #c8cfe0; }

  .stat-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 16px; margin-bottom: 24px;
  }
  .stat-card {
    background: #fff; border-radius: 14px; padding: 22px 24px;
    border: 1px solid #e8ecf4; box-shadow: 0 1px 4px rgba(0,0,0,.04);
    transition: box-shadow .2s, transform .2s;
    animation: fadeUp .4s ease both;
  }
  .stat-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,.07); transform: translateY(-2px); }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .stat-icon { font-size: 22px; margin-bottom: 12px; }
  .stat-value { font-size: 28px; font-weight: 600; color: #1a1d2e; letter-spacing: -.5px; line-height: 1; margin-bottom: 4px; }
  .stat-label { font-size: 13px; color: #8a94ad; font-weight: 500; }
  .stat-sub { font-size: 11px; color: #aab2c8; margin-top: 4px; font-family: 'DM Mono', monospace; }

  .panel-full {
    background: #fff; border-radius: 14px; border: 1px solid #e8ecf4;
    box-shadow: 0 1px 4px rgba(0,0,0,.04); overflow: hidden; margin-bottom: 20px;
  }
  .panel-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid #f0f2f7;
  }
  .panel-title { font-size: 14px; font-weight: 600; color: #1a1d2e; }
  .panel-count {
    font-size: 12px; font-weight: 600; background: #f0f2f7;
    color: #6b7a99; border-radius: 20px; padding: 2px 10px;
  }

  .data-table { width: 100%; border-collapse: collapse; }
  .data-table thead th {
    font-size: 11px; font-weight: 600; letter-spacing: .8px; text-transform: uppercase;
    color: #aab2c8; padding: 10px 20px; text-align: left;
    border-bottom: 1px solid #f0f2f7; background: #fafbfd;
  }
  .data-table tbody tr { border-bottom: 1px solid #f6f7fb; transition: background .15s; }
  .data-table tbody tr:last-child { border-bottom: none; }
  .data-table tbody tr:hover { background: #fafbff; }
  .data-table tbody td {
    padding: 11px 20px; font-size: 13px; color: #374060;
    font-family: 'DM Mono', monospace;
  }
  .td-time { color: #aab2c8; font-size: 12px; }

  .chip {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px;
    font-family: 'DM Sans', sans-serif; letter-spacing: .2px; white-space: nowrap;
  }
  .chip-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .chip-normal  { background: #e8faf2; color: #16a361; }
  .chip-normal  .chip-dot { background: #16a361; }
  .chip-warning { background: #fff7e6; color: #d97706; }
  .chip-warning .chip-dot { background: #d97706; }
  .chip-error   { background: #fef2f2; color: #dc2626; }
  .chip-error   .chip-dot { background: #dc2626; animation: blink 1.2s ease-in-out infinite; }

  .val-normal  { color: #374060; }
  .val-warning { color: #d97706; font-weight: 600; }
  .val-error   { color: #dc2626; font-weight: 600; }

  .row-error   { background: #fff8f8 !important; }
  .row-warning { background: #fffdf5 !important; }

  .usage-bar-track {
    width: 80px; height: 6px; background: #f0f2f7;
    border-radius: 99px; overflow: hidden; display: inline-block; vertical-align: middle; margin-right: 8px;
  }
  .usage-bar-fill { height: 100%; border-radius: 99px; transition: width .6s ease; }

  @media (max-width: 900px) {
    .stat-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

const fmt  = v => (v === null || v === undefined) ? "—" : Number(v).toFixed(1);
const fmtT = t => t ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";
const fmtD = t => t ? new Date(t).toLocaleDateString([], { month: "short", day: "numeric" }) : "—";

function getSeverity(val) {
  const n = parseFloat(val);
  if (n > 85) return "error";
  if (n > 70) return "warning";
  return "normal";
}

function rowSeverity(m) {
  if ([m.cpu, m.memory, m.disk].some(v => parseFloat(v) > 85)) return "error";
  if ([m.cpu, m.memory, m.disk].some(v => parseFloat(v) > 70)) return "warning";
  return "normal";
}

function StatusChip({ level }) {
  const labels = { normal: "Normal", warning: "Warning", error: "Error" };
  return (
    <span className={`chip chip-${level}`}>
      <span className="chip-dot" />
      {labels[level]}
    </span>
  );
}

function UsageBar({ value }) {
  const n = parseFloat(value) || 0;
  const sev = getSeverity(n);
  const color = sev === "error" ? "#dc2626" : sev === "warning" ? "#f59e0b" : "#22c55e";
  return (
    <span>
      <span className="usage-bar-track">
        <span className="usage-bar-fill" style={{ width: `${Math.min(n, 100)}%`, background: color }} />
      </span>
      <span className={`val-${sev}`}>{fmt(n)}%</span>
    </span>
  );
}

function avg(arr, key) {
  if (!arr.length) return 0;
  return arr.reduce((s, m) => s + (parseFloat(m[key]) || 0), 0) / arr.length;
}

export default function Systems() {
  const [metrics, setMetrics] = useState([]);
  const [now, setNow]         = useState(new Date());
  const [fetchError, setFetchError] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/metrics/latest");
      setMetrics(res.data || []);
      setFetchError(null);
    } catch (err) {
      console.error("Systems fetch error:", err);
      setFetchError(err.message || "Unknown error");
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const cpuAvg  = avg(metrics, "cpu").toFixed(1);
  const memAvg  = avg(metrics, "memory").toFixed(1);
  const diskAvg = avg(metrics, "disk").toFixed(1);
  const netAvg  = avg(metrics, "network").toFixed(1);

  const errorCount   = metrics.filter(m => rowSeverity(m) === "error").length;
  const warningCount = metrics.filter(m => rowSeverity(m) === "warning").length;

  return (
    <>
      <style>{STYLES}</style>
      <div className="page">

        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="topbar-title">Systems</div>
            <div className="topbar-sub">{now.toLocaleDateString()} · {now.toLocaleTimeString()}</div>
          </div>
          <div className="topbar-right">
            <div className="live-pill"><div className="live-dot" />LIVE</div>
            <button className="refresh-btn" onClick={fetchData}>↻ Refresh</button>
          </div>
        </div>

        {fetchError && (
          <div style={{ margin: "12px 0", padding: "12px 16px", background: "#fee2e2", color: "#b91c1c", borderRadius: 12 }}>
            <strong>Fetch error:</strong> {fetchError}
          </div>
        )}

        {/* Summary Cards */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-value" style={{ color: getSeverity(cpuAvg) === "error" ? "#dc2626" : getSeverity(cpuAvg) === "warning" ? "#d97706" : "#1a1d2e" }}>
              {cpuAvg}%
            </div>
            <div className="stat-label">Avg CPU Usage</div>
            <div className="stat-sub">across {metrics.length} records</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🧠</div>
            <div className="stat-value" style={{ color: getSeverity(memAvg) === "error" ? "#dc2626" : getSeverity(memAvg) === "warning" ? "#d97706" : "#1a1d2e" }}>
              {memAvg}%
            </div>
            <div className="stat-label">Avg Memory Usage</div>
            <div className="stat-sub">across {metrics.length} records</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💾</div>
            <div className="stat-value" style={{ color: getSeverity(diskAvg) === "error" ? "#dc2626" : getSeverity(diskAvg) === "warning" ? "#d97706" : "#1a1d2e" }}>
              {diskAvg}%
            </div>
            <div className="stat-label">Avg Disk Usage</div>
            <div className="stat-sub">across {metrics.length} records</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🌐</div>
            <div className="stat-value">{netAvg}</div>
            <div className="stat-label">Avg Network KB/s</div>
            <div className="stat-sub">across {metrics.length} records</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔴</div>
            <div className="stat-value" style={{ color: errorCount > 0 ? "#dc2626" : "#1a1d2e" }}>{errorCount}</div>
            <div className="stat-label">Critical Records</div>
            <div className="stat-sub">CPU / Memory / Disk &gt; 85%</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🟡</div>
            <div className="stat-value" style={{ color: warningCount > 0 ? "#d97706" : "#1a1d2e" }}>{warningCount}</div>
            <div className="stat-label">Warning Records</div>
            <div className="stat-sub">CPU / Memory / Disk &gt; 70%</div>
          </div>
        </div>

        {/* Metrics Table */}
        <div className="panel-full">
          <div className="panel-head">
            <div className="panel-title">System Metrics</div>
            <span className="panel-count">{metrics.length} records</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>System ID</th>
                <th>Time</th>
                <th>CPU</th>
                <th>Memory</th>
                <th>Disk</th>
                <th>Network KB/s</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, i) => {
                const sev = rowSeverity(m);
                return (
                  <tr key={i} className={sev !== "normal" ? `row-${sev}` : ""}>
                    <td style={{ fontFamily: "'DM Mono', monospace", color: "#6b7a99" }}>
                      SYS-{String(i + 1).padStart(3, "0")}
                    </td>
                    <td className="td-time">{fmtD(m.recorded_at)} {fmtT(m.recorded_at)}</td>
                    <td><UsageBar value={m.cpu} /></td>
                    <td><UsageBar value={m.memory} /></td>
                    <td><UsageBar value={m.disk} /></td>
                    <td>{fmt(m.network)}</td>
                    <td><StatusChip level={sev} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}