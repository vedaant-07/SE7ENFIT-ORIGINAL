const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { requireAuth, requireOwner } = require("../middleware/auth");
const { getEmailProviderStatus, isEmailConfigured, sendEmail } = require("../lib/mailer");

const router = express.Router();

function getSafeProviderStatus() {
  const status = getEmailProviderStatus();

  return {
    configured: status.configured,
    provider: status.provider,
    missing: status.missing,
    host: status.host,
    port: status.port,
    from: status.from,
  };
}

// Public diagnostic endpoint for the website/provider banner.
// It never returns SMTP_PASS or any secret value.
router.get("/provider-status-public", (req, res) => {
  return res.json({
    success: true,
    data: getSafeProviderStatus(),
  });
});

router.use(requireAuth);
router.use(requireOwner);

const emailSchema = z
  .object({
    to: z.string().email().optional(),
    recipient_email: z.string().email().optional(),
    recipient_name: z.string().trim().max(120).optional(),
    subject: z.string().trim().min(1, "Subject is required").max(200),
    message: z.string().trim().optional(),
    body: z.string().trim().optional(),
    template_name: z.string().trim().max(100).optional(),
  })
  .refine((data) => data.to || data.recipient_email, {
    message: "Recipient email is required",
    path: ["to"],
  })
  .refine((data) => data.message || data.body, {
    message: "Email body is required",
    path: ["message"],
  });

function getOwnerScopedWhere(user) {
  if (user.role === "ADMIN") return {};
  return { ownerId: user.id };
}

router.get("/status", (req, res) => {
  return res.json({
    success: true,
    data: getSafeProviderStatus(),
  });
});

router.get("/", async (req, res) => {
  try {
    const emails = await prisma.emailMessage.findMany({
      where: getOwnerScopedWhere(req.user),
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return res.json({
      success: true,
      providerConfigured: isEmailConfigured(),
      data: emails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load email history",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  let emailRecord;

  try {
    const data = emailSchema.parse(req.body || {});
    const to = data.to || data.recipient_email;
    const message = data.message || data.body;
    const providerStatus = getEmailProviderStatus();

    emailRecord = await prisma.emailMessage.create({
      data: {
        ownerId: req.user.id,
        recipientName: data.recipient_name || null,
        to,
        subject: data.subject,
        message,
        templateName: data.template_name || null,
        status: providerStatus.configured ? "pending" : "queued",
      },
    });

    if (!providerStatus.configured) {
      return res.status(202).json({
        success: true,
        message: `Email queued. SMTP is not configured yet. Missing: ${providerStatus.missing.join(", ")}`,
        providerConfigured: false,
        data: emailRecord,
      });
    }

    try {
      const delivery = await sendEmail({
        to,
        subject: data.subject,
        text: message,
      });

      const sentRecord = await prisma.emailMessage.update({
        where: { id: emailRecord.id },
        data: {
          status: "sent",
          from: getEmailProviderStatus().from,
          providerMessageId: delivery.messageId || null,
          sentAt: new Date(),
          error: null,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Email sent successfully",
        providerConfigured: true,
        data: sentRecord,
      });
    } catch (deliveryError) {
      const failedRecord = await prisma.emailMessage.update({
        where: { id: emailRecord.id },
        data: {
          status: "failed",
          error: deliveryError.message,
        },
      });

      return res.status(502).json({
        success: false,
        message: "Email saved but delivery failed. Check SMTP credentials/settings.",
        error: deliveryError.message,
        data: failedRecord,
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || "Invalid email payload",
        errors: error.issues,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to process email request",
      error: error.message,
    });
  }
});

module.exports = router;
