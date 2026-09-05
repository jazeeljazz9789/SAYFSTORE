import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import product from "../data/products";

const CheckIcon: React.FC = () => (
  <svg viewBox="0 0 10 10" aria-hidden="true">
    <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TRUST = [
  "Secure Checkout",
  "Fast Delivery",
  "Premium Packaging",
  "Easy Returns",
];

const ProductSection: React.FC = () => {
  const { addToCart, openCart } = useCart();
  const [selectedQtyIdx, setSelectedQtyIdx] = useState(0);
  const selected = product.quantityOptions[selectedQtyIdx];

  const handleAddToCart = () => {
    addToCart(selected.qty);
  };

  const handleBuyNow = () => {
    addToCart(selected.qty);
    setTimeout(openCart, 80);
  };

  return (
    <section className="product-section py-5 px-3 px-md-5" id="product" aria-labelledby="product-heading">
      <div className="container-lg product-inner">
        <div className="row gy-5 gx-lg-5 align-items-center">
          {/* Product Image */}
          <div className="col-12 col-lg-6 product-image-wrap reveal">
            <img
              src="/images/sayf.prd.jpeg"
              alt="SAYF Premium Beard Oil"
              className="product-image img-fluid d-block mx-auto"
              style={{ borderRadius: "8px", objectFit: "cover" }}
              width="500"
              height="500"
              loading="lazy"
            />
          </div>

          {/* Product Info */}
          <div className="col-12 col-lg-6 product-info">
            <p className="product-brand-label">SAYF Store.In</p>

            <h2 className="product-name" id="product-heading">
              SAYF<br />Premium Beard Oil
            </h2>

            <p className="product-desc">{product.description}</p>

            {/* Price */}
            <div className="product-price-display d-flex align-items-baseline gap-2 mb-4">
              <span className="product-currency">₹</span>
              <span className="product-price-num">{selected.price.toLocaleString("en-IN")}</span>
            </div>

            {/* Quantity Options */}
            <div className="quantity-section mb-4">
              <div className="quantity-label">Choose Quantity</div>
              <div className="quantity-options d-flex flex-wrap gap-2">
                {product.quantityOptions.map((opt, i) => (
                  <button
                    key={opt.qty}
                    className={`qty-option flex-fill${selectedQtyIdx === i ? " active" : ""}`}
                    onClick={() => setSelectedQtyIdx(i)}
                    id={`qty-option-${opt.qty}`}
                    aria-pressed={selectedQtyIdx === i}
                  >
                    <span className="qty-option-label d-block">{opt.label}</span>
                    <span className="qty-option-price d-block mt-1">₹{opt.price.toLocaleString("en-IN")}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="product-actions d-flex flex-column flex-sm-row gap-3 mb-4">
              <button className="btn-outline flex-fill" onClick={handleAddToCart} id="add-to-cart-btn">
                Add to Cart
              </button>
              <button className="btn-primary flex-fill" onClick={handleBuyNow} id="buy-now-btn">
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="trust-badges row g-3 row-cols-1 row-cols-sm-2">
              {TRUST.map((t) => (
                <div className="col d-flex align-items-center gap-2 trust-badge" key={t}>
                  <div className="trust-badge-icon flex-shrink-0 d-flex align-items-center justify-content-center">
                    <CheckIcon />
                  </div>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;

