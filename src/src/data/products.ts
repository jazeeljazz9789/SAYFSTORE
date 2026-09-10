// ============================================================
// SAYF — Product Data
// Edit price and quantity options here. Do NOT hardcode prices
// in components — always import from this file.
// ============================================================

export const TOTAL_FRAMES = 147;

export const product = {
  id: "sayf-beard-oil",
  name: "SAYF Premium Beard Oil",
  shortName: "Beard Oil",
  brand: "SAYF",
  tagline: "Craft Your Presence.",
  description:
    "SAYF Beard Oil is a premium blend of natural oils that nourishes your beard, hydrates the skin beneath the beard, reduces itchiness, and promotes healthy beard growth. Lightweight, non-greasy, and fast-absorbing.",
  basePrice: 650, // ← Edit price here (INR)
  volume: "30 mL e / 1.01 fl oz",
  quantityOptions: [
    { qty: 1, label: "1 Bottle", price: 650 },
    { qty: 2, label: "2 Bottles", price: 1300 },
    { qty: 3, label: "3 Bottles", price: 1950 },
  ],
};

export type QuantityOption = (typeof product.quantityOptions)[number];
export default product;
