const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const tokenSchema = z.object({
  token: z.string().optional(),
  expoPushToken: z.string().optional(),
  platform: z.string().optional(),
  deviceId: z.string().optional(),
});

router.post("/register-device", async (req, res) => {
  try {
    const data = tokenSchema.parse(req.body || {});
    const token = data.expoPushToken || data.token;

    if (!token) {
      return res.status(400).json({ success: false, message: "Push token is required" });
    }

    const savedToken = await prisma.pushToken.upsert({
      where: { token },
      create: {
        userId: req.user.id,
        token,
        platform: data.platform || null,
        deviceId: data.deviceId || null,
        isActive: true,
      },
      update: {
        userId: req.user.id,
        platform: data.platform || null,
        deviceId: data.deviceId || null,
        isActive: true,
      },
    });

    return res.json({ success: true, message: "Push token registered", pushToken: savedToken });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Push token registration failed", error: error.message });
  }
});

router.post("/unregister-device", async (req, res) => {
  try {
    const data = tokenSchema.parse(req.body || {});
    const token = data.expoPushToken || data.token;

    if (!token) {
      return res.status(400).json({ success: false, message: "Push token is required" });
    }

    await prisma.pushToken.updateMany({
      where: { token, userId: req.user.id },
      data: { isActive: false },
    });

    return res.json({ success: true, message: "Push token unregistered" });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Push token unregister failed", error: error.message });
  }
});

module.exports = router;
