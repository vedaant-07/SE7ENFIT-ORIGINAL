const express = require("express");
const { z } = require("zod");
const { createClient } = require("@supabase/supabase-js");

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

let supabase;

function getSupabaseClient() {
  if (supabase) return supabase;

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

  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabase;
}

router.post("/", async (req, res, next) => {
  try {
    const payload = supportTicketSchema.parse(req.body);
    const client = getSupabaseClient();

    const { data, error } = await client
      .from("support_tickets")
      .insert({
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
      })
      .select("id, created_at")
      .single();

    if (error) {
      throw Object.assign(new Error(error.message), { status: 502 });
    }

    res.status(201).json({
      success: true,
      message: "Support request submitted",
      ticket: data,
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
