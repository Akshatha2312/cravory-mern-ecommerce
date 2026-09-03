import { useEffect, useState } from "react";
import { getVendorOrders, updateVendorOrderStatus } from "../api/orderApi";
import { getVendorProfile } from "../api/vendorApi";
import VendorLayout from "../components/VendorLayout";

function VendorOrders() {
  const [vendor, setVendor] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [vendorData, data] = await Promise.all([
        getVendorProfile().catch(() => null),
        getVendorOrders(),
      ]);
      setVendor(vendorData);
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to load vendor orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, itemId, newStatus) => {
    try {
      setUpdatingId(`${orderId}_${itemId}`);
      await updateVendorOrderStatus(orderId, newStatus, itemId);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update item status");
    } finally {
      setUpdatingId(null);
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

  if (errorMsg) {
    return (
      <div className="cravory-container" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
        <div className="cravory-error-state" style={{ textAlign: "center" }}>
          {errorMsg}
        </div>
      </div>
    );
  }

  return (
    <VendorLayout vendor={vendor}>
      {/* Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ margin: 0, color: "var(--cravory-cocoa)", fontSize: "1.35rem" }}>
            📦 Customer Orders ({orders.length})
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.875rem", color: "var(--cravory-text-secondary)" }}>
            Fulfill and update order status for customer purchases of your bakery products.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="cravory-btn cravory-btn-secondary"
        >
          🔄 Refresh Orders
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="cravory-empty-state">
          <div className="cravory-empty-icon">📦</div>
          <h3 style={{ color: "var(--cravory-cocoa)", margin: "0 0 8px 0" }}>No customer orders placed yet</h3>
          <p style={{ color: "var(--cravory-text-secondary)", margin: 0, maxWidth: "450px" }}>
            When dessert lovers purchase your freshly baked cakes, pastries, or cookies, their orders will appear right here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {orders.map((order) => (
            <div key={order._id} style={styles.orderCard}>
              {/* Order Card Header */}
              <div style={styles.orderHeaderRow}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--cravory-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: "700" }}>
                    Order ID
                  </span>
                  <div style={{ fontFamily: "monospace", fontWeight: "700", color: "var(--cravory-cocoa)", fontSize: "0.95rem" }}>
                    #{order._id}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--cravory-text-secondary)" }}>
                    📅 {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Customer & Shipping Details Grid */}
              <div style={styles.detailsGrid}>
                <div style={styles.detailBox}>
                  <div style={styles.detailTitle}>👤 Customer Details</div>
                  <div style={{ fontWeight: "700", color: "var(--cravory-cocoa)" }}>
                    {order.user?.name || "Customer"}
                  </div>
                  <div style={{ color: "var(--cravory-text-secondary)", fontSize: "0.825rem" }}>
                    {order.user?.email}
                  </div>
                </div>

                <div style={styles.detailBox}>
                  <div style={styles.detailTitle}>📍 Delivery Shipping Address</div>
                  {order.shippingAddress ? (
                    <div style={{ color: "var(--cravory-text-secondary)", fontSize: "0.825rem", lineHeight: "1.4" }}>
                      <strong>{order.shippingAddress.fullName}</strong>, {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode} (📞 {order.shippingAddress.phone})
                    </div>
                  ) : (
                    <div style={{ color: "var(--cravory-text-tertiary)", fontSize: "0.825rem" }}>N/A</div>
                  )}
                </div>
              </div>

              {/* Vendor Items Table */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--cravory-cocoa)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Purchased Items from Your Bakery:
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {order.orderItems?.map((item) => {
                    const isUpdating = updatingId === `${order._id}_${item._id}`;

                    return (
                      <div key={item._id} style={styles.itemRow}>
                        <div>
                          <span style={{ fontWeight: "700", color: "var(--cravory-cocoa)", fontSize: "0.95rem" }}>{item.name}</span>
                          <span style={{ color: "var(--cravory-text-secondary)", fontSize: "0.85rem", marginLeft: "8px" }}>
                            × {item.qty} (₹{item.price} each)
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: "800", color: "var(--cravory-cocoa)", fontSize: "0.95rem" }}>
                            ₹{item.price * item.qty}
                          </span>

                          {/* Status Select Dropdown */}
                          <select
                            value={item.status || "pending"}
                            onChange={(e) => handleStatusChange(order._id, item._id, e.target.value)}
                            disabled={isUpdating}
                            className="cravory-select"
                            style={{
                              width: "auto",
                              padding: "6px 12px",
                              fontSize: "0.825rem",
                              fontWeight: "700",
                              borderRadius: "var(--cravory-radius-full)",
                            }}
                          >
                            <option value="pending">Pending ⏳</option>
                            <option value="confirmed">Confirmed 📋</option>
                            <option value="preparing">Preparing 🧑‍🍳</option>
                            <option value="ready">Ready 📦</option>
                            <option value="out_for_delivery">Out for Delivery 🚚</option>
                            <option value="delivered">Delivered ✅</option>
                            <option value="cancelled">Cancelled ❌</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Footer Subtotal */}
              <div style={styles.orderFooterRow}>
                <div>
                  <span style={{ fontSize: "0.875rem", color: "var(--cravory-text-secondary)" }}>
                    Payment Status:{" "}
                  </span>
                  <strong style={{ color: order.isPaid ? "var(--cravory-success)" : "var(--cravory-danger)", fontSize: "0.875rem" }}>
                    {order.isPaid ? "Paid ✅" : "Pending ❌"}
                  </strong>
                </div>

                <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--cravory-primary)", fontFamily: "var(--cravory-font-display)" }}>
                  Bakehouse Subtotal: ₹{order.vendorSubtotal || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </VendorLayout>
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
  orderHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid var(--cravory-surface-border)",
    paddingBottom: "12px",
    marginBottom: "14px",
    flexWrap: "wrap",
    gap: "10px",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  detailBox: {
    backgroundColor: "var(--cravory-surface-secondary)",
    border: "1px solid var(--cravory-surface-border)",
    borderRadius: "12px",
    padding: "12px 14px",
  },
  detailTitle: {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "var(--cravory-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    marginBottom: "4px",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    border: "1px solid var(--cravory-surface-border)",
    borderRadius: "12px",
    padding: "10px 14px",
    flexWrap: "wrap",
    gap: "10px",
  },
  orderFooterRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1.5px solid var(--cravory-surface-border)",
    paddingTop: "12px",
    marginTop: "12px",
    flexWrap: "wrap",
    gap: "10px",
  },
};

export default VendorOrders;
