import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../api/productApi";
import { getPublicVendors } from "../api/vendorApi";
import ProductCard from "../components/ProductCard";

function Products() {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBakery, setSelectedBakery] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [sortBy, setSortBy] = useState("Recommended");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const [prodData, vendorData] = await Promise.all([
          getProducts(),
          getPublicVendors(),
        ]);

        setProducts(prodData.products || []);
        setVendors(vendorData.vendors || []);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load products marketplace.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update category and search query when URL search parameters change
  useEffect(() => {
    const catParam = searchParams.get("category");
    const searchParam = searchParams.get("search");
    if (catParam) {
      setSelectedCategory(catParam);
    } else {
      setSelectedCategory("All");
    }
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Category list
  const categories = [
    { name: "All", icon: "🧁" },
    { name: "Cakes", icon: "🎂" },
    { name: "Cookies", icon: "🍪" },
    { name: "Brownies", icon: "🍫" },
    { name: "Biscuits", icon: "🧇" },
    { name: "Pastries", icon: "🍰" },
    { name: "Dream Cakes", icon: "✨" },
  ];

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Name / Description / Bakery Name Search
        if (searchQuery.trim()) {
          const query = searchQuery.trim().toLowerCase();
          const nameMatch = p.name.toLowerCase().includes(query);
          const descMatch = p.description ? p.description.toLowerCase().includes(query) : false;
          const bakeryMatch =
            p.vendor && typeof p.vendor === "object" && p.vendor.bakeryName
              ? p.vendor.bakeryName.toLowerCase().includes(query)
              : false;

          if (!nameMatch && !descMatch && !bakeryMatch) {
            return false;
          }
        }

        // Category Filter
        if (selectedCategory !== "All" && p.category !== selectedCategory) {
          return false;
        }

        // Bakery Filter
        if (selectedBakery !== "All") {
          if (!p.vendor || (p.vendor._id !== selectedBakery && p.vendor !== selectedBakery)) {
            return false;
          }
        }

        // Price Filter
        if (priceRange === "Under500" && p.price >= 500) return false;
        if (priceRange === "500to1000" && (p.price < 500 || p.price > 1000)) return false;
        if (priceRange === "Above1000" && p.price <= 1000) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "Newest") {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy === "PriceLowHigh") {
          return a.price - b.price;
        }
        if (sortBy === "PriceHighLow") {
          return b.price - a.price;
        }
        if (sortBy === "NameAZ") {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedBakery, priceRange, sortBy]);

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    if (catName === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", catName);
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedBakery("All");
    setPriceRange("All");
    setSortBy("Recommended");
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "All" ||
    selectedBakery !== "All" ||
    priceRange !== "All" ||
    sortBy !== "Recommended";

  return (
    <div className="cravory-container" style={{ paddingTop: "24px", paddingBottom: "60px" }}>
      {/* 1. Header Banner */}
      <div style={styles.headerBanner}>
        <span className="cravory-badge cravory-badge-primary">🛍️ Cravory Marketplace</span>
        <h1 style={styles.headerTitle}>Handcrafted Cakes, Cookies & Fresh Bakery Delights</h1>
        <p style={styles.headerSubtitle}>
          Discover artisan treats baked fresh by local independent bakeries and delivered to your doorstep.
        </p>
      </div>

      {errorMsg && (
        <div className="cravory-error-state" style={{ marginBottom: "20px", textAlign: "center" }}>
          {errorMsg}
        </div>
      )}

      {/* 2. Category Filter Pills Bar */}
      <div style={styles.categoryPillsBar}>
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => handleCategorySelect(cat.name)}
            className={`cravory-chip ${selectedCategory === cat.name ? "active" : ""}`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* 3. Controls & Filter Panel */}
      <div style={styles.controlPanel}>
        {/* Search input */}
        <div style={{ flex: "2 1 240px" }}>
          <div style={styles.searchWrapper}>
            <span style={{ color: "var(--cravory-text-tertiary)" }}>🔍</span>
            <input
              type="text"
              placeholder="Search by cake name, description, or bakery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cravory-input"
              style={styles.searchInputInner}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={styles.clearSearchBtn}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Bakery Filter */}
        <div style={{ flex: "1 1 160px" }}>
          <select
            value={selectedBakery}
            onChange={(e) => setSelectedBakery(e.target.value)}
            className="cravory-select"
          >
            <option value="All">All Bakeries</option>
            {vendors.map((v) => (
              <option key={v._id} value={v._id}>
                🧁 {v.bakeryName}
              </option>
            ))}
          </select>
        </div>

        {/* Price Filter */}
        <div style={{ flex: "1 1 140px" }}>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="cravory-select"
          >
            <option value="All">All Prices</option>
            <option value="Under500">Under ₹500</option>
            <option value="500to1000">₹500 – ₹1000</option>
            <option value="Above1000">Above ₹1000</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div style={{ flex: "1 1 160px" }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="cravory-select"
          >
            <option value="Recommended">Sort: Recommended</option>
            <option value="Newest">Sort: Newest First</option>
            <option value="PriceLowHigh">Price: Low → High</option>
            <option value="PriceHighLow">Price: High → Low</option>
            <option value="NameAZ">Name: A → Z</option>
          </select>
        </div>
      </div>

      {/* 4. Results Metadata & Active Filters */}
      <div style={styles.resultsBar}>
        <span style={styles.resultsCountText}>
          Showing <b>{filteredProducts.length}</b> artisan bakery goods
        </span>

        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="cravory-btn cravory-btn-secondary"
            style={{ fontSize: "0.8rem", padding: "6px 14px" }}
          >
            Clear All Filters ✕
          </button>
        )}
      </div>

      {/* 5. Loading Skeleton / Product Grid / Empty State */}
      {loading && (
        <div style={styles.productGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} style={{ height: "340px", borderRadius: "16px" }} className="cravory-skeleton" />
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="cravory-empty-state">
          <div className="cravory-empty-icon">🧁</div>
          <h3 style={{ color: "var(--cravory-cocoa)", margin: "0 0 8px 0" }}>No bakery items found</h3>
          <p style={{ color: "var(--cravory-text-secondary)", margin: "0 0 20px 0", maxWidth: "450px" }}>
            We couldn't find any desserts matching your current filters or search term.
          </p>
          <button onClick={handleResetFilters} className="cravory-btn cravory-btn-primary">
            Reset Filters & Show All Items
          </button>
        </div>
      )}

      {!loading && filteredProducts.length > 0 && (
        <div style={styles.productGrid}>
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
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
    marginBottom: "20px",
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
  categoryPillsBar: {
    display: "flex",
    gap: "8px",
    overflowX: "auto",
    paddingBottom: "6px",
    marginBottom: "20px",
    scrollbarWidth: "thin",
  },
  controlPanel: {
    backgroundColor: "#ffffff",
    border: "1.5px solid #f0e6df",
    borderRadius: "16px",
    padding: "16px 20px",
    boxShadow: "0 2px 8px rgba(62, 39, 35, 0.04)",
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "center",
    marginBottom: "18px",
  },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#fffdfa",
    border: "1.5px solid #f0e6df",
    borderRadius: "10px",
    padding: "8px 12px",
  },
  searchInputInner: {
    border: "none",
    outline: "none",
    background: "transparent",
    padding: 0,
    width: "100%",
    boxShadow: "none",
  },
  clearSearchBtn: {
    background: "none",
    border: "none",
    color: "var(--cravory-text-tertiary)",
    cursor: "pointer",
    fontSize: "0.8rem",
    padding: 0,
  },
  resultsBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  resultsCountText: {
    fontSize: "0.9rem",
    color: "var(--cravory-text-secondary)",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "24px",
  },
};

export default Products;
