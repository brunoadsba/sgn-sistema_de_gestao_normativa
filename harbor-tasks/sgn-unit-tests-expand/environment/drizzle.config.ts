import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_PATH || './data/sgn.db',
    authToken: process.env.TURSO_AUTH_TOKEN as string,
  },
});
