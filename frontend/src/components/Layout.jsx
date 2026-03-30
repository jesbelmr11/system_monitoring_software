import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

const LAYOUT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #f0f2f7;
    font-family: 'DM Sans', sans-serif;
    color: #1a1d2e;
  }

  .layout {
    min-height: 100vh;
    background: #f0f2f7;
    display: flex;
  }

  .sidebar {
    position: fixed; top: 0; left: 0;
    width: 64px;
    height: 100vh;
    background: #1a1d2e;
    display: flex; flex-direction: column; align-items: center;
    padding: 20px 0;
    gap: 6px;
    z-index: 100;
  }
  .sidebar-logo {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #4f8ef7, #2563eb);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    margin-bottom: 24px;
    cursor: default;
  }
  .sidebar-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    cursor: pointer;
    transition: background .2s;
    color: #6b7a99;
    position: relative;
  }
  .sidebar-icon:hover { background: rgba(255,255,255,.08); color: #fff; }
  .sidebar-icon.active { background: rgba(79,142,247,.18); color: #4f8ef7; }

  .layout-main {
    margin-left: 64px;
    width: 100%;
    min-height: 100vh;
  }
`;

const NAV_ITEMS = [
  { icon: "📊", path: "/",         label: "Dashboard" },
  { icon: "🖥️", path: "/systems",  label: "Systems"   },
  { icon: "🔔", path: "/alerts",   label: "Alerts"    },
  { icon: "⚙️", path: "/settings", label: "Settings"  },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <style>{LAYOUT_STYLES}</style>
      <div className="layout">

        {/* Shared Sidebar */}
        <div className="sidebar">
          <div className="sidebar-logo">⬡</div>

          {NAV_ITEMS.map(({ icon, path, label }) => {
            const isActive = location.pathname === path;
            return (
              <div
                key={path}
                className={`sidebar-icon ${isActive ? "active" : ""}`}
                onClick={() => navigate(path)}
                title={label}
              >
                {icon}
              </div>
            );
          })}
        </div>

        {/* Page content rendered here */}
        <div className="layout-main">
          <Outlet />
        </div>

      </div>
    </>
  );
}