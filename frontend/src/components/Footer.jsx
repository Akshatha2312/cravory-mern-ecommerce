import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div className="cravory-container" style={styles.container}>
        <div style={styles.topSection}>
          {/* Brand Info */}
          <div style={styles.brandCol}>
            <Link to="/" style={styles.brandLogo}>
              <span style={{ fontSize: "1.6rem" }}>🧁</span>
              <span style={styles.brandTitle}>Cravory</span>
            </Link>
            <p style={styles.brandTagline}>
              Artisan cakes, handcrafted cookies, and fresh pastries delivered straight from top local bakeries to your doorstep.
            </p>
            <div style={styles.badgeRow}>
              <span className="cravory-badge cravory-badge-primary">100% Fresh Bakery</span>
              <span className="cravory-badge cravory-badge-success">Local Artisans</span>
            </div>
          </div>

          {/* Quick Links */}
          <div style={styles.linksCol}>
            <h4 style={styles.colTitle}>Marketplace</h4>
            <ul style={styles.linkList}>
              <li><Link to="/" style={styles.footerLink}>Home</Link></li>
              <li><Link to="/products" style={styles.footerLink}>Explore Desserts</Link></li>
              <li><Link to="/bakeries" style={styles.footerLink}>Partner Bakeries</Link></li>
              <li><Link to="/wishlist" style={styles.footerLink}>Wishlist</Link></li>
              <li><Link to="/cart" style={styles.footerLink}>Shopping Cart</Link></li>
            </ul>
          </div>

          {/* Customer & Partner Links */}
          <div style={styles.linksCol}>
            <h4 style={styles.colTitle}>Account & Partners</h4>
            <ul style={styles.linkList}>
              <li><Link to="/my-orders" style={styles.footerLink}>My Orders</Link></li>
              <li><Link to="/become-a-baker" style={styles.footerLink}>Become a Baker</Link></li>
              <li><Link to="/login" style={styles.footerLink}>Customer Login</Link></li>
              <li><Link to="/register" style={styles.footerLink}>Register Account</Link></li>
            </ul>
          </div>

          {/* Bakery Promise */}
          <div style={styles.linksCol}>
            <h4 style={styles.colTitle}>Artisan Guarantee</h4>
            <p style={{ fontSize: "0.85rem", color: "var(--cravory-text-tertiary)", margin: 0, lineHeight: 1.6 }}>
              Every item is freshly prepared by independent local bakers upon receiving your order. Guaranteed quality, hygiene, and safe packaging.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={styles.bottomBar}>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} Cravory Inc. All rights reserved. Artisan Bakery & Dessert Marketplace.
          </p>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: "var(--cravory-surface)",
    borderTop: "2px solid var(--cravory-surface-border)",
    marginTop: "auto",
    paddingTop: "40px",
    paddingBottom: "20px",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  topSection: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr 1fr 1.2fr",
    gap: "30px",
  },
  brandCol: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  brandLogo: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
  },
  brandTitle: {
    fontFamily: "var(--cravory-font-display)",
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "var(--cravory-primary)",
    letterSpacing: "-0.02em",
  },
  brandTagline: {
    fontSize: "0.875rem",
    color: "var(--cravory-text-secondary)",
    lineHeight: "1.5",
    margin: 0,
  },
  badgeRow: {
    display: "flex",
    gap: "8px",
    marginTop: "4px",
  },
  linksCol: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  colTitle: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  linkList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  footerLink: {
    fontSize: "0.875rem",
    color: "var(--cravory-text-secondary)",
    textDecoration: "none",
    transition: "color var(--cravory-transition-fast)",
  },
  bottomBar: {
    borderTop: "1px solid var(--cravory-surface-border)",
    paddingTop: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  copyright: {
    fontSize: "0.8rem",
    color: "var(--cravory-text-tertiary)",
    margin: 0,
  },
};

export default Footer;
