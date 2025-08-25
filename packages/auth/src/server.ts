import type { KVNamespace } from '@cloudflare/workers-types';
import type { DatabaseInstance } from '@workspace/db';
import { type BetterAuthOptions, betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { phoneNumber } from 'better-auth/plugins/phone-number';

export interface AuthOptions extends BetterAuthOptions {
  webUrl: string;
  authSecret: string;
  db: DatabaseInstance;
}

export type AuthInstance = ReturnType<typeof createAuth>;

/**
 * This function is abstracted for schema generations in cli-config.ts
 */
export const getBaseOptions = (db: DatabaseInstance) =>
  ({
    database: drizzleAdapter(db, {
      provider: 'pg',
    }),
    trustedOrigins: ['http://localhost:8787', 'http://localhost:5173'],
    // Plugins to be added for type inference. They will be overridden in createAuth if passed as options.
    plugins: [phoneNumber()],
    session: {
      additionalFields: {
        phoneNumber: {
          type: 'string',
          required: true,
        },
      },
    },
    secondaryStorage: {
      get: async () => {
        return null;
      },
      set: async () => {
        return;
      },
      delete: async () => {
        return;
      },
    },

    /**
     * Only uncomment the line below if you are using plugins, so that
     * your types can be correctly inferred:
     */
  }) satisfies BetterAuthOptions;

/**
 * Creates a BetterAuth instance with the given options.
 * @param options - The options for the BetterAuth instance.
 * @returns A BetterAuth instance.
 *
 * @param secondaryStorage - The secondary storage for the BetterAuth instance - use kv when using cloudflare workers
 */
export const createAuth = ({
  webUrl,
  db,
  authSecret,
  secondaryStorage,
  kv,
  ...options
}: {
  webUrl: string;
  db: DatabaseInstance;
  authSecret: string;
  // secondaryStorage: SecondaryStorage;
  kv: KVNamespace<string>;
} & BetterAuthOptions) => {
  return betterAuth({
    ...getBaseOptions(db),
    ...options,
    secret: authSecret,
    trustedOrigins: ['http://localhost:8787', 'http://localhost:5173'],
    secondaryStorage: {
      get: async (key) => {
        console.log('getting', key);
        const value = await kv.get(key);
        return value;
      },
      set: async (key, value, ttl) => {
        console.log('setting', key, value, ttl);
        if (ttl) {
          // Convert relative TTL to absolute expiration timestamp
          const expiration = Math.floor(Date.now() / 1000) + ttl;
          await kv.put(key, value, { expiration });
        } else {
          await kv.put(key, value);
        }
      },
      delete: async (key) => {
        await kv.delete(key);
      },
    },
  });
};
