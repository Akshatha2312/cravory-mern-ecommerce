import { useEffect, useState } from "react";
import { getProducts } from "../api/productApi";

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data.products || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Products</h2>
      {products.map((p) => (
        <div key={p._id}>{p.name}</div>
      ))}
    </div>
  );
}

export default Home;
