/**
 * Better Auth CLI configuration file
 *
 * Docs: https://www.better-auth.com/docs/concepts/cli
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createDb } from './src/db/db';
import * as schema from './src/db/schema';
import { betterAuthOptions } from './src/lib/better-auth/options';

const { DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET } = process.env;

if (!DATABASE_URL || !BETTER_AUTH_URL || !BETTER_AUTH_SECRET) {
  throw new Error('Missing environment variables');
}

const db = createDb(DATABASE_URL);

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  ...betterAuthOptions,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  baseURL: BETTER_AUTH_URL,
  secret: BETTER_AUTH_SECRET,
});
