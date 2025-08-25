import type { KVNamespace } from '@cloudflare/workers-types';
import { createAuthClient } from '@workspace/auth/client';
import { type AuthInstance, createAuth } from '@workspace/auth/server';
import type { DatabaseInstance } from '@workspace/db';

// import { type AuthInstance, createAuth } from '@workspace/auth/server';
// import { createDb } from '@workspace/db';

const apiBaseUrl = import.meta.env.VITE_BETTER_AUTH_URL;
console.log('apiBaseUrl', apiBaseUrl);

export const authClient = createAuthClient({
  apiBaseUrl,
});

export const getAuthServer = ({
  db,
  kv,
  webUrl,
  authSecret,
}: {
  db: DatabaseInstance;
  kv: KVNamespace;
  webUrl: string;
  authSecret: string;
}): AuthInstance => {
  return createAuth({
    webUrl,
    db,
    authSecret,
    kv,
  });
};
