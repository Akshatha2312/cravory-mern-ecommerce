import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVendorProfile } from "../api/vendorApi";
import { getMyProducts, updateVendorProductStock } from "../api/vendorProductApi";
import VendorLayout from "../components/VendorLayout";

function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    available: 0,
    unavailable: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [stockModalProduct, setStockModalProduct] = useState(null);
  const [stockInput, setStockInput] = useState("");
  const [stockUpdating, setStockUpdating] = useState(false);

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [vendorData, productsData] = await Promise.all([
        getVendorProfile(),
        getMyProducts(),
      ]);

      setVendor(vendorData);
      const prods = productsData.products || [];
      setProducts(prods);

      const total = prods.length;
      const available = prods.filter((p) => p.isAvailable !== false).length;
      const unavailable = prods.filter((p) => p.isAvailable === false).length;
      const inStock = prods.filter((p) => p.stock > 5).length;
      const lowStock = prods.filter((p) => p.stock > 0 && p.stock <= 5).length;
      const outOfStock = prods.filter((p) => p.stock <= 0).length;

      setMetrics({ total, available, unavailable, inStock, lowStock, outOfStock });
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load vendor portal data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickStockSave = async (e) => {
    e.preventDefault();
    if (!stockModalProduct) return;

    const num = Number(stockInput);
    if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
      alert("Stock must be a non-negative whole integer");
      return;
    }

    try {
      setStockUpdating(true);
      await updateVendorProductStock(stockModalProduct._id, num);
      setStockModalProduct(null);
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update stock");
    } finally {
      setStockUpdating(false);
    }
  };

  const inventoryAlertProducts = products.filter((p) => p.stock <= 5);

  if (loading) {
    return (
      <div className="cravory-container" style={{ paddingTop: "28px", paddingBottom: "60px" }}>
        <div style={{ height: "140px", borderRadius: "20px", marginBottom: "24px" }} className="cravory-skeleton" />
        <div style={{ height: "300px", borderRadius: "20px" }} className="cravory-skeleton" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="cravory-container" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
        <div className="cravory-error-state" style={{ textAlign: "center" }}>
          {errorMsg}
        </div>
      </div>
    );
  }

  return (
    <VendorLayout vendor={vendor}>
      {/* 1. Live Performance Metrics Grid */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>🍰</div>
          <div>
            <div style={styles.metricValue}>{metrics.total}</div>
            <div style={styles.metricLabel}>Total Products</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={{ ...styles.metricIcon, backgroundColor: "var(--cravory-success-bg)", color: "var(--cravory-success)" }}>
            ✅
          </div>
          <div>
            <div style={{ ...styles.metricValue, color: "var(--cravory-success)" }}>{metrics.available}</div>
            <div style={styles.metricLabel}>Available Online</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={{ ...styles.metricIcon, backgroundColor: "var(--cravory-surface-tertiary)", color: "var(--cravory-text-secondary)" }}>
            ⏸️
          </div>
          <div>
            <div style={styles.metricValue}>{metrics.unavailable}</div>
            <div style={styles.metricLabel}>Unavailable</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={{ ...styles.metricIcon, backgroundColor: "var(--cravory-success-bg)", color: "var(--cravory-success)" }}>
            📦
          </div>
          <div>
            <div style={{ ...styles.metricValue, color: "var(--cravory-success)" }}>{metrics.inStock}</div>
            <div style={styles.metricLabel}>Healthy Stock (&gt;5)</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={{ ...styles.metricIcon, backgroundColor: "var(--cravory-warning-bg)", color: "var(--cravory-warning)" }}>
            ⚠️
          </div>
          <div>
            <div style={{ ...styles.metricValue, color: "var(--cravory-warning)" }}>{metrics.lowStock}</div>
            <div style={styles.metricLabel}>Low Stock (1-5)</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={{ ...styles.metricIcon, backgroundColor: "var(--cravory-danger-bg)", color: "var(--cravory-danger)" }}>
            🚨
          </div>
          <div>
            <div style={{ ...styles.metricValue, color: "var(--cravory-danger)" }}>{metrics.outOfStock}</div>
            <div style={styles.metricLabel}>Out of Stock (0)</div>
          </div>
        </div>
      </div>

      {/* 2. Inventory Stock Alerts */}
      <div style={{ marginTop: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ margin: 0, color: "var(--cravory-cocoa)", fontSize: "1.2rem" }}>
              ⚠️ Inventory Stock Alerts
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "var(--cravory-text-secondary)" }}>
              Items requiring immediate batch restocking or inventory update.
            </p>
          </div>
          <button
            onClick={() => navigate("/vendor/products")}
            className="cravory-btn cravory-btn-secondary cravory-btn-sm"
          >
            Manage All Products →
          </button>
        </div>

        {inventoryAlertProducts.length === 0 ? (
          <div style={styles.noAlertsCard}>
            <span style={{ fontSize: "1.4rem" }}>🎉</span>
            <div>
              <strong style={{ color: "var(--cravory-success)", display: "block", fontSize: "0.95rem" }}>
                All bakery products have healthy stock levels!
              </strong>
              <span style={{ fontSize: "0.825rem", color: "var(--cravory-text-secondary)" }}>
                No items currently require restocking or emergency attention.
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {inventoryAlertProducts.map((p) => {
              const isOut = p.stock <= 0;
              return (
                <div
                  key={p._id}
                  style={{
                    ...styles.alertRow,
                    borderColor: isOut ? "var(--cravory-danger-border)" : "#ffe0b2",
                    backgroundColor: isOut ? "var(--cravory-danger-bg)" : "#fffdf8",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "1.5rem" }}>{isOut ? "🚨" : "⚠️"}</span>
                    <div>
                      <h4 style={{ margin: "0 0 2px 0", color: "var(--cravory-cocoa)", fontSize: "0.98rem" }}>{p.name}</h4>
                      <span style={{ fontSize: "0.825rem", color: isOut ? "var(--cravory-danger)" : "var(--cravory-warning)", fontWeight: "700" }}>
                        {isOut ? "Out of Stock (0 remaining)" : `Low Stock (${p.stock} remaining)`}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => {
                        setStockModalProduct(p);
                        setStockInput(p.stock.toString());
                      }}
                      className="cravory-btn cravory-btn-primary cravory-btn-sm"
                    >
                      Adjust Stock
                    </button>
                    <button
                      onClick={() => navigate(`/vendor/products/${p._id}/edit`)}
                      className="cravory-btn cravory-btn-secondary cravory-btn-sm"
                    >
                      Edit Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Baker Portal Management Modules */}
      <div style={{ marginTop: "36px" }}>
        <h3 style={{ margin: "0 0 16px 0", color: "var(--cravory-cocoa)", fontSize: "1.2rem" }}>
          Baker Portal Management Modules
        </h3>

        <div style={styles.grid}>
          {/* Module 1: Product Management */}
          <div
            onClick={() => navigate("/vendor/products")}
            className="cravory-card-interactive"
            style={styles.featureCard}
          >
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>🍰</div>
              <span className="cravory-badge cravory-badge-primary">Active Module</span>
            </div>
            <div>
              <h3 style={styles.cardTitle}>My Bakery Products</h3>
              <p style={styles.cardText}>
                View, add, edit, toggle online availability, or delete your bakery treats.
              </p>
            </div>
            <div style={styles.cardFooterBtn}>
              Manage Products →
            </div>
          </div>

          {/* Module 2: Orders */}
          <div
            onClick={() => navigate("/vendor/orders")}
            className="cravory-card-interactive"
            style={styles.featureCard}
          >
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>📦</div>
              <span className="cravory-badge cravory-badge-primary">Active Module</span>
            </div>
            <div>
              <h3 style={styles.cardTitle}>Customer Orders</h3>
              <p style={styles.cardText}>
                Track customer purchases, update preparation progress, and fulfill orders.
              </p>
            </div>
            <div style={styles.cardFooterBtn}>
              Manage Orders →
            </div>
          </div>

          {/* Module 3: Inventory */}
          <div style={{ ...styles.featureCard, cursor: "default", opacity: 0.85 }}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.cardIcon, backgroundColor: "var(--cravory-surface-tertiary)" }}>🥣</div>
              <span className="cravory-badge cravory-badge-secondary">Coming Soon</span>
            </div>
            <div>
              <h3 style={styles.cardTitle}>Batch Inventory</h3>
              <p style={styles.cardText}>
                Advanced ingredient batch tracking and automated raw material alerts.
              </p>
            </div>
            <div style={{ ...styles.cardFooterBtn, color: "var(--cravory-text-tertiary)", backgroundColor: "var(--cravory-surface-secondary)" }}>
              In Development
            </div>
          </div>

          {/* Module 4: Analytics */}
          <div style={{ ...styles.featureCard, cursor: "default", opacity: 0.85 }}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.cardIcon, backgroundColor: "var(--cravory-surface-tertiary)" }}>📊</div>
              <span className="cravory-badge cravory-badge-secondary">Coming Soon</span>
            </div>
            <div>
              <h3 style={styles.cardTitle}>Sales Analytics</h3>
              <p style={styles.cardText}>
                Bakehouse revenue metrics, monthly reports, and top-selling cake insights.
              </p>
            </div>
            <div style={{ ...styles.cardFooterBtn, color: "var(--cravory-text-tertiary)", backgroundColor: "var(--cravory-surface-secondary)" }}>
              In Development
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stock Edit Modal */}
      {stockModalProduct && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: "var(--cravory-cocoa)", fontSize: "1.15rem" }}>
                Adjust Stock Quantity
              </h3>
              <button
                onClick={() => setStockModalProduct(null)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--cravory-text-tertiary)" }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: "0 0 16px 0", fontSize: "0.875rem", color: "var(--cravory-text-secondary)" }}>
              Updating stock for: <strong style={{ color: "var(--cravory-cocoa)" }}>{stockModalProduct.name}</strong>
            </p>

            <form onSubmit={handleQuickStockSave}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.875rem", color: "var(--cravory-cocoa)" }}>
                  New Stock Quantity:
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="cravory-input"
                  value={stockInput}
                  onChange={(e) => setStockInput(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setStockModalProduct(null)}
                  disabled={stockUpdating}
                  className="cravory-btn cravory-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={stockUpdating}
                  className="cravory-btn cravory-btn-primary"
                >
                  {stockUpdating ? "Saving..." : "Save Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </VendorLayout>
  );
}

