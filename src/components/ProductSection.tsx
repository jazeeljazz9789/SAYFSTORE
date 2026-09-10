import React, { useState, useEffect, useCallback } from "react";
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

const productImages = [
  "/images/sayf.prd.jpeg",
  "/images/sayf.prd2.png"
];

const ProductSection: React.FC = () => {
  const { addToCart, openCart } = useCart();
  const [selectedQtyIdx, setSelectedQtyIdx] = useState(0);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const selected = product.quantityOptions[selectedQtyIdx];

  const nextImage = useCallback(() => setCurrentImageIdx((prev) => (prev + 1) % productImages.length), []);
  const prevImage = useCallback(() => setCurrentImageIdx((prev) => (prev - 1 + productImages.length) % productImages.length), []);

  useEffect(() => {
    const timer = setInterval(() => {
      nextImage();
    }, 4000);
    return () => clearInterval(timer);
  }, [nextImage, currentImageIdx]);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50) {
      nextImage(); // Swipe left -> next image
    } else if (diff < -50) {
      prevImage(); // Swipe right -> previous image
    }
    setTouchStartX(null);
  };

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
          <div className="col-12 col-lg-6 product-image-wrap reveal text-center">
            <div 
              className="position-relative d-inline-block" 

              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {productImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`SAYF Premium Beard Oil - Image ${idx + 1}`}
                  className="product-image img-fluid d-block mx-auto"
                  style={{ 
                    borderRadius: "8px", 
                    objectFit: "cover",
                    position: idx === 0 ? "relative" : "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: currentImageIdx === idx ? 1 : 0,
                    transition: "opacity 0.8s ease-in-out",
                    zIndex: currentImageIdx === idx ? 1 : 0
                  }}
                  width="500"
                  height="500"
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              ))}

              {/* Navigation arrows removed as requested */}
              
              {/* Indicators */}
              <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4 d-flex gap-2" style={{ zIndex: 2 }}>
                {productImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIdx(idx)}
                    className="border-0 p-0 bg-light"
                    style={{ 
                      width: '24px', 
                      height: '3px', 
                      borderRadius: '2px', 
                      opacity: currentImageIdx === idx ? 1 : 0.3, 
                      transition: 'opacity 0.3s ease-in-out' 
                    }}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
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

