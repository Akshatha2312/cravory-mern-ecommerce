import { useEffect, useState } from "react";
import AdminNav from "../components/AdminNav";
import { getAdminProducts, toggleAdminProductAvailability } from "../api/adminApi";
import { Link } from "react-router-dom";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const params = {};
        if (searchTerm) params.q = searchTerm;
        if (vendorFilter !== "all") params.vendor = vendorFilter;
        const data = await getAdminProducts(params);
        setProducts(data || []);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [vendorFilter, searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleToggleAvailability = async (productId, currentVal) => {
    try {
      setProcessingId(productId);
      const newVal = !currentVal;
      await toggleAdminProductAvailability(productId, newVal);
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, isAvailable: newVal } : p))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update product availability.");
    } finally {
      setProcessingId(null);
    }
  };

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

  return (
    <div>
      <AdminNav />

      <div className="cravory-container" style={{ paddingBottom: "60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ margin: 0, color: "var(--cravory-cocoa)", fontSize: "1.35rem" }}>
              📦 Products Catalog Management ({products.length})
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.875rem", color: "var(--cravory-text-secondary)" }}>
              Inspect all vendor bakehouse items and Cravory platform legacy products.
            </p>
          </div>

          <Link to="/admin/add-product" className="cravory-btn cravory-btn-primary">
            ➕ Add Platform Product
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <div style={styles.controlsBar}>
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px", flex: "2 1 240px" }}>
            <input
              type="text"
              placeholder="🔍 Search product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cravory-input"
            />
          </form>

          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="cravory-select"
            style={{ flex: "1 1 180px" }}
          >
            <option value="all">All Vendors & Legacy</option>
            <option value="legacy">Legacy Products (vendor: null)</option>
          </select>
        </div>

        {errorMsg && <div className="cravory-error-state" style={{ marginBottom: "16px" }}>{errorMsg}</div>}

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Product Title</th>
                <th style={styles.th}>Bakery / Source</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Availability</th>
                <th style={styles.th}>Platform Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isLegacy = !p.vendor;
                const isAvail = p.isAvailable !== false;
                const bakeryName = p.vendor?.bakeryName || "Cravory Legacy";

                return (
                  <tr key={p._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: "700", color: "var(--cravory-cocoa)" }}>{p.name}</div>
                    </td>
                    <td style={styles.td}>
                      <span
                        className="cravory-badge"
                        style={{
                          backgroundColor: isLegacy ? "var(--cravory-surface-tertiary)" : "var(--cravory-primary-bg)",
                          color: isLegacy ? "var(--cravory-text-secondary)" : "var(--cravory-primary)",
                          border: "1px solid",
                          borderColor: isLegacy ? "var(--cravory-surface-border)" : "var(--cravory-primary-light)",
                        }}
                      >
                        {bakeryName}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: "0.85rem", color: "var(--cravory-text-secondary)" }}>{p.category}</span>
                    </td>
                    <td style={styles.td}>
                      <strong style={{ color: "var(--cravory-primary)", fontFamily: "var(--cravory-font-display)", fontSize: "1rem" }}>₹{p.price}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: p.stock > 0 ? "var(--cravory-success)" : "var(--cravory-danger)", fontWeight: "700", fontSize: "0.85rem" }}>
                        {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: isAvail ? "var(--cravory-success)" : "var(--cravory-text-tertiary)", fontWeight: "700", fontSize: "0.85rem" }}>
                        {isAvail ? "Available ✅" : "Unavailable 🔴"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleToggleAvailability(p._id, isAvail)}
                        disabled={processingId === p._id}
                        className="cravory-btn cravory-btn-sm"
                        style={{
                          backgroundColor: isAvail ? "var(--cravory-danger-bg)" : "var(--cravory-success-bg)",
                          color: isAvail ? "var(--cravory-danger)" : "var(--cravory-success)",
                          borderColor: isAvail ? "var(--cravory-danger-border)" : "var(--cravory-success-border)",
                        }}
                      >
                        {processingId === p._id ? "Updating..." : isAvail ? "Make Unavailable" : "Make Available"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  controlsBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "20px",
    backgroundColor: "#ffffff",
    padding: "16px",
    borderRadius: "16px",
    border: "1.5px solid var(--cravory-surface-border)",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1.5px solid var(--cravory-surface-border)",
    boxShadow: "var(--cravory-shadow-xs)",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  thRow: {
    backgroundColor: "var(--cravory-surface-secondary)",
    borderBottom: "1.5px solid var(--cravory-surface-border)",
  },
  th: {
    padding: "14px 18px",
    fontSize: "0.78rem",
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  tr: {
    borderBottom: "1px solid var(--cravory-surface-border)",
  },
  td: {
    padding: "14px 18px",
    fontSize: "0.875rem",
    verticalAlign: "middle",
  },
};

export default AdminProducts;
