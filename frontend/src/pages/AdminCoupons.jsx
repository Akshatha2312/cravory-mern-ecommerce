import { useEffect, useState } from "react";
import AdminNav from "../components/AdminNav";
import { getPublicCoupons } from "../api/couponApi";
import API from "../api/axios";

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 0,
    maxDiscount: "",
    expiryDate: "",
    usageLimit: "",
    perUserLimit: 1,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await getPublicCoupons();
      setCoupons(data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setActionMsg("");
      await API.post("/coupons/admin", formData);
      setActionMsg(`Coupon '${formData.code.toUpperCase()}' created successfully! 🎉`);
      setShowCreateForm(false);
      setFormData({
        code: "",
        discountType: "percentage",
        discountValue: 10,
        minOrderValue: 0,
        maxDiscount: "",
        expiryDate: "",
        usageLimit: "",
        perUserLimit: 1,
      });
      await fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id, code) => {
    if (!window.confirm(`Deactivate coupon '${code}'?`)) return;
    try {
      await API.delete(`/coupons/admin/${id}`);
      setActionMsg(`Coupon '${code}' deactivated successfully.`);
      await fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to deactivate coupon");
    }
  };

  if (loading) {
    return (
      <div>
        <AdminNav />
        <div className="cravory-container" style={{ paddingBottom: "60px" }}>
          <div style={{ height: "300px", borderRadius: "20px" }} className="cravory-skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminNav />

      <div className="cravory-container" style={{ paddingBottom: "60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ margin: 0, color: "var(--cravory-cocoa)", fontSize: "1.35rem" }}>
              🎟️ Platform Coupon Management ({coupons.length})
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.875rem", color: "var(--cravory-text-secondary)" }}>
              Create and manage promotional discount coupons for platform checkout.
            </p>
          </div>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={showCreateForm ? "cravory-btn cravory-btn-secondary" : "cravory-btn cravory-btn-primary"}
          >
            {showCreateForm ? "✕ Cancel Form" : "➕ Create New Coupon"}
          </button>
        </div>

        {errorMsg && <div className="cravory-error-state" style={{ marginBottom: "16px" }}>{errorMsg}</div>}
        {actionMsg && (
          <div style={{ backgroundColor: "var(--cravory-success-bg)", border: "1px solid var(--cravory-success-border)", color: "var(--cravory-success)", padding: "12px 16px", borderRadius: "12px", fontSize: "0.875rem", marginBottom: "16px", fontWeight: "600" }}>
            ✅ {actionMsg}
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateCoupon} style={styles.formCard}>
            <h3 style={{ margin: "0 0 16px 0", color: "var(--cravory-cocoa)", fontSize: "1.15rem" }}>
              Create Promotional Discount Coupon
            </h3>

            <div style={styles.formRow2}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Coupon Code *</label>
                <input type="text" name="code" value={formData.code} onChange={handleChange} placeholder="e.g. CRAVORY10" required className="cravory-input" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Discount Type *</label>
                <select name="discountType" value={formData.discountType} onChange={handleChange} className="cravory-select">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
            </div>

            <div style={styles.formRow3}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Discount Value *</label>
                <input type="number" min="1" name="discountValue" value={formData.discountValue} onChange={handleChange} required className="cravory-input" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Min Order Value (₹)</label>
                <input type="number" min="0" name="minOrderValue" value={formData.minOrderValue} onChange={handleChange} className="cravory-input" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Max Discount Cap (₹)</label>
                <input type="number" min="0" name="maxDiscount" value={formData.maxDiscount} onChange={handleChange} placeholder="Optional" className="cravory-input" />
              </div>
            </div>

            <div style={styles.formRow3}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Expiry Date *</label>
                <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required className="cravory-input" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Total Usage Limit</label>
                <input type="number" min="1" name="usageLimit" value={formData.usageLimit} onChange={handleChange} placeholder="Unlimited if blank" className="cravory-input" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Per-User Limit</label>
                <input type="number" min="1" name="perUserLimit" value={formData.perUserLimit} onChange={handleChange} className="cravory-input" />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
              <button type="button" onClick={() => setShowCreateForm(false)} className="cravory-btn cravory-btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="cravory-btn cravory-btn-primary">
                {submitting ? "Creating..." : "Save & Activate Coupon →"}
              </button>
            </div>
          </form>
        )}

        {/* Coupons List Table */}
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Coupon Code</th>
                <th style={styles.th}>Discount Terms</th>
                <th style={styles.th}>Min Order Required</th>
                <th style={styles.th}>Expiry Date</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id} style={styles.tr}>
                  <td style={styles.td}>
                    <span className="cravory-badge cravory-badge-primary" style={{ fontFamily: "monospace", fontSize: "0.9rem", padding: "4px 10px" }}>
                      {c.code}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <strong style={{ color: "var(--cravory-cocoa)" }}>
                      {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                    </strong>
                    {c.maxDiscount ? <span style={{ color: "var(--cravory-text-secondary)", fontSize: "0.825rem", marginLeft: "4px" }}>(Max Cap: ₹{c.maxDiscount})</span> : ""}
                  </td>
                  <td style={styles.td}>₹{c.minOrderValue || 0}</td>
                  <td style={styles.td}>
                    <span style={{ color: "var(--cravory-text-secondary)", fontSize: "0.85rem" }}>
                      {new Date(c.expiryDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleDeactivate(c._id, c.code)}
                      className="cravory-btn cravory-btn-sm"
                      style={{ backgroundColor: "var(--cravory-danger-bg)", color: "var(--cravory-danger)", borderColor: "var(--cravory-danger-border)" }}
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  formCard: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "20px",
    border: "1.5px solid var(--cravory-surface-border)",
    marginBottom: "24px",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  formGroup: {
    marginBottom: "14px",
  },
  formRow2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },
  formRow3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "14px",
  },
  label: {
    display: "block",
    marginBottom: "4px",
    fontWeight: "600",
    fontSize: "0.85rem",
    color: "var(--cravory-cocoa)",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1.5px solid var(--cravory-surface-border)",
    boxShadow: "var(--cravory-shadow-xs)",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  thRow: {
    backgroundColor: "var(--cravory-surface-secondary)",
    borderBottom: "1.5px solid var(--cravory-surface-border)",
  },
  th: {
    padding: "14px 18px",
    fontSize: "0.78rem",
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  tr: {
    borderBottom: "1px solid var(--cravory-surface-border)",
  },
  td: {
    padding: "14px 18px",
    fontSize: "0.875rem",
    verticalAlign: "middle",
  },
};

export default AdminCoupons;
