import { useEffect, useState } from "react";
import AdminNav from "../components/AdminNav";
import { getAdminDashboard } from "../api/adminApi";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await getAdminDashboard();
      setMetrics(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div>
        <AdminNav />
        <div className="cravory-container" style={{ paddingBottom: "60px" }}>
          <div style={{ height: "300px", borderRadius: "20px" }} className="cravory-skeleton" />
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div>
        <AdminNav />
        <div className="cravory-container" style={{ paddingBottom: "60px" }}>
          <div className="cravory-error-state" style={{ textAlign: "center" }}>{errorMsg}</div>
        </div>
      </div>
    );
  }

  const cards = [
    { title: "Total Customers", value: metrics.totalUsers, icon: "👤", link: "/admin/users", badge: "User Accounts", isPrimary: false },
    { title: "Total Vendors", value: metrics.totalVendors, icon: "🧁", link: "/admin/vendors", badge: "Bakery Marketplace", isPrimary: false },
    { title: "Pending Applications", value: metrics.pendingVendors, icon: "⏳", link: "/admin/vendors", badge: "Requires Action", isDanger: true },
    { title: "Approved Active Bakers", value: metrics.approvedVendors, icon: "✅", link: "/admin/vendors", badge: "Verified Bakehouses", isSuccess: true },
    { title: "Total Products", value: metrics.totalProducts, icon: "📦", link: "/admin/products", badge: "Platform Menu", isPrimary: false },
    { title: "Total Customer Orders", value: metrics.totalOrders, icon: "🛒", link: "/admin/orders", badge: "Total Sales", isPrimary: false },
    { title: "Paid Orders", value: metrics.paidOrders, icon: "💳", link: "/admin/orders", badge: "Successful Checkout", isSuccess: true },
    { title: "Unpaid / Pending Orders", value: metrics.unpaidOrders, icon: "⚠️", link: "/admin/orders", badge: "Pending Payment", isWarning: true },
    { title: "Total Platform Revenue", value: `₹${metrics.totalRevenue}`, icon: "💰", link: "/admin/analytics", badge: "Real-time Revenue", isPrimary: true },
    { title: "Active Coupons", value: metrics.activeCoupons, icon: "🎟️", link: "/admin/coupons", badge: "Promotions", isPrimary: false },
  ];

  return (
    <div>
      <AdminNav />

      <div className="cravory-container" style={{ paddingBottom: "60px" }}>
        {/* Header Control Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ margin: 0, color: "var(--cravory-cocoa)", fontSize: "1.35rem" }}>
              📊 Platform Overview Metrics
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.875rem", color: "var(--cravory-text-secondary)" }}>
              Real-time administrative data from active database records.
            </p>
          </div>

          <button
            onClick={loadData}
            className="cravory-btn cravory-btn-secondary"
          >
            🔄 Refresh Metrics
          </button>
        </div>

        {/* Dashboard Grid */}
        <div style={styles.grid}>
          {cards.map((c, idx) => (
            <div
              key={idx}
              className="cravory-card-interactive"
              style={{
                ...styles.card,
                borderLeft: c.isPrimary
                  ? "5px solid var(--cravory-primary)"
                  : c.isSuccess
                  ? "5px solid var(--cravory-success)"
                  : c.isDanger
                  ? "5px solid var(--cravory-danger)"
                  : c.isWarning
                  ? "5px solid var(--cravory-warning)"
                  : "1.5px solid var(--cravory-surface-border)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span className="cravory-badge cravory-badge-secondary" style={{ fontSize: "0.72rem" }}>
                  {c.badge}
                </span>
                <span style={{ fontSize: "1.5rem" }}>{c.icon}</span>
              </div>

              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--cravory-text-secondary)", fontWeight: "600", display: "block" }}>
                  {c.title}
                </span>
                <div style={{
                  fontFamily: "var(--cravory-font-display)",
                  fontSize: "1.8rem",
                  fontWeight: "800",
                  color: c.isPrimary ? "var(--cravory-primary)" : "var(--cravory-cocoa)",
                  lineHeight: "1.1",
                  marginTop: "4px",
                  marginBottom: "16px",
                }}>
                  {c.value}
                </div>
              </div>

              <Link to={c.link} style={styles.cardLink}>
                View Management Section →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "var(--cravory-shadow-xs)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardLink: {
    color: "var(--cravory-primary)",
    textDecoration: "none",
    fontSize: "0.825rem",
    fontWeight: "700",
    borderTop: "1px solid var(--cravory-surface-border)",
    paddingTop: "10px",
    marginTop: "auto",
  },
};

export default AdminDashboard;
