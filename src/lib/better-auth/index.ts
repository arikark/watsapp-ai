import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createDb } from '../../db/db';
import * as schema from '../../db/schema';
import { betterAuthOptions } from './options';

/**
 * Better Auth Instance
 */
export const auth = (env: Env) => {
  const db = createDb(env.DATABASE_URL);

  return betterAuth({
    ...betterAuthOptions,
    database: drizzleAdapter(db, { provider: 'pg', schema }),
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,

    // Additional options that depend on env ...
  });
};
