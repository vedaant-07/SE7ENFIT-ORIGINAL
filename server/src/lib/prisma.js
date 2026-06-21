const { PrismaClient } = require("@prisma/client");

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ["warn", "error"],
  });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["query", "warn", "error"],
    });
  }
  prisma = global.prisma;
}

module.exports = { prisma };
