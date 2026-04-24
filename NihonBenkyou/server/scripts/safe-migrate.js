#!/usr/bin/env node
/**
 * Safe migration script - only runs Prisma migrations if DATABASE_URL is set
 * This prevents the server from crashing during deployment if the database is not configured
 */
import { spawn } from 'child_process';
import process from 'process';

const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);

if (!isDatabaseConfigured) {
  console.log('[migration] DATABASE_URL not set; skipping migrations');
  process.exit(0);
}

console.log('[migration] Running Prisma migrations...');

const migrate = spawn('npx', ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  shell: true,
});

migrate.on('close', (code) => {
  if (code !== 0) {
    console.warn(`[migration] Warning: Prisma migration failed with code ${code}`);
    console.warn('[migration] Server will start without migrations applied');
    process.exit(0); // Don't block server startup
  }
  console.log('[migration] Migrations completed successfully');
  process.exit(0);
});

migrate.on('error', (err) => {
  console.error('[migration] Failed to start migration process:', err);
  console.warn('[migration] Server will start anyway');
  process.exit(0); // Allow server startup even if migration script fails
});
