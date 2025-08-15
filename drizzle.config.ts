import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'local.db', // This is just for drizzle-kit, actual DB is handled by Cloudflare
  },
});
