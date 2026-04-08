import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "").trim();

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🔥 Sản phẩm nổi bật</h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        {products.map((p) => (
          <ProductCard
            key={p._id}
            product={p}
            onAddToCart={() => {}}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;