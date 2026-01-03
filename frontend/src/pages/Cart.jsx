import { useEffect, useState } from "react";
import {
  getCart,
  removeFromCart,
  updateQty,
} from "../utils/cartUtils";
import axios from "axios";


const Cart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const updateQuantity = (id, qty) => {
    if (qty < 1) return;
    updateQty(id, qty);
    setCart(getCart());
  };

  const removeItem = (id) => {
    removeFromCart(id);
    setCart(getCart());
  };
  const placeOrder = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    return;
  }

  try {
    await axios.post(
      "http://127.0.0.1:4000/api/orders",
      {
        orderItems: cart,
        totalPrice,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    localStorage.removeItem("cart");
    alert("Order placed successfully ✅");
    window.location.href = "/";
  } catch (error) {
    alert("Order failed");
  }
};


  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>Cart</h2>

      {cart.length === 0 && <p>Your cart is empty</p>}

      {cart.map((item) => (
        <div
          key={item._id}
          style={{
            borderBottom: "1px solid #ccc",
            marginBottom: "10px",
          }}
        >
          <h4>{item.name}</h4>
          <p>₹{item.price}</p>

          <button onClick={() => updateQuantity(item._id, item.qty - 1)}>
            -
          </button>
          <span style={{ margin: "0 10px" }}>{item.qty}</span>
          <button onClick={() => updateQuantity(item._id, item.qty + 1)}>
            +
          </button>

          <button
            style={{ marginLeft: "10px", color: "red" }}
            onClick={() => removeItem(item._id)}
          >
            Remove
          </button>
        </div>
      ))}

      <h3>Total: ₹{totalPrice}</h3>
    </div>
  );
};

export default Cart;
