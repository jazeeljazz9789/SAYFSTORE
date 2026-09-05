import React from "react";
import { useCart } from "../context/CartContext";

interface CartDrawerProps { }

const CartDrawer: React.FC<CartDrawerProps> = () => {
  const { items, isOpen, closeCart, updateQty, subtotal, openCheckout } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-overlay${isOpen ? " open" : ""}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`cart-drawer${isOpen ? " open" : ""}`}
        aria-label="Shopping cart"
        aria-modal="true"
        role="dialog"
        data-lenis-prevent
      >
        {/* Header */}
        <div className="cart-header">
          <span className="cart-title">Your Cart</span>
          <button
            className="btn-primary cart-checkout-btn"
            onClick={() => {
              openCheckout();
              closeCart();
            }}
            id="cart-checkout-btn"
          >
            Checkout
          </button>
        </div>

        {/* Body */}
        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon" aria-hidden="true">◈</div>
              <p className="cart-empty-text">Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div className="cart-item" key={item.id}>
                {/* Product image */}
                <img
                  src="/images/desktop/ezgif-frame-001.jpg"
                  alt="SAYF Premium Beard Oil"
                  className="cart-item-img"
                />

                <div className="cart-item-info">
                  <div className="cart-item-name">
                    {item.name}
                    {item.qty > 1 && (
                      <span style={{ fontSize: "0.85em", color: "var(--silver-dim)", marginLeft: "8px" }}>
                        ({item.qty} Bottles)
                      </span>
                    )}
                  </div>
                  <div className="cart-item-price">₹{item.price.toLocaleString("en-IN")}</div>

                  <div className="cart-qty-control" role="group" aria-label="Quantity">
                    <button
                      className="cart-qty-btn"
                      onClick={() => item.qty > 1 && updateQty(item.id, item.qty - 1)}
                      aria-label="Decrease quantity"
                      id="cart-qty-decrease"
                      disabled={item.qty <= 1}
                      style={{ opacity: item.qty <= 1 ? 0.3 : 1, cursor: item.qty <= 1 ? 'not-allowed' : 'pointer' }}
                    >
                      −
                    </button>
                    <div className="cart-qty-display" aria-live="polite">{item.qty}</div>
                    <button
                      className="cart-qty-btn"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      aria-label="Increase quantity"
                      id="cart-qty-increase"
                      disabled={item.qty >= 10}
                      style={{ opacity: item.qty >= 10 ? 0.3 : 1, cursor: item.qty >= 10 ? 'not-allowed' : 'pointer' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span className="cart-subtotal-label">Subtotal</span>
              <span className="cart-subtotal-amount" aria-live="polite">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <button
              className="btn-primary cart-checkout-btn"
              onClick={() => {
                openCheckout();
                closeCart();
              }}
              id="cart-checkout-btn"
            >
              Checkout
            </button>
          </div>
        )}

      </aside>
    </>
  );
};

export default CartDrawer;
