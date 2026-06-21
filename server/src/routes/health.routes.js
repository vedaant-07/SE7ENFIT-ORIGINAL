const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function startOfDay(inputDate) {
  const date = inputDate ? new Date(inputDate) : new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

const healthSyncSchema = z.object({
  date: z.string().optional(),
  source: z.string().optional(),
  steps: z.coerce.number().int().nonnegative().optional(),
  distanceMeters: z.coerce.number().nonnegative().optional(),
  activeCalories: z.coerce.number().nonnegative().optional(),
  totalCalories: z.coerce.number().nonnegative().optional(),
  exerciseMinutes: z.coerce.number().int().nonnegative().optional(),
  weightKg: z.coerce.number().positive().optional(),
  heightCm: z.coerce.number().positive().optional(),
  rawPayload: z.any().optional(),
});

router.post("/sync", async (req, res) => {
  try {
    const data = healthSyncSchema.parse(req.body || {});
    const date = startOfDay(data.date);

    const record = await prisma.healthSyncRecord.create({
      data: {
        userId: req.user.id,
        source: data.source || "health_connect",
        syncedForDate: date,
        steps: data.steps ?? null,
        distanceMeters: data.distanceMeters ?? null,
        activeCalories: data.activeCalories ?? null,
        totalCalories: data.totalCalories ?? null,
        exerciseMinutes: data.exerciseMinutes ?? null,
        weightKg: data.weightKg ?? null,
        heightCm: data.heightCm ?? null,
        rawPayload: data.rawPayload || null,
      },
    });

    const summary = await prisma.dailyHealthSummary.upsert({
      where: {
        userId_date: {
          userId: req.user.id,
          date,
        },
      },
      create: {
        userId: req.user.id,
        date,
        steps: data.steps || 0,
        distanceMeters: data.distanceMeters || 0,
        activeCalories: data.activeCalories || 0,
        totalCalories: data.totalCalories || 0,
        exerciseMinutes: data.exerciseMinutes || 0,
        weightKg: data.weightKg || null,
        heightCm: data.heightCm || null,
      },
      update: {
        steps: data.steps || 0,
        distanceMeters: data.distanceMeters || 0,
        activeCalories: data.activeCalories || 0,
        totalCalories: data.totalCalories || 0,
        exerciseMinutes: data.exerciseMinutes || 0,
        ...(data.weightKg ? { weightKg: data.weightKg } : {}),
        ...(data.heightCm ? { heightCm: data.heightCm } : {}),
      },
    });

    return res.json({ success: true, message: "Health data synced", record, summary });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Health sync failed", error: error.message });
  }
});

router.get("/today", async (req, res) => {
  const date = startOfDay(req.query.date);
  const summary = await prisma.dailyHealthSummary.findUnique({
    where: { userId_date: { userId: req.user.id, date } },
  });

  return res.json({
    success: true,
    summary: summary || {
      userId: req.user.id,
      date,
      steps: 0,
      distanceMeters: 0,
      activeCalories: 0,
      totalCalories: 0,
      exerciseMinutes: 0,
      weightKg: null,
      heightCm: null,
    },
  });
});

router.get("/history", async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 30), 90);
  const summaries = await prisma.dailyHealthSummary.findMany({
    where: { userId: req.user.id },
    orderBy: { date: "desc" },
    take: limit,
  });

  return res.json({ success: true, summaries });
});

module.exports = router;
