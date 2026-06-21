const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const startSchema = z.object({
  workoutPlanId: z.string().optional(),
  title: z.string().optional(),
  startedAt: z.string().optional(),
});

router.post("/workout/start", async (req, res) => {
  try {
    const data = startSchema.parse(req.body || {});
    const session = await prisma.workoutSession.create({
      data: {
        userId: req.user.id,
        workoutPlanId: data.workoutPlanId || null,
        title: data.title || "Workout Session",
        startedAt: data.startedAt ? new Date(data.startedAt) : new Date(),
        status: "ACTIVE",
      },
    });

    return res.status(201).json({ success: true, message: "Workout session started", session });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Failed to start workout", error: error.message });
  }
});

const updateSchema = z.object({
  status: z.string().optional(),
  endedAt: z.string().optional(),
  durationSeconds: z.coerce.number().int().nonnegative().optional(),
  caloriesEstimate: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional(),
});

router.patch("/workout/session/:id", async (req, res) => {
  try {
    const data = updateSchema.parse(req.body || {});
    const existing = await prisma.workoutSession.findFirst({ where: { id: req.params.id, userId: req.user.id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Workout session not found" });
    }

    const session = await prisma.workoutSession.update({
      where: { id: existing.id },
      data: {
        ...(data.status ? { status: data.status } : {}),
        ...(data.endedAt ? { endedAt: new Date(data.endedAt) } : {}),
        ...(data.durationSeconds !== undefined ? { durationSeconds: data.durationSeconds } : {}),
        ...(data.caloriesEstimate !== undefined ? { caloriesEstimate: data.caloriesEstimate } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
      include: { sets: true },
    });

    return res.json({ success: true, message: "Workout session updated", session });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Failed to update workout", error: error.message });
  }
});

router.post("/workout/end", async (req, res) => {
  const sessionId = req.body?.sessionId || req.body?.id;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: "sessionId is required" });
  }

  req.params.id = sessionId;
  req.body = { ...req.body, status: "COMPLETED", endedAt: req.body?.endedAt || new Date().toISOString() };

  const existing = await prisma.workoutSession.findFirst({ where: { id: sessionId, userId: req.user.id } });
  if (!existing) {
    return res.status(404).json({ success: false, message: "Workout session not found" });
  }

  const session = await prisma.workoutSession.update({
    where: { id: existing.id },
    data: {
      status: "COMPLETED",
      endedAt: new Date(req.body.endedAt),
      durationSeconds: req.body.durationSeconds ?? existing.durationSeconds,
      caloriesEstimate: req.body.caloriesEstimate ?? existing.caloriesEstimate,
      notes: req.body.notes ?? existing.notes,
    },
    include: { sets: true },
  });

  return res.json({ success: true, message: "Workout session completed", session });
});

const setSchema = z.object({
  exerciseId: z.string().optional(),
  exerciseName: z.string().optional(),
  setNumber: z.coerce.number().int().positive().optional(),
  reps: z.coerce.number().int().nonnegative().optional(),
  weightKg: z.coerce.number().nonnegative().optional(),
  durationSeconds: z.coerce.number().int().nonnegative().optional(),
  restSeconds: z.coerce.number().int().nonnegative().optional(),
  completed: z.boolean().optional(),
});

router.post("/workout/session/:id/set", async (req, res) => {
  try {
    const data = setSchema.parse(req.body || {});
    const session = await prisma.workoutSession.findFirst({ where: { id: req.params.id, userId: req.user.id } });

    if (!session) {
      return res.status(404).json({ success: false, message: "Workout session not found" });
    }

    const set = await prisma.workoutSet.create({
      data: {
        sessionId: session.id,
        exerciseId: data.exerciseId || null,
        exerciseName: data.exerciseName || null,
        setNumber: data.setNumber || null,
        reps: data.reps || null,
        weightKg: data.weightKg || null,
        durationSeconds: data.durationSeconds || null,
        restSeconds: data.restSeconds || null,
        completed: data.completed ?? true,
      },
    });

    return res.status(201).json({ success: true, message: "Workout set saved", set });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Failed to save workout set", error: error.message });
  }
});

router.get("/workout/history", async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 20), 100);
  const sessions = await prisma.workoutSession.findMany({
    where: { userId: req.user.id },
    orderBy: { startedAt: "desc" },
    take: limit,
    include: { sets: true },
  });

  return res.json({ success: true, sessions });
});

module.exports = router;
