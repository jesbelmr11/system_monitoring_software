import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout    from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Systems   from "./components/Systems";
import Alerts    from "./components/Alerts";
import Settings  from "./components/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* All pages share the Layout (sidebar) */}
        <Route element={<Layout />}>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/systems"  element={<Systems />}   />
          <Route path="/alerts"   element={<Alerts />}    />
          <Route path="/settings" element={<Settings />}  />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}