import path from 'node:path';
import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

config({ path: path.join(__dirname, '../.env') });

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'schema.prisma'),
  migrate: {
    async url() {
      return process.env.DATABASE_URL!;
    },
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
