const express = require("express");
const { prisma } = require("../lib/prisma");
const { requireAuth, requireOwner } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireOwner);

const resources = {
  members: { model: "gymMember", required: ["name"] },
  payments: { model: "gymPayment" },
  leads: { model: "gymLead", required: ["name"] },
  attendance: { model: "gymAttendanceRecord" },
  campaigns: { model: "gymCampaign", required: ["title"] },
  equipment: { model: "gymEquipment", required: ["name"] },
  reviews: { model: "gymReview" },
  referrals: { model: "gymReferral" },
  "workout-plans": { model: "gymWorkoutPlan", required: ["title"] },
  "diet-plans": { model: "gymDietPlan", required: ["title"] },
  "assigned-workouts": { model: "gymAssignedWorkoutPlan" },
  "assigned-diets": { model: "gymAssignedDietPlan" },
  whatsapp: { model: "gymWhatsAppMessage" },
  "email-notifications": { model: "gymEmailMessage" },
  staff: { model: "gymStaff", required: ["name"] },
  classes: { model: "gymClass", required: ["title"] },
  plans: { model: "gymMembershipPlan", required: ["name"] },
};

const dateFields = new Set(["join_date", "renewal_date", "paid_at", "due_date", "follow_up_date", "date", "check_in", "check_out", "start_date", "end_date", "purchased_at"]);
const numberFields = new Set(["amount", "reward", "rating", "capacity", "durationDays"]);

function cleanPayload(payload = {}) {
  const data = { ...payload };
  delete data.id;
  delete data.ownerId;
  delete data.createdAt;
  delete data.updatedAt;
  Object.keys(data).forEach((key) => {
    if (data[key] === "") data[key] = null;
    if (dateFields.has(key) && data[key]) data[key] = new Date(data[key]);
    if (numberFields.has(key) && data[key] !== null && data[key] !== undefined) {
      const value = Number(data[key]);
      if (!Number.isNaN(value)) data[key] = value;
    }
  });
  return data;
}

function configFor(resource) {
  return resources[resource];
}

function delegateFor(config) {
  return prisma[config.model];
}

function ownerWhere(req) {
  return { ownerId: req.user.id };
}

function missingRequired(data, required = []) {
  return required.find((key) => !data[key]);
}

router.get("/summary", async (req, res) => {
  try {
    const ownerId = req.user.id;
    const [members, payments, leads, attendance, campaigns, equipment, reviews] = await Promise.all([
      prisma.gymMember.findMany({ where: { ownerId } }),
      prisma.gymPayment.findMany({ where: { ownerId } }),
      prisma.gymLead.findMany({ where: { ownerId } }),
      prisma.gymAttendanceRecord.findMany({ where: { ownerId } }),
      prisma.gymCampaign.findMany({ where: { ownerId } }),
      prisma.gymEquipment.findMany({ where: { ownerId } }),
      prisma.gymReview.findMany({ where: { ownerId } }),
    ]);
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = new Date().getMonth();
    const activeMembers = members.filter((m) => m.status === "active");
    const todayAttendance = attendance.filter((a) => a.date && new Date(a.date).toISOString().slice(0, 10) === today);
    const paidPayments = payments.filter((p) => p.status === "paid");
    const totalRevenue = paidPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const newThisMonth = members.filter((m) => m.join_date && new Date(m.join_date).getMonth() === thisMonth);
    const convertedLeads = leads.filter((l) => l.status === "converted");
    const avgRating = reviews.length ? Number((reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1)) : null;
    res.json({ success: true, data: {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      newThisMonth: newThisMonth.length,
      todayAttendance: todayAttendance.length,
      revenue: totalRevenue,
      duePayments: payments.filter((p) => ["due", "overdue"].includes(p.status)).length,
      referredUsers: 0,
      leadConversion: leads.length ? Math.round((convertedLeads.length / leads.length) * 100) : 0,
      activeCampaigns: campaigns.filter((c) => c.status === "active").length,
      eqIssues: equipment.filter((e) => ["needs_repair", "out_of_order", "broken", "maintenance"].includes(e.status)).length,
      avgRating: avgRating || "—",
    }});
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load owner summary", error: error.message });
  }
});

router.get("/profile", async (req, res) => {
  try {
    let profile = await prisma.gymProfile.findUnique({ where: { ownerId: req.user.id } });
    if (!profile) {
      profile = await prisma.gymProfile.create({ data: { ownerId: req.user.id, owner_name: req.user.name, email: req.user.email, mobile: req.user.phone, gym_name: "My Gym" } });
    }
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load gym profile", error: error.message });
  }
});

router.post("/profile", async (req, res) => {
  try {
    const profile = await prisma.gymProfile.upsert({ where: { ownerId: req.user.id }, create: { ownerId: req.user.id, ...cleanPayload(req.body) }, update: cleanPayload(req.body) });
    res.json({ success: true, profile });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to save gym profile", error: error.message });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const profile = await prisma.gymProfile.upsert({ where: { ownerId: req.user.id }, create: { ownerId: req.user.id, ...cleanPayload(req.body) }, update: cleanPayload(req.body) });
    res.json({ success: true, profile });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to update gym profile", error: error.message });
  }
});

router.get("/:resource", async (req, res) => {
  try {
    const config = configFor(req.params.resource);
    if (!config) return res.status(404).json({ success: false, message: "Unknown owner resource" });
    const data = await delegateFor(config).findMany({ where: ownerWhere(req), orderBy: { createdAt: "desc" }, take: Math.min(Number(req.query.limit || 100), 500) });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to list resource", error: error.message });
  }
});

router.post("/:resource", async (req, res) => {
  try {
    const config = configFor(req.params.resource);
    if (!config) return res.status(404).json({ success: false, message: "Unknown owner resource" });
    const body = cleanPayload(req.body);
    const missing = missingRequired(body, config.required);
    if (missing) return res.status(400).json({ success: false, message: `${missing} is required` });
    const data = await delegateFor(config).create({ data: { ...body, ownerId: req.user.id } });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to create resource", error: error.message });
  }
});

router.put("/:resource/:id", async (req, res) => {
  try {
    const config = configFor(req.params.resource);
    if (!config) return res.status(404).json({ success: false, message: "Unknown owner resource" });
    const existing = await delegateFor(config).findFirst({ where: { id: req.params.id, ownerId: req.user.id } });
    if (!existing) return res.status(404).json({ success: false, message: "Resource not found" });
    const data = await delegateFor(config).update({ where: { id: req.params.id }, data: cleanPayload(req.body) });
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to update resource", error: error.message });
  }
});

module.exports = router;
