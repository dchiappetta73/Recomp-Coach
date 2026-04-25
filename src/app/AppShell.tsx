import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/program", label: "Program" },
  { to: "/workout", label: "Workout" },
  { to: "/daily-metrics", label: "Daily Metrics" },
  { to: "/weekly-checkin", label: "Weekly Check-In" },
  { to: "/weekly-export", label: "Weekly Export" },
  { to: "/progress-hub", label: "Progress Hub" },
  { to: "/analysis", label: "Analysis" },
  { to: "/integrations", label: "Integrations" },
  { to: "/settings", label: "Settings" },
];

export default function AppShell() {
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" }}>
      <header
        style={{
          borderBottom: "1px solid #334155",
          padding: "16px 20px",
          background: "#020617",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px" }}>Recomp Coach Platform</h1>
        <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "13px" }}>
          Goal-flexible health, training, and progress system
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          minHeight: "calc(100vh - 73px)",
        }}
      >
        <aside
          style={{
            borderRight: "1px solid #334155",
            padding: "20px 12px",
            background: "#0b1220",
          }}
        >
          <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                style={({ isActive }) => ({
                  textDecoration: "none",
                  color: isActive ? "#ffffff" : "#cbd5e1",
                  background: isActive ? "#2563eb" : "transparent",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main style={{ padding: "24px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
