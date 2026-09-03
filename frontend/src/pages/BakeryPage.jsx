import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicVendorById } from "../api/vendorApi";
import { getProductsByVendorId } from "../api/productApi";
import ProductCard from "../components/ProductCard";

import { DEFAULT_BAKERY_IMAGE } from "../utils/imageFallback";

function BakeryPage() {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchBakeryData = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const [vendorData, productsData] = await Promise.all([
          getPublicVendorById(id),
          getProductsByVendorId(id),
        ]);

        setVendor(vendorData);
        setProducts(productsData.products || []);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.response?.data?.message || "Bakery not found or unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchBakeryData();
  }, [id]);

  if (loading) {
    return (
      <div className="cravory-container" style={{ paddingTop: "28px", paddingBottom: "60px" }}>
        <div style={{ height: "240px", borderRadius: "24px", marginBottom: "24px" }} className="cravory-skeleton" />
        <div style={{ height: "100px", borderRadius: "18px", marginBottom: "32px" }} className="cravory-skeleton" />
      </div>
    );
  }

  if (errorMsg || !vendor) {
    return (
      <div className="cravory-container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <div className="cravory-empty-state">
          <div className="cravory-empty-icon">🧁</div>
          <h2 style={{ color: "var(--cravory-cocoa)", margin: "0 0 10px 0" }}>Bakery Not Found</h2>
          <p style={{ color: "var(--cravory-text-secondary)", marginBottom: "20px" }}>
            {errorMsg || "This bakery is currently unavailable or does not exist."}
          </p>
          <Link to="/bakeries" className="cravory-btn cravory-btn-primary">
            ← Browse All Bakeries
          </Link>
        </div>
      </div>
    );
  }

  const coverUrl =
    vendor.coverImage ||
    "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1200&q=80";
  const logoUrl = vendor.logo || DEFAULT_BAKERY_IMAGE;

  return (
    <div className="cravory-container" style={{ paddingTop: "24px", paddingBottom: "60px" }}>
      {/* Breadcrumbs */}
      <div style={styles.breadcrumbBar}>
        <Link to="/" style={styles.breadcrumbLink}>Home</Link>
        <span style={styles.breadcrumbSep}>›</span>
        <Link to="/bakeries" style={styles.breadcrumbLink}>Bakeries</Link>
        <span style={styles.breadcrumbSep}>›</span>
        <span style={styles.breadcrumbCurrent}>{vendor.bakeryName}</span>
      </div>

      {/* 1. Bakery Hero Banner */}
      <div style={styles.bannerContainer}>
        <img src={coverUrl} alt={vendor.bakeryName} style={styles.coverImage} />
        <div style={styles.bannerOverlay}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <img src={logoUrl} alt="Logo" style={styles.logoImage} />
            <div>
              <span className="cravory-badge cravory-badge-primary" style={{ marginBottom: "6px" }}>
                Verified Bakehouse ✅
              </span>
              <h1 style={styles.storefrontTitle}>{vendor.bakeryName}</h1>
              <p style={styles.storefrontLocationText}>
                📍 {vendor.city ? `${vendor.city}, ${vendor.state}` : "Local Bakehouse"}{" "}
                {vendor.address ? `• ${vendor.address}` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bakery Info Card */}
      <div style={styles.detailsCard}>
        <div style={{ flex: 1, minWidth: "260px" }}>
          <h3 style={styles.aboutHeading}>About {vendor.bakeryName}</h3>
          <p style={styles.aboutDescription}>
            {vendor.description ||
              "Fresh handcrafted cakes, cookies, brownies, and pastries baked daily with premium artisan ingredients."}
          </p>
        </div>

        <div style={styles.statBoxRight}>
          <div style={styles.productCountNumber}>
            {products.length} {products.length === 1 ? "Product" : "Products"}
          </div>
          <span style={styles.partnerBadgeText}>
            Fresh Bake-On-Order Standard
          </span>
        </div>
      </div>

      {/* 3. Bakery Offerings Grid Section */}
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionHeading}>Fresh Bakery Offerings ({products.length})</h2>
          <p style={styles.sectionSubheading}>Explore delicious handcrafted items directly from this bakery kitchen</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="cravory-empty-state">
          <div className="cravory-empty-icon">🍰</div>
          <h3 style={{ color: "var(--cravory-cocoa)", margin: "0 0 8px 0" }}>No Available Products</h3>
          <p style={{ color: "var(--cravory-text-secondary)", margin: 0 }}>
            This bakery currently has no active product listings. Check back soon!
          </p>
        </div>
      ) : (
        <div style={styles.productGrid}>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
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
  },
  bannerContainer: {
    position: "relative",
    height: "260px",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "var(--cravory-shadow-md)",
    marginBottom: "24px",
    backgroundColor: "var(--cravory-surface-tertiary)",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "28px 32px",
    background: "linear-gradient(to top, rgba(44, 29, 17, 0.9) 0%, rgba(44, 29, 17, 0.4) 60%, transparent 100%)",
    display: "flex",
    alignItems: "flex-end",
  },
  logoImage: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "50%",
    border: "3.5px solid #ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    backgroundColor: "#ffffff",
  },
  storefrontTitle: {
    fontFamily: "var(--cravory-font-display)",
    fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
    fontWeight: "800",
    color: "#ffffff",
    margin: "0 0 4px 0",
    lineHeight: "1.15",
    textShadow: "0 2px 6px rgba(0,0,0,0.4)",
  },
  storefrontLocationText: {
    margin: 0,
    color: "#f8f9fa",
    fontSize: "0.95rem",
    fontWeight: "500",
  },
  detailsCard: {
    backgroundColor: "#ffffff",
    padding: "24px 28px",
    borderRadius: "20px",
    border: "1.5px solid var(--cravory-surface-border)",
    marginBottom: "36px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
    flexWrap: "wrap",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  aboutHeading: {
    margin: "0 0 6px 0",
    fontSize: "1.15rem",
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
  },
  aboutDescription: {
    margin: 0,
    color: "var(--cravory-text-secondary)",
    fontSize: "0.95rem",
    lineHeight: "1.55",
  },
  statBoxRight: {
    textAlign: "right",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  productCountNumber: {
    fontSize: "1.35rem",
    fontWeight: "800",
    color: "var(--cravory-primary)",
    fontFamily: "var(--cravory-font-display)",
  },
  partnerBadgeText: {
    fontSize: "0.8rem",
    color: "var(--cravory-success)",
    fontWeight: "700",
    marginTop: "2px",
  },
  sectionHeader: {
    marginBottom: "24px",
  },
  sectionHeading: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "var(--cravory-cocoa)",
    margin: 0,
  },
  sectionSubheading: {
    fontSize: "0.9rem",
    color: "var(--cravory-text-secondary)",
    margin: "4px 0 0 0",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "24px",
  },
};

export default BakeryPage;
