import { useEffect, useState } from "react";
import AdminNav from "../components/AdminNav";
import { getAdminUsers, toggleAdminUserStatus } from "../api/adminApi";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await getAdminUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId, currentStatus, userName) => {
    try {
      setProcessingId(userId);
      setActionMsg("");
      const newStatus = !currentStatus;
      await toggleAdminUserStatus(userId, newStatus);
      setActionMsg(`User '${userName}' account ${newStatus ? "activated" : "deactivated"} successfully.`);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user status.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ margin: 0, color: "var(--cravory-cocoa)", fontSize: "1.35rem" }}>
              👤 User Account Management ({filteredUsers.length})
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.875rem", color: "var(--cravory-text-secondary)" }}>
              Inspect platform user accounts, verify assigned roles, and toggle user status.
            </p>
          </div>

          <input
            type="text"
            placeholder="🔍 Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="cravory-input"
            style={{ width: "280px" }}
          />
        </div>

        {errorMsg && <div className="cravory-error-state" style={{ marginBottom: "16px" }}>{errorMsg}</div>}
        {actionMsg && (
          <div style={{ backgroundColor: "var(--cravory-success-bg)", border: "1px solid var(--cravory-success-border)", color: "var(--cravory-success)", padding: "12px 16px", borderRadius: "12px", fontSize: "0.875rem", marginBottom: "16px", fontWeight: "600" }}>
            ✅ {actionMsg}
          </div>
        )}

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Customer / User</th>
                <th style={styles.th}>Email Address</th>
                <th style={styles.th}>Platform Role</th>
                <th style={styles.th}>Joined Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Account Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isActive = u.isActive !== false;
                return (
                  <tr key={u._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: "700", color: "var(--cravory-cocoa)" }}>{u.name}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: "var(--cravory-text-secondary)", fontSize: "0.875rem" }}>{u.email}</span>
                    </td>
                    <td style={styles.td}>
                      <span
                        className="cravory-badge"
                        style={{
                          backgroundColor: u.role === "admin" ? "var(--cravory-danger-bg)" : u.role === "vendor" ? "var(--cravory-primary-bg)" : "var(--cravory-surface-tertiary)",
                          color: u.role === "admin" ? "var(--cravory-danger)" : u.role === "vendor" ? "var(--cravory-primary)" : "var(--cravory-text-secondary)",
                          border: "1px solid",
                          borderColor: u.role === "admin" ? "var(--cravory-danger-border)" : u.role === "vendor" ? "var(--cravory-primary-light)" : "var(--cravory-surface-border)",
                          textTransform: "uppercase",
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: "var(--cravory-text-tertiary)", fontSize: "0.85rem" }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: isActive ? "var(--cravory-success)" : "var(--cravory-danger)", fontWeight: "700", fontSize: "0.85rem" }}>
                        {isActive ? "Active ✅" : "Deactivated 🔴"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleToggleStatus(u._id, isActive, u.name)}
                        disabled={processingId === u._id}
                        className="cravory-btn cravory-btn-sm"
                        style={{
                          backgroundColor: isActive ? "var(--cravory-danger-bg)" : "var(--cravory-success-bg)",
                          color: isActive ? "var(--cravory-danger)" : "var(--cravory-success)",
                          borderColor: isActive ? "var(--cravory-danger-border)" : "var(--cravory-success-border)",
                        }}
                      >
                        {processingId === u._id ? "Updating..." : isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
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

export default AdminUsers;
