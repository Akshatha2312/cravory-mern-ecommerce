import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addProduct, uploadProductImage } from "../api/productApi";
import PRODUCT_CATEGORIES from "../utils/categories";
import AdminNav from "../components/AdminNav";

const AdminAddProduct = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!form.name || !form.description || !form.price || !form.category) {
      setErrorMsg("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setErrorMsg("");

      const res = await addProduct({
        ...form,
        price: Number(form.price),
        stock: form.stock ? Number(form.stock) : 0,
      });

      const createdProduct = res.product;

      // If an image was selected, upload it
      if (imageFile && createdProduct?._id) {
        const formData = new FormData();
        formData.append("image", imageFile);
        await uploadProductImage(createdProduct._id, formData);
      }

      setMessage("Product added successfully! 🎉");

      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
      });
      setImageFile(null);
      setImagePreview("");

      setTimeout(() => {
        navigate("/admin/products");
      }, 1500);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AdminNav />

      <div className="cravory-container" style={{ paddingBottom: "60px", maxWidth: "700px" }}>
        <div style={{ marginBottom: "20px" }}>
          <Link to="/admin/products" style={{ color: "var(--cravory-primary)", fontWeight: "600", textDecoration: "none", fontSize: "0.875rem" }}>
            ← Back to Products Catalog
          </Link>
          <h2 style={{ margin: "8px 0 0 0", color: "var(--cravory-cocoa)", fontSize: "1.5rem" }}>
            ➕ Add Platform Legacy Product
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.875rem", color: "var(--cravory-text-secondary)" }}>
            Add official Cravory platform items to the global marketplace menu.
          </p>
        </div>

        <div style={styles.card}>
          {message && (
            <div style={{ backgroundColor: "var(--cravory-success-bg)", border: "1px solid var(--cravory-success-border)", color: "var(--cravory-success)", padding: "12px 16px", borderRadius: "12px", fontSize: "0.875rem", marginBottom: "20px", fontWeight: "600" }}>
              ✅ {message}
            </div>
          )}
          {errorMsg && <div className="cravory-error-state" style={{ marginBottom: "20px" }}>{errorMsg}</div>}

          <form onSubmit={submitHandler}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Product Title *</label>
              <input
                name="name"
                placeholder="e.g. Cravory Signature Chocolate Mousse Cake"
                value={form.name}
                onChange={handleChange}
                required
                className="cravory-input"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description *</label>
              <textarea
                name="description"
                placeholder="Describe ingredient selection, weight, taste profile..."
                value={form.description}
                onChange={handleChange}
                required
                className="cravory-textarea"
                style={{ minHeight: "95px" }}
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  placeholder="350"
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="cravory-input"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="cravory-select"
                >
                  <option value="">Select Category</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  placeholder="10"
                  value={form.stock}
                  onChange={handleChange}
                  className="cravory-input"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Product Image (Optional)</label>
              <div style={styles.uploadArea}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ width: "100%" }}
                />
                {imagePreview && (
                  <div style={{ marginTop: "12px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--cravory-text-secondary)", display: "block", marginBottom: "4px" }}>Selected Image Preview:</span>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "10px", border: "1px solid var(--cravory-surface-border)" }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="cravory-btn cravory-btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="cravory-btn cravory-btn-primary"
                style={{ flex: 2 }}
              >
                {loading ? "Adding Product..." : "Save Platform Product →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: "#ffffff",
    padding: "28px",
    borderRadius: "20px",
    border: "1.5px solid var(--cravory-surface-border)",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  formGroup: {
    marginBottom: "18px",
  },
  formRow: {
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
  uploadArea: {
    backgroundColor: "var(--cravory-surface-secondary)",
    border: "1.5px dashed var(--cravory-surface-border-strong)",
    borderRadius: "14px",
    padding: "16px",
  },
};

export default AdminAddProduct;
