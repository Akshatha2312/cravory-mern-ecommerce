import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createVendorProduct, uploadVendorProductImage } from "../api/vendorProductApi";
import VendorLayout from "../components/VendorLayout";

function VendorAddProduct() {
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
  const [errors, setErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Product Name is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.price || Number(form.price) <= 0) errs.price = "Price must be greater than 0";
    if (!form.category.trim()) errs.category = "Category is required";
    if (form.stock === "" || Number(form.stock) < 0) errs.stock = "Stock cannot be negative";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const res = await createVendorProduct({
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category.trim(),
        stock: Number(form.stock),
      });

      const createdProduct = res.product;

      if (imageFile && createdProduct?._id) {
        const formData = new FormData();
        formData.append("image", imageFile);
        await uploadVendorProductImage(createdProduct._id, formData);
      }

      navigate("/vendor/products");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VendorLayout>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <div style={{ marginBottom: "20px" }}>
          <Link to="/vendor/products" style={{ color: "var(--cravory-primary)", fontWeight: "600", textDecoration: "none", fontSize: "0.875rem" }}>
            ← Back to My Products
          </Link>
          <h2 style={{ margin: "8px 0 0 0", color: "var(--cravory-cocoa)", fontSize: "1.5rem" }}>
            ➕ Add New Bakery Product
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.875rem", color: "var(--cravory-text-secondary)" }}>
            Fill in the details below to add a new cake, cookie, brownie, or pastry to your bakehouse menu.
          </p>
        </div>

        <div style={styles.card}>
          {errorMsg && <div className="cravory-error-state" style={{ marginBottom: "20px" }}>{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Product Name *</label>
              <input
                name="name"
                placeholder="e.g. Belgian Chocolate Mousse Cake"
                value={form.name}
                onChange={handleChange}
                className="cravory-input"
              />
              {errors.name && <span style={styles.fieldError}>{errors.name}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description *</label>
              <textarea
                name="description"
                placeholder="Describe ingredients, taste, weight, or portion size..."
                value={form.description}
                onChange={handleChange}
                className="cravory-textarea"
                style={{ minHeight: "100px" }}
              />
              {errors.description && <span style={styles.fieldError}>{errors.description}</span>}
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  placeholder="450"
                  value={form.price}
                  onChange={handleChange}
                  className="cravory-input"
                />
                {errors.price && <span style={styles.fieldError}>{errors.price}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="cravory-select"
                >
                  <option value="">Select Category</option>
                  <option value="Cakes">Cakes</option>
                  <option value="Cookies">Cookies</option>
                  <option value="Brownies">Brownies</option>
                  <option value="Biscuits">Biscuits</option>
                  <option value="Pastries">Pastries</option>
                  <option value="Dream Cakes">Dream Cakes</option>
                </select>
                {errors.category && <span style={styles.fieldError}>{errors.category}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Stock Quantity *</label>
                <input
                  type="number"
                  name="stock"
                  placeholder="10"
                  value={form.stock}
                  onChange={handleChange}
                  className="cravory-input"
                />
                {errors.stock && <span style={styles.fieldError}>{errors.stock}</span>}
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
                onClick={() => navigate("/vendor/products")}
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
                {loading ? "Creating Product..." : "Save Bakery Product →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </VendorLayout>
  );
}

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
  fieldError: {
    color: "var(--cravory-danger)",
    fontSize: "0.8rem",
    marginTop: "4px",
    display: "block",
  },
  uploadArea: {
    backgroundColor: "var(--cravory-surface-secondary)",
    border: "1.5px dashed var(--cravory-surface-border-strong)",
    borderRadius: "14px",
    padding: "16px",
  },
};

export default VendorAddProduct;
