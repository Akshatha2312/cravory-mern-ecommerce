import { useEffect, useState } from "react";
import AdminNav from "../components/AdminNav";
import { getAdminVendors, updateAdminVendorStatus } from "../api/adminApi";

function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [filterTab, setFilterTab] = useState("all");

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await getAdminVendors();
      setVendors(data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load vendor applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleStatusToggle = async (vendorId, isApproved, isActive, bakeryName) => {
    try {
      setProcessingId(vendorId);
      setActionMsg("");
      await updateAdminVendorStatus(vendorId, isApproved, isActive);
      setActionMsg(`Bakery '${bakeryName}' status updated successfully! 🎉`);
      await fetchVendors();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update vendor status.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredVendors = vendors.filter((v) => {
    if (filterTab === "pending") return v.isApproved === false;
    if (filterTab === "approved") return v.isApproved === true && v.isActive === true;
    if (filterTab === "inactive") return v.isActive === false;
    return true;
  });

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
        {/* Header & Filter Controls Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ margin: 0, color: "var(--cravory-cocoa)", fontSize: "1.35rem" }}>
              🧁 Baker & Vendor Management ({filteredVendors.length})
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.875rem", color: "var(--cravory-text-secondary)" }}>
              Review applications, approve new bakehouse partners, and manage active accounts.
            </p>
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {["all", "pending", "approved", "inactive"].map((tab) => {
              const count = vendors.filter((v) => {
                if (tab === "pending") return v.isApproved === false;
                if (tab === "approved") return v.isApproved === true && v.isActive === true;
                if (tab === "inactive") return v.isActive === false;
                return true;
              }).length;

              const isSelected = filterTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className="cravory-chip"
                  style={{
                    backgroundColor: isSelected ? "var(--cravory-primary)" : "#ffffff",
                    color: isSelected ? "#ffffff" : "var(--cravory-cocoa)",
                    borderColor: isSelected ? "transparent" : "var(--cravory-surface-border)",
                    padding: "6px 14px",
                    fontSize: "0.825rem",
                    textTransform: "capitalize",
                  }}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {errorMsg && <div className="cravory-error-state" style={{ marginBottom: "16px" }}>{errorMsg}</div>}
        {actionMsg && (
          <div style={{ backgroundColor: "var(--cravory-success-bg)", border: "1px solid var(--cravory-success-border)", color: "var(--cravory-success)", padding: "12px 16px", borderRadius: "12px", fontSize: "0.875rem", marginBottom: "16px", fontWeight: "600" }}>
            ✅ {actionMsg}
          </div>
        )}

        {filteredVendors.length === 0 ? (
          <div className="cravory-empty-state">
            <div className="cravory-empty-icon">🧁</div>
            <h3 style={{ color: "var(--cravory-cocoa)", margin: "0 0 8px 0" }}>No Bakehouses Found</h3>
            <p style={{ color: "var(--cravory-text-secondary)", margin: 0 }}>No vendors match the selected category filter.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {filteredVendors.map((v) => (
              <div key={v._id} style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", color: "var(--cravory-cocoa)", fontSize: "1.2rem" }}>{v.bakeryName}</h3>
                    <p style={{ margin: 0, color: "var(--cravory-text-secondary)", fontSize: "0.875rem" }}>
                      <strong>Applicant Name:</strong> {v.user?.name || "N/A"} ({v.user?.email || "N/A"})
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <span
                      className="cravory-badge"
                      style={{
                        backgroundColor: v.isApproved ? "var(--cravory-success-bg)" : "var(--cravory-warning-bg)",
                        color: v.isApproved ? "var(--cravory-success)" : "var(--cravory-warning)",
                        border: "1px solid",
                        borderColor: v.isApproved ? "var(--cravory-success-border)" : "#ffe0b2",
                      }}
                    >
                      {v.isApproved ? "Approved Bakehouse ✅" : "Pending Approval ⏳"}
                    </span>

                    <span
                      className="cravory-badge"
                      style={{
                        backgroundColor: v.isActive !== false ? "var(--cravory-primary-bg)" : "var(--cravory-danger-bg)",
                        color: v.isActive !== false ? "var(--cravory-primary)" : "var(--cravory-danger)",
                        border: "1px solid",
                        borderColor: v.isActive !== false ? "var(--cravory-primary-light)" : "var(--cravory-danger-border)",
                      }}
                    >
                      {v.isActive !== false ? "Active Status 🟢" : "Deactivated 🔴"}
                    </span>
                  </div>
                </div>

                <div style={styles.infoGrid}>
                  <div style={styles.infoBox}>
                    <p style={styles.infoItem}><b>Contact Phone:</b> {v.phone}</p>
                    <p style={styles.infoItem}><b>Business Email:</b> {v.email}</p>
                  </div>
                  <div style={styles.infoBox}>
                    <p style={styles.infoItem}><b>Bakehouse Location:</b> {v.city}, {v.state} - {v.pincode}</p>
                    <p style={styles.infoItem}><b>Address:</b> {v.address}</p>
                  </div>
                </div>

                {v.description && (
                  <div style={{ marginTop: "12px", fontSize: "0.85rem", color: "var(--cravory-text-secondary)", backgroundColor: "var(--cravory-surface-secondary)", padding: "12px", borderRadius: "12px", border: "1px solid var(--cravory-surface-border)" }}>
                    <strong>Bakery Story / Description:</strong> {v.description}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "14px", borderTop: "1.5px solid var(--cravory-surface-border)", flexWrap: "wrap", gap: "10px" }}>
                  <span style={{ fontSize: "0.825rem", color: "var(--cravory-text-tertiary)" }}>
                    Application Date: {new Date(v.createdAt).toLocaleString()}
                  </span>

                  <div style={{ display: "flex", gap: "10px" }}>
                    {!v.isApproved && (
                      <button
                        onClick={() => handleStatusToggle(v._id, true, true, v.bakeryName)}
                        disabled={processingId === v._id}
                        className="cravory-btn cravory-btn-primary cravory-btn-sm"
                      >
                        {processingId === v._id ? "Processing..." : "Approve Bakehouse ✅"}
                      </button>
                    )}

                    <button
                      onClick={() => handleStatusToggle(v._id, v.isApproved, !v.isActive, v.bakeryName)}
                      disabled={processingId === v._id}
                      className="cravory-btn cravory-btn-sm"
                      style={{
                        backgroundColor: v.isActive !== false ? "var(--cravory-danger-bg)" : "var(--cravory-success-bg)",
                        color: v.isActive !== false ? "var(--cravory-danger)" : "var(--cravory-success)",
                        borderColor: v.isActive !== false ? "var(--cravory-danger-border)" : "var(--cravory-success-border)",
                      }}
                    >
                      {processingId === v._id
                        ? "Updating..."
                        : v.isActive !== false
                        ? "Deactivate Bakery"
                        : "Reactivate Bakery"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1.5px solid var(--cravory-surface-border)",
    padding: "22px",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "12px",
    margin: "12px 0",
  },
  infoBox: {
    backgroundColor: "var(--cravory-surface-secondary)",
    border: "1px solid var(--cravory-surface-border)",
    borderRadius: "12px",
    padding: "12px",
  },
  infoItem: {
    margin: "3px 0",
    fontSize: "0.85rem",
    color: "var(--cravory-cocoa)",
  },
};

export default AdminVendors;
