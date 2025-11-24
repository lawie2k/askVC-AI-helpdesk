const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis.__prisma || {};

const prisma = globalForPrisma.client || new PrismaClient();

if (!globalForPrisma.client) {
  globalThis.__prisma = { client: prisma };
}

module.exports = prisma;
