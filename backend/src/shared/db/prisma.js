import { PrismaClient } from '@prisma/client';
import { config } from '../../config/index.js';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.isProduction ? ['error'] : ['error', 'warn'],
  });

if (!config.isProduction) {
  globalForPrisma.prisma = prisma;
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