const styles = {
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "16px",
  },
  metricCard: {
    backgroundColor: "#ffffff",
    padding: "18px 16px",
    borderRadius: "16px",
    border: "1.5px solid var(--cravory-surface-border)",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  metricIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    backgroundColor: "var(--cravory-primary-bg)",
    color: "var(--cravory-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.3rem",
    flexShrink: 0,
  },
  metricValue: {
    fontFamily: "var(--cravory-font-display)",
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "var(--cravory-cocoa)",
    lineHeight: "1.1",
  },
  metricLabel: {
    color: "var(--cravory-text-secondary)",
    fontSize: "0.78rem",
    fontWeight: "600",
    marginTop: "2px",
  },
  noAlertsCard: {
    backgroundColor: "var(--cravory-success-bg)",
    border: "1px solid var(--cravory-success-border)",
    borderRadius: "16px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  alertRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    borderRadius: "14px",
    border: "1px solid",
    flexWrap: "wrap",
    gap: "12px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "20px",
  },
  featureCard: {
    backgroundColor: "#ffffff",
    padding: "22px",
    borderRadius: "18px",
    border: "1.5px solid var(--cravory-surface-border)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "16px",
    cursor: "pointer",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    backgroundColor: "var(--cravory-primary-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.3rem",
  },
  cardTitle: {
    margin: "0 0 6px 0",
    fontSize: "1.05rem",
    color: "var(--cravory-cocoa)",
  },
  cardText: {
    fontSize: "0.85rem",
    color: "var(--cravory-text-secondary)",
    margin: 0,
    lineHeight: "1.5",
  },
  cardFooterBtn: {
    backgroundColor: "var(--cravory-surface-secondary)",
    color: "var(--cravory-primary)",
    border: "1px solid var(--cravory-surface-border)",
    padding: "8px 14px",
    borderRadius: "var(--cravory-radius-md)",
    fontSize: "0.825rem",
    fontWeight: "700",
    textAlign: "center",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(62, 39, 35, 0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1200,
    padding: "20px",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    padding: "28px",
    borderRadius: "20px",
    maxWidth: "440px",
    width: "100%",
    boxShadow: "var(--cravory-shadow-lg)",
    border: "1px solid var(--cravory-surface-border)",
  },
};

export default VendorDashboard;
