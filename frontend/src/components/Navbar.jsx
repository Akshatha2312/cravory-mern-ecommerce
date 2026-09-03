import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { WishlistContext } from "../context/WishlistContext";
import { getVendorStatus } from "../api/vendorApi";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { wishlistCount } = useContext(WishlistContext);
  const [vendorIsApproved, setVendorIsApproved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (user && user.role === "vendor") {
      getVendorStatus()
        .then((data) => {
          if (isMounted) {
            setVendorIsApproved(data.status === "APPROVED");
          }
        })
        .catch((err) => console.error("Error fetching navbar vendor status:", err));
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  const logoutHandler = () => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    logout();
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <header style={styles.header}>
      <div className="cravory-container" style={styles.container}>
        {/* Brand Logo */}
        <Link to="/" style={styles.brandLink}>
          <div style={styles.logoBadge}>🧁</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={styles.brandTitle}>Cravory</span>
            <span style={styles.brandSubtitle}>Artisan Bakery</span>
          </div>
        </Link>

        {/* Center Search Bar */}
        <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search cakes, cookies, pastries & bakeries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchBtn}>
              Search
            </button>
          </div>
        </form>

        {/* Desktop Navigation Controls */}
        <nav style={styles.navLinks} className="cravory-desktop-nav">
          <Link
            to="/"
            style={location.pathname === "/" ? { ...styles.link, ...styles.activeLink } : styles.link}
          >
            Home
          </Link>
          <Link
            to="/products"
            style={location.pathname.startsWith("/product") ? { ...styles.link, ...styles.activeLink } : styles.link}
          >
            Products
          </Link>
          <Link
            to="/bakeries"
            style={location.pathname.startsWith("/bakery") ? { ...styles.link, ...styles.activeLink } : styles.link}
          >
            Bakeries
          </Link>

          {!user && (
            <>
              <Link to="/login" style={styles.link}>
                Login
              </Link>
              <Link to="/register" style={styles.registerBtn}>
                Register
              </Link>
              <Link to="/become-a-baker" style={styles.bakerBadgeLink}>
                Become a Baker 🥐
              </Link>
            </>
          )}

          {user && (
            <>
              {/* Wishlist Link with Badge */}
              <Link to="/wishlist" style={styles.iconLink} title="Wishlist">
                <span style={{ fontSize: "1.1rem" }}>❤️</span>
                <span style={styles.iconLinkLabel}>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="cravory-badge cravory-badge-primary" style={styles.badgeNumber}>
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Link */}
              <Link to="/cart" style={styles.iconLink} title="Shopping Cart">
                <span style={{ fontSize: "1.1rem" }}>🛒</span>
                <span style={styles.iconLinkLabel}>Cart</span>
              </Link>

              {/* User Dropdown / Role Actions */}
              <div style={styles.userProfileMenu}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  style={styles.profileBtn}
                >
                  <span style={styles.userAvatar}>👤</span>
                  <span style={styles.userName}>{user.name || "Account"}</span>
                  <span style={{ fontSize: "0.75rem", marginLeft: "2px" }}>▼</span>
                </button>

                {isProfileDropdownOpen && (
                  <div style={styles.dropdownMenu}>
                    <div style={styles.dropdownHeader}>
                      <strong style={{ display: "block", color: "var(--cravory-cocoa)", fontSize: "0.875rem" }}>
                        {user.name}
                      </strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--cravory-text-tertiary)" }}>
                        {user.email}
                      </span>
                    </div>

                    <div style={styles.dropdownDivider} />

                    <Link to="/my-orders" style={styles.dropdownItem}>
                      📦 My Orders
                    </Link>

                    {user.role === "vendor" && (
                      <>
                        {vendorIsApproved ? (
                          <>
                            <Link to="/vendor/orders" style={styles.dropdownItem}>
                              📋 Vendor Orders
                            </Link>
                            <Link to="/vendor/dashboard" style={styles.dropdownItemHighlight}>
                              🧁 Baker Dashboard
                            </Link>
                          </>
                        ) : (
                          <Link to="/become-a-baker" style={styles.dropdownItemHighlight}>
                            🥐 Baker Application
                          </Link>
                        )}
                      </>
                    )}

                    {user.role === "admin" && (
                      <Link to="/admin/dashboard" style={styles.dropdownAdminItem}>
                        🛡️ Admin Portal
                      </Link>
                    )}

                    {user.role === "user" && (
                      <Link to="/become-a-baker" style={styles.dropdownItem}>
                        🥐 Become a Baker
                      </Link>
                    )}

                    <div style={styles.dropdownDivider} />

                    <button onClick={logoutHandler} style={styles.dropdownLogoutBtn}>
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={styles.mobileMenuBtn}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div style={styles.mobileDrawer}>
          <div className="cravory-container" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px" }}>
            <Link to="/" style={styles.mobileLink}>
              🏠 Home
            </Link>
            <Link to="/products" style={styles.mobileLink}>
              🍰 Products
            </Link>
            <Link to="/bakeries" style={styles.mobileLink}>
              🏪 Partner Bakeries
            </Link>

            {!user && (
              <>
                <Link to="/login" style={styles.mobileLink}>
                  🔑 Login
                </Link>
                <Link to="/register" style={styles.mobileLink}>
                  📝 Register
                </Link>
                <Link to="/become-a-baker" style={styles.mobileHighlightLink}>
                  🥐 Become a Baker
                </Link>
              </>
            )}

            {user && (
              <>
                <Link to="/wishlist" style={styles.mobileLink}>
                  ❤️ Wishlist ({wishlistCount})
                </Link>
                <Link to="/cart" style={styles.mobileLink}>
                  🛒 Shopping Cart
                </Link>
                <Link to="/my-orders" style={styles.mobileLink}>
                  📦 My Orders
                </Link>

                {user.role === "vendor" && (
                  <>
                    {vendorIsApproved ? (
                      <>
                        <Link to="/vendor/orders" style={styles.mobileLink}>
                          📋 Vendor Orders
                        </Link>
                        <Link to="/vendor/dashboard" style={styles.mobileHighlightLink}>
                          🧁 Baker Dashboard
                        </Link>
                      </>
                    ) : (
                      <Link to="/become-a-baker" style={styles.mobileHighlightLink}>
                        🥐 Baker Application
                      </Link>
                    )}
                  </>
                )}

                {user.role === "admin" && (
                  <Link to="/admin/dashboard" style={styles.mobileAdminLink}>
                    🛡️ Admin Portal
                  </Link>
                )}

                <button onClick={logoutHandler} style={styles.mobileLogoutBtn}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    backdropFilter: "blur(8px)",
    borderBottom: "1px solid var(--cravory-surface-border)",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "72px",
    gap: "16px",
  },
  brandLink: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
  },
  logoBadge: {
    width: "40px",
    height: "40px",
    borderRadius: "var(--cravory-radius-md)",
    backgroundColor: "var(--cravory-primary-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.3rem",
    boxShadow: "0 2px 8px var(--cravory-primary-shadow)",
  },
  brandTitle: {
    fontFamily: "var(--cravory-font-display)",
    fontSize: "1.35rem",
    fontWeight: "800",
    color: "var(--cravory-primary)",
    lineHeight: 1,
    letterSpacing: "-0.02em",
  },
  brandSubtitle: {
    fontSize: "0.65rem",
    fontWeight: "600",
    color: "var(--cravory-text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginTop: "2px",
  },
  searchForm: {
    flex: "1 1 380px",
    maxWidth: "480px",
    margin: "0 12px",
  },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "var(--cravory-surface-secondary)",
    border: "1px solid var(--cravory-surface-border-strong)",
    borderRadius: "var(--cravory-radius-full)",
    padding: "2px 4px 2px 14px",
    transition: "border-color var(--cravory-transition-fast), box-shadow var(--cravory-transition-fast)",
  },
  searchIcon: {
    fontSize: "0.9rem",
    color: "var(--cravory-text-tertiary)",
    marginRight: "6px",
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    width: "100%",
    fontSize: "0.875rem",
    color: "var(--cravory-text)",
    fontFamily: "var(--cravory-font-sans)",
  },
  searchBtn: {
    backgroundColor: "var(--cravory-primary)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--cravory-radius-full)",
    padding: "6px 14px",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background var(--cravory-transition-fast)",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },
  link: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "var(--cravory-text-secondary)",
    textDecoration: "none",
    transition: "color var(--cravory-transition-fast)",
  },
  activeLink: {
    color: "var(--cravory-primary)",
    fontWeight: "700",
  },
  iconLink: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "var(--cravory-cocoa)",
    textDecoration: "none",
    position: "relative",
    padding: "4px 8px",
    borderRadius: "var(--cravory-radius-sm)",
  },
  iconLinkLabel: {
    fontSize: "0.85rem",
  },
  badgeNumber: {
    marginLeft: "2px",
    padding: "2px 6px",
    fontSize: "0.7rem",
  },
  registerBtn: {
    backgroundColor: "var(--cravory-primary-bg)",
    color: "var(--cravory-primary-hover)",
    padding: "6px 14px",
    borderRadius: "var(--cravory-radius-full)",
    fontSize: "0.85rem",
    fontWeight: "600",
    textDecoration: "none",
  },
  bakerBadgeLink: {
    backgroundColor: "var(--cravory-peach)",
    color: "var(--cravory-cocoa)",
    padding: "6px 12px",
    borderRadius: "var(--cravory-radius-full)",
    fontSize: "0.8rem",
    fontWeight: "700",
    textDecoration: "none",
  },
  userProfileMenu: {
    position: "relative",
  },
  profileBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "var(--cravory-surface-secondary)",
    border: "1px solid var(--cravory-surface-border)",
    borderRadius: "var(--cravory-radius-full)",
    padding: "4px 12px 4px 8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "var(--cravory-cocoa)",
  },
  userAvatar: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    backgroundColor: "var(--cravory-primary-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.85rem",
  },
  userName: {
    maxWidth: "100px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  dropdownMenu: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 8px)",
    width: "200px",
    backgroundColor: "var(--cravory-surface)",
    border: "1px solid var(--cravory-surface-border)",
    borderRadius: "var(--cravory-radius-md)",
    boxShadow: "var(--cravory-shadow-lg)",
    padding: "8px 0",
    zIndex: 1100,
  },
  dropdownHeader: {
    padding: "8px 16px",
  },
  dropdownDivider: {
    height: "1px",
    backgroundColor: "var(--cravory-surface-border)",
    margin: "6px 0",
  },
  dropdownItem: {
    display: "block",
    padding: "8px 16px",
    fontSize: "0.85rem",
    color: "var(--cravory-text)",
    textDecoration: "none",
  },
  dropdownItemHighlight: {
    display: "block",
    padding: "8px 16px",
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "var(--cravory-primary)",
    textDecoration: "none",
    backgroundColor: "var(--cravory-primary-bg)",
  },
  dropdownAdminItem: {
    display: "block",
    padding: "8px 16px",
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "var(--cravory-danger)",
    textDecoration: "none",
    backgroundColor: "var(--cravory-danger-bg)",
  },
  dropdownLogoutBtn: {
    width: "100%",
    textAlign: "left",
    padding: "8px 16px",
    fontSize: "0.85rem",
    color: "var(--cravory-danger)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
  },
  mobileMenuBtn: {
    display: "none",
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "var(--cravory-cocoa)",
  },
  mobileDrawer: {
    backgroundColor: "var(--cravory-surface)",
    borderBottom: "1px solid var(--cravory-surface-border)",
    boxShadow: "var(--cravory-shadow-md)",
  },
  mobileLink: {
    padding: "8px 12px",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "var(--cravory-text)",
    textDecoration: "none",
    borderRadius: "var(--cravory-radius-sm)",
  },
  mobileHighlightLink: {
    padding: "10px 12px",
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "var(--cravory-primary)",
    backgroundColor: "var(--cravory-primary-bg)",
    textDecoration: "none",
    borderRadius: "var(--cravory-radius-sm)",
  },
  mobileAdminLink: {
    padding: "10px 12px",
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "var(--cravory-danger)",
    backgroundColor: "var(--cravory-danger-bg)",
    textDecoration: "none",
    borderRadius: "var(--cravory-radius-sm)",
  },
  mobileLogoutBtn: {
    padding: "10px 12px",
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#fff",
    backgroundColor: "var(--cravory-danger)",
    border: "none",
    borderRadius: "var(--cravory-radius-sm)",
    cursor: "pointer",
    marginTop: "8px",
  },
};

export default Navbar;
