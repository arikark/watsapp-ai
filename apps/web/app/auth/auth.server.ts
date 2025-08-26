import type { KVNamespace } from '@cloudflare/workers-types';
import { createAuth } from '@workspace/auth';
import { createDb } from '@workspace/db';
import type { AppLoadContext } from 'react-router';

export function getAuth(ctx: AppLoadContext) {
  const db = createDb({ databaseUrl: ctx.cloudflare.env.DATABASE_URL });
  return createAuth({
    db,
    authSecret: ctx.cloudflare.env.BETTER_AUTH_SECRET,
    webUrl: ctx.cloudflare.env.BETTER_AUTH_URL,
    kv: ctx.cloudflare.env.BETTER_AUTH_SESSION as KVNamespace<string>,
  });
}
