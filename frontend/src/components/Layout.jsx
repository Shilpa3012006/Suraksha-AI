import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../App.css";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/upload": "Upload Evidence",
  "/evidence": "Evidence Library",
  "/verify": "Verify Evidence",
  "/trusted-contacts": "Trusted Contacts",
  "/reports": "Reports",
  "/profile": "Profile",
};

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] ?? "Suraksha-AI";

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="layout-main">
        <Navbar
          title={pageTitle}
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
