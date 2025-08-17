import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export function createDb(env: Env) {
  return drizzle(env.DATABASE_URL, { schema });
}

export { schema };
