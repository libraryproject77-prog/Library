import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
} catch (err) {
  console.warn('[Prisma] Prisma client could not be initialized directly. Using repository fallback mode.');
  prisma = null;
}

export { prisma };
