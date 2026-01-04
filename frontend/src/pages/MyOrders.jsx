import { useEffect, useState } from "react";
import { getMyOrders } from "../api/orderApi";

function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      alert("Failed to load orders");
    }
  };

  if (orders.length === 0) {
    return <h3>No orders found</h3>;
  }

  return (
    <div>
      <h2>My Orders</h2>

      {orders.map((order) => (
        <div
          key={order._id}
          style={{
            border: "1px solid #ccc",
            marginBottom: "15px",
            padding: "10px",
          }}
        >
          <p><b>Order ID:</b> {order._id}</p>
          <p><b>Total:</b> ₹{order.totalPrice}</p>
          <p><b>Paid:</b> {order.isPaid ? "Yes ✅" : "No ❌"}</p>
          <p><b>Delivered:</b> {order.isDelivered ? "Yes 🚚" : "Pending ⏳"}</p>
          <p>
            <b>Date:</b>{" "}
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}

export default MyOrders;
