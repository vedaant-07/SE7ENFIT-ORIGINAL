const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

function normalizeRole(role) {
  const value = String(role || "user").toLowerCase();

  if (["owner", "gym_owner", "gym-owner"].includes(value)) {
    return "OWNER";
  }

  if (value === "admin") {
    return "ADMIN";
  }

  return "USER";
}

function deriveNameFromEmail(email) {
  const prefix = String(email || "user").split("@")[0] || "User";
  return prefix
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim() || "SE7EN FIT User";
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    heightCm: user.heightCm,
    weightKg: user.weightKg,
    goal: user.goal,
    createdAt: user.createdAt,
  };
}

const registerSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.string().optional(),
  gymName: z.string().optional(),
  referralCode: z.string().optional(),
  heightCm: z.coerce.number().optional(),
  weightKg: z.coerce.number().optional(),
  goal: z.string().optional(),
});

router.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const email = data.email.toLowerCase();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or phone already registered",
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const role = normalizeRole(data.role);

    const user = await prisma.user.create({
      data: {
        name: data.name || deriveNameFromEmail(email),
        email,
        phone: data.phone || null,
        passwordHash,
        role,
        heightCm: data.heightCm || null,
        weightKg: data.weightKg || null,
        goal: data.goal || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        heightCm: true,
        weightKg: true,
        goal: true,
        createdAt: true,
      },
    });

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: role === "OWNER" ? "Owner registered successfully" : "User registered successfully",
      token,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.string().optional(),
});

router.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const requestedRole = data.role ? normalizeRole(data.role) : null;

    const user = await prisma.user.findUnique({
      where: {
        email: data.email.toLowerCase(),
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (requestedRole === "OWNER" && !["OWNER", "ADMIN"].includes(user.role)) {
      return res.status(401).json({
        success: false,
        message: "Invalid owner credentials",
      });
    }

    if (requestedRole === "USER" && user.role !== "USER") {
      return res.status(401).json({
        success: false,
        message: "Invalid user credentials",
      });
    }

    const passwordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    const token = createToken(user);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

router.post("/owner-login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: {
        email: data.email.toLowerCase(),
      },
    });

    if (!user || !["OWNER", "ADMIN"].includes(user.role)) {
      return res.status(401).json({
        success: false,
        message: "Invalid owner credentials",
      });
    }

    const passwordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid owner credentials",
      });
    }

    const token = createToken(user);

    return res.json({
      success: true,
      message: "Owner login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Owner login failed",
      error: error.message,
    });
  }
});

const googleSchema = z.object({
  idToken: z.string().min(20),
  role: z.string().optional(),
});

async function verifyGoogleIdToken(idToken) {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );

  if (!response.ok) {
    throw new Error("Invalid Google token");
  }

  const payload = await response.json();
  const allowedAudiences = [
    process.env.GOOGLE_WEB_CLIENT_ID,
    process.env.GOOGLE_ANDROID_CLIENT_ID,
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  ].filter(Boolean);

  if (allowedAudiences.length > 0 && !allowedAudiences.includes(payload.aud)) {
    throw new Error("Google token audience mismatch");
  }

  if (!payload.email) {
    throw new Error("Google account email is missing");
  }

  if (payload.email_verified !== true && payload.email_verified !== "true") {
    throw new Error("Google email is not verified");
  }

  return payload;
}

router.post("/google", async (req, res) => {
  try {
    const data = googleSchema.parse(req.body);
    const googleUser = await verifyGoogleIdToken(data.idToken);
    const email = googleUser.email.toLowerCase();
    const role = normalizeRole(data.role);

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const passwordHash = await bcrypt.hash(
        `google:${googleUser.sub}:${process.env.JWT_SECRET || "se7enfit"}`,
        10
      );

      user = await prisma.user.create({
        data: {
          name: googleUser.name || deriveNameFromEmail(email),
          email,
          phone: null,
          passwordHash,
          role,
          isActive: true,
        },
      });
    }

    if (role === "OWNER" && !["OWNER", "ADMIN"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "This Google account is not registered as a gym owner",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    const token = createToken(user);

    return res.json({
      success: true,
      message: "Google login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Google login failed",
      error: error.message,
    });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

router.post("/logout", requireAuth, async (req, res) => {
  return res.json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = router;
