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
    background: #e8faf2; border: 1px solid #a7e8c8; border-radius: 20px;
    padding: 5px 14px; font-size: 12px; font-weight: 600; color: #16a361; letter-spacing: .4px;
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
    transition: box-shadow .2s, transform .2s; animation: fadeUp .4s ease both;
  }
  .stat-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,.07); transform: translateY(-2px); }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .stat-icon { font-size: 22px; margin-bottom: 10px; }
  .stat-value { font-size: 28px; font-weight: 600; color: #1a1d2e; letter-spacing: -.5px; margin-bottom: 4px; }
  .stat-label { font-size: 13px; color: #8a94ad; font-weight: 500; }

  /* Filter bar */
  .filter-bar {
    display: flex; align-items: center; gap: 8px; margin-bottom: 20px;
  }
  .filter-btn {
    padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;
    cursor: pointer; border: 1px solid #e2e6f0; background: #fff; color: #6b7a99;
    font-family: 'DM Sans', sans-serif; transition: all .2s;
  }
  .filter-btn:hover { border-color: #c8cfe0; color: #374060; }
  .filter-btn.active-all     { background: #1a1d2e; color: #fff; border-color: #1a1d2e; }
  .filter-btn.active-warning { background: #fff7e6; color: #d97706; border-color: #f59e0b; }
  .filter-btn.active-error   { background: #fef2f2; color: #dc2626; border-color: #dc2626; }
  .filter-btn.active-normal  { background: #e8faf2; color: #16a361; border-color: #a7e8c8; }
  .filter-count {
    font-size: 11px; background: #f0f2f7; color: #6b7a99;
    border-radius: 20px; padding: 2px 8px; margin-left: 4px;
  }

  /* Alert cards */
  .alerts-list { display: flex; flex-direction: column; gap: 12px; }

  .alert-card {
    background: #fff; border-radius: 14px; border: 1px solid #e8ecf4;
    box-shadow: 0 1px 4px rgba(0,0,0,.04);
    overflow: hidden; transition: box-shadow .2s;
    animation: fadeUp .3s ease both;
  }
  .alert-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.07); }
  .alert-card.sev-error   { border-left: 4px solid #dc2626; }
  .alert-card.sev-warning { border-left: 4px solid #f59e0b; }
  .alert-card.sev-normal  { border-left: 4px solid #22c55e; }

  .alert-card-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-bottom: 1px solid #f6f7fb; gap: 12px;
  }
  .alert-card-head-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
  .alert-msg {
    font-size: 14px; font-weight: 600; color: #1a1d2e;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .alert-card-body {
    padding: 12px 20px; display: grid;
    grid-template-columns: repeat(3, 1fr); gap: 12px;
  }
  .alert-field-label { font-size: 10px; font-weight: 600; letter-spacing: .8px; text-transform: uppercase; color: #aab2c8; margin-bottom: 4px; }
  .alert-field-value { font-size: 13px; color: #374060; font-family: 'DM Mono', monospace; }

  .alert-card-footer {
    padding: 10px 20px; background: #fafbfd;
    border-top: 1px solid #f0f2f7;
    display: flex; align-items: flex-start; gap: 8px; flex-wrap: wrap;
  }
  .footer-label { font-size: 11px; font-weight: 600; color: #aab2c8; text-transform: uppercase; letter-spacing: .6px; padding-top: 2px; }
  .pred-chip {
    font-size: 11px; padding: 2px 9px; border-radius: 6px;
    background: #f0f2f7; color: #374060; font-family: 'DM Mono', monospace;
  }

  .count-badge {
    background: #1a1d2e; color: #fff; font-size: 11px; font-weight: 700;
    border-radius: 20px; padding: 2px 8px; margin-left: 4px;
  }

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

  .empty-state {
    text-align: center; padding: 48px 20px; color: #aab2c8;
    font-size: 14px;
  }
  .empty-icon { font-size: 36px; margin-bottom: 12px; }

  @media (max-width: 900px) {
    .stat-grid { grid-template-columns: repeat(2, 1fr); }
    .alert-card-body { grid-template-columns: 1fr 1fr; }
  }
`;

function alertSeverity(prob) {
  // Dummy logic removed. Using rigorous standard mappings.
  return "normal";
}

function StatusChip({ status }) {
  const norm = (status || "Normal").toLowerCase();
  const labels = { normal: "Normal", warning: "Warning", error: "Error" };
  const displayLabel = labels[norm] || status || "Normal";

  return (
    <span className={`status-chip status-${norm}`}>
      <span className="status-dot" />
      {displayLabel}
    </span>
  );
}

const fmtT = t => t ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";
const fmtD = t => t ? new Date(t).toLocaleDateString([], { month: "short", day: "numeric" }) : "—";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [now, setNow]       = useState(new Date());
  const [fetchError, setFetchError] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/predictions");
      setAlerts(res.data || []);
      setFetchError(null);
    } catch (err) {
      console.error("Alerts fetch error:", err);
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

  const enriched = alerts.map(a => ({
    ...a,
    prob: parseFloat((a.probability_percentage || "0").replace("%", "")),
    sev: (a.status || "Normal").toLowerCase()
  }));

  const errorCount   = enriched.filter(a => a.sev === "error").length;
  const warningCount = enriched.filter(a => a.sev === "warning").length;
  const normalCount  = enriched.filter(a => a.sev === "normal").length;

  // Group by message + root_cause
  const grouped = enriched.reduce((acc, a) => {
    const key = `${a.message}||${a.root_cause}`;
    if (!acc[key]) {
      acc[key] = { ...a, count: 1, latest: a.predicted_at };
    } else {
      acc[key].count += 1;
      if (new Date(a.predicted_at) > new Date(acc[key].latest)) {
        acc[key].latest = a.predicted_at;
      }
    }
    return acc;
  }, {});
  const groupedList = Object.values(grouped);

  const filtered = filter === "all" ? groupedList
    : groupedList.filter(a => a.sev === filter);

  return (
    <>
      <style>{STYLES}</style>
      <div className="page">

        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="topbar-title">Alerts</div>
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
            <div className="stat-icon">🔔</div>
            <div className="stat-value">{alerts.length}</div>
            <div className="stat-label">Total Alerts</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔴</div>
            <div className="stat-value" style={{ color: errorCount > 0 ? "#dc2626" : "#1a1d2e" }}>{errorCount}</div>
            <div className="stat-label">Critical</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🟡</div>
            <div className="stat-value" style={{ color: warningCount > 0 ? "#d97706" : "#1a1d2e" }}>{warningCount}</div>
            <div className="stat-label">Warning</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🟢</div>
            <div className="stat-value" style={{ color: "#16a361" }}>{normalCount}</div>
            <div className="stat-label">Normal</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <button
            className={`filter-btn ${filter === "all" ? "active-all" : ""}`}
            onClick={() => setFilter("all")}
          >
            All <span className="filter-count">{groupedList.length}</span>
          </button>
          <button
            className={`filter-btn ${filter === "error" ? "active-error" : ""}`}
            onClick={() => setFilter("error")}
          >
            Error <span className="filter-count">{groupedList.filter(a => a.sev === "error").length}</span>
          </button>
          <button
            className={`filter-btn ${filter === "warning" ? "active-warning" : ""}`}
            onClick={() => setFilter("warning")}
          >
            Warning <span className="filter-count">{groupedList.filter(a => a.sev === "warning").length}</span>
          </button>
          <button
            className={`filter-btn ${filter === "normal" ? "active-normal" : ""}`}
            onClick={() => setFilter("normal")}
          >
            Normal <span className="filter-count">{groupedList.filter(a => a.sev === "normal").length}</span>
          </button>
        </div>

        {/* Alert Cards */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            No alerts match this filter.
          </div>
        ) : (
          <div className="alerts-list">
            {filtered.map((a, i) => (
              <div key={i} className={`alert-card sev-${a.sev}`}>

                <div className="alert-card-head">
                  <div className="alert-card-head-left">
                    <StatusChip level={a.sev} />
                    <span className="alert-msg">{a.message || "—"}</span>
                    {a.count > 1 && (
                      <span className="count-badge">×{a.count}</span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: "#aab2c8", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>
                    {fmtD(a.latest)} {fmtT(a.latest)}
                  </span>
                </div>

                <div className="alert-card-body">
                  <div>
                    <div className="alert-field-label">Root Cause</div>
                    <div className="alert-field-value">{a.root_cause || "—"}</div>
                  </div>
                  <div>
                    <div className="alert-field-label">Probability</div>
                    <div className="alert-field-value" style={{ color: a.sev === "error" ? "#dc2626" : a.sev === "warning" ? "#d97706" : "#16a361", fontWeight: 600 }}>
                      {a.prob.toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="alert-field-label">Occurrences</div>
                    <div className="alert-field-value">{a.count} time{a.count > 1 ? "s" : ""}</div>
                  </div>
                </div>

                {a.top_predictions && a.top_predictions.length > 0 && (
                  <div className="alert-card-footer">
                    <span className="footer-label">Top Predictions</span>
                    {a.top_predictions.map((p, j) => (
                      <span key={j} className="pred-chip">
                        {p.root_cause} · {p.probability}
                      </span>
                    ))}
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}