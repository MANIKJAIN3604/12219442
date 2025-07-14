import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LinkInsights from "./pages/LinkInsights";
import ShortlinkRedirect from "./pages/ShortlinkRedirect";

function QuickLinkApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/insights" element={<LinkInsights />} />
        <Route path="/:aliasCode" element={<ShortlinkRedirect />} />
      </Routes>
    </Router>
  );
}

export default QuickLinkApp;
