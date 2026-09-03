import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { WishlistContext } from "../context/WishlistContext";
import { addToCart } from "../api/cartApi";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/imageFallback";

function ProductCard({ product, onCartUpdated }) {
  const { user } = useContext(AuthContext);
  const { isWishlisted, toggleWishlistHandler } = useContext(WishlistContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const isAvailable = product.isAvailable !== false;
  const isOutOfStock = product.stock <= 0;
  const isPurchasable = isAvailable && !isOutOfStock;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }

    if (!isPurchasable) {
      return;
    }

    try {
      setLoading(true);
      await addToCart(product._id, 1);
      alert(`${product.name} added to cart! 🛒`);
      if (onCartUpdated) {
        onCartUpdated();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add product to cart");
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    const res = await toggleWishlistHandler(product._id);
    if (res.requireAuth) {
      navigate("/login");
    }
  };

  const imageUrl =
    product.images && product.images.length > 0
      ? typeof product.images[0] === "string"
        ? product.images[0]
        : product.images[0].url
      : DEFAULT_PRODUCT_IMAGE;

  const bakeryName =
    product.vendor && typeof product.vendor === "object" && product.vendor.bakeryName
      ? product.vendor.bakeryName
      : null;

  const vendorId =
    product.vendor && typeof product.vendor === "object"
      ? product.vendor._id
      : product.vendor;

  const wishlisted = isWishlisted(product._id);

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      style={{ ...styles.card, opacity: isPurchasable ? 1 : 0.85 }}
      className="cravory-card-interactive"
    >
      <div style={{ position: "relative" }}>
        <img src={imageUrl} alt={product.name} style={styles.image} />

        {/* Wishlist Heart Toggle Button */}
        <button
          onClick={handleWishlistClick}
          style={styles.heartButton}
          title={wishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
          aria-label="Wishlist toggle"
        >
          {wishlisted ? "❤️" : "🤍"}
        </button>
      </div>

      <div style={styles.content}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
          <span className="cravory-badge cravory-badge-secondary" style={styles.categoryBadge}>
            {product.category || "Bakery"}
          </span>
          {bakeryName && vendorId && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/bakery/${vendorId}`);
              }}
              style={styles.bakeryBadge}
              title={`View ${bakeryName} Storefront`}
            >
              🧁 {bakeryName}
            </span>
          )}
        </div>

        <h3 style={styles.title}>{product.name}</h3>
        <p style={styles.description}>
          {product.description
            ? product.description.length > 60
              ? `${product.description.substring(0, 60)}...`
              : product.description
            : ""}
        </p>

        <div style={styles.footer}>
          <span style={styles.price}>₹{product.price}</span>
          <span
            style={{
              ...styles.stock,
              color: !isAvailable ? "var(--cravory-text-tertiary)" : isOutOfStock ? "var(--cravory-danger)" : "var(--cravory-success)",
            }}
          >
            {!isAvailable
              ? "Unavailable 🔴"
              : isOutOfStock
              ? "Out of Stock"
              : `In Stock (${product.stock})`}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={loading || !isPurchasable}
          className={`cravory-btn ${isPurchasable ? "cravory-btn-primary" : "cravory-btn-ghost"}`}
          style={{
            width: "100%",
            opacity: !isPurchasable ? 0.6 : 1,
            cursor: !isPurchasable ? "not-allowed" : "pointer",
          }}
        >
          {loading
            ? "Adding..."
            : !isAvailable
            ? "Unavailable"
            : isOutOfStock
            ? "Out of Stock"
            : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid var(--cravory-surface-border)",
    borderRadius: "var(--cravory-radius-lg)",
    overflow: "hidden",
    boxShadow: "var(--cravory-shadow-sm)",
    backgroundColor: "var(--cravory-surface)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    cursor: "pointer",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "190px",
    objectFit: "cover",
  },
  heartButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    border: "none",
    borderRadius: "50%",
    width: "34px",
    height: "34px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1.1rem",
    cursor: "pointer",
    boxShadow: "var(--cravory-shadow-sm)",
    backdropFilter: "blur(4px)",
  },
  content: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  categoryBadge: {
    fontSize: "0.7rem",
    padding: "2px 8px",
  },
  bakeryBadge: {
    fontSize: "0.75rem",
    backgroundColor: "var(--cravory-primary-bg)",
    color: "var(--cravory-primary-hover)",
    padding: "2px 8px",
    borderRadius: "var(--cravory-radius-full)",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "140px",
  },
  title: {
    margin: "8px 0 4px 0",
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
    lineHeight: "1.3",
  },
  description: {
    fontSize: "0.85rem",
    color: "var(--cravory-text-secondary)",
    margin: "0 0 12px 0",
    flexGrow: 1,
    lineHeight: "1.4",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  price: {
    fontSize: "1.2rem",
    fontWeight: "800",
    color: "var(--cravory-primary)",
    fontFamily: "var(--cravory-font-display)",
  },
  stock: {
    fontSize: "0.75rem",
    fontWeight: "600",
  },
};

export default ProductCard;
