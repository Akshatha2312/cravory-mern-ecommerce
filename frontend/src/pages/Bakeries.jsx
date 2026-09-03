import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPublicVendors } from "../api/vendorApi";

import { DEFAULT_BAKERY_IMAGE } from "../utils/imageFallback";

function Bakeries() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const data = await getPublicVendors();
        setVendors(data.vendors || []);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load bakeries.");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  if (loading) {
    return (
      <div className="cravory-container" style={{ paddingTop: "28px", paddingBottom: "60px" }}>
        <div style={{ height: "180px", borderRadius: "20px", marginBottom: "32px" }} className="cravory-skeleton" />
        <div style={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} style={{ height: "320px", borderRadius: "18px" }} className="cravory-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cravory-container" style={{ paddingTop: "24px", paddingBottom: "60px" }}>
      {/* 1. Page Header */}
      <div style={styles.headerBanner}>
        <span className="cravory-badge cravory-badge-primary">🧁 Partner Bakehouses</span>
        <h1 style={styles.headerTitle}>Meet the Bakers Behind Your Favourite Treats</h1>
        <p style={styles.headerSubtitle}>
          Explore verified local artisan bakeries crafting fresh cakes, cookies, pastries, and desserts near you.
        </p>
      </div>

      {errorMsg && (
        <div className="cravory-error-state" style={{ marginBottom: "24px", textAlign: "center" }}>
          {errorMsg}
        </div>
      )}

      {/* 2. Bakery Grid / Empty State */}
      {vendors.length === 0 ? (
        <div className="cravory-empty-state">
          <div className="cravory-empty-icon">🥖</div>
          <h3 style={{ color: "var(--cravory-cocoa)", margin: "0 0 8px 0" }}>No Partner Bakeries Found Yet</h3>
          <p style={{ color: "var(--cravory-text-secondary)", margin: 0 }}>
            Check back soon as new artisan bakeries join Cravory every day!
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {vendors.map((v) => {
            const coverUrl =
              v.coverImage ||
              "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=600&q=80";
            const logoUrl = v.logo || DEFAULT_BAKERY_IMAGE;

            return (
              <div
                key={v._id}
                onClick={() => navigate(`/bakery/${v._id}`)}
                style={styles.card}
                className="cravory-card-interactive"
              >
                <div style={styles.imageContainer}>
                  <img src={coverUrl} alt={v.bakeryName} style={styles.coverImage} />
                  <img src={logoUrl} alt="Logo" style={styles.logoImage} />
                  {v.productCount !== undefined && (
                    <span style={styles.countBadgeTop}>
                      {v.productCount} {v.productCount === 1 ? "Item" : "Items"}
                    </span>
                  )}
                </div>

                <div style={styles.cardBody}>
                  <h3 style={styles.bakeryName}>{v.bakeryName}</h3>

                  <div style={styles.locationRow}>
                    <span>📍</span>
                    <span>{v.city ? `${v.city}, ${v.state}` : "Local Bakehouse"}</span>
                  </div>

                  <p style={styles.description}>
                    {v.description
                      ? v.description.length > 80
                        ? `${v.description.substring(0, 80)}...`
                        : v.description
                      : "Handcrafted bakery delights baked fresh daily with premium ingredients."}
                  </p>

                  <div style={{ marginTop: "auto", paddingTop: "12px" }}>
                    <Link
                      to={`/bakery/${v._id}`}
                      className="cravory-btn cravory-btn-primary"
                      style={{ width: "100%", fontSize: "0.85rem" }}
                    >
                      Visit Bakery Storefront →
                    </Link>
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
    marginBottom: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
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
    margin: 0,
    maxWidth: "580px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    overflow: "hidden",
    border: "1.5px solid var(--cravory-surface-border)",
    boxShadow: "var(--cravory-shadow-sm)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  imageContainer: {
    position: "relative",
    height: "150px",
    backgroundColor: "var(--cravory-surface-tertiary)",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  logoImage: {
    position: "absolute",
    bottom: "-22px",
    left: "20px",
    width: "56px",
    height: "56px",
    objectFit: "cover",
    borderRadius: "50%",
    border: "3px solid #ffffff",
    boxShadow: "0 4px 10px rgba(62, 39, 35, 0.15)",
    backgroundColor: "#ffffff",
  },
  countBadgeTop: {
    position: "absolute",
    top: "12px",
    right: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    color: "var(--cravory-cocoa)",
    padding: "3px 10px",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: "700",
    boxShadow: "var(--cravory-shadow-xs)",
    backdropFilter: "blur(4px)",
  },
  cardBody: {
    padding: "30px 20px 20px 20px",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  bakeryName: {
    margin: "0 0 6px 0",
    fontSize: "1.15rem",
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
    lineHeight: "1.3",
  },
  locationRow: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.825rem",
    fontWeight: "600",
    color: "var(--cravory-primary)",
    marginBottom: "10px",
  },
  description: {
    fontSize: "0.85rem",
    color: "var(--cravory-text-secondary)",
    margin: "0 0 16px 0",
    lineHeight: "1.5",
    flexGrow: 1,
  },
};

export default Bakeries;
