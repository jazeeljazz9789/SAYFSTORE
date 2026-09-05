import React, { createContext, useContext, useState, useCallback } from "react";
import product from "../data/products";

export interface CartItem {
  id: string;
  name: string;
  price: number; // dynamically calculated total tier price
  qty: number;
}

// We only store the base identifying state natively to avoid desync
interface RawCartState {
  id: string;
  name: string;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (qty: number) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [rawItems, setRawItems] = useState<RawCartState[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const openCheckout = useCallback(() => setIsCheckoutOpen(true), []);
  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);

  const addToCart = useCallback((qty: number) => {
    setRawItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: Math.min(i.qty + qty, 10) } : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          qty: Math.min(qty, 10),
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setRawItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      const validQty = Math.min(qty, 10);
      setRawItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, qty: validQty } : i))
      );
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setRawItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setRawItems([]);
  }, []);

  // Hydrate items perfectly mapped with authoritative tier pricing
  const items: CartItem[] = rawItems.map((raw) => {
    const price = product.basePrice * raw.qty;
    return { ...raw, price };
  });

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        subtotal,
        totalItems,
        isCheckoutOpen,
        openCheckout,
        closeCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
