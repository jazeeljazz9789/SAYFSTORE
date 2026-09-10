import { Router, Request, Response } from "express";
import crypto from "crypto";

export interface IOrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface IOrder {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: "cod" | "upi";
  totalAmount: number;
  items: IOrderItem[];
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  idempotencyKey?: string;
  createdAt: Date;
}

// Generate cryptographically secure order ID (Stateless)
export function generateOrderId(): string {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}${mm}${dd}`;
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(crypto.randomInt(0, chars.length));
  }
  
  return `SAYF-${dateStr}-${randomStr}`;
}

const router = Router();

/**
 * Strips sensitive data and returns only the fields necessary for the frontend.
 */
function toSafeOrderDTO(order: IOrder) {
  return {
    orderId: order.orderId,
    status: order.status,
    totalAmount: order.totalAmount,
    items: order.items,
    createdAt: order.createdAt,
    customerName: order.customerName,
  };
}

// Server-authoritative product price catalog
// Server MUST calculate real prices — never trust frontend client price
const SERVER_CATALOG: Record<
  string,
  {
    name: string;
    basePrice: number;
  }
> = {
  "sayf-beard-oil": {
    name: "SAYF Premium Beard Oil",
    basePrice: 650,
  },
};


/**
 * Calculates server-authoritative item price and total amount
 */
function calculateAuthoritativePrice(
  productId: string,
  requestedQty: number
): { name: string; unitPrice: number; itemTotal: number } | null {
  const catalogItem = SERVER_CATALOG[productId];
  if (!catalogItem) return null;

  const itemTotal = catalogItem.basePrice * requestedQty;
  const unitPrice = catalogItem.basePrice;

  return {
    name: catalogItem.name,
    unitPrice,
    itemTotal,
  };
}

// POST /api/orders - Create new customer order securely
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, phone, address, paymentMethod, items } = req.body;

    // 1. Validate Customer Name
    const cleanName = typeof name === "string" ? name.trim() : "";
    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        error: "Invalid customer name. Please provide your full name (2-100 characters).",
      });
    }

    // 2. Validate Customer Phone
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    const phoneRegex = /^[0-9+\s\-()]{7,15}$/;
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        error: "Invalid phone number. Please enter a valid contact phone number.",
      });
    }

    // 3. Validate Delivery Address
    const cleanAddress = typeof address === "string" ? address.trim() : "";
    if (!cleanAddress || cleanAddress.length < 5 || cleanAddress.length > 500) {
      return res.status(400).json({
        error: "Invalid delivery address. Please enter a complete street address.",
      });
    }

    // 4. Validate Payment Method
    if (paymentMethod !== "upi" && paymentMethod !== "cod") {
      return res.status(400).json({
        error: "Invalid payment method. Please select either Cash on Delivery or UPI.",
      });
    }
    const validPayment = paymentMethod;

    // 5. Validate Cart Items Structure
    if (!items || !Array.isArray(items) || items.length === 0 || items.length > 20) {
      return res.status(400).json({
        error: "Order must contain at least one valid product item.",
      });
    }

    // 6. Recalculate Prices Server-Side (Crucial Security Check)
    const verifiedItems: IOrderItem[] = [];
    const seenProductIds = new Set<string>();
    let serverTotalAmount = 0;

    for (const rawItem of items) {
      const productId = typeof rawItem.id === "string" && rawItem.id ? rawItem.id : "";
      
      if (seenProductIds.has(productId)) {
        return res.status(400).json({ error: "Duplicate product items are not allowed." });
      }
      seenProductIds.add(productId);

      const qty = Number(rawItem.qty);

      if (!Number.isInteger(qty) || qty <= 0 || qty > 10) {
        return res.status(400).json({ error: "Invalid product quantity." });
      }

      const pricing = calculateAuthoritativePrice(productId, qty);
      if (!pricing) {
        return res.status(400).json({ error: "Invalid product ID provided." });
      }

      verifiedItems.push({
        id: productId,
        name: pricing.name,
        price: pricing.unitPrice,
        qty: qty,
      });

      serverTotalAmount += pricing.itemTotal;
    }

    // 7. Check for Idempotency / Duplicate Orders
    const rawIdempotencyKey = req.headers["idempotency-key"];
    const idempotencyKey = typeof rawIdempotencyKey === "string" ? rawIdempotencyKey.trim() : undefined;

    if (idempotencyKey && (idempotencyKey.length > 128 || !/^[A-Za-z0-9._:-]+$/.test(idempotencyKey))) {
      return res.status(400).json({ error: "Invalid idempotency key." });
    }

    if (idempotencyKey) {
      // Idempotency usually requires DB to check previous requests, but in stateless mode, we skip this check.
      // We will proceed normally.
    }

    // 8. Generate Unique Order ID (Stateless mode, no DB save)
    const orderId = generateOrderId();
    const newOrder: IOrder = {
      orderId,
      customerName: cleanName,
      phone: cleanPhone,
      address: cleanAddress,
      paymentMethod: validPayment,
      totalAmount: serverTotalAmount,
      items: verifiedItems,
      status: "pending",
      idempotencyKey,
      createdAt: new Date(),
    };

    console.log(`📦 [Order Created - Stateless] ID: ${newOrder.orderId} | Total: ₹${newOrder.totalAmount}`);

    // 10. Return Success Response Immediately
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: toSafeOrderDTO(newOrder),
    });
  } catch (error: any) {
    console.error("❌ Error placing order:", error.message || "Unknown error");
    return res.status(500).json({
      error: "Unable to process order at this time. Please try again or contact support.",
    });
  }
});

// GET /api/orders/search?q=<exact-order-id>&phone=<phone>
// Public order tracking requires BOTH the exact order ID and matching phone number.
router.get("/search", async (_req: Request, res: Response) => {
  return res.status(501).json({ error: "Order tracking is disabled in this mode." });
});

// GET /api/orders/:id?phone=... - Get order by orderId securely
router.get("/:id", async (_req: Request, res: Response) => {
  return res.status(501).json({ error: "Order tracking is disabled in this mode." });
});

export default router;
