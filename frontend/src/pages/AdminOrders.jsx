import { useEffect, useState } from "react";
import axios from "../api/axios";

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data } = await axios.get("/orders");
    setOrders(data);
  };

  const markDelivered = async (id) => {
    await axios.put(`/orders/${id}/deliver`);
    fetchOrders();
  };

  return (
    <div>
      <h2>Admin Orders</h2>

      {orders.map((order) => (
        <div key={order._id} style={{ border: "1px solid #ccc", margin: 10 }}>
          <p><b>User:</b> {order.user.name}</p>
          <p><b>Total:</b> ₹{order.totalPrice}</p>
          <p><b>Paid:</b> {order.isPaid ? "Yes" : "No"}</p>
          <p><b>Delivered:</b> {order.isDelivered ? "Yes" : "No"}</p>

          {!order.isDelivered && (
            <button onClick={() => markDelivered(order._id)}>
              Mark Delivered
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default AdminOrders;
