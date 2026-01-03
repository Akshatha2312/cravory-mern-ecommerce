import { useState } from "react";
import axios from "axios";

const AdminAddProduct = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://127.0.0.1:4000/api/products/add-product",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Product added successfully ✅");

      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add product");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "30px auto" }}>
      <h2>Add Product (Admin)</h2>

      <form onSubmit={submitHandler}>
        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
        />

        <button type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default AdminAddProduct;
