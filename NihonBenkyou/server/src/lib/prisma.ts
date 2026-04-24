import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const log: Prisma.LogLevel[] = process.env.NODE_ENV === 'development'
  ? ['query', 'error', 'warn']
  : ['error'];

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  // Keep the API process alive even when DB config is missing/invalid.
  // Route handlers will return errors, but health can still report diagnostics.
  if (!databaseUrl) {
    console.error('[prisma] DATABASE_URL is missing; starting without adapter');
    return new PrismaClient({ log });
  }

  try {
    const adapter = new PrismaPg(databaseUrl);
    return new PrismaClient({ adapter, log });
  } catch (error) {
    console.error('[prisma] Failed to initialize PrismaPg adapter; starting without adapter', error);
    return new PrismaClient({ log });
  }
}

const prisma = createPrismaClient();

export default prisma;
