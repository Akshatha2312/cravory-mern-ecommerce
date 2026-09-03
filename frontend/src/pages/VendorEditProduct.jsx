import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProductById } from "../api/productApi";
import { updateVendorProduct, uploadVendorProductImage } from "../api/vendorProductApi";
import VendorLayout from "../components/VendorLayout";

function VendorEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    isAvailable: true,
  });

  const [existingImages, setExistingImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const p = await getProductById(id);
        
        setForm({
          name: p.name || "",
          description: p.description || "",
          price: p.price !== undefined ? p.price : "",
          category: p.category || "",
          stock: p.stock !== undefined ? p.stock : "",
          isAvailable: p.isAvailable !== undefined ? p.isAvailable : true,
        });

        setExistingImages(p.images || []);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 403) {
          setForbidden(true);
        } else {
          setErrorMsg("Failed to load product details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
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
      setSubmitting(true);
      setErrorMsg("");

      await updateVendorProduct(id, {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category.trim(),
        stock: Number(form.stock),
        isAvailable: form.isAvailable,
      });

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        await uploadVendorProductImage(id, formData);
      }

      navigate("/vendor/products");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setForbidden(true);
      } else {
        setErrorMsg(err.response?.data?.message || "Failed to update product");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="cravory-container" style={{ paddingTop: "28px", paddingBottom: "60px" }}>
        <div style={{ height: "140px", borderRadius: "20px", marginBottom: "24px" }} className="cravory-skeleton" />
        <div style={{ height: "300px", borderRadius: "20px" }} className="cravory-skeleton" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <VendorLayout>
        <div className="cravory-empty-state" style={{ maxWidth: "500px", margin: "0 auto" }}>
          <div className="cravory-empty-icon">🚫</div>
          <h2 style={{ color: "var(--cravory-danger)", margin: "0 0 8px 0" }}>Access Denied</h2>
          <p style={{ color: "var(--cravory-text-secondary)", margin: "0 0 20px 0" }}>
            You do not have permission to edit this bakery product.
          </p>
          <Link to="/vendor/products" className="cravory-btn cravory-btn-primary">
            Return to My Products →
          </Link>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <div style={{ marginBottom: "20px" }}>
          <Link to="/vendor/products" style={{ color: "var(--cravory-primary)", fontWeight: "600", textDecoration: "none", fontSize: "0.875rem" }}>
            ← Back to My Products
          </Link>
          <h2 style={{ margin: "8px 0 0 0", color: "var(--cravory-cocoa)", fontSize: "1.5rem" }}>
            ✏️ Edit Bakery Product
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.875rem", color: "var(--cravory-text-secondary)" }}>
            Update pricing, stock level, online availability, or details for this item.
          </p>
        </div>

        <div style={styles.card}>
          {errorMsg && <div className="cravory-error-state" style={{ marginBottom: "20px" }}>{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Product Name *</label>
              <input
                name="name"
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
                  value={form.stock}
                  onChange={handleChange}
                  className="cravory-input"
                />
                {errors.stock && <span style={styles.fieldError}>{errors.stock}</span>}
              </div>
            </div>

            {/* Online Availability Switch Box */}
            <div style={styles.availabilityBox}>
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                checked={form.isAvailable}
                onChange={handleChange}
                style={{ width: "20px", height: "20px", accentColor: "var(--cravory-primary)", cursor: "pointer" }}
              />
              <label htmlFor="isAvailable" style={{ fontWeight: "700", cursor: "pointer", color: "var(--cravory-cocoa)", fontSize: "0.9rem" }}>
                Product is Active & Available for Customer Ordering Online 🟢
              </label>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Upload Additional Image</label>
              <div style={styles.uploadArea}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ width: "100%" }}
                />

                {/* Existing Images Display */}
                {existingImages.length > 0 && (
                  <div style={{ marginTop: "14px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--cravory-text-secondary)", display: "block", marginBottom: "6px" }}>Current Product Images:</span>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {existingImages.map((img, idx) => {
                        const url = typeof img === "string" ? img : img.url;
                        return (
                          <img
                            key={idx}
                            src={url}
                            alt="Product"
                            style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "10px", border: "1px solid var(--cravory-surface-border)" }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {imagePreview && (
                  <div style={{ marginTop: "14px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--cravory-success)", display: "block", marginBottom: "6px", fontWeight: "700" }}>New Replacement Image Preview:</span>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "10px", border: "2px solid var(--cravory-success)" }}
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
                disabled={submitting}
                className="cravory-btn cravory-btn-primary"
                style={{ flex: 2 }}
              >
                {submitting ? "Updating Product..." : "Update Product Details →"}
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
  availabilityBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "var(--cravory-surface-secondary)",
    border: "1px solid var(--cravory-surface-border)",
    borderRadius: "14px",
    padding: "14px",
    marginBottom: "18px",
  },
  uploadArea: {
    backgroundColor: "var(--cravory-surface-secondary)",
    border: "1.5px dashed var(--cravory-surface-border-strong)",
    borderRadius: "14px",
    padding: "16px",
  },
};

export default VendorEditProduct;
