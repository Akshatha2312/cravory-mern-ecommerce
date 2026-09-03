import { useEffect, useState } from "react";
<<<<<<< HEAD
import { Link, useNavigate } from "react-router-dom";
import { getProducts } from "../api/productApi";
import { getPublicVendors } from "../api/vendorApi";
import ProductCard from "../components/ProductCard";

import { DEFAULT_BAKERY_IMAGE } from "../utils/imageFallback";

function Home() {
  const [products, setProducts] = useState([]);
  const [bakeries, setBakeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const categories = [
    { name: "Cakes", icon: "🎂", desc: "Custom & Celebration" },
    { name: "Cookies", icon: "🍪", desc: "Soft & Crunchy" },
    { name: "Brownies", icon: "🍫", desc: "Fudge & Decadent" },
    { name: "Biscuits", icon: "🧇", desc: "Tea-Time Biscuits" },
    { name: "Pastries", icon: "🍰", desc: "Flaky & Creamy" },
    { name: "Dream Cakes", icon: "✨", desc: "Signature Delights" },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [prodData, vendorData] = await Promise.all([
        getProducts(),
        getPublicVendors(),
      ]);

      setProducts(prodData.products || []);
      setBakeries((vendorData.vendors || []).slice(0, 4)); // Show top 4 featured bakeries
    } catch (err) {
      console.error(err);
      setError("Failed to load marketplace content. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={styles.pageWrapper}>
      {/* 1. HERO SECTION */}
      <section style={styles.heroSection}>
        <div className="cravory-container">
          <div style={styles.heroBannerBox}>
            {/* Left Text Block */}
            <div style={styles.heroLeftCol}>
              <div style={styles.eyebrowBadgeRow}>
                <span className="cravory-badge cravory-badge-primary">✨ Fresh From Oven</span>
                <span style={styles.eyebrowText}>Artisan Bakery Marketplace</span>
              </div>

              <h1 style={styles.heroTitle}>
                Freshly Baked Delights From Top Local Artisan Bakeries 🍰
              </h1>

              <p style={styles.heroDescription}>
                Handcrafted cakes, artisan cookies, flaky pastries, and gourmet desserts prepared fresh by independent local bakers and delivered straight to your door.
              </p>

              <div style={styles.heroActionGroup}>
                <button
                  onClick={() => navigate("/products")}
                  className="cravory-btn cravory-btn-primary cravory-btn-lg"
                >
                  Explore Full Marketplace →
                </button>
                <button
                  onClick={() => navigate("/bakeries")}
                  className="cravory-btn cravory-btn-secondary cravory-btn-lg"
                >
                  Discover Bakeries 🏪
                </button>
              </div>

              {/* Dynamic Supported Metrics */}
              <div style={styles.heroStatsRow}>
                <div style={styles.statMiniCard}>
                  <span style={styles.statValue}>{products.length > 0 ? `${products.length}+` : "Fresh"}</span>
                  <span style={styles.statLabel}>Artisan Items</span>
                </div>
                <div style={styles.statMiniCard}>
                  <span style={styles.statValue}>{bakeries.length > 0 ? `${bakeries.length}+` : "Local"}</span>
                  <span style={styles.statLabel}>Partner Bakehouses</span>
                </div>
                <div style={styles.statMiniCard}>
                  <span style={styles.statValue}>100%</span>
                  <span style={styles.statLabel}>Baked On Order</span>
                </div>
              </div>
            </div>

            {/* Right Visual Image Card */}
            <div style={styles.heroRightCol}>
              <div style={styles.featuredCard}>
                <div style={styles.featuredTag}>🍰 Baked Today</div>
                <img
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80"
                  alt="Artisan Gourmet Cake"
                  style={styles.featuredImage}
                />
                <div style={styles.featuredCardMeta}>
                  <div style={styles.featuredCardTitle}>Belgian Chocolate Truffle Cake</div>
                  <div style={styles.featuredCardSubtitle}>Handcrafted by Local Artisan Bakeries • Made Fresh Daily</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY DISCOVERY */}
      <section className="cravory-container" style={styles.sectionSpacing}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionHeading}>Browse By Category</h2>
            <p style={styles.sectionSubheading}>Find your favorite bakery treats crafted by local experts</p>
          </div>
          <Link to="/products" style={styles.sectionLink}>
            View All Categories →
          </Link>
        </div>

        <div style={styles.categoryGrid}>
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => navigate(`/products?category=${cat.name}`)}
              style={styles.categoryCard}
              className="cravory-card-interactive"
            >
              <div style={styles.categoryEmoji}>{cat.icon}</div>
              <div style={styles.categoryName}>{cat.name}</div>
              <div style={styles.categorySubtitle}>{cat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TRUST & QUALITY BANNER */}
      <section style={styles.trustBanner}>
        <div className="cravory-container" style={styles.trustGrid}>
          <div style={styles.trustCard}>
            <span style={styles.trustIcon}>🧁</span>
            <div>
              <h4 style={styles.trustHeading}>Baked Fresh On Order</h4>
              <p style={styles.trustBody}>Local bakers prepare your items fresh right after your order is confirmed.</p>
            </div>
          </div>

          <div style={styles.trustCard}>
            <span style={styles.trustIcon}>🛵</span>
            <div>
              <h4 style={styles.trustHeading}>Express Safe Packaging</h4>
              <p style={styles.trustBody}>Specialized cake boxes ensure delicate bakery goods arrive in perfect shape.</p>
            </div>
          </div>

          <div style={styles.trustCard}>
            <span style={styles.trustIcon}>🛡️</span>
            <div>
              <h4 style={styles.trustHeading}>Verified Bakehouses</h4>
              <p style={styles.trustBody}>Every partner kitchen is compliance-verified for hygiene and quality standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED BAKERIES */}
      {bakeries.length > 0 && (
        <section className="cravory-container" style={styles.sectionSpacing}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionHeading}>Featured Local Bakeries</h2>
              <p style={styles.sectionSubheading}>Explore storefronts from talented bakehouses in your city</p>
            </div>
            <Link to="/bakeries" style={styles.sectionLink}>
              View All Bakeries →
            </Link>
          </div>

          <div style={styles.bakeriesGrid}>
            {bakeries.map((b) => (
              <div
                key={b._id}
                onClick={() => navigate(`/bakery/${b._id}`)}
                style={styles.bakeryCard}
                className="cravory-card-interactive"
              >
                <img
                  src={b.logo || b.coverImage || DEFAULT_BAKERY_IMAGE}
                  alt={b.bakeryName}
                  style={styles.bakeryLogoImg}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={styles.bakeryTitle}>{b.bakeryName}</h4>
                  <div style={styles.bakeryCityText}>
                    📍 {b.city ? `${b.city}, ${b.state}` : "Local Bakehouse"}
                  </div>
                  <span style={styles.bakeryActionText}>Visit Bakery →</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. POPULAR PRODUCTS */}
      <section className="cravory-container" style={styles.sectionSpacing}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionHeading}>Popular Bakery Products</h2>
            <p style={styles.sectionSubheading}>Handcrafted desserts loved by our marketplace community</p>
          </div>
          <Link to="/products" style={styles.sectionLink}>
            Explore All Products →
          </Link>
        </div>

        {loading && (
          <div style={styles.productGrid}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} style={{ height: "320px", borderRadius: "16px" }} className="cravory-skeleton" />
            ))}
          </div>
        )}

        {error && (
          <div className="cravory-error-state" style={{ textAlign: "center", margin: "20px 0" }}>
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="cravory-empty-state">
            <div className="cravory-empty-icon">🧁</div>
            <h3 style={{ color: "var(--cravory-cocoa)" }}>No products available yet</h3>
            <p>Check back soon as local bakers add fresh items daily!</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div style={styles.productGrid}>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
=======
import { getProducts } from "../api/productApi";

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data.products || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Products</h2>
      {products.map((p) => (
        <div key={p._id}>{p.name}</div>
      ))}
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
    </div>
  );
}

