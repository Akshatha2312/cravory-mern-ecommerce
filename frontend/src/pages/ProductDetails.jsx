import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProductById } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import { getProductReviews, getEligibleReviewProducts, createReview } from "../api/reviewApi";
import { AuthContext } from "../context/AuthContext";
import { WishlistContext } from "../context/WishlistContext";

import { DEFAULT_PRODUCT_IMAGE } from "../utils/imageFallback";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { isWishlisted, toggleWishlistHandler } = useContext(WishlistContext);

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Reviews state
  const [reviewsData, setReviewsData] = useState({ count: 0, averageRating: 0, reviews: [] });
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const data = await getProductById(id);
        setProduct(data);

        if (data.images && data.images.length > 0) {
          const firstImg = typeof data.images[0] === "string" ? data.images[0] : data.images[0].url;
          setSelectedImage(firstImg);
        }

        const revRes = await getProductReviews(id);
        setReviewsData(revRes);

        if (user) {
          const items = await getEligibleReviewProducts();
          const match = items.filter(
            (i) => i.productId.toString() === id.toString() && !i.hasReviewed
          );
          setEligibleOrders(match);
          if (match.length > 0) {
            setSelectedOrderId(match[0].orderId);
          }
        }
      } catch (err) {
        console.error(err);
        setErrorMsg(err.response?.data?.message || "Product not found or currently unavailable.");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [id, user]);

  const handleQtyChange = (val) => {
    const num = Number(val);
    if (isNaN(num)) return;
    const maxAllowed = product ? Math.min(10, product.stock) : 10;
    if (num < 1) setQuantity(1);
    else if (num > maxAllowed) setQuantity(maxAllowed);
    else setQuantity(Math.floor(num));
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!product || product.isAvailable === false || product.stock <= 0) {
      return;
    }

    try {
      setCartLoading(true);
      setSuccessMsg("");
      await addToCart(product._id, quantity);
      setSuccessMsg(`Added ${quantity} x '${product.name}' to your cart! 🛒`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add product to cart");
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    const res = await toggleWishlistHandler(product._id);
    if (res.requireAuth) {
      navigate("/login");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedOrderId) {
      alert("Please select an order to review");
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewMsg("");
      await createReview({
        productId: id,
        orderId: selectedOrderId,
        rating: reviewRating,
        comment: reviewComment,
      });

      setReviewMsg("Review submitted successfully! Thank you ⭐");
      setReviewComment("");

      const revRes = await getProductReviews(id);
      setReviewsData(revRes);

      if (user) {
        const items = await getEligibleReviewProducts();
        const match = items.filter(
          (i) => i.productId.toString() === id.toString() && !i.hasReviewed
        );
        setEligibleOrders(match);
        if (match.length > 0) {
          setSelectedOrderId(match[0].orderId);
        } else {
          setSelectedOrderId("");
        }
      }
    } catch (err) {
      setReviewMsg(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="cravory-container" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
        <div style={{ height: "450px", borderRadius: "24px" }} className="cravory-skeleton" />
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="cravory-container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <div className="cravory-empty-state">
          <div className="cravory-empty-icon">🎂</div>
          <h2 style={{ color: "var(--cravory-cocoa)", margin: "0 0 10px 0" }}>Product Unavailable</h2>
          <p style={{ color: "var(--cravory-text-secondary)", marginBottom: "20px" }}>{errorMsg || "Product not found."}</p>
          <Link to="/products" className="cravory-btn cravory-btn-primary">
            ← Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isAvailable = product.isAvailable !== false;
  const isOutOfStock = product.stock <= 0;
  const isPurchasable = isAvailable && !isOutOfStock;

  const imagesList = product.images && product.images.length > 0
    ? product.images.map((img) => (typeof img === "string" ? img : img.url))
    : [DEFAULT_PRODUCT_IMAGE];

  const mainImageUrl = selectedImage || imagesList[0];

  const vendorName =
    product.vendor && typeof product.vendor === "object" && product.vendor.bakeryName
      ? product.vendor.bakeryName
      : null;

  const vendorId =
    product.vendor && typeof product.vendor === "object"
      ? product.vendor._id
      : product.vendor;

  const wishlisted = isWishlisted(product._id);

  return (
    <div className="cravory-container" style={{ paddingTop: "24px", paddingBottom: "60px" }}>
      {/* Breadcrumb Navigation */}
      <div style={styles.breadcrumbBar}>
        <Link to="/" style={styles.breadcrumbLink}>Home</Link>
        <span style={styles.breadcrumbSep}>›</span>
        <Link to="/products" style={styles.breadcrumbLink}>Products</Link>
        <span style={styles.breadcrumbSep}>›</span>
        <span style={styles.breadcrumbCurrent}>{product.name}</span>
      </div>

      {successMsg && (
        <div style={styles.successAlert} className="cravory-transition">
          {successMsg}
        </div>
      )}

      {/* Main Two-Column Product Card */}
      <div style={styles.productCardContainer}>
        {/* Left Column: Image & Gallery */}
        <div style={styles.imageColumn}>
          <div style={styles.mainImageFrame}>
            <img src={mainImageUrl} alt={product.name} style={styles.mainImage} />
          </div>

          {imagesList.length > 1 && (
            <div style={styles.thumbnailRow}>
              {imagesList.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx}`}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    ...styles.thumbnail,
                    borderColor: selectedImage === img ? "var(--cravory-primary)" : "var(--cravory-surface-border)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Information & Controls */}
        <div style={styles.detailsColumn}>
          <div style={styles.topMetaRow}>
            <span className="cravory-badge cravory-badge-primary">
              {product.category || "Artisan Bakery"}
            </span>

            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              className="cravory-btn cravory-btn-secondary cravory-btn-sm"
              style={{
                borderColor: wishlisted ? "var(--cravory-primary-light)" : "var(--cravory-surface-border)",
                color: wishlisted ? "var(--cravory-primary)" : "var(--cravory-text-secondary)",
              }}
              title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              {wishlisted ? "❤️ Wishlisted" : "🤍 Add to Wishlist"}
            </button>
          </div>

          <h1 style={styles.productTitle}>{product.name}</h1>

          {/* Rating Summary Header */}
          <div style={styles.ratingRow}>
            <span style={{ color: "#f1c40f", fontSize: "1.1rem" }}>
              {"★".repeat(Math.round(reviewsData.averageRating || product.rating || 0)) +
                "☆".repeat(5 - Math.round(reviewsData.averageRating || product.rating || 0))}
            </span>
            <strong style={{ color: "var(--cravory-cocoa)", fontSize: "0.95rem" }}>
              {reviewsData.averageRating || product.rating || 0}
            </strong>
            <span style={{ color: "var(--cravory-text-tertiary)", fontSize: "0.85rem" }}>
              ({reviewsData.count || product.numReviews || 0} {reviewsData.count === 1 ? "review" : "reviews"})
            </span>
          </div>

          {/* Bakery Branding Badge (Vendor Products Only) */}
          {vendorName && vendorId && (
            <div style={styles.bakeryCardBox}>
              <span style={{ fontSize: "1.4rem" }}>🧁</span>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--cravory-text-tertiary)", display: "block", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: "600" }}>
                  Handcrafted By
                </span>
                <Link to={`/bakery/${vendorId}`} style={styles.bakeryTitleLink}>
                  {vendorName} →
                </Link>
              </div>
            </div>
          )}

          {/* Price & Stock */}
          <div style={styles.priceRow}>
            <span style={styles.priceText}>₹{product.price}</span>
            <span
              style={{
                ...styles.stockBadgeText,
                color: !isAvailable ? "var(--cravory-text-tertiary)" : isOutOfStock ? "var(--cravory-danger)" : "var(--cravory-success)",
              }}
            >
              {!isAvailable
                ? "Unavailable 🔴"
                : isOutOfStock
                ? "Out of Stock"
                : `In Stock (${product.stock} remaining)`}
            </span>
          </div>

          <p style={styles.descriptionText}>{product.description}</p>

          {/* Quantity Selector & Add to Cart Controls */}
          {isPurchasable && (
            <div style={{ marginBottom: "20px" }}>
              <label style={styles.qtyLabel}>Quantity:</label>
              <div style={styles.qtyWrapper}>
                <button
                  type="button"
                  onClick={() => handleQtyChange(quantity - 1)}
                  disabled={quantity <= 1 || cartLoading}
                  className="cravory-btn cravory-btn-secondary"
                  style={styles.qtyStepBtn}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={Math.min(10, product.stock)}
                  step="1"
                  value={quantity}
                  onChange={(e) => handleQtyChange(e.target.value)}
                  style={styles.qtyInputField}
                />
                <button
                  type="button"
                  onClick={() => handleQtyChange(quantity + 1)}
                  disabled={quantity >= Math.min(10, product.stock) || cartLoading}
                  className="cravory-btn cravory-btn-secondary"
                  style={styles.qtyStepBtn}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={cartLoading || !isPurchasable}
            className={`cravory-btn cravory-btn-lg ${isPurchasable ? "cravory-btn-primary" : "cravory-btn-secondary"}`}
            style={{
              width: "100%",
              marginTop: "auto",
              opacity: !isPurchasable ? 0.6 : 1,
              cursor: !isPurchasable ? "not-allowed" : "pointer",
            }}
          >
            {cartLoading
              ? "Adding to Cart..."
              : !isAvailable
              ? "Currently Unavailable"
              : isOutOfStock
              ? "Out of Stock"
              : `Add ${quantity} to Cart 🛒`}
          </button>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div style={styles.reviewsContainer}>
        <h3 style={styles.reviewsHeading}>Customer Reviews & Ratings</h3>

        {/* Verified Purchase Review Form */}
        {user && eligibleOrders.length > 0 && (
          <div style={styles.reviewFormBox}>
            <h4 style={{ margin: "0 0 10px 0", color: "var(--cravory-cocoa)", fontSize: "1rem" }}>
              ✏️ Write a Review (Verified Purchase)
            </h4>
            {reviewMsg && (
              <p style={{ color: reviewMsg.includes("successfully") ? "var(--cravory-success)" : "var(--cravory-danger)", fontWeight: "600", fontSize: "0.85rem" }}>
                {reviewMsg}
              </p>
            )}

            <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={styles.formLabel}>Select Order:</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="cravory-select"
                >
                  {eligibleOrders.map((o) => (
                    <option key={o.orderId} value={o.orderId}>
                      Order #{o.orderId.substring(0, 8)} ({new Date(o.purchasedAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.formLabel}>Rating (1-5 Stars):</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="cravory-select"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                  <option value={3}>⭐⭐⭐ (3 - Average)</option>
                  <option value={2}>⭐⭐ (2 - Poor)</option>
                  <option value={1}>⭐ (1 - Terrible)</option>
                </select>
              </div>

              <div>
                <label style={styles.formLabel}>Your Review:</label>
                <textarea
                  rows="3"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your taste experience..."
                  required
                  className="cravory-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="cravory-btn cravory-btn-primary"
                style={{ width: "fit-content" }}
              >
                {submittingReview ? "Submitting..." : "Submit Verified Review"}
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        {reviewsData.reviews.length === 0 ? (
          <p style={{ color: "var(--cravory-text-tertiary)", fontStyle: "italic", margin: 0 }}>
            No reviews yet. Be the first verified buyer to leave a review!
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {reviewsData.reviews.map((rev) => (
              <div key={rev._id} style={styles.reviewCardItem}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <strong style={{ color: "var(--cravory-cocoa)", fontSize: "0.95rem" }}>
                    {rev.user?.name || "Verified Customer"}
                  </strong>
                  <span style={{ color: "var(--cravory-text-tertiary)", fontSize: "0.8rem" }}>
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ color: "#f1c40f", fontSize: "0.9rem", marginBottom: "6px" }}>
                  {"★".repeat(rev.rating) + "☆".repeat(5 - rev.rating)}
                </div>
                <p style={{ margin: 0, color: "var(--cravory-text-secondary)", fontSize: "0.9rem", lineHeight: "1.45" }}>
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  breadcrumbBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.85rem",
    marginBottom: "20px",
  },
  breadcrumbLink: {
    color: "var(--cravory-text-secondary)",
    textDecoration: "none",
    fontWeight: "500",
  },
  breadcrumbSep: {
    color: "var(--cravory-text-tertiary)",
  },
  breadcrumbCurrent: {
    color: "var(--cravory-cocoa)",
    fontWeight: "600",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "300px",
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
  productCardContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "40px",
    backgroundColor: "#ffffff",
    padding: "36px",
    borderRadius: "24px",
    border: "1px solid var(--cravory-surface-border)",
    boxShadow: "var(--cravory-shadow-md)",
  },
  imageColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  mainImageFrame: {
    width: "100%",
    height: "360px",
    borderRadius: "18px",
    overflow: "hidden",
    border: "1px solid var(--cravory-surface-border)",
    backgroundColor: "#fffdfa",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  thumbnailRow: {
    display: "flex",
    gap: "12px",
    overflowX: "auto",
    paddingBottom: "4px",
  },
  thumbnail: {
    width: "72px",
    height: "72px",
    objectFit: "cover",
    borderRadius: "10px",
    border: "2px solid",
    cursor: "pointer",
    transition: "border-color 0.2s ease",
  },
  detailsColumn: {
    display: "flex",
    flexDirection: "column",
  },
  topMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  productTitle: {
    fontFamily: "var(--cravory-font-display)",
    fontSize: "clamp(1.75rem, 2.5vw, 2.2rem)",
    fontWeight: "800",
    color: "var(--cravory-cocoa)",
    margin: "0 0 10px 0",
    lineHeight: "1.2",
    letterSpacing: "-0.015em",
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "14px",
  },
  bakeryCardBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "var(--cravory-surface-secondary)",
    border: "1px solid var(--cravory-surface-border)",
    borderRadius: "12px",
    padding: "10px 16px",
    marginBottom: "18px",
    width: "fit-content",
  },
  bakeryTitleLink: {
    color: "var(--cravory-primary)",
    fontWeight: "700",
    textDecoration: "none",
    fontSize: "0.95rem",
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "14px",
    marginBottom: "14px",
  },
  priceText: {
    fontFamily: "var(--cravory-font-display)",
    fontSize: "2rem",
    fontWeight: "800",
    color: "var(--cravory-primary)",
  },
  stockBadgeText: {
    fontSize: "0.875rem",
    fontWeight: "700",
  },
  descriptionText: {
    fontSize: "0.95rem",
    color: "var(--cravory-text-secondary)",
    lineHeight: "1.6",
    margin: "0 0 20px 0",
  },
  qtyLabel: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "700",
    fontSize: "0.85rem",
    color: "var(--cravory-cocoa)",
  },
  qtyWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  qtyStepBtn: {
    width: "38px",
    height: "38px",
    padding: 0,
    fontSize: "1.2rem",
    fontWeight: "700",
  },
  qtyInputField: {
    width: "56px",
    height: "38px",
    textAlign: "center",
    border: "1.5px solid var(--cravory-surface-border)",
    borderRadius: "var(--cravory-radius-md)",
    fontSize: "1rem",
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
    outline: "none",
  },
  reviewsContainer: {
    marginTop: "36px",
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "20px",
    border: "1px solid var(--cravory-surface-border)",
    boxShadow: "var(--cravory-shadow-sm)",
  },
  reviewsHeading: {
    fontSize: "1.4rem",
    fontWeight: "800",
    color: "var(--cravory-cocoa)",
    marginBottom: "20px",
  },
  reviewFormBox: {
    backgroundColor: "var(--cravory-surface-secondary)",
    border: "1px solid var(--cravory-surface-border)",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "28px",
  },
  formLabel: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
    marginBottom: "4px",
  },
  reviewCardItem: {
    borderBottom: "1px solid var(--cravory-surface-border)",
    paddingBottom: "16px",
  },
};

export default ProductDetails;
