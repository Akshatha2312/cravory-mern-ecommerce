import { useEffect, useState } from "react";
import axios from "axios";
import { addToCart } from "../utils/cartUtils";

const Home = () => {
  const [products, setProducts] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    const res = await axios.get("http://127.0.0.1:4000/api/products");
    setProducts(res.data.products);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    await axios.delete(`http://127.0.0.1:4000/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchProducts();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Products</h2>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {products.map((p) => (
          <div
            key={p._id}
            style={{ border: "1px solid #ccc", padding: "15px", width: "220px" }}
          >
            <h4>{p.name}</h4>
            <p>₹{p.price}</p>
            <p>{p.category}</p>

            {/* USER ACTION */}
            <button onClick={() => addToCart(p)}>Add to Cart</button>

            {/* ADMIN ACTION */}
            {user?.role === "admin" && (
              <button
                style={{ marginTop: "5px", background: "red", color: "#fff" }}
                onClick={() => deleteProduct(p._id)}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
