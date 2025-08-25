import type { KVNamespace } from '@cloudflare/workers-types';
import { createAuthClient } from '@workspace/auth/client';
import { type AuthInstance, createAuth } from '@workspace/auth/server';
import { createDb } from '@workspace/db';
import { phoneNumberClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  apiBaseUrl: import.meta.env.VITE_BETTER_AUTH_URL,
});

export const getAuthServer = ({
  databaseUrl,
  authSecret,
  webUrl,
  kv,
}: {
  databaseUrl: string;
  authSecret: string;
  webUrl: string;
  kv: KVNamespace;
}): AuthInstance =>
  createAuth({
    plugins: [phoneNumberClient()],
    webUrl,
    db: createDb({ databaseUrl }),
    authSecret,
    kv,
  });
