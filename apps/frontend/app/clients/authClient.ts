import type { KVNamespace } from '@cloudflare/workers-types';
import { createAuthClient } from '@workspace/auth/client';
import { type AuthInstance, createAuth } from '@workspace/auth/server';
import { createDb } from '@workspace/db';

export const authClient = createAuthClient({
  apiBaseUrl: import.meta.env.VITE_BETTER_AUTH_URL,
});

export const getAuthServer = (kv: KVNamespace): AuthInstance =>
  createAuth({
    webUrl: import.meta.env.VITE_BETTER_AUTH_URL,
    db: createDb(),
    authSecret: import.meta.env.VITE_BETTER_AUTH_SECRET,
    kv,
  });
