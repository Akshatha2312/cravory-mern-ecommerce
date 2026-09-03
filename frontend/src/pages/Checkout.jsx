import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getCart, clearCart } from "../api/cartApi";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../api/addressApi";
import { createOrder } from "../api/orderApi";
import { createRazorpayOrder, verifyPayment, reportPaymentFailure } from "../api/paymentApi";
import { applyCoupon } from "../api/couponApi";

function Checkout() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Cart & Group state
  const [cartData, setCartData] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Address Form state
  const [showForm, setShowForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    label: "Home",
    isDefault: false,
  });

  // Flow & error state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchCartAndAddresses();
  }, [user, navigate]);

  const fetchCartAndAddresses = async () => {
    try {
      setLoadingCart(true);
      setLoadingAddresses(true);
      setErrorMsg("");

      const [cartRes, addressRes] = await Promise.all([
        getCart(),
        getAddresses(),
      ]);

      setCartData(cartRes);
      setAddresses(addressRes);

      // Select default address initially if present
      if (addressRes && addressRes.length > 0) {
        const defaultAdd = addressRes.find((a) => a.isDefault) || addressRes[0];
        setSelectedAddressId(defaultAdd._id);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load checkout details.");
    } finally {
      setLoadingCart(false);
      setLoadingAddresses(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOpenAddForm = () => {
    setEditingAddressId(null);
    setFormData({
      fullName: user?.name || "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
      label: "Home",
      isDefault: addresses.length === 0,
    });
    setShowForm(true);
  };

  const handleOpenEditForm = (addr) => {
    setEditingAddressId(addr._id);
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      landmark: addr.landmark || "",
      label: addr.label || "Home",
      isDefault: addr.isDefault,
    });
    setShowForm(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      setErrorMsg("");
      if (editingAddressId) {
        await updateAddress(editingAddressId, formData);
        setSuccessMsg("Address updated successfully.");
      } else {
        const newAdd = await createAddress(formData);
        if (newAdd.address) {
          setSelectedAddressId(newAdd.address._id);
        }
        setSuccessMsg("New address added successfully.");
      }
      setShowForm(false);
      const updatedList = await getAddresses();
      setAddresses(updatedList);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to save address.");
    }
  };

  const handleDeleteAddress = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this delivery address?")) return;
    try {
      await deleteAddress(id);
      const updatedList = await getAddresses();
      setAddresses(updatedList);
      if (selectedAddressId === id) {
        setSelectedAddressId(updatedList[0]?._id || null);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete address.");
    }
  };

  const handleSetDefault = async (id, e) => {
    e.stopPropagation();
    try {
      await setDefaultAddress(id);
      const updatedList = await getAddresses();
      setAddresses(updatedList);
      setSelectedAddressId(id);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to set default address.");
    }
  };

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput || couponCodeInput.trim().length === 0) return;

    try {
      setCouponLoading(true);
      setCouponMsg("");
      const res = await applyCoupon(couponCodeInput, totalSubtotal);

      setAppliedCoupon(res);
      setCouponMsg(`✅ Coupon '${res.code}' applied! Saved ₹${res.discountAmount}`);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponMsg(`❌ ${err.response?.data?.message || "Invalid coupon code"}`);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    setCouponMsg("Coupon removed");
  };

  // Process Checkout & Payment Hand-off
  const handleProceedToPayment = async () => {
    const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
    if (!selectedAddress) {
      setErrorMsg("Please select or add a delivery address to proceed.");
      return;
    }

    if (!cartData || !cartData.items || cartData.items.length === 0) {
      setErrorMsg("Your shopping cart is empty.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");

      // 1. Fresh Server Revalidation check
      const freshCart = await getCart();
      if (freshCart.warnings && freshCart.warnings.length > 0) {
        setCartData(freshCart);
        setErrorMsg("Cart inventory was updated due to live availability changes. Please review your cart before continuing.");
        setSubmitting(false);
        return;
      }

      // 2. Prepare Order Items
      const orderItems = freshCart.items.map((item) => ({
        product: item.product._id,
        qty: item.quantity,
      }));

      // 3. Create MongoDB Order with Address Snapshot and optional Coupon
      const order = await createOrder({
        orderItems,
        shippingAddress: selectedAddress,
        couponCode: appliedCoupon?.code || undefined,
      });

      // 4. Create Razorpay Order
      const rzpData = await createRazorpayOrder(order._id);

      // 5. Open Razorpay Gateway Modal
      const options = {
        key: rzpData.key,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "Cravory Bakery Marketplace",
        description: `Order #${order._id.substring(0, 8)}`,
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
            navigate("/order-success", { state: { orderId: order._id } });
          } catch (err) {
            alert(err.response?.data?.message || "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: async function () {
            await reportPaymentFailure(order._id, "Modal closed by customer");
            setErrorMsg("Payment was cancelled. Your order has been saved and can be retried anytime from My Orders.");
            setSubmitting(false);
          },
        },
        prefill: {
          name: selectedAddress.fullName || user?.name || "",
          contact: selectedAddress.phone || "",
          email: user?.email || "",
        },
        theme: {
          color: "#c2185b",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async function (response) {
        await reportPaymentFailure(order._id, response.error?.description || "Payment failed");
        setErrorMsg(`Payment failed: ${response.error?.description || "Transaction declined"}. You can retry payment from My Orders.`);
        setSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCart || loadingAddresses) {
    return (
      <div className="cravory-container" style={{ paddingTop: "28px", paddingBottom: "60px" }}>
        <div style={{ height: "140px", borderRadius: "20px", marginBottom: "24px" }} className="cravory-skeleton" />
        <div style={{ height: "400px", borderRadius: "20px" }} className="cravory-skeleton" />
      </div>
    );
  }

  const groups = cartData?.groups || [];
  const warnings = cartData?.warnings || [];
  const totalSubtotal = cartData?.subtotal || 0;
  const hasItems = cartData?.items && cartData.items.length > 0;

  if (!hasItems) {
    return (
      <div className="cravory-container" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
        <div className="cravory-empty-state">
          <div className="cravory-empty-icon">🛒</div>
          <h2 style={{ color: "var(--cravory-cocoa)", margin: "0 0 8px 0" }}>Your Cart is Empty</h2>
          <p style={{ color: "var(--cravory-text-secondary)", margin: "0 0 20px 0" }}>
            You must add bakery items to your cart before checking out.
          </p>
          <Link to="/products" className="cravory-btn cravory-btn-primary">
            Browse Marketplace Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cravory-container" style={{ paddingTop: "24px", paddingBottom: "60px" }}>
      {/* 1. Header Banner with Stage Progress Indicator */}
      <div style={styles.headerBanner}>
        <div>
          <span className="cravory-badge cravory-badge-primary" style={{ marginBottom: "6px" }}>
            🛍️ Secure Checkout
          </span>
          <h1 style={styles.headerTitle}>Complete Your Cravory Order</h1>
          <p style={styles.headerSubtitle}>
            Freshly baked treats, carefully packed and ready for delivery.
          </p>
        </div>

        {/* Visual Progress Stage Indicator */}
        <div style={styles.progressIndicatorBox}>
          <span style={{ color: "var(--cravory-text-tertiary)" }}>1. Cart</span>
          <span style={{ color: "var(--cravory-text-tertiary)" }}>→</span>
          <span style={{ color: "var(--cravory-primary)", fontWeight: "800" }}>2. Address & Review</span>
          <span style={{ color: "var(--cravory-text-tertiary)" }}>→</span>
          <span style={{ color: "var(--cravory-text-tertiary)" }}>3. Payment</span>
        </div>
      </div>

      {errorMsg && (
        <div className="cravory-error-state" style={{ marginBottom: "20px", textAlign: "center" }}>
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={styles.successAlert}>
          {successMsg}
        </div>
      )}

      {warnings.length > 0 && (
        <div style={styles.warningBox}>
          <h4 style={{ margin: "0 0 6px 0", color: "var(--cravory-warning)", fontSize: "0.95rem" }}>
            ⚠️ Live Inventory Updates:
          </h4>
          <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--cravory-text)", fontSize: "0.9rem" }}>
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={styles.checkoutLayoutGrid}>
        {/* Left Column: Address Selection & Multi-Vendor Order Review */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* STEP 1: DELIVERY ADDRESS */}
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
              <h2 style={styles.sectionHeading}>
                📍 Delivery Address
              </h2>
              <button onClick={handleOpenAddForm} className="cravory-btn cravory-btn-primary" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
                + Add New Address
              </button>
            </div>

            {/* Address Selection List */}
            {addresses.length === 0 ? (
              <div style={styles.emptyAddressBox}>
                No delivery addresses saved yet. Please add an address to continue checkout.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id;
                  return (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      style={{
                        ...styles.addressCard,
                        borderColor: isSelected ? "var(--cravory-primary)" : "var(--cravory-surface-border)",
                        backgroundColor: isSelected ? "var(--cravory-primary-bg)" : "#ffffff",
                        boxShadow: isSelected ? "var(--cravory-shadow-sm)" : "none",
                      }}
                      className="cravory-transition"
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <input
                            type="radio"
                            name="deliveryAddress"
                            checked={isSelected}
                            onChange={() => setSelectedAddressId(addr._id)}
                            style={{ accentColor: "var(--cravory-primary)", cursor: "pointer" }}
                          />
                          <strong style={{ color: "var(--cravory-cocoa)", fontSize: "1rem" }}>{addr.fullName}</strong>
                          <span className="cravory-badge cravory-badge-secondary" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="cravory-badge cravory-badge-primary" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>
                              Default
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          {!addr.isDefault && (
                            <button
                              onClick={(e) => handleSetDefault(addr._id, e)}
                              style={styles.actionLink}
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditForm(addr);
                            }}
                            style={styles.actionLink}
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => handleDeleteAddress(addr._id, e)}
                            style={{ ...styles.actionLink, color: "var(--cravory-danger)" }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div style={styles.addressDetailsText}>
                        <div>{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</div>
                        <div>{addr.landmark ? `Landmark: ${addr.landmark}, ` : ""}{addr.city}, {addr.state} - <b>{addr.pincode}</b></div>
                        <div>Phone: <b>{addr.phone}</b></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Address Form Modal / Inline Form */}
            {showForm && (
              <form onSubmit={handleSaveAddress} style={styles.addressForm}>
                <h3 style={{ margin: "0 0 16px 0", color: "var(--cravory-cocoa)", fontSize: "1.1rem" }}>
                  {editingAddressId ? "Edit Delivery Address" : "Add Delivery Address"}
                </h3>

                <div style={styles.formRow}>
                  <div>
                    <label style={styles.formLabel}>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      required
                      className="cravory-input"
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel}>Phone Number *</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      required
                      className="cravory-input"
                    />
                  </div>
                </div>

                <div style={{ marginTop: "12px" }}>
                  <label style={styles.formLabel}>Address Line 1 *</label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleFormChange}
                    placeholder="House/Flat No., Building Name, Street"
                    required
                    className="cravory-input"
                  />
                </div>

                <div style={{ marginTop: "12px" }}>
                  <label style={styles.formLabel}>Address Line 2</label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleFormChange}
                    placeholder="Area, Colony, Sector (Optional)"
                    className="cravory-input"
                  />
                </div>

                <div style={styles.formRowThree}>
                  <div>
                    <label style={styles.formLabel}>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleFormChange}
                      required
                      className="cravory-input"
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel}>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleFormChange}
                      required
                      className="cravory-input"
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel}>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleFormChange}
                      required
                      className="cravory-input"
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div>
                    <label style={styles.formLabel}>Landmark</label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleFormChange}
                      placeholder="Nearby famous place"
                      className="cravory-input"
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel}>Address Label</label>
                    <select
                      name="label"
                      value={formData.label}
                      onChange={handleFormChange}
                      className="cravory-select"
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ margin: "14px 0" }}>
                  <label style={{ fontSize: "0.85rem", cursor: "pointer", color: "var(--cravory-cocoa)", fontWeight: "500" }}>
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleFormChange}
                      style={{ accentColor: "var(--cravory-primary)" }}
                    />{" "}
                    Set as default delivery address
                  </label>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button type="submit" className="cravory-btn cravory-btn-primary">
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="cravory-btn cravory-btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* STEP 2: REVIEW MULTI-VENDOR CART */}
          <div style={styles.card}>
            <h2 style={{ ...styles.sectionHeading, marginBottom: "16px" }}>
              🧁 Review Order Items
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {groups.map((group) => {
                if (!group.items || group.items.length === 0) return null;
                const isBakery = !group.isLegacy && group.vendor;

                return (
                  <div key={group.groupId} style={styles.reviewGroupCard}>
                    <div style={styles.reviewGroupHeader}>
                      <span style={{ fontWeight: "700", color: "var(--cravory-cocoa)", fontSize: "0.95rem" }}>
                        {isBakery ? `🧁 ${group.name}` : `🍰 ${group.name}`}
                      </span>
                      <span style={{ fontSize: "0.85rem", color: "var(--cravory-text-secondary)" }}>
                        Subtotal: <b>₹{group.subtotal}</b>
                      </span>
                    </div>

                    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      {group.items.map((item) => {
                        const p = item.product;
                        if (!p) return null;

                        return (
                          <div key={item._id} style={styles.reviewItemRow}>
                            <div>
                              <strong style={{ color: "var(--cravory-cocoa)", fontSize: "0.9rem" }}>{p.name}</strong>
                              <div style={{ fontSize: "0.8rem", color: "var(--cravory-text-tertiary)" }}>
                                Qty: {item.quantity} × ₹{item.price}
                              </div>
                            </div>
                            <div style={{ fontWeight: "800", color: "var(--cravory-cocoa)", fontSize: "0.95rem" }}>
                              ₹{item.itemSubtotal}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: STEP 3 ORDER SUMMARY & PAY BUTTON */}
        <div>
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>
              Order Summary
            </h3>

            {/* Coupon Code Section */}
            <div style={{ margin: "16px 0", borderTop: "1px solid var(--cravory-surface-border)", borderBottom: "1px solid var(--cravory-surface-border)", padding: "14px 0" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--cravory-cocoa)", marginBottom: "8px" }}>
                🎟️ Have a promo / coupon code?
              </label>
              {appliedCoupon ? (
                <div style={styles.appliedCouponBox}>
                  <div>
                    <b style={{ color: "var(--cravory-success)", fontSize: "0.9rem" }}>✓ {appliedCoupon.code}</b>
                    <span style={{ fontSize: "0.8rem", color: "var(--cravory-success)", marginLeft: "6px" }}>(-₹{appliedCoupon.discountAmount})</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    style={styles.removeCouponBtn}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. CRAVORY10"
                    className="cravory-input"
                    style={{ flex: 1, padding: "8px 10px", fontSize: "0.85rem", textTransform: "uppercase" }}
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCodeInput}
                    className="cravory-btn cravory-btn-secondary"
                    style={{ fontSize: "0.85rem", padding: "8px 14px" }}
                  >
                    {couponLoading ? "Checking..." : "Apply"}
                  </button>
                </form>
              )}
              {couponMsg && (
                <div style={{ fontSize: "0.8rem", marginTop: "6px", color: couponMsg.includes("✅") ? "var(--cravory-success)" : "var(--cravory-danger)", fontWeight: "600" }}>
                  {couponMsg}
                </div>
              )}
            </div>

            <div style={styles.summaryRow}>
              <span>Items Total ({cartData?.totalItems || 0} units):</span>
              <b>₹{totalSubtotal}</b>
            </div>

            {appliedCoupon && (
              <div style={{ ...styles.summaryRow, color: "var(--cravory-success)" }}>
                <span>Coupon Discount ({appliedCoupon.code}):</span>
                <b>-₹{appliedCoupon.discountAmount}</b>
              </div>
            )}

            <div style={styles.summaryRow}>
              <span>Delivery Fee:</span>
              <b style={{ color: "var(--cravory-success)" }}>FREE</b>
            </div>

            <div style={styles.summaryTotalRow}>
              <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--cravory-cocoa)" }}>Total Amount:</span>
              <span style={styles.summaryTotalAmount}>
                ₹{appliedCoupon ? appliedCoupon.finalTotal : totalSubtotal}
              </span>
            </div>

            <div style={styles.deliveryTargetBox}>
              <div style={{ color: "var(--cravory-text-tertiary)", marginBottom: "4px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: "700" }}>Delivering to:</div>
              {selectedAddressId ? (
                (() => {
                  const sel = addresses.find((a) => a._id === selectedAddressId);
                  return sel ? (
                    <div>
                      <b>{sel.fullName}</b> ({sel.phone})<br />
                      {sel.addressLine1}, {sel.city} - {sel.pincode}
                    </div>
                  ) : (
                    <span style={{ color: "var(--cravory-danger)" }}>Please select an address</span>
                  );
                })()
              ) : (
                <span style={{ color: "var(--cravory-danger)" }}>No address selected</span>
              )}
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={submitting || !selectedAddressId}
              className={`cravory-btn cravory-btn-lg ${selectedAddressId && !submitting ? "cravory-btn-primary" : "cravory-btn-secondary"}`}
              style={{
                width: "100%",
                marginTop: "16px",
                opacity: !selectedAddressId || submitting ? 0.6 : 1,
                cursor: !selectedAddressId || submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Processing Order..." : "Proceed to Secure Payment →"}
            </button>

            <div style={styles.securityText}>
              🔒 Safe & Secure Razorpay Payment
            </div>
          </div>
        </div>
      </div>
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
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
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
  progressIndicatorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.85rem",
    backgroundColor: "#ffffff",
    padding: "8px 16px",
    borderRadius: "9999px",
    border: "1px solid var(--cravory-surface-border)",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  successAlert: {
    backgroundColor: "var(--cravory-success-bg)",
    border: "1px solid var(--cravory-success-border)",
    color: "var(--cravory-success)",
    padding: "12px 18px",
    borderRadius: "var(--cravory-radius-md)",
    marginBottom: "20px",
    fontWeight: "600",
    textAlign: "center",
  },
  warningBox: {
    backgroundColor: "var(--cravory-warning-bg)",
    border: "1px solid var(--cravory-peach)",
    padding: "14px 20px",
    borderRadius: "var(--cravory-radius-md)",
    marginBottom: "20px",
  },
  checkoutLayoutGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 360px",
    gap: "24px",
    alignItems: "flex-start",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "20px",
    border: "1.5px solid var(--cravory-surface-border)",
    boxShadow: "var(--cravory-shadow-xs)",
  },
  sectionHeading: {
    fontSize: "1.2rem",
    fontWeight: "800",
    color: "var(--cravory-cocoa)",
    margin: 0,
  },
  emptyAddressBox: {
    padding: "20px",
    backgroundColor: "var(--cravory-surface-secondary)",
    borderRadius: "14px",
    textAlign: "center",
    color: "var(--cravory-text-secondary)",
    fontSize: "0.9rem",
    border: "1px dashed var(--cravory-surface-border-strong)",
  },
  addressCard: {
    border: "2px solid",
    borderRadius: "14px",
    padding: "16px",
    cursor: "pointer",
  },
  actionLink: {
    backgroundColor: "transparent",
    border: "none",
    color: "var(--cravory-primary)",
    fontSize: "0.8rem",
    fontWeight: "700",
    cursor: "pointer",
    padding: 0,
  },
  addressDetailsText: {
    marginTop: "8px",
    fontSize: "0.875rem",
    color: "var(--cravory-text-secondary)",
    paddingLeft: "26px",
    lineHeight: "1.45",
  },
  addressForm: {
    marginTop: "20px",
    padding: "20px",
    backgroundColor: "var(--cravory-surface-secondary)",
    borderRadius: "16px",
    border: "1px solid var(--cravory-surface-border)",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "12px",
  },
  formRowThree: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "12px",
    marginTop: "12px",
  },
  formLabel: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: "700",
    marginBottom: "4px",
    color: "var(--cravory-cocoa)",
  },
  reviewGroupCard: {
    border: "1px solid var(--cravory-surface-border)",
    borderRadius: "12px",
    overflow: "hidden",
  },
  reviewGroupHeader: {
    backgroundColor: "var(--cravory-surface-secondary)",
    padding: "10px 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid var(--cravory-surface-border)",
  },
  reviewItemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid var(--cravory-surface-border)",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "20px",
    border: "1.5px solid var(--cravory-surface-border)",
    boxShadow: "var(--cravory-shadow-sm)",
    position: "sticky",
    top: "24px",
  },
  summaryTitle: {
    margin: "0 0 16px 0",
    color: "var(--cravory-cocoa)",
    fontFamily: "var(--cravory-font-display)",
    fontSize: "1.25rem",
    fontWeight: "800",
    borderBottom: "1px solid var(--cravory-surface-border)",
    paddingBottom: "12px",
  },
  appliedCouponBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "var(--cravory-success-bg)",
    border: "1px solid var(--cravory-success-border)",
    padding: "8px 12px",
    borderRadius: "8px",
  },
  removeCouponBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "var(--cravory-danger)",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    margin: "10px 0",
    fontSize: "0.925rem",
    color: "var(--cravory-text-secondary)",
  },
  summaryTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    borderTop: "1.5px solid var(--cravory-surface-border)",
    paddingTop: "14px",
    marginTop: "14px",
  },
  summaryTotalAmount: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "var(--cravory-primary)",
    fontFamily: "var(--cravory-font-display)",
  },
  deliveryTargetBox: {
    marginTop: "16px",
    padding: "12px 14px",
    backgroundColor: "var(--cravory-surface-secondary)",
    borderRadius: "12px",
    border: "1px solid var(--cravory-surface-border)",
    fontSize: "0.85rem",
    color: "var(--cravory-text)",
  },
  securityText: {
    marginTop: "16px",
    textAlign: "center",
    fontSize: "0.8rem",
    color: "var(--cravory-text-tertiary)",
    fontWeight: "500",
  },
};

export default Checkout;
