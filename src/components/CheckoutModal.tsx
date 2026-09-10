import React, { useState, useEffect, useRef, useCallback } from "react";
import { useCart } from "../context/CartContext";
import { api } from "../api/orders";
import "./CheckoutModal.css";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalState = "form" | "submitting" | "success" | "error";

const generateIdempotencyKey = (): string => {
  if (typeof window !== "undefined" && window.crypto) {
    if (typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    if (typeof window.crypto.getRandomValues === "function") {
      const array = new Uint32Array(4);
      window.crypto.getRandomValues(array);
      return Array.from(array)
        .map((n) => n.toString(16))
        .join("-");
    }
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
};
const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [modalState, setModalState] = useState<ModalState>("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [successOrderId, setSuccessOrderId] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [isPopupBlocked, setIsPopupBlocked] = useState(false);

  const { items, subtotal, clearCart } = useCart();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Lock body scroll & manage focus when modal opens
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      // Focus the first input after animation
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = "unset";
      // Return focus to the element that triggered the modal
      triggerRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const idempotencyKeyRef = useRef("");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setModalState("form");
      setErrorMessage("");
      setSuccessOrderId("");
      setWhatsappUrl("");
      setIsPopupBlocked(false);
      idempotencyKeyRef.current = generateIdempotencyKey();
    }
  }, [isOpen]);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalState !== "submitting") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, modalState, onClose]);

  const handleClose = useCallback(() => {
    if (modalState === "submitting") return; // Don't close during submission
    onClose();
  }, [modalState, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend validation (UX only — backend validates authoritatively)
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    if (trimmedName.length < 2) {
      setErrorMessage("Please enter your full name (at least 2 characters).");
      setModalState("error");
      return;
    }

    const phoneDigits = trimmedPhone.replace(/[^0-9]/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      setErrorMessage("Please enter a valid phone number.");
      setModalState("error");
      return;
    }

    if (trimmedAddress.length < 5) {
      setErrorMessage("Please enter your complete delivery address.");
      setModalState("error");
      return;
    }

    if (items.length === 0) {
      setErrorMessage("Your cart is empty.");
      setModalState("error");
      return;
    }

    // Prevent duplicate submission
    setModalState("submitting");
    setErrorMessage("");

    try {
      const response = await api.createOrder({
        name: trimmedName,
        phone: trimmedPhone,
        address: trimmedAddress,
        paymentMethod: "cod",
        items: items.map((item) => ({ id: item.id, qty: item.qty })),
      }, idempotencyKeyRef.current);

      // Construct WhatsApp URL before clearing cart and form
      const MANAGER_WHATSAPP_NUMBER = "919944282594";
      const formattedPhone = trimmedPhone.startsWith("+") ? trimmedPhone : `+91${trimmedPhone.replace(/^0+/, "")}`;
      
      const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
      const quantityText = totalQty === 1 ? "1 bottle" : `${totalQty} bottles`;
      const productName = items.length > 0 ? items[0].name : "SAYF Premium Beard Oil";
      const formattedTotal = response.order.totalAmount.toLocaleString("en-IN");

      const message = `Thank you for choosing SAYF

Hi SAYF Store, I want to buy ${quantityText} of ${productName} for ₹${formattedTotal}. Please process my order.

🧾 CUSTOMER DETAILS:
Order ID: ${response.order.orderId}
Name: ${trimmedName}
Phone: ${formattedPhone}
Address: ${trimmedAddress}`;

      const encodedMessage = encodeURIComponent(message);
      const url = `https://wa.me/${MANAGER_WHATSAPP_NUMBER}?text=${encodedMessage}`;
      setWhatsappUrl(url);

      // Directly redirect the current tab to WhatsApp to avoid popup blockers
      window.location.href = url;
      setIsPopupBlocked(false);

      // Success — clear cart ONLY after confirmed backend success
      setSuccessOrderId(response.order.orderId);
      setModalState("success");
      clearCart();
      setName("");
      setPhone("");
      setAddress("");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to place your order right now. Please try again.";
      setErrorMessage(message);
      setModalState("error");
      // Cart is NOT cleared on failure
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="checkout-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className={`checkout-modal ${modalState === "success" ? "success-theme" : ""}`}
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
      >
        <div className="checkout-content">
          {/* ── SUCCESS STATE ── */}
          {modalState === "success" ? (
            <div className="checkout-success-full">
              <button className="success-back-btn" onClick={onClose} aria-label="Go back">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              </button>

              <div className="success-content-wrapper">
                <div className="success-icon-anim">
                  <svg viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="25" fill="#00A000" />
                    <path className="success-check" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                  </svg>
                </div>

                <h2 className="success-heading">ORDER CONFIRMED</h2>
                <p className="success-subheading">Thank you for your order</p>

                {successOrderId && (
                  <div className="success-order-id-subtle">
                    Order ID<br />
                    #{successOrderId}
                  </div>
                )}
              </div>

              <div className="success-actions">
                {isPopupBlocked && (
                  <button
                    type="button"
                    className="btn-success-whatsapp"
                    onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
                  >
                    SEND ORDER TO WHATSAPP
                  </button>
                )}
                <button
                  className="btn-success-continue"
                  onClick={onClose}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="checkout-title">Complete Order</h2>
              <p className="checkout-subtitle">SAYF PREMIUM BEARD OIL</p>

              {/* ── ERROR BANNER ── */}
              {modalState === "error" && errorMessage && (
                <div className="checkout-error">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="checkout-form">
                <div className="form-field">
                  <label htmlFor="checkout-name">FULL NAME</label>
                  <input
                    id="checkout-name"
                    ref={firstInputRef}
                    type="text"
                    required
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={modalState === "submitting"}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="checkout-phone">PHONE NUMBER</label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    maxLength={20}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={modalState === "submitting"}
                  />
                </div>

                <div className="form-field address-field">
                  <label htmlFor="checkout-address">DELIVERY ADDRESS</label>
                  <textarea
                    id="checkout-address"
                    required
                    maxLength={500}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={modalState === "submitting"}
                  />
                </div>

                <div className="order-summary">
                  {items.map((item, index) => (
                    <div className="summary-row" key={index}>
                      <span className="summary-left">
                        {item.name} &times; {item.qty}
                      </span>
                      <span className="summary-right">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                  <div className="summary-row">
                    <span className="summary-left">Express Shipping</span>
                    <span className="summary-right">FREE</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row total-row">
                    <span className="summary-total-label">Total</span>
                    <span className="summary-total-value">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="checkout-buttons">
                  <button
                    type="submit"
                    className="btn-confirm"
                    disabled={modalState === "submitting"}
                  >
                    {modalState === "submitting" ? (
                      "PLACING ORDER..."
                    ) : (
                      <>
                        CONFIRM & PLACE
                        <br />
                        ORDER
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={handleClose}
                    disabled={modalState === "submitting"}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
