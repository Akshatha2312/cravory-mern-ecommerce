import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getMyProducts,
  deleteVendorProduct,
  toggleVendorProductStatus,
  updateVendorProductStock,
} from "../api/vendorProductApi";
import { getVendorProfile } from "../api/vendorApi";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/imageFallback";
import VendorLayout from "../components/VendorLayout";

function VendorProducts() {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  // Controls State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  // Stock Edit Modal State
  const [stockEditProduct, setStockEditProduct] = useState(null);
  const [newStockInput, setNewStockInput] = useState("");
  const [stockEditLoading, setStockEditLoading] = useState(false);

  // Delete Modal State
  const [deleteModalProduct, setDeleteModalProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [vendorData, data] = await Promise.all([
        getVendorProfile().catch(() => null),
        getMyProducts(),
      ]);
      setVendor(vendorData);
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load your bakery products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search by name
        if (searchQuery.trim()) {
          if (!p.name.toLowerCase().includes(searchQuery.trim().toLowerCase())) {
            return false;
          }
        }
        // Category filter
        if (categoryFilter !== "All" && p.category !== categoryFilter) {
          return false;
        }
        // Availability filter
        if (availabilityFilter === "Available" && p.isAvailable === false) {
          return false;
        }
        if (availabilityFilter === "Unavailable" && p.isAvailable !== false) {
          return false;
        }
        // Stock filter
        if (stockFilter === "In Stock" && p.stock <= 5) {
          return false;
        }
        if (stockFilter === "Low Stock" && (p.stock <= 0 || p.stock > 5)) {
          return false;
        }
        if (stockFilter === "Out of Stock" && p.stock > 0) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "Newest") {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy === "Oldest") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        if (sortBy === "PriceLowHigh") {
          return a.price - b.price;
        }
        if (sortBy === "PriceHighLow") {
          return b.price - a.price;
        }
        if (sortBy === "StockLowHigh") {
          return a.stock - b.stock;
        }
        return 0;
      });
  }, [products, searchQuery, categoryFilter, availabilityFilter, stockFilter, sortBy]);

  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      setActionMsg("");
      const res = await toggleVendorProductStatus(productId, !currentStatus);
      setActionMsg(res.message);
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, isAvailable: !currentStatus } : p
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update availability status");
    }
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!stockEditProduct) return;

    const num = Number(newStockInput);
    if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
      alert("Stock must be a non-negative whole integer");
      return;
    }

    try {
      setStockEditLoading(true);
      setActionMsg("");
      await updateVendorProductStock(stockEditProduct._id, num);
      setActionMsg(`Stock for '${stockEditProduct.name}' updated to ${num}.`);

      setProducts((prev) =>
        prev.map((p) =>
          p._id === stockEditProduct._id ? { ...p, stock: num } : p
        )
      );
      setStockEditProduct(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update stock");
    } finally {
      setStockEditLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModalProduct) return;

    try {
      setActionLoading(true);
      await deleteVendorProduct(deleteModalProduct._id);
      setActionMsg(`Product '${deleteModalProduct.name}' deleted successfully.`);
      setProducts((prev) => prev.filter((p) => p._id !== deleteModalProduct._id));
      setDeleteModalProduct(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cravory-container" style={{ paddingTop: "28px", paddingBottom: "60px" }}>
        <div style={{ height: "140px", borderRadius: "20px", marginBottom: "24px" }} className="cravory-skeleton" />
        <div style={{ height: "300px", borderRadius: "20px" }} className="cravory-skeleton" />
      </div>
    );
  }

  return (
    <VendorLayout vendor={vendor}>
      {/* Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ margin: 0, color: "var(--cravory-cocoa)", fontSize: "1.35rem" }}>
            🍰 My Bakery Inventory ({filteredProducts.length})
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.875rem", color: "var(--cravory-text-secondary)" }}>
            Manage bakery menu items, pricing, stock levels, and online availability.
          </p>
        </div>

        <Link to="/vendor/products/add" className="cravory-btn cravory-btn-primary">
          ➕ Add New Product
        </Link>
      </div>

      {errorMsg && <div className="cravory-error-state" style={{ marginBottom: "16px" }}>{errorMsg}</div>}
      {actionMsg && (
        <div style={{ backgroundColor: "var(--cravory-success-bg)", border: "1px solid var(--cravory-success-border)", color: "var(--cravory-success)", padding: "12px 16px", borderRadius: "12px", fontSize: "0.875rem", marginBottom: "16px", fontWeight: "600" }}>
          ✅ {actionMsg}
        </div>
      )}

      {/* Controls Bar: Search, Filters & Sorting */}
      <div style={styles.controlsBar}>
        {/* Search */}
        <div style={{ flex: "2 1 200px" }}>
          <input
            type="text"
            placeholder="🔍 Search product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="cravory-input"
          />
        </div>

        {/* Category Filter */}
        <div style={{ flex: "1 1 140px" }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="cravory-select"
          >
            <option value="All">All Categories</option>
            <option value="Cakes">Cakes</option>
            <option value="Cookies">Cookies</option>
            <option value="Brownies">Brownies</option>
            <option value="Biscuits">Biscuits</option>
            <option value="Pastries">Pastries</option>
            <option value="Dream Cakes">Dream Cakes</option>
          </select>
        </div>

        {/* Availability Filter */}
        <div style={{ flex: "1 1 130px" }}>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="cravory-select"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>

        {/* Stock Filter */}
        <div style={{ flex: "1 1 130px" }}>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="cravory-select"
          >
            <option value="All">All Stock Levels</option>
            <option value="In Stock">In Stock (&gt;5)</option>
            <option value="Low Stock">Low Stock (1-5)</option>
            <option value="Out of Stock">Out of Stock (0)</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div style={{ flex: "1 1 150px" }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="cravory-select"
          >
            <option value="Newest">Sort: Newest</option>
            <option value="Oldest">Sort: Oldest</option>
            <option value="PriceLowHigh">Price: Low → High</option>
            <option value="PriceHighLow">Price: High → Low</option>
            <option value="StockLowHigh">Stock: Low → High</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {products.length === 0 ? (
        <div className="cravory-empty-state">
          <div className="cravory-empty-icon">🍰</div>
          <h3 style={{ color: "var(--cravory-cocoa)", margin: "0 0 8px 0" }}>Your bakery has no products yet</h3>
          <p style={{ color: "var(--cravory-text-secondary)", margin: "0 0 20px 0", maxWidth: "440px" }}>
            Start adding cakes, pastries, brownies, and cookies to showcase on the Cravory marketplace!
          </p>
          <Link to="/vendor/products/add" className="cravory-btn cravory-btn-primary">
            Add Your First Product →
          </Link>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="cravory-empty-state">
          <div className="cravory-empty-icon">🔍</div>
          <h3 style={{ color: "var(--cravory-cocoa)", margin: "0 0 8px 0" }}>No matching products found</h3>
          <p style={{ color: "var(--cravory-text-secondary)", margin: 0 }}>
            Try adjusting your search query or filter options.
          </p>
        </div>
      ) : (
        /* Products List Cards */
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredProducts.map((p) => {
            const imageUrl =
              p.images && p.images.length > 0
                ? typeof p.images[0] === "string"
                  ? p.images[0]
                  : p.images[0].url
                : DEFAULT_PRODUCT_IMAGE;

            const isOut = p.stock <= 0;
            const isLow = p.stock > 0 && p.stock <= 5;

            return (
              <div
                key={p._id}
                style={{
                  ...styles.productRow,
                  borderLeft: isOut
                    ? "5px solid var(--cravory-danger)"
                    : isLow
                    ? "5px solid var(--cravory-warning)"
                    : "5px solid var(--cravory-success)",
                }}
              >
                <img src={imageUrl} alt={p.name} style={styles.productImage} />

                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                    <span className="cravory-badge cravory-badge-secondary">{p.category}</span>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--cravory-cocoa)" }}>{p.name}</h3>
                  </div>

                  <p style={{ margin: "0 0 8px 0", color: "var(--cravory-text-secondary)", fontSize: "0.85rem", lineHeight: "1.4" }}>
                    {p.description}
                  </p>

                  <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap", fontSize: "0.875rem" }}>
                    <span style={{ fontWeight: "800", color: "var(--cravory-primary)", fontFamily: "var(--cravory-font-display)", fontSize: "1.1rem" }}>
                      ₹{p.price}
                    </span>

                    {/* Stock Status Indicator */}
                    <span
                      style={{
                        fontWeight: "700",
                        fontSize: "0.8rem",
                        color: isOut ? "var(--cravory-danger)" : isLow ? "var(--cravory-warning)" : "var(--cravory-success)",
                      }}
                    >
                      {isOut
                        ? "🚨 Out of Stock (0)"
                        : isLow
                        ? `⚠️ Low Stock (${p.stock})`
                        : `✅ In Stock (${p.stock})`}
                    </span>

                    {/* Stock Visual Progress Bar */}
                    <div style={styles.stockProgressWrapper} title={`Stock: ${p.stock}`}>
                      <div
                        style={{
                          height: "100%",
                          borderRadius: "4px",
                          width: `${Math.min(100, (p.stock / 20) * 100)}%`,
                          backgroundColor: isOut ? "var(--cravory-danger)" : isLow ? "var(--cravory-warning)" : "var(--cravory-success)",
                        }}
                      />
                    </div>

                    {/* Quick Stock Edit Button */}
                    <button
                      onClick={() => {
                        setStockEditProduct(p);
                        setNewStockInput(p.stock.toString());
                      }}
                      className="cravory-btn cravory-btn-secondary cravory-btn-sm"
                    >
                      ✏️ Edit Stock
                    </button>
                  </div>
                </div>

                {/* Actions Side */}
                <div style={styles.actionCol}>
                  {/* Availability Toggle */}
                  <button
                    onClick={() => handleToggleStatus(p._id, p.isAvailable)}
                    style={{
                      ...styles.statusToggleBtn,
                      backgroundColor: p.isAvailable !== false ? "var(--cravory-success-bg)" : "var(--cravory-danger-bg)",
                      color: p.isAvailable !== false ? "var(--cravory-success)" : "var(--cravory-danger)",
                      borderColor: p.isAvailable !== false ? "var(--cravory-success-border)" : "var(--cravory-danger-border)",
                    }}
                  >
                    {p.isAvailable !== false ? "Available 🟢" : "Unavailable 🔴"}
                  </button>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => navigate(`/vendor/products/${p._id}/edit`)}
                      className="cravory-btn cravory-btn-secondary cravory-btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteModalProduct(p)}
                      style={{ backgroundColor: "var(--cravory-danger-bg)", color: "var(--cravory-danger)", border: "1px solid var(--cravory-danger-border)" }}
                      className="cravory-btn cravory-btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Stock Edit Modal */}
      {stockEditProduct && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: "var(--cravory-cocoa)", fontSize: "1.15rem" }}>
                Update Inventory Stock
              </h3>
              <button
                onClick={() => setStockEditProduct(null)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--cravory-text-tertiary)" }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: "0 0 16px 0", fontSize: "0.875rem", color: "var(--cravory-text-secondary)" }}>
              Product: <strong style={{ color: "var(--cravory-cocoa)" }}>{stockEditProduct.name}</strong>
            </p>

            <form onSubmit={handleSaveStock}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.875rem", color: "var(--cravory-cocoa)" }}>
                  Enter New Stock Quantity:
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="cravory-input"
                  value={newStockInput}
                  onChange={(e) => setNewStockInput(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setStockEditProduct(null)}
                  disabled={stockEditLoading}
                  className="cravory-btn cravory-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={stockEditLoading}
                  className="cravory-btn cravory-btn-primary"
                >
                  {stockEditLoading ? "Saving..." : "Save Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalProduct && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: "var(--cravory-danger)", fontSize: "1.15rem" }}>
                Delete Product Confirmation
              </h3>
              <button
                onClick={() => setDeleteModalProduct(null)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--cravory-text-tertiary)" }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: "0 0 20px 0", fontSize: "0.9rem", color: "var(--cravory-text-secondary)", lineHeight: "1.5" }}>
              Are you sure you want to remove <strong style={{ color: "var(--cravory-cocoa)" }}>'{deleteModalProduct.name}'</strong> from your bakery catalog? This action cannot be undone.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setDeleteModalProduct(null)}
                disabled={actionLoading}
                className="cravory-btn cravory-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={actionLoading}
                style={{ backgroundColor: "var(--cravory-danger)", color: "#ffffff" }}
                className="cravory-btn"
              >
                {actionLoading ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
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
  productRow: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    border: "1.5px solid var(--cravory-surface-border)",
    boxShadow: "var(--cravory-shadow-xs)",
    flexWrap: "wrap",
  },
  productImage: {
    width: "84px",
    height: "84px",
    objectFit: "cover",
    borderRadius: "14px",
    border: "1px solid var(--cravory-surface-border)",
    flexShrink: 0,
  },
  stockProgressWrapper: {
    width: "80px",
    height: "6px",
    backgroundColor: "var(--cravory-surface-tertiary)",
    borderRadius: "4px",
    overflow: "hidden",
  },
  actionCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "10px",
    marginLeft: "auto",
  },
  statusToggleBtn: {
    padding: "4px 12px",
    borderRadius: "var(--cravory-radius-full)",
    fontSize: "0.78rem",
    fontWeight: "700",
    border: "1px solid",
    cursor: "pointer",
    transition: "all 0.2s ease",
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

export default VendorProducts;
