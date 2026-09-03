import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext";
import { addToCart } from "../api/cartApi";

import { DEFAULT_PRODUCT_IMAGE } from "../utils/imageFallback";

function Wishlist() {
  const { wishlistItems, loading, removeFromWishlistHandler } = useContext(WishlistContext);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMsg, setActionMsg] = useState("");

  const navigate = useNavigate();

  const handleAddToCart = async (product) => {
    try {
      setActionLoadingId(product._id);
      setActionMsg("");
      await addToCart(product._id, 1);
      setActionMsg(`Added '${product.name}' to cart! 🛒`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add item to cart");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemove = async (productId, productName) => {
    try {
      setActionLoadingId(productId);
      await removeFromWishlistHandler(productId);
      setActionMsg(`Removed '${productName}' from your wishlist.`);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="cravory-container" style={{ paddingTop: "28px", paddingBottom: "60px" }}>
        <div style={{ height: "140px", borderRadius: "20px", marginBottom: "24px" }} className="cravory-skeleton" />
        <div style={styles.grid}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} style={{ height: "320px", borderRadius: "18px" }} className="cravory-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cravory-container" style={{ paddingTop: "24px", paddingBottom: "60px" }}>
      {/* Header Banner */}
      <div style={styles.headerBanner}>
        <div>
          <span className="cravory-badge cravory-badge-primary" style={{ marginBottom: "6px" }}>
            ❤️ Saved Desserts
          </span>
          <h1 style={styles.headerTitle}>My Saved Wishlist</h1>
          <p style={styles.headerSubtitle}>
            Save your favorite bakery treats and add them to cart whenever you are ready.
          </p>
        </div>

        <Link to="/products" className="cravory-btn cravory-btn-secondary" style={{ fontSize: "0.85rem" }}>
          ← Continue Browsing
        </Link>
      </div>

      {actionMsg && (
        <div style={styles.successAlert}>
          {actionMsg}
        </div>
      )}

      {wishlistItems.length === 0 ? (
        <div className="cravory-empty-state">
          <div className="cravory-empty-icon">🤍</div>
          <h3 style={{ color: "var(--cravory-cocoa)", margin: "0 0 8px 0" }}>Your wishlist is empty</h3>
          <p style={{ color: "var(--cravory-text-secondary)", margin: "0 0 20px 0", maxWidth: "450px" }}>
            Explore our bakery marketplace and click the heart icon on any cake or cookie to save it for later.
          </p>
          <Link to="/products" className="cravory-btn cravory-btn-primary">
            Explore Bakery Marketplace →
          </Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {wishlistItems.map((p) => {
            if (!p || typeof p !== "object") return null;

            const imageUrl =
              p.images && p.images.length > 0
                ? typeof p.images[0] === "string"
                  ? p.images[0]
                  : p.images[0].url
                : DEFAULT_PRODUCT_IMAGE;

            const isAvailable = p.isAvailable !== false;
            const isOutOfStock = p.stock <= 0;
            const isPurchasable = isAvailable && !isOutOfStock;

            const bakeryName =
              p.vendor && typeof p.vendor === "object" && p.vendor.bakeryName
                ? p.vendor.bakeryName
                : null;

            return (
              <div key={p._id} style={styles.card} className="cravory-card-interactive">
                <div style={{ position: "relative" }}>
                  <img src={imageUrl} alt={p.name} style={styles.cardImage} />
                  <button
                    onClick={() => handleRemove(p._id, p.name)}
                    disabled={actionLoadingId === p._id}
                    style={styles.removeIconBtn}
                    title="Remove from Wishlist"
                    aria-label="Remove from Wishlist"
                  >
                    ❌
                  </button>
                </div>

                <div style={styles.cardBody}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                    <span className="cravory-badge cravory-badge-secondary" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
                      {p.category || "Bakery"}
                    </span>
                    {bakeryName && <span style={styles.bakeryBadgeText}>🧁 {bakeryName}</span>}
                  </div>

                  <h3 style={styles.cardTitle}>{p.name}</h3>

                  <div style={styles.cardPriceRow}>
                    <span style={styles.cardPrice}>₹{p.price}</span>
                    <span
                      style={{
                        fontWeight: "700",
                        fontSize: "0.75rem",
                        color: !isAvailable ? "var(--cravory-text-tertiary)" : isOutOfStock ? "var(--cravory-danger)" : "var(--cravory-success)",
                      }}
                    >
                      {!isAvailable ? "Unavailable 🔴" : isOutOfStock ? "Out of Stock" : "In Stock"}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "auto", paddingTop: "8px" }}>
                    <button
                      onClick={() => navigate(`/product/${p._id}`)}
                      className="cravory-btn cravory-btn-secondary"
                      style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleAddToCart(p)}
                      disabled={!isPurchasable || actionLoadingId === p._id}
                      className={`cravory-btn ${isPurchasable ? "cravory-btn-primary" : "cravory-btn-secondary"}`}
                      style={{
                        flexGrow: 1,
                        fontSize: "0.85rem",
                        padding: "8px 12px",
                        opacity: !isPurchasable ? 0.6 : 1,
                        cursor: !isPurchasable ? "not-allowed" : "pointer",
                      }}
                    >
                      {actionLoadingId === p._id
                        ? "Adding..."
                        : !isAvailable
                        ? "Unavailable"
                        : isOutOfStock
                        ? "Out of Stock"
                        : "Add to Cart 🛒"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    overflow: "hidden",
    border: "1.5px solid var(--cravory-surface-border)",
    boxShadow: "var(--cravory-shadow-sm)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  cardImage: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
  },
  removeIconBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    boxShadow: "var(--cravory-shadow-xs)",
    fontSize: "0.8rem",
    backdropFilter: "blur(4px)",
  },
  cardBody: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  bakeryBadgeText: {
    fontSize: "0.75rem",
    color: "var(--cravory-primary)",
    fontWeight: "600",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "130px",
  },
  cardTitle: {
    margin: "8px 0 4px 0",
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
    lineHeight: "1.3",
  },
  cardPriceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "8px 0 12px 0",
  },
  cardPrice: {
    fontSize: "1.2rem",
    fontWeight: "800",
    color: "var(--cravory-primary)",
    fontFamily: "var(--cravory-font-display)",
  },
};

export default Wishlist;
