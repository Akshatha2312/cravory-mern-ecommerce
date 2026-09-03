import { Link, useLocation } from "react-router-dom";

function AdminNav() {
  const location = useLocation();

  const links = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/vendors", label: "Bakers / Vendors", icon: "🧁" },
    { path: "/admin/users", label: "User Accounts", icon: "👤" },
    { path: "/admin/products", label: "Products Catalog", icon: "📦" },
    { path: "/admin/orders", label: "Customer Orders", icon: "🛒" },
    { path: "/admin/coupons", label: "Coupons", icon: "🎟️" },
    { path: "/admin/analytics", label: "Analytics", icon: "📈" },
  ];

  return (
    <div style={styles.navContainer}>
      <div className="cravory-container" style={styles.innerContainer}>
        {/* Header Bar */}
        <div style={styles.headerRow}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={styles.logoBadge}>🛡️</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={styles.title}>Cravory Admin Portal</h2>
                <span className="cravory-badge" style={{ backgroundColor: "var(--cravory-danger-bg)", color: "var(--cravory-danger)", border: "1px solid var(--cravory-danger-border)" }}>
                  System Administrator
                </span>
              </div>
              <p style={styles.subtitle}>
                Marketplace oversight, baker approvals, inventory control, and platform analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Row Navigation */}
        <div style={styles.tabRow}>
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  ...styles.tab,
                  backgroundColor: isActive ? "var(--cravory-primary-bg)" : "#ffffff",
                  color: isActive ? "var(--cravory-primary)" : "var(--cravory-cocoa)",
                  borderColor: isActive ? "var(--cravory-primary-light)" : "var(--cravory-surface-border)",
                  fontWeight: isActive ? "700" : "600",
                }}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  navContainer: {
    backgroundColor: "#fff8f5",
    backgroundImage: "linear-gradient(180deg, #fffaf8 0%, #fff0f4 100%)",
    borderBottom: "1px solid #fce4ec",
    paddingTop: "20px",
    paddingBottom: "16px",
    marginBottom: "28px",
  },
  innerContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  logoBadge: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    backgroundColor: "var(--cravory-danger-bg)",
    border: "1px solid var(--cravory-danger-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  title: {
    margin: 0,
    color: "var(--cravory-cocoa)",
    fontSize: "1.45rem",
    fontFamily: "var(--cravory-font-display)",
    fontWeight: "800",
  },
  subtitle: {
    margin: "2px 0 0 0",
    fontSize: "0.85rem",
    color: "var(--cravory-text-secondary)",
  },
  tabRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  tab: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    padding: "8px 16px",
    borderRadius: "var(--cravory-radius-full)",
    fontSize: "0.85rem",
    border: "1.5px solid",
    transition: "all 0.2s ease",
    boxShadow: "var(--cravory-shadow-xs)",
  },
};

export default AdminNav;
