import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function OrderSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/my-orders");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>🎉 Payment Successful!</h1>
      <p>Your order has been placed successfully.</p>
      <p>Redirecting to My Orders...</p>
    </div>
  );
}

export default OrderSuccess;
