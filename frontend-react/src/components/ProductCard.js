import React from "react";
import "./ProductCard.css";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "").trim();

function ProductCard({ product, onAddToCart }) {
  const getImageUrl = (image) => {
    if (!image) {
      return "https://via.placeholder.com/400x300?text=No+Image";
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("/uploads")) {
      return BACKEND_URL ? `${BACKEND_URL}${image}` : image;
    }

    return BACKEND_URL ? `${BACKEND_URL}/uploads/${image}` : `/uploads/${image}`;
  };

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
          }}
        />
      </div>

      <div className="product-content">
        <h3 className="product-name">{product.name}</h3>

        <div className="product-price">
          {Number(product.price || 0).toLocaleString("vi-VN")}đ
        </div>

        <p className="product-desc">
          {product.description || "Chưa có mô tả"}
        </p>

        <button className="add-cart-btn" onClick={() => onAddToCart(product)}>
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}

export default ProductCard;