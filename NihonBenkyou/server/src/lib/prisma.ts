import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

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
    // Use an explicit pg.Pool so we can set a connection timeout.
    // Without connectionTimeoutMillis the pool waits forever on failed
    // connections, causing requests to hang until Railway's CDN gives up
    // and returns a 502 instead of letting Express return a 500.
    const pool = new Pool({
      connectionString: databaseUrl,
      connectionTimeoutMillis: 10_000, // 10 s — fail fast, not hang
      idleTimeoutMillis: 30_000,
      max: 10,
    });

    pool.on('error', (err) => {
      console.error('[prisma] pg pool error:', err.message);
    });

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter, log });
  } catch (error) {
    console.error('[prisma] Failed to initialize PrismaPg adapter; starting without adapter', error);
    return new PrismaClient({ log });
  }
}

const prisma = createPrismaClient();

export default prisma;
