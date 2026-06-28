const express = require("express");
const { z } = require("zod");

const router = express.Router();

const supportTicketSchema = z.object({
  source: z.enum(["app", "website", "admin"]).default("website"),
  userId: z.string().uuid().optional().nullable(),
  userName: z.string().trim().max(160).optional().nullable(),
  userEmail: z.string().trim().email().optional().nullable(),
  userPhone: z.string().trim().max(32).optional().nullable(),
  subject: z.string().trim().min(3).max(180),
  message: z.string().trim().min(5).max(5000),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
});

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw Object.assign(new Error("Supabase support-ticket environment variables are missing"), {
      status: 500,
    });
  }

  return {
    url: supabaseUrl.replace(/\/$/, ""),
    key: supabaseKey,
  };
}

async function createSupportTicket(payload) {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/support_tickets?select=id,created_at`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      source: payload.source,
      user_id: payload.userId || null,
      user_name: payload.userName || null,
      user_email: payload.userEmail || null,
      user_phone: payload.userPhone || null,
      subject: payload.subject,
      message: payload.message,
      priority: payload.priority,
      status: "new",
      is_read: false,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || data?.error || "Could not create support ticket";
    throw Object.assign(new Error(message), { status: 502, details: data });
  }

  return Array.isArray(data) ? data[0] : data;
}

router.post("/", async (req, res, next) => {
  try {
    const payload = supportTicketSchema.parse(req.body);
    const ticket = await createSupportTicket(payload);

    res.status(201).json({
      success: true,
      message: "Support request submitted",
      ticket,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid support request",
        errors: error.issues,
      });
    }

    next(error);
  }
});

module.exports = router;
