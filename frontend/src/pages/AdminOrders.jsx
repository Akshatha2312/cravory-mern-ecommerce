import { useEffect, useState } from "react";
import AdminNav from "../components/AdminNav";
import { getAdminOrders } from "../api/adminApi";
import { markOrderDelivered } from "../api/orderApi";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [filterPaid, setFilterPaid] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAdminOrders();
      setOrders(data || []);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to load admin orders");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (id) => {
    try {
      await markOrderDelivered(id);
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update order status");
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterPaid === "paid") return o.isPaid === true;
    if (filterPaid === "unpaid") return o.isPaid === false;
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
        {/* Header & Filter Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ margin: 0, color: "var(--cravory-cocoa)", fontSize: "1.35rem" }}>
              🛒 Customer Orders Overview ({filteredOrders.length})
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.875rem", color: "var(--cravory-text-secondary)" }}>
              Inspect unified customer orders across all partner bakehouses on the platform.
            </p>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {["all", "paid", "unpaid"].map((f) => {
              const count = orders.filter((o) => (f === "paid" ? o.isPaid : f === "unpaid" ? !o.isPaid : true)).length;
              const isSelected = filterPaid === f;

              return (
                <button
                  key={f}
                  onClick={() => setFilterPaid(f)}
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
                  {f} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {errorMsg && <div className="cravory-error-state" style={{ marginBottom: "16px" }}>{errorMsg}</div>}

        {filteredOrders.length === 0 ? (
          <div className="cravory-empty-state">
            <div className="cravory-empty-icon">🛒</div>
            <h3 style={{ color: "var(--cravory-cocoa)", margin: "0 0 8px 0" }}>No Orders Found</h3>
            <p style={{ color: "var(--cravory-text-secondary)", margin: 0 }}>No orders match the selected payment filter.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {filteredOrders.map((order) => (
              <div key={order._id} style={styles.orderCard}>
                {/* Header Row */}
                <div style={styles.headerRow}>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--cravory-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: "700" }}>
                      Customer & Order ID
                    </span>
                    <div style={{ fontWeight: "700", color: "var(--cravory-cocoa)", fontSize: "0.95rem" }}>
                      {order.user ? order.user.name : "Guest User"} ({order.user ? order.user.email : "N/A"})
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--cravory-text-secondary)" }}>
                      #{order._id}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--cravory-text-secondary)" }}>
                      📅 {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Ordered Items Box */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--cravory-cocoa)", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "8px" }}>
                    Purchased Marketplace Products:
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {order.orderItems?.map((item, idx) => (
                      <div key={idx} style={styles.itemRow}>
                        <div>
                          <strong style={{ color: "var(--cravory-cocoa)" }}>{item.name}</strong>
                          <span style={{ fontSize: "0.85rem", color: "var(--cravory-text-secondary)", marginLeft: "8px" }}>
                            × {item.qty} ({item.vendor ? `🧁 ${item.vendor.bakeryName}` : "🍰 Cravory Legacy"})
                          </span>
                        </div>
                        <span style={{ fontWeight: "700", color: "var(--cravory-cocoa)" }}>₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Totals & Action */}
                <div style={styles.footerRow}>
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "0.85rem", color: "var(--cravory-text-secondary)" }}>Total: </span>
                      <strong style={{ fontSize: "1.1rem", color: "var(--cravory-primary)", fontFamily: "var(--cravory-font-display)" }}>
                        ₹{order.totalPrice} {order.discountAmount > 0 ? `(-₹${order.discountAmount})` : ""}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.85rem", color: "var(--cravory-text-secondary)" }}>Payment: </span>
                      <strong style={{ color: order.isPaid ? "var(--cravory-success)" : "var(--cravory-danger)", fontSize: "0.85rem" }}>
                        {order.isPaid ? "Paid ✅" : "Pending ❌"}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.85rem", color: "var(--cravory-text-secondary)" }}>Fulfillment: </span>
                      <strong style={{ color: order.isDelivered ? "var(--cravory-success)" : "var(--cravory-warning)", fontSize: "0.85rem" }}>
                        {order.isDelivered ? "Delivered 🚚" : "In Progress ⏳"}
                      </strong>
                    </div>
                  </div>

                  {!order.isDelivered && (
                    <button
                      onClick={() => handleMarkDelivered(order._id)}
                      className="cravory-btn cravory-btn-primary cravory-btn-sm"
                    >
                      Mark Order Delivered 🚚
                    </button>
                  )}
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
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1.5px solid var(--cravory-surface-border)",
    padding: "22px",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid var(--cravory-surface-border)",
    paddingBottom: "12px",
    marginBottom: "14px",
    flexWrap: "wrap",
    gap: "10px",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "var(--cravory-surface-secondary)",
    border: "1px solid var(--cravory-surface-border)",
    borderRadius: "12px",
    padding: "8px 14px",
    fontSize: "0.875rem",
  },
  footerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1.5px solid var(--cravory-surface-border)",
    paddingTop: "12px",
    marginTop: "12px",
    flexWrap: "wrap",
    gap: "12px",
  },
};

export default AdminOrders;
