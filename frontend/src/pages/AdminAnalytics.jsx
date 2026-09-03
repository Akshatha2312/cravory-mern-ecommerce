import { useEffect, useState } from "react";
import AdminNav from "../components/AdminNav";
import { getAdminAnalytics } from "../api/adminApi";

function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await getAdminAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
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

  if (errorMsg || !data) {
    return (
      <div>
        <AdminNav />
        <div className="cravory-container" style={{ paddingBottom: "60px" }}>
          <div className="cravory-error-state" style={{ textAlign: "center" }}>{errorMsg}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminNav />

      <div className="cravory-container" style={{ paddingBottom: "60px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ margin: 0, color: "var(--cravory-cocoa)", fontSize: "1.35rem" }}>
            📈 Platform Business Analytics
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.875rem", color: "var(--cravory-text-secondary)" }}>
            Real-time metric aggregation calculated directly from active MongoDB database records.
          </p>
        </div>

        {/* Top Summary Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "28px" }}>
          <div style={{ ...styles.card, borderLeft: "5px solid var(--cravory-primary)" }}>
            <span style={styles.cardTitle}>Total Platform Revenue</span>
            <div style={{ ...styles.cardVal, color: "var(--cravory-primary)" }}>₹{data.totalRevenue}</div>
          </div>
          <div style={{ ...styles.card, borderLeft: "5px solid var(--cravory-cocoa)" }}>
            <span style={styles.cardTitle}>Total Customer Orders</span>
            <div style={styles.cardVal}>{data.totalOrders}</div>
          </div>
          <div style={{ ...styles.card, borderLeft: "5px solid var(--cravory-success)" }}>
            <span style={styles.cardTitle}>Active Customer Accounts</span>
            <div style={{ ...styles.cardVal, color: "var(--cravory-success)" }}>{data.totalUsers}</div>
          </div>
          <div style={{ ...styles.card, borderLeft: "5px solid var(--cravory-warning)" }}>
            <span style={styles.cardTitle}>Approved Bakehouses</span>
            <div style={{ ...styles.cardVal, color: "var(--cravory-warning)" }}>{data.totalVendors}</div>
          </div>
        </div>

        {/* Breakdown Section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {/* Top Selling Products */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={{ margin: 0, color: "var(--cravory-cocoa)", fontSize: "1.1rem" }}>🏆 Top 5 Best-Selling Products</h3>
              <span className="cravory-badge cravory-badge-primary">By Volume</span>
            </div>

            {data.topProducts.length === 0 ? (
              <p style={{ color: "var(--cravory-text-tertiary)", fontStyle: "italic", margin: 0 }}>No product sales recorded yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid var(--cravory-surface-border)" }}>
                    <th style={styles.tableTh}>Product Name</th>
                    <th style={styles.tableTh}>Units Sold</th>
                    <th style={styles.tableTh}>Gross Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--cravory-surface-border)" }}>
                      <td style={styles.tableTd}>
                        <strong style={{ color: "var(--cravory-cocoa)" }}>{p._id}</strong>
                      </td>
                      <td style={styles.tableTd}>
                        <span className="cravory-badge cravory-badge-secondary">{p.totalSold} units</span>
                      </td>
                      <td style={styles.tableTd}>
                        <strong style={{ color: "var(--cravory-success)" }}>₹{p.revenue}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Orders by Fulfillment Status */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={{ margin: 0, color: "var(--cravory-cocoa)", fontSize: "1.1rem" }}>📊 Items by Fulfillment Stage</h3>
              <span className="cravory-badge cravory-badge-secondary">Fulfillment</span>
            </div>

            {data.ordersByStatus.length === 0 ? (
              <p style={{ color: "var(--cravory-text-tertiary)", fontStyle: "italic", margin: 0 }}>No item statuses recorded yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {data.ordersByStatus.map((st, idx) => (
                  <div key={idx} style={styles.statusRow}>
                    <span style={{ fontWeight: "700", textTransform: "capitalize", color: "var(--cravory-cocoa)", fontSize: "0.9rem" }}>
                      {st._id || "pending"}
                    </span>
                    <span className="cravory-badge cravory-badge-primary" style={{ padding: "4px 10px" }}>
                      {st.count} items
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "20px",
    border: "1.5px solid var(--cravory-surface-border)",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  cardTitle: {
    fontSize: "0.8rem",
    color: "var(--cravory-text-secondary)",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    display: "block",
    marginBottom: "6px",
  },
  cardVal: {
    fontFamily: "var(--cravory-font-display)",
    fontSize: "1.7rem",
    fontWeight: "800",
    color: "var(--cravory-cocoa)",
    lineHeight: "1.1",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1.5px solid var(--cravory-surface-border)",
    padding: "24px",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid var(--cravory-surface-border)",
  },
  tableTh: {
    padding: "10px 0",
    fontSize: "0.78rem",
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
    textTransform: "uppercase",
  },
  tableTd: {
    padding: "10px 0",
    fontSize: "0.875rem",
  },
  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    backgroundColor: "var(--cravory-surface-secondary)",
    border: "1px solid var(--cravory-surface-border)",
    borderRadius: "12px",
  },
};

export default AdminAnalytics;
