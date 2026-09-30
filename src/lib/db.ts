import { PrismaClient } from "@prisma/client";

// Lazy singleton: avoids creating clients during `next build` when no
// DATABASE_URL is configured yet. The client is only instantiated on
// first actual use at request time.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Create a free Supabase project, copy its " +
        "Postgres connection string, and add it to your .env file. " +
        "See .env.example for the exact variable names.",
    );
  }
  return new PrismaClient();
}

export function db(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}
