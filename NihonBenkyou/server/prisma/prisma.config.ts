import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, env } from 'prisma/config';

// __dirname is not defined in ESM ("type": "module"), derive it from
// import.meta.url so dotenv can locate ../.env reliably.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Re-load .env relative to this file in case CWD isn't the server folder
// (e.g. running prisma CLI from a different directory).
import { config as loadDotenv } from 'dotenv';
loadDotenv({ path: path.join(__dirname, '../.env') });

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),
  datasource: {
    url: env('DATABASE_URL'),
  },
});
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

// __dirname is not defined in ESM ("type": "module"), so derive it from
// import.meta.url. Without this, dotenv silently loads no file and Prisma
// CLI commands (db push / migrate) fail with: "datasource.url is required".
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
  console.error('[prisma.config] DATABASE_URL not loaded from', path.join(__dirname, '../.env'));
}

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'schema.prisma'),
  migrate: {
    async url() {
      return process.env.DATABASE_URL!;
    },
  },
  datasource: {
    async url() {
      return process.env.DATABASE_URL!;
    },
  },
});
