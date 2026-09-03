import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart, updateCartQuantity, removeFromCart, clearCart } from "../api/cartApi";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/imageFallback";

function Cart() {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await getCart();

      // Normalize data response structure
      if (data && data.groups) {
        setCartData(data);
      } else {
        // Fallback formatting if response is flat cart doc
        const items = data?.items || [];
        setCartData({
          items,
          groups: [],
          subtotal: 0,
          totalItems: 0,
          warnings: [],
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load your cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityUpdate = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    try {
      setActionLoadingId(productId);
      setActionMsg("");
      const res = await updateCartQuantity(productId, newQty);
      if (res.cart) {
        setCartData(res.cart);
      } else {
        await fetchCart();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update quantity");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemove = async (productId, productName) => {
    try {
      setActionLoadingId(productId);
      setActionMsg("");
      const res = await removeFromCart(productId);
      setActionMsg(`Removed '${productName}' from your cart.`);
      if (res.cart) {
        setCartData(res.cart);
      } else {
        await fetchCart();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove item");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear your entire cart?")) {
      return;
    }

    try {
      setLoading(true);
      await clearCart();
      await fetchCart();
      setActionMsg("Cart cleared successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to clear cart");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cravory-container" style={{ paddingTop: "28px", paddingBottom: "60px" }}>
        <div style={{ height: "140px", borderRadius: "20px", marginBottom: "24px" }} className="cravory-skeleton" />
        <div style={{ height: "350px", borderRadius: "20px" }} className="cravory-skeleton" />
      </div>
    );
  }

  const groups = cartData?.groups || [];
  const warnings = cartData?.warnings || [];
  const totalSubtotal = cartData?.subtotal || 0;
  const totalItemsCount = cartData?.totalItems || 0;

  const hasItems = groups.some((g) => g.items && g.items.length > 0);

  return (
    <div className="cravory-container" style={{ paddingTop: "24px", paddingBottom: "60px" }}>
      {/* 1. Header Banner */}
      <div style={styles.headerBanner}>
        <div>
          <span className="cravory-badge cravory-badge-primary" style={{ marginBottom: "6px" }}>
            🛒 Checkout Ready
          </span>
          <h1 style={styles.headerTitle}>Your Shopping Cart</h1>
          <p style={styles.headerSubtitle}>
            Review your freshly picked bakery delights before proceeding to secure checkout.
          </p>
        </div>

        {hasItems && (
          <button onClick={handleClear} className="cravory-btn cravory-btn-secondary" style={{ fontSize: "0.85rem" }}>
            Clear Cart
          </button>
        )}
      </div>

      {/* Warnings & Feedback Banners */}
      {errorMsg && (
        <div className="cravory-error-state" style={{ marginBottom: "20px", textAlign: "center" }}>
          {errorMsg}
        </div>
      )}
      {actionMsg && (
        <div style={styles.successAlert}>
          {actionMsg}
        </div>
      )}

      {warnings.length > 0 && (
        <div style={styles.warningBox}>
          <h4 style={{ margin: "0 0 6px 0", color: "var(--cravory-warning)", fontSize: "0.95rem" }}>
            ⚠️ Inventory Updates:
          </h4>
          <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--cravory-text)", fontSize: "0.9rem" }}>
            {warnings.map((w, idx) => (
              <li key={`warn-${idx}-${String(w).substring(0, 15)}`}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty State */}
      {!hasItems ? (
        <div className="cravory-empty-state">
          <div className="cravory-empty-icon">🧺</div>
          <h2 style={{ color: "var(--cravory-cocoa)", margin: "0 0 8px 0" }}>Your cart is empty</h2>
          <p style={{ color: "var(--cravory-text-secondary)", margin: "0 0 20px 0", maxWidth: "450px" }}>
            Discover fresh cakes, cookies, and pastries prepared daily by top local artisan bakeries.
          </p>
          <Link to="/products" className="cravory-btn cravory-btn-primary">
            Explore Bakery Marketplace →
          </Link>
        </div>
      ) : (
        /* Multi-Vendor Cart Layout */
        <div style={styles.cartLayoutGrid}>
          {/* Left Column: Vendor Groups List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {groups.map((group, groupIdx) => {
              if (!group.items || group.items.length === 0) return null;

              const isBakery = !group.isLegacy && group.vendor;
              const bakeryLogo = isBakery ? group.vendor.logo : null;
              const bakeryCity = isBakery && group.vendor.city ? `${group.vendor.city}, ${group.vendor.state}` : null;

              return (
                <div key={group.groupId || group.vendor?._id || `group-${groupIdx}`} style={styles.groupCard}>
                  {/* Group / Bakery Header */}
                  <div style={styles.groupHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {bakeryLogo ? (
                        <img src={bakeryLogo} alt="Logo" style={styles.bakeryLogo} />
                      ) : (
                        <span style={{ fontSize: "1.5rem" }}>{isBakery ? "🧁" : "🍰"}</span>
                      )}
                      <div>
                        <h3 style={styles.groupTitle}>
                          {group.name}
                        </h3>
                        {bakeryCity && (
                          <span style={styles.bakeryCityText}>
                            📍 {bakeryCity}
                          </span>
                        )}
                      </div>
                    </div>

                    {isBakery && group.vendor?._id && (
                      <Link to={`/bakery/${group.vendor._id}`} style={styles.visitStorefrontLink}>
                        Visit Bakery →
                      </Link>
                    )}
                  </div>

                  {/* Group Cart Items */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "20px" }}>
                    {group.items.map((item) => {
                      const p = item.product;
                      if (!p) return null;

                      const imageUrl =
                        p.images && p.images.length > 0
                          ? typeof p.images[0] === "string"
                            ? p.images[0]
                            : p.images[0].url
                          : DEFAULT_PRODUCT_IMAGE;

                      const isAvailable = p.isAvailable !== false;
                      const isOutOfStock = p.stock <= 0;
                      const maxStock = p.stock || 0;

                      return (
                        <div key={item._id} style={styles.itemRow}>
                          <img src={imageUrl} alt={p.name} style={styles.itemImage} />

                          <div style={{ flex: 1, padding: "0 14px", minWidth: 0 }}>
                            <Link to={`/product/${p._id}`} style={styles.itemName}>
                              {p.name}
                            </Link>
                            <div style={styles.unitPriceText}>
                              Unit Price: <b>₹{item.price}</b>
                            </div>

                            {/* Stock Warning Badges */}
                            {(!isAvailable || isOutOfStock) && (
                              <span style={styles.outOfStockBadge}>
                                {!isAvailable ? "Currently Unavailable" : "Out of Stock"}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div style={styles.qtyWrapper}>
                            <button
                              onClick={() => handleQuantityUpdate(p._id, item.quantity, -1)}
                              disabled={item.quantity <= 1 || actionLoadingId === p._id}
                              className="cravory-btn cravory-btn-secondary"
                              style={styles.qtyStepBtn}
                            >
                              −
                            </button>
                            <span style={styles.qtyValueText}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityUpdate(p._id, item.quantity, 1)}
                              disabled={item.quantity >= maxStock || actionLoadingId === p._id}
                              className="cravory-btn cravory-btn-secondary"
                              style={styles.qtyStepBtn}
                            >
                              +
                            </button>
                          </div>

                          {/* Item Subtotal */}
                          <div style={styles.itemSubtotalText}>
                            ₹{item.itemSubtotal}
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemove(p._id, p.name)}
                            disabled={actionLoadingId === p._id}
                            style={styles.removeBtn}
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            🗑️
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Vendor Group Subtotal Footer */}
                  <div style={styles.groupFooter}>
                    <span>Group Subtotal ({group.items.length} {group.items.length === 1 ? "item" : "items"}):</span>
                    <span style={styles.groupSubtotalAmount}>
                      ₹{group.subtotal}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Overall Order Summary */}
          <div>
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>
                Order Summary
              </h3>

              <div style={styles.summaryRow}>
                <span>Total Items:</span>
                <b>{totalItemsCount} {totalItemsCount === 1 ? "unit" : "units"}</b>
              </div>

              <div style={styles.summaryRow}>
                <span>Bakery Groups:</span>
                <b>{groups.length}</b>
              </div>

              <div style={styles.summaryTotalRow}>
                <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--cravory-cocoa)" }}>Total Amount:</span>
                <span style={styles.summaryTotalAmount}>
                  ₹{totalSubtotal}
                </span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="cravory-btn cravory-btn-primary cravory-btn-lg"
                style={{ width: "100%", marginTop: "16px" }}
              >
                Proceed to Checkout →
              </button>

              <div style={styles.securityText}>
                🔒 Safe & Secure Razorpay Payment
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  headerBanner: {
    backgroundColor: "#fff8f5",
    backgroundImage: "radial-gradient(circle at 90% 10%, #ffe4ec 0%, transparent 45%), linear-gradient(180deg, #fffaf8 0%, #fff0f4 100%)",
    border: "1px solid #fce4ec",
    borderRadius: "20px",
    padding: "32px 28px",
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  headerTitle: {
    fontFamily: "var(--cravory-font-display)",
    fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
    fontWeight: "800",
    color: "var(--cravory-cocoa)",
    margin: 0,
    lineHeight: "1.2",
    letterSpacing: "-0.015em",
  },
  headerSubtitle: {
    fontSize: "0.95rem",
    color: "var(--cravory-text-secondary)",
    margin: "4px 0 0 0",
    maxWidth: "580px",
  },
  successAlert: {
    backgroundColor: "var(--cravory-success-bg)",
    border: "1px solid var(--cravory-success-border)",
    color: "var(--cravory-success)",
    padding: "12px 18px",
    borderRadius: "var(--cravory-radius-md)",
    marginBottom: "20px",
    fontWeight: "600",
    textAlign: "center",
  },
  warningBox: {
    backgroundColor: "var(--cravory-warning-bg)",
    border: "1px solid var(--cravory-peach)",
    padding: "14px 20px",
    borderRadius: "var(--cravory-radius-md)",
    marginBottom: "20px",
  },
  cartLayoutGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: "24px",
    alignItems: "flex-start",
  },
  groupCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1.5px solid var(--cravory-surface-border)",
    overflow: "hidden",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  groupHeader: {
    backgroundColor: "var(--cravory-surface-secondary)",
    padding: "14px 20px",
    borderBottom: "1px solid var(--cravory-surface-border)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bakeryLogo: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1.5px solid var(--cravory-primary-light)",
  },
  groupTitle: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
  },
  bakeryCityText: {
    fontSize: "0.8rem",
    color: "var(--cravory-text-tertiary)",
    fontWeight: "500",
  },
  visitStorefrontLink: {
    color: "var(--cravory-primary)",
    textDecoration: "none",
    fontSize: "0.85rem",
    fontWeight: "700",
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    paddingBottom: "16px",
    borderBottom: "1px solid var(--cravory-surface-border)",
    gap: "12px",
  },
  itemImage: {
    width: "64px",
    height: "64px",
    objectFit: "cover",
    borderRadius: "12px",
    border: "1px solid var(--cravory-surface-border)",
  },
  itemName: {
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
    textDecoration: "none",
    fontSize: "0.95rem",
    display: "block",
    lineHeight: "1.3",
  },
  unitPriceText: {
    fontSize: "0.85rem",
    color: "var(--cravory-text-secondary)",
    marginTop: "2px",
  },
  outOfStockBadge: {
    display: "inline-block",
    backgroundColor: "var(--cravory-danger-bg)",
    color: "var(--cravory-danger)",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "700",
    marginTop: "4px",
  },
  qtyWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  qtyStepBtn: {
    width: "32px",
    height: "32px",
    padding: 0,
    fontSize: "1.1rem",
    fontWeight: "700",
  },
  qtyValueText: {
    fontWeight: "700",
    width: "24px",
    textAlign: "center",
    fontSize: "0.95rem",
    color: "var(--cravory-cocoa)",
  },
  itemSubtotalText: {
    width: "90px",
    textAlign: "right",
    fontWeight: "800",
    color: "var(--cravory-cocoa)",
    fontSize: "1rem",
  },
  removeBtn: {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "1.1rem",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "6px",
    transition: "background-color 0.2s ease",
  },
  groupFooter: {
    backgroundColor: "var(--cravory-surface-secondary)",
    padding: "12px 20px",
    borderTop: "1px solid var(--cravory-surface-border)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.9rem",
    color: "var(--cravory-text-secondary)",
  },
  groupSubtotalAmount: {
    fontWeight: "800",
    color: "var(--cravory-primary)",
    fontSize: "1.1rem",
    fontFamily: "var(--cravory-font-display)",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "20px",
    border: "1.5px solid var(--cravory-surface-border)",
    boxShadow: "var(--cravory-shadow-sm)",
    position: "sticky",
    top: "24px",
  },
  summaryTitle: {
    margin: "0 0 16px 0",
    color: "var(--cravory-cocoa)",
    fontFamily: "var(--cravory-font-display)",
    fontSize: "1.25rem",
    fontWeight: "800",
    borderBottom: "1px solid var(--cravory-surface-border)",
    paddingBottom: "12px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    margin: "10px 0",
    fontSize: "0.925rem",
    color: "var(--cravory-text-secondary)",
  },
  summaryTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    borderTop: "1.5px solid var(--cravory-surface-border)",
    paddingTop: "14px",
    marginTop: "14px",
  },
  summaryTotalAmount: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "var(--cravory-primary)",
    fontFamily: "var(--cravory-font-display)",
  },
  securityText: {
    marginTop: "16px",
    textAlign: "center",
    fontSize: "0.8rem",
    color: "var(--cravory-text-tertiary)",
    fontWeight: "500",
  },
};

export default Cart;
