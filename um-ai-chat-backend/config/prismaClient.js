let prisma;

try {
  const { PrismaClient } = require("@prisma/client");
  const globalForPrisma = globalThis.__prisma || {};

  prisma = globalForPrisma.client || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  if (!globalForPrisma.client) {
    globalThis.__prisma = { client: prisma };
  }

  // Test connection
  prisma.$connect().catch(err => {
    console.error("❌ Prisma connection error:", err.message);
  });
} catch (error) {
  console.error("❌ Failed to load Prisma Client:", error.message);
  console.error("Make sure to run: npx prisma generate");
  // Create a mock prisma that throws helpful errors
  prisma = new Proxy({}, {
    get: () => {
      throw new Error("Prisma Client not generated. Run: npx prisma generate");
    }
  });
}

module.exports = prisma;
