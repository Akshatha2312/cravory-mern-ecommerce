import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { registerVendor, getVendorStatus } from "../api/vendorApi";

function BecomeABaker() {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [statusData, setStatusData] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    bakeryName: "",
    description: "",
    phone: "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchStatus = async () => {
    try {
      setLoadingStatus(true);
      const data = await getVendorStatus();
      setStatusData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchStatus();
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!form.bakeryName.trim()) errs.bakeryName = "Bakery Name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      errs.email = "Enter a valid email address";
    }
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.state.trim()) errs.state = "State is required";
    if (!form.pincode.trim()) errs.pincode = "Pincode is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await registerVendor({
        bakeryName: form.bakeryName.trim(),
        description: form.description.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      });

      if (res.user) {
        updateUser(res.user);
      }

      setSuccessMsg("Application submitted successfully! Waiting for admin approval.");
      await fetchStatus();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="cravory-container" style={{ paddingTop: "28px", paddingBottom: "60px" }}>
        <div style={{ height: "140px", borderRadius: "20px", marginBottom: "24px" }} className="cravory-skeleton" />
        <div style={{ height: "300px", borderRadius: "20px" }} className="cravory-skeleton" />
      </div>
    );
  }

  const status = statusData?.status || "NOT_APPLIED";
  const vendorInfo = statusData?.vendor;

  return (
    <div className="cravory-container" style={{ paddingTop: "28px", paddingBottom: "60px", maxWidth: "860px" }}>
      {/* State: PENDING */}
      {status === "PENDING" && (
        <div style={styles.statusCard}>
          <span className="cravory-badge cravory-badge-primary" style={{ marginBottom: "12px", fontSize: "0.85rem" }}>
            ⏳ Application Under Review
          </span>
          <h2 style={styles.cardTitle}>Your Baker Application is Being Reviewed</h2>
          <p style={{ color: "var(--cravory-text-secondary)", lineHeight: "1.55", marginBottom: "20px" }}>
            Thank you for applying to join the Cravory Artisan Bakery Marketplace! Our admin team is currently reviewing your bakery details. You will be able to access your Baker Dashboard once approved.
          </p>

          {vendorInfo && (
            <div style={styles.detailsBox}>
              <h3 style={{ fontSize: "0.95rem", color: "var(--cravory-cocoa)", margin: "0 0 10px 0" }}>Submitted Bakery Information:</h3>
              <p style={styles.detailItem}><b>Bakehouse Name:</b> {vendorInfo.bakeryName}</p>
              <p style={styles.detailItem}><b>Contact Phone:</b> {vendorInfo.phone}</p>
              <p style={styles.detailItem}><b>Business Email:</b> {vendorInfo.email}</p>
              <p style={styles.detailItem}><b>Address:</b> {vendorInfo.address}, {vendorInfo.city}, {vendorInfo.state} - {vendorInfo.pincode}</p>
              <p style={styles.detailItem}><b>Application Date:</b> {new Date(vendorInfo.createdAt).toLocaleString()}</p>
            </div>
          )}
        </div>
      )}

      {/* State: APPROVED */}
      {status === "APPROVED" && (
        <div style={styles.statusCard}>
          <span style={{ fontSize: "3.5rem", display: "block", marginBottom: "10px" }}>🎉</span>
          <span className="cravory-badge cravory-badge-primary" style={{ marginBottom: "12px", fontSize: "0.85rem" }}>
            ✓ Bakery Approved & Active
          </span>
          <h2 style={styles.cardTitle}>Welcome to Cravory, {vendorInfo?.bakeryName}!</h2>
          <p style={{ color: "var(--cravory-text-secondary)", lineHeight: "1.55", marginBottom: "24px" }}>
            Your bakery account is fully approved. You can now manage your bakery menu, stock inventory, and fulfill customer orders directly in your seller portal.
          </p>
          <button
            onClick={() => navigate("/vendor/dashboard")}
            className="cravory-btn cravory-btn-primary cravory-btn-lg"
          >
            Go to Baker Dashboard →
          </button>
        </div>
      )}

      {/* State: SUSPENDED */}
      {status === "SUSPENDED" && (
        <div style={{ ...styles.statusCard, borderColor: "var(--cravory-danger-border)" }}>
          <span className="cravory-badge" style={{ backgroundColor: "var(--cravory-danger-bg)", color: "var(--cravory-danger)", marginBottom: "12px" }}>
            ⚠️ Account Suspended
          </span>
          <h2 style={{ ...styles.cardTitle, color: "var(--cravory-danger)" }}>Bakery Account Currently Inactive</h2>
          <p style={{ color: "var(--cravory-text-secondary)", lineHeight: "1.55" }}>
            Your baker seller profile has been deactivated by platform administrators. Please contact Cravory support for assistance with reactivation.
          </p>
        </div>
      )}

      {/* State: NOT_APPLIED */}
      {status === "NOT_APPLIED" && (
        <div>
          {/* Hero Banner */}
          <div style={styles.heroBanner}>
            <span className="cravory-badge cravory-badge-primary" style={{ marginBottom: "10px" }}>
              🥐 Partner Bakehouses
            </span>
            <h1 style={styles.heroTitle}>Become a Cravory Baker</h1>
            <p style={styles.heroSubtitle}>
              Turn your baking passion into your own online bakery storefront. Reach thousands of local dessert lovers on Cravory.
            </p>

            <div style={styles.benefitsGrid}>
              <div style={styles.benefitCard}>
                <div style={styles.benefitIcon}>🚀</div>
                <h4 style={styles.benefitTitle}>Expand Your Reach</h4>
                <p style={styles.benefitText}>Showcase your signature cakes, brownies, and pastries to dessert enthusiasts across your region.</p>
              </div>
              <div style={styles.benefitCard}>
                <div style={styles.benefitIcon}>🍰</div>
                <h4 style={styles.benefitTitle}>Build Your Storefront</h4>
                <p style={styles.benefitText}>Create your customized online bakery page with custom pricing and real-time inventory management.</p>
              </div>
              <div style={styles.benefitCard}>
                <div style={styles.benefitIcon}>📦</div>
                <h4 style={styles.benefitTitle}>Seamless Order Flow</h4>
                <p style={styles.benefitText}>Receive customer orders effortlessly, update baking stages, and scale your local home bakery.</p>
              </div>
            </div>
          </div>

          {/* Application Form Card */}
          <div style={styles.formCard}>
            <h2 style={{ fontSize: "1.4rem", color: "var(--cravory-cocoa)", margin: "0 0 20px 0" }}>
              Baker Partner Application Form
            </h2>

            {errorMsg && <div className="cravory-error-state" style={{ marginBottom: "20px" }}>{errorMsg}</div>}
            {successMsg && (
              <div style={{ backgroundColor: "var(--cravory-success-bg)", border: "1px solid var(--cravory-success-border)", color: "var(--cravory-success)", padding: "14px 18px", borderRadius: "14px", marginBottom: "20px", fontWeight: "700", fontSize: "0.9rem" }}>
                ✅ {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Bakery / Shop Name *</label>
                <input
                  name="bakeryName"
                  placeholder="e.g. Sweet Dreams Artisan Bakery"
                  value={form.bakeryName}
                  onChange={handleChange}
                  className="cravory-input"
                />
                {errors.bakeryName && <span style={styles.fieldError}>{errors.bakeryName}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Bakery Story & Description</label>
                <textarea
                  name="description"
                  placeholder="Tell customers what makes your fresh baked goods special..."
                  value={form.description}
                  onChange={handleChange}
                  className="cravory-textarea"
                  style={{ minHeight: "90px" }}
                />
              </div>

              <div style={styles.formRow2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Contact Phone *</label>
                  <input
                    name="phone"
                    placeholder="e.g. +91 9876543210"
                    value={form.phone}
                    onChange={handleChange}
                    className="cravory-input"
                  />
                  {errors.phone && <span style={styles.fieldError}>{errors.phone}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Business Email *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="baker@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="cravory-input"
                  />
                  {errors.email && <span style={styles.fieldError}>{errors.email}</span>}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Full Bakehouse Address *</label>
                <input
                  name="address"
                  placeholder="Shop/Street address"
                  value={form.address}
                  onChange={handleChange}
                  className="cravory-input"
                />
                {errors.address && <span style={styles.fieldError}>{errors.address}</span>}
              </div>

              <div style={styles.formRow3}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>City *</label>
                  <input
                    name="city"
                    placeholder="City"
                    value={form.city}
                    onChange={handleChange}
                    className="cravory-input"
                  />
                  {errors.city && <span style={styles.fieldError}>{errors.city}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>State *</label>
                  <input
                    name="state"
                    placeholder="State"
                    value={form.state}
                    onChange={handleChange}
                    className="cravory-input"
                  />
                  {errors.state && <span style={styles.fieldError}>{errors.state}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Pincode *</label>
                  <input
                    name="pincode"
                    placeholder="Pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    className="cravory-input"
                  />
                  {errors.pincode && <span style={styles.fieldError}>{errors.pincode}</span>}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="cravory-btn cravory-btn-primary cravory-btn-lg"
                style={{ width: "100%", marginTop: "12px" }}
              >
                {submitting ? "Submitting Application..." : "Submit Baker Application →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  heroBanner: {
    backgroundColor: "#fff8f5",
    backgroundImage: "radial-gradient(circle at 90% 10%, #ffe4ec 0%, transparent 45%), linear-gradient(180deg, #fffaf8 0%, #fff0f4 100%)",
    border: "1px solid #fce4ec",
    borderRadius: "24px",
    padding: "36px 30px",
    marginBottom: "28px",
  },
  heroTitle: {
    fontFamily: "var(--cravory-font-display)",
    fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
    fontWeight: "800",
    color: "var(--cravory-cocoa)",
    margin: "0 0 8px 0",
    lineHeight: "1.2",
  },
  heroSubtitle: {
    fontSize: "1rem",
    color: "var(--cravory-text-secondary)",
    margin: 0,
    maxWidth: "600px",
    lineHeight: "1.5",
  },
  benefitsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginTop: "24px",
  },
  benefitCard: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "18px",
    border: "1.5px solid var(--cravory-surface-border)",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  benefitIcon: {
    fontSize: "1.6rem",
    marginBottom: "8px",
  },
  benefitTitle: {
    margin: "0 0 4px 0",
    fontSize: "0.98rem",
    color: "var(--cravory-cocoa)",
  },
  benefitText: {
    margin: 0,
    fontSize: "0.825rem",
    color: "var(--cravory-text-secondary)",
    lineHeight: "1.45",
  },
  formCard: {
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "24px",
    border: "1.5px solid var(--cravory-surface-border)",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  statusCard: {
    backgroundColor: "#ffffff",
    padding: "36px",
    borderRadius: "24px",
    border: "1.5px solid var(--cravory-surface-border)",
    textAlign: "center",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  cardTitle: {
    fontFamily: "var(--cravory-font-display)",
    fontSize: "1.6rem",
    color: "var(--cravory-cocoa)",
    margin: "0 0 10px 0",
  },
  detailsBox: {
    backgroundColor: "var(--cravory-surface-secondary)",
    border: "1px solid var(--cravory-surface-border)",
    borderRadius: "16px",
    padding: "18px",
    textAlign: "left",
    maxWidth: "500px",
    margin: "0 auto",
  },
  detailItem: {
    fontSize: "0.875rem",
    color: "var(--cravory-text-secondary)",
    margin: "0 0 6px 0",
  },
  formGroup: {
    marginBottom: "18px",
  },
  formRow2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  formRow3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "14px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
    fontSize: "0.875rem",
    color: "var(--cravory-cocoa)",
  },
  fieldError: {
    color: "var(--cravory-danger)",
    fontSize: "0.8rem",
    marginTop: "4px",
    display: "block",
  },
};

export default BecomeABaker;
