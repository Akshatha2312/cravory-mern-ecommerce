import { useEffect } from "react";
<<<<<<< HEAD
import { useNavigate, useLocation, Link } from "react-router-dom";

function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const orderId = location.state?.orderId;
=======
import { useNavigate } from "react-router-dom";

function OrderSuccess() {
  const navigate = useNavigate();
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/my-orders");
<<<<<<< HEAD
    }, 5000);
=======
    }, 3000);
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
<<<<<<< HEAD
    <div className="cravory-container" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
      <div className="cravory-empty-state" style={{ maxWidth: "600px", margin: "0 auto", padding: "44px 32px" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🎉</div>
        
        <span className="cravory-badge cravory-badge-primary" style={{ marginBottom: "10px" }}>
          ✓ Payment Verified
        </span>

        <h1 style={{ fontFamily: "var(--cravory-font-display)", fontSize: "2rem", color: "var(--cravory-cocoa)", margin: "0 0 10px 0" }}>
          Order Placed Successfully!
        </h1>

        <p style={{ color: "var(--cravory-text-secondary)", margin: "0 0 16px 0", lineHeight: "1.55" }}>
          Your artisan bakery order has been confirmed and sent directly to the baker's kitchen.
        </p>

        {orderId && (
          <div style={{ backgroundColor: "var(--cravory-surface-secondary)", border: "1px solid var(--cravory-surface-border)", borderRadius: "12px", padding: "10px 16px", marginBottom: "24px", fontFamily: "monospace", color: "var(--cravory-cocoa)", fontSize: "0.9rem" }}>
            Order ID: #{orderId}
          </div>
        )}

        <p style={{ fontSize: "0.85rem", color: "var(--cravory-text-tertiary)", marginBottom: "24px" }}>
          Redirecting to My Orders in 5 seconds...
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link to="/my-orders" className="cravory-btn cravory-btn-primary">
            View My Orders →
          </Link>
          <Link to="/products" className="cravory-btn cravory-btn-secondary">
            Explore Marketplace
          </Link>
        </div>
      </div>
=======
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>🎉 Payment Successful!</h1>
      <p>Your order has been placed successfully.</p>
      <p>Redirecting to My Orders...</p>
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
    </div>
  );
}

export default OrderSuccess;
