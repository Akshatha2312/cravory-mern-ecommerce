import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../api/orderApi";
import { createRazorpayOrder, verifyPayment, reportPaymentFailure } from "../api/paymentApi";
import { clearCart } from "../api/cartApi";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data || []);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async (order) => {
    try {
      const rzpData = await createRazorpayOrder(order._id);

      const options = {
        key: rzpData.key,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "Cravory Bakery Marketplace",
        description: `Retry Order #${order._id.substring(0, 8)}`,
        order_id: rzpData.id,
        handler: async function (response) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              mongo_order_id: order._id,
            });

            await clearCart();
            alert("Payment successful!");
            await loadOrders();
          } catch (err) {
            alert(err.response?.data?.message || "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: async function () {
            await reportPaymentFailure(order._id, "Retry modal closed by user");
          },
        },
        prefill: {
          name: order.shippingAddress?.fullName || "",
          contact: order.shippingAddress?.phone || "",
        },
        theme: {
          color: "#c2185b",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async function (response) {
        await reportPaymentFailure(order._id, response.error?.description || "Payment failed");
        alert(`Payment failed: ${response.error?.description || "Transaction declined"}`);
      });
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to initiate payment retry.");
    }
  };

  // Helper to group order items by vendor/bakery
  const groupItemsByVendor = (items) => {
    const groups = new Map();

    items?.forEach((item) => {
      const v = item.vendor && typeof item.vendor === "object" ? item.vendor : null;
      const key = v ? v._id : "cravory_legacy";
      const name = v ? v.bakeryName : "Cravory Products";

      if (!groups.has(key)) {
        groups.set(key, {
          bakeryName: name,
          isLegacy: !v,
          items: [],
        });
      }
      groups.get(key).items.push(item);
    });

    return Array.from(groups.values());
  };

  const stages = [
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "preparing", label: "Preparing" },
    { key: "ready", label: "Ready" },
    { key: "out_for_delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
  ];

  const stageRanks = {
    pending: 0,
    confirmed: 1,
    preparing: 2,
    ready: 3,
    out_for_delivery: 4,
    delivered: 5,
  };

  const renderBakeryTimeline = (group) => {
    const hasCancelled = group.items.some((i) => i.status === "cancelled");
    if (hasCancelled) {
      return (
        <div style={styles.cancelledTimelineBox}>
          ❌ Status: Cancelled
        </div>
      );
    }

    const maxRank = Math.max(
      ...group.items.map((i) => stageRanks[i.status || "pending"] ?? 0)
    );

    return (
      <div style={styles.timelineWrapper}>
        <div style={styles.timelineHeading}>
          Fulfillment Progress:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          {stages.map((stg, idx) => {
            const isPassed = idx < maxRank;
            const isCurrent = idx === maxRank;

            let symbol = "○";
            let color = "var(--cravory-text-secondary)";
            let bg = "var(--cravory-surface-secondary)";
            let border = "1px solid var(--cravory-surface-border)";

            if (isPassed) {
              symbol = "✓";
              color = "var(--cravory-success)";
              bg = "var(--cravory-success-bg)";
              border = "1px solid var(--cravory-success-border)";
            } else if (isCurrent) {
              symbol = "→";
              color = "var(--cravory-primary)";
              bg = "var(--cravory-primary-bg)";
              border = "1px solid var(--cravory-primary-light)";
            }

            return (
              <div
                key={stg.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  backgroundColor: bg,
                  color,
                  border,
                  fontSize: "0.75rem",
                  fontWeight: isCurrent ? "700" : "500",
                }}
              >
                <span>{symbol}</span>
                <span>{stg.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const s = status || "pending";
    const map = {
      pending: { label: "Pending ⏳", color: "var(--cravory-text-secondary)", bg: "var(--cravory-surface-tertiary)" },
      confirmed: { label: "Confirmed 📋", color: "var(--cravory-primary)", bg: "var(--cravory-primary-bg)" },
      preparing: { label: "Preparing 🧑‍🍳", color: "var(--cravory-warning)", bg: "var(--cravory-warning-bg)" },
      ready: { label: "Ready 📦", color: "var(--cravory-success)", bg: "var(--cravory-success-bg)" },
      out_for_delivery: { label: "Out for Delivery 🚚", color: "var(--cravory-primary)", bg: "var(--cravory-primary-bg)" },
      delivered: { label: "Delivered ✅", color: "var(--cravory-success)", bg: "var(--cravory-success-bg)" },
      cancelled: { label: "Cancelled ❌", color: "var(--cravory-danger)", bg: "var(--cravory-danger-bg)" },
    };

    const style = map[s] || map.pending;
    return (
      <span
        style={{
          backgroundColor: style.bg,
          color: style.color,
          padding: "3px 8px",
          borderRadius: "var(--cravory-radius-full)",
          fontSize: "0.75rem",
          fontWeight: "700",
          display: "inline-block",
        }}
      >
        {style.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="cravory-container" style={{ paddingTop: "28px", paddingBottom: "60px" }}>
        <div style={{ height: "140px", borderRadius: "20px", marginBottom: "24px" }} className="cravory-skeleton" />
        <div style={{ height: "280px", borderRadius: "20px" }} className="cravory-skeleton" />
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
    <div className="cravory-container" style={{ paddingTop: "24px", paddingBottom: "60px" }}>
      {/* 1. Header Banner */}
      <div style={styles.headerBanner}>
        <div>
          <span className="cravory-badge cravory-badge-primary" style={{ marginBottom: "6px" }}>
            📦 Purchase History
          </span>
          <h1 style={styles.headerTitle}>My Orders</h1>
          <p style={styles.headerSubtitle}>
            Track your freshly baked treats from artisan bakehouses from order to doorstep.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="cravory-empty-state">
          <div className="cravory-empty-icon">📦</div>
          <h2 style={{ color: "var(--cravory-cocoa)", margin: "0 0 8px 0" }}>No orders placed yet</h2>
          <p style={{ color: "var(--cravory-text-secondary)", margin: "0 0 20px 0", maxWidth: "450px" }}>
            Your next bakery favourite is waiting for you! Browse artisan cakes, cookies, and pastries from top bakehouses.
          </p>
          <Link to="/products" className="cravory-btn cravory-btn-primary">
            Explore Bakery Marketplace →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px", margin: "0 auto" }}>
          {orders.map((order) => {
            const itemGroups = groupItemsByVendor(order.orderItems);

            return (
              <div key={order._id} style={styles.orderCard}>
                {/* Order Header */}
                <div style={styles.orderHeaderRow}>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--cravory-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: "700" }}>
                      Order ID
                    </span>
                    <div style={styles.orderIdText}>#{order._id}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "var(--cravory-text-secondary)", fontSize: "0.85rem", fontWeight: "500" }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Delivery Address Snapshot Preview */}
                {order.shippingAddress && (
                  <div style={styles.addressSnapshotBox}>
                    📍 <b>Delivery Address:</b> {order.shippingAddress.fullName}, {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode} ({order.shippingAddress.phone})
                  </div>
                )}

                {/* Vendor Grouped Items */}
                <div style={{ marginBottom: "16px" }}>
                  {itemGroups.map((group, gIdx) => (
                    <div key={gIdx} style={styles.groupItemBox}>
                      <div style={styles.groupBakeryTitle}>
                        🧁 {group.bakeryName}
                      </div>

                      {group.items.map((item, idx) => (
                        <div key={idx} style={styles.orderItemRow}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <strong style={{ color: "var(--cravory-cocoa)" }}>{item.name}</strong>
                            <span style={{ fontSize: "0.85rem", color: "var(--cravory-text-secondary)" }}>× {item.qty}</span>
                            {getStatusBadge(item.status)}
                          </div>
                          <span style={{ fontWeight: "700", color: "var(--cravory-cocoa)" }}>₹{item.price * item.qty}</span>
                        </div>
                      ))}

                      {/* Bakery Fulfillment Timeline */}
                      {renderBakeryTimeline(group)}
                    </div>
                  ))}
                </div>

                {/* Order Total & Status Footer */}
                <div style={styles.orderFooterRow}>
                  <div>
                    <div style={{ fontSize: "0.875rem", marginBottom: "4px" }}>
                      <span style={{ color: "var(--cravory-text-secondary)" }}>Payment: </span>
                      <strong style={{ color: order.isPaid ? "var(--cravory-success)" : "var(--cravory-danger)" }}>
                        {order.isPaid ? "Paid ✅" : "Pending ❌"}
                      </strong>
                    </div>
                    <div style={{ fontSize: "0.875rem" }}>
                      <span style={{ color: "var(--cravory-text-secondary)" }}>Fulfillment: </span>
                      <strong style={{ color: order.isDelivered ? "var(--cravory-success)" : "var(--cravory-warning)" }}>
                        {order.isDelivered ? "Delivered 🚚" : "In Progress ⏳"}
                      </strong>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={styles.totalPriceText}>
                      Total: ₹{order.totalPrice}
                    </div>
                    {!order.isPaid && (
                      <button
                        onClick={() => handleRetryPayment(order)}
                        className="cravory-btn cravory-btn-primary cravory-btn-sm"
                        style={{ marginTop: "6px" }}
                      >
                        💳 Pay Now / Retry Payment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
    marginBottom: "28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "900px",
    margin: "0 auto 28px auto",
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
    margin: "4px 0 0 0",
    maxWidth: "580px",
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1.5px solid var(--cravory-surface-border)",
    padding: "24px",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  orderHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid var(--cravory-surface-border)",
    paddingBottom: "14px",
    marginBottom: "16px",
    gap: "12px",
    flexWrap: "wrap",
  },
  orderIdText: {
    fontFamily: "monospace",
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
    fontSize: "1rem",
  },
  addressSnapshotBox: {
    fontSize: "0.85rem",
    color: "var(--cravory-text-secondary)",
    marginBottom: "16px",
    backgroundColor: "var(--cravory-surface-secondary)",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid var(--cravory-surface-border)",
  },
  groupItemBox: {
    backgroundColor: "#ffffff",
    border: "1px solid var(--cravory-surface-border)",
    borderRadius: "14px",
    padding: "14px 16px",
    marginBottom: "12px",
  },
  groupBakeryTitle: {
    fontWeight: "700",
    color: "var(--cravory-cocoa)",
    marginBottom: "10px",
    fontSize: "0.95rem",
  },
  orderItemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    fontSize: "0.9rem",
    borderBottom: "1px solid var(--cravory-surface-border)",
  },
  timelineWrapper: {
    marginTop: "12px",
    padding: "12px",
    backgroundColor: "var(--cravory-surface-secondary)",
    borderRadius: "12px",
    border: "1px solid var(--cravory-surface-border)",
  },
  timelineHeading: {
    fontSize: "0.75rem",
    color: "var(--cravory-text-tertiary)",
    marginBottom: "8px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  cancelledTimelineBox: {
    padding: "8px 12px",
    backgroundColor: "var(--cravory-danger-bg)",
    color: "var(--cravory-danger)",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "700",
    marginTop: "10px",
  },
  orderFooterRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1.5px solid var(--cravory-surface-border)",
    paddingTop: "14px",
    marginTop: "14px",
    flexWrap: "wrap",
    gap: "12px",
  },
  totalPriceText: {
    fontSize: "1.25rem",
    fontWeight: "800",
    color: "var(--cravory-primary)",
    fontFamily: "var(--cravory-font-display)",
  },
};

export default MyOrders;
