import { Link, useLocation } from "react-router-dom";

function VendorLayout({ children, vendor }) {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/vendor/dashboard", icon: "🧁" },
    { label: "My Products", path: "/vendor/products", icon: "🍰" },
    { label: "Customer Orders", path: "/vendor/orders", icon: "📦" },
  ];

  return (
    <div className="cravory-container" style={{ paddingTop: "24px", paddingBottom: "60px" }}>
      {/* Baker Portal Header Banner */}
      <div style={styles.headerBanner}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={styles.bakeryLogoBadge}>🧁</div>
          <div>
            <span className="cravory-badge cravory-badge-primary" style={{ marginBottom: "4px" }}>
              Baker Portal Management
            </span>
            <h1 style={styles.bakeryTitle}>{vendor?.bakeryName || "My Bakery Dashboard"}</h1>
            <p style={styles.bakerySubtitle}>
              {vendor?.description || "Manage your artisan products, inventory, and customer orders."}
            </p>
          </div>
        </div>

        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
          <span style={styles.statusBadgeApproved}>Approved Bakehouse ✅</span>
          <span style={styles.statusBadgeActive}>Active Seller 🟢</span>
        </div>
      </div>

      {/* Portal Layout: Sidebar + Main Content */}
      <div style={styles.layoutGrid}>
        {/* Sidebar Navigation */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "700", color: "var(--cravory-text-tertiary)" }}>
              Baker Navigation
            </span>
          </div>

          <nav style={styles.navMenu}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    ...styles.navLink,
                    backgroundColor: isActive ? "var(--cravory-primary-bg)" : "transparent",
                    color: isActive ? "var(--cravory-primary)" : "var(--cravory-cocoa)",
                    fontWeight: isActive ? "700" : "600",
                    borderLeft: isActive ? "4px solid var(--cravory-primary)" : "4px solid transparent",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <Link
              to="/vendor/products/add"
              style={{
                ...styles.navLink,
                marginTop: "12px",
                backgroundColor: "var(--cravory-surface-tertiary)",
                color: "var(--cravory-cocoa)",
                fontWeight: "700",
                border: "1px dashed var(--cravory-surface-border-strong)",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>➕</span>
              <span>Add New Product</span>
            </Link>
          </nav>

          {/* Bakery Snapshot Info Card */}
          {vendor && (
            <div style={styles.infoCard}>
              <div style={styles.infoTitle}>📍 Bakehouse Info</div>
              <div style={styles.infoText}>
                <b>Location:</b> {vendor.city ? `${vendor.city}, ${vendor.state}` : "N/A"}
              </div>
              <div style={styles.infoText}>
                <b>Phone:</b> {vendor.phone || "N/A"}
              </div>
              <div style={styles.infoText}>
                <b>Email:</b> {vendor.email || "N/A"}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main style={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}

const styles = {
  headerBanner: {
    backgroundColor: "#fff8f5",
    backgroundImage: "radial-gradient(circle at 90% 10%, #ffe4ec 0%, transparent 45%), linear-gradient(180deg, #fffaf8 0%, #fff0f4 100%)",
    border: "1px solid #fce4ec",
    borderRadius: "20px",
    padding: "28px",
    marginBottom: "28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  bakeryLogoBadge: {
    width: "54px",
    height: "54px",
    borderRadius: "16px",
    backgroundColor: "var(--cravory-primary-bg)",
    border: "1.5px solid var(--cravory-primary-light)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.8rem",
    boxShadow: "0 4px 12px var(--cravory-primary-shadow)",
  },
  bakeryTitle: {
    fontFamily: "var(--cravory-font-display)",
    fontSize: "clamp(1.5rem, 2.5vw, 2.1rem)",
    fontWeight: "800",
    color: "var(--cravory-cocoa)",
    margin: 0,
    lineHeight: "1.2",
    letterSpacing: "-0.015em",
  },
  bakerySubtitle: {
    fontSize: "0.9rem",
    color: "var(--cravory-text-secondary)",
    margin: "4px 0 0 0",
    maxWidth: "540px",
  },
  statusBadgeApproved: {
    backgroundColor: "var(--cravory-success-bg)",
    color: "var(--cravory-success)",
    border: "1px solid var(--cravory-success-border)",
    padding: "4px 12px",
    borderRadius: "var(--cravory-radius-full)",
    fontSize: "0.78rem",
    fontWeight: "700",
  },
  statusBadgeActive: {
    backgroundColor: "var(--cravory-primary-bg)",
    color: "var(--cravory-primary)",
    border: "1px solid var(--cravory-primary-light)",
    padding: "4px 12px",
    borderRadius: "var(--cravory-radius-full)",
    fontSize: "0.78rem",
    fontWeight: "700",
  },
  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: "28px",
    alignItems: "start",
  },
  sidebar: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1.5px solid var(--cravory-surface-border)",
    padding: "20px",
    boxShadow: "var(--cravory-shadow-xs)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    position: "sticky",
    top: "90px",
  },
  sidebarHeader: {
    paddingBottom: "8px",
    borderBottom: "1px solid var(--cravory-surface-border)",
  },
  navMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    borderRadius: "var(--cravory-radius-md)",
    fontSize: "0.9rem",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  infoCard: {
    backgroundColor: "var(--cravory-surface-secondary)",
    border: "1px solid var(--cravory-surface-border)",
    borderRadius: "14px",
    padding: "14px",
    marginTop: "8px",
  },
  infoTitle: {
    fontSize: "0.8rem",
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  infoText: {
    fontSize: "0.82rem",
    color: "var(--cravory-text-secondary)",
    marginBottom: "4px",
    wordBreak: "break-word",
  },
  mainContent: {
    minWidth: 0,
  },
};

export default VendorLayout;
