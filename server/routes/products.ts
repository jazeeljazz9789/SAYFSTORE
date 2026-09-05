import { Router, Request, Response } from "express";

const router = Router();

const productData = {
  id: "sayf-beard-oil",
  name: "SAYF Premium Beard Oil",
  shortName: "Beard Oil",
  brand: "SAYF",
  tagline: "Craft Your Presence.",
  description:
    "SAYF Beard Oil is a premium blend of natural oils that nourishes your beard, hydrates the skin beneath, reduces itchiness, and promotes healthy beard growth. Lightweight, non-greasy, and fast-absorbing.",
  basePrice: 650,
  currency: "INR",
  currencySymbol: "₹",
  volume: "30 mL e / 1.01 fl oz",
  inStock: true,
  quantityOptions: [
    { qty: 1, label: "1 Bottle", price: 650 },
    { qty: 2, label: "2 Bottles", price: 1300 },
    { qty: 3, label: "3 Bottles", price: 1950 },
  ],
  ingredients: [
    { name: "Argan Oil", role: "Nourishment & Shine" },
    { name: "Jojoba Oil", role: "Hydration & Follicle Health" },
    { name: "Cedarwood & Oud", role: "Subtle Masculine Scent" },
    { name: "Vitamin E", role: "Antioxidant Protection" },
  ],
};

// GET /api/products - Returns product catalog
router.get("/", (_req: Request, res: Response) => {
  return res.json({
    success: true,
    product: productData,
  });
});

export default router;