<<<<<<< HEAD
const styles = {
  pageWrapper: {
    width: "100%",
    backgroundColor: "var(--cravory-bg)",
  },
  heroSection: {
    padding: "32px 0",
  },
  heroBannerBox: {
    backgroundColor: "#fff8f5",
    backgroundImage: "radial-gradient(circle at 85% 20%, #ffe4ec 0%, transparent 55%), linear-gradient(180deg, #fffaf8 0%, #fff0f4 100%)",
    border: "1px solid #fce4ec",
    borderRadius: "24px",
    boxShadow: "0 10px 30px rgba(62, 39, 35, 0.05)",
    padding: "44px 40px",
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: "40px",
    alignItems: "center",
  },
  heroLeftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  eyebrowBadgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  eyebrowText: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "var(--cravory-text-secondary)",
    letterSpacing: "0.02em",
  },
  heroTitle: {
    fontFamily: "var(--cravory-font-display)",
    fontSize: "clamp(2rem, 3.2vw, 2.6rem)",
    fontWeight: "800",
    color: "var(--cravory-cocoa)",
    lineHeight: "1.18",
    letterSpacing: "-0.02em",
    margin: 0,
  },
  heroDescription: {
    fontSize: "1.05rem",
    color: "var(--cravory-text-secondary)",
    lineHeight: "1.55",
    margin: 0,
    maxWidth: "540px",
  },
  heroActionGroup: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "4px",
  },
  heroStatsRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginTop: "16px",
    flexWrap: "wrap",
  },
  statMiniCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #f0e6df",
    borderRadius: "12px",
    padding: "8px 16px",
    boxShadow: "0 2px 8px rgba(62, 39, 35, 0.04)",
    display: "flex",
    flexDirection: "column",
  },
  statValue: {
    fontSize: "1.15rem",
    fontWeight: "800",
    color: "var(--cravory-primary)",
    fontFamily: "var(--cravory-font-display)",
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "var(--cravory-text-tertiary)",
    fontWeight: "600",
  },
  heroRightCol: {
    display: "flex",
    justifyContent: "center",
  },
  featuredCard: {
    position: "relative",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #f0e6df",
    boxShadow: "0 10px 24px rgba(62, 39, 35, 0.08)",
    padding: "12px",
    width: "100%",
    maxWidth: "380px",
    overflow: "hidden",
  },
  featuredTag: {
    position: "absolute",
    top: "24px",
    left: "24px",
    backgroundColor: "var(--cravory-primary)",
    color: "#ffffff",
    fontSize: "0.75rem",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "9999px",
    boxShadow: "0 2px 8px rgba(194, 24, 91, 0.3)",
    zIndex: 2,
  },
  featuredImage: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    borderRadius: "14px",
  },
  featuredCardMeta: {
    padding: "12px 6px 4px 6px",
  },
  featuredCardTitle: {
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
  },
  featuredCardSubtitle: {
    fontSize: "0.8rem",
    color: "var(--cravory-text-secondary)",
    marginTop: "2px",
  },
  sectionSpacing: {
    marginTop: "44px",
    marginBottom: "44px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "24px",
    gap: "12px",
    flexWrap: "wrap",
  },
  sectionHeading: {
    fontSize: "1.65rem",
    fontWeight: "800",
    color: "var(--cravory-cocoa)",
    margin: 0,
    letterSpacing: "-0.01em",
  },
  sectionSubheading: {
    fontSize: "0.9rem",
    color: "var(--cravory-text-secondary)",
    margin: "4px 0 0 0",
  },
  sectionLink: {
    fontSize: "0.9rem",
    fontWeight: "700",
    color: "var(--cravory-primary)",
    textDecoration: "none",
  },
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))",
    gap: "16px",
  },
  categoryCard: {
    backgroundColor: "#ffffff",
    border: "1.5px solid #f0e6df",
    borderRadius: "16px",
    padding: "20px 14px",
    textAlign: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(62, 39, 35, 0.04)",
  },
  categoryEmoji: {
    fontSize: "2.2rem",
    marginBottom: "8px",
  },
  categoryName: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
  },
  categorySubtitle: {
    fontSize: "0.75rem",
    color: "var(--cravory-text-tertiary)",
    marginTop: "2px",
  },
  trustBanner: {
    backgroundColor: "#fce4ec",
    borderTop: "1px solid #f8bbd0",
    borderBottom: "1px solid #f8bbd0",
    padding: "36px 0",
    margin: "40px 0",
  },
  trustGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
  },
  trustCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
  },
  trustIcon: {
    fontSize: "2rem",
    backgroundColor: "#ffffff",
    padding: "10px",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(62, 39, 35, 0.04)",
  },
  trustHeading: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
    margin: "0 0 4px 0",
  },
  trustBody: {
    fontSize: "0.85rem",
    color: "var(--cravory-text-secondary)",
    margin: 0,
    lineHeight: "1.45",
  },
  bakeriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px",
  },
  bakeryCard: {
    backgroundColor: "#ffffff",
    border: "1.5px solid #f0e6df",
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(62, 39, 35, 0.04)",
  },
  bakeryLogoImg: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #fce4ec",
  },
  bakeryTitle: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
    margin: "0 0 2px 0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  bakeryCityText: {
    fontSize: "0.8rem",
    color: "var(--cravory-text-tertiary)",
    margin: "0 0 6px 0",
  },
  bakeryActionText: {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "var(--cravory-primary)",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "24px",
  },
};

=======
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
export default Home;
