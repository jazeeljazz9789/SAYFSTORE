import { Router, Request, Response } from "express";


const router = Router();

// POST /api/contact - Submit inquiry
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message } = req.body;

    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim() : "";
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    const cleanMessage = typeof message === "string" ? message.trim() : "";

    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({ error: "Please provide a valid name (2-100 characters)." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    const phoneRegex = /^[0-9+\s\-()]{7,15}$/;
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ error: "Please provide a valid phone number." });
    }

    if (!cleanMessage || cleanMessage.length < 10 || cleanMessage.length > 2000) {
      return res.status(400).json({ error: "Message content is required (10-2000 characters)." });
    }

    // In stateless mode, we do not save the inquiry to a database.
    // We just simulate success so the frontend behavior remains unaffected.
    console.log(`[Contact Inquiry] Received message from ${cleanName} (${cleanEmail})`);

    return res.status(201).json({
      success: true,
      message: "Thank you for reaching out to SAYF. We will get back to you shortly.",
    });
  } catch (error: any) {
    console.error("Error submitting contact inquiry:", error);
    return res.status(500).json({ error: "Failed to submit inquiry" });
  }
});

export default router;
