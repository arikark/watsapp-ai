import type { KVNamespace } from '@cloudflare/workers-types';
import type { DatabaseInstance } from '@workspace/db';
import {
  type BetterAuthOptions,
  type BetterAuthPlugin,
  betterAuth,
} from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { phoneNumber } from 'better-auth/plugins/phone-number';

export interface AuthOptions extends BetterAuthOptions {
  webUrl: string;
  authSecret: string;
  db: DatabaseInstance;
}

// Use any type to avoid complex type inference issues

const basePlugins = [phoneNumber()];

/**
 * This function is abstracted for schema generations in cli-config.ts
 */
export const getBaseOptions = (db: DatabaseInstance) => {
  const session = {
    additionalFields: {
      phoneNumber: {
        type: 'string',
        required: true,
      },
    },
  } satisfies BetterAuthOptions['session'];

  const baseOptions = {
    database: drizzleAdapter(db, {
      provider: 'pg',
    }),
    trustedOrigins: ['http://localhost:8787', 'http://localhost:5173'],
    // Plugins to be added for type inference. They will be overridden in createAuth if passed as options.
    plugins: basePlugins,
    session,
    // secondaryStorage: {
    //   get: async () => {
    //     return null;
    //   },
    //   set: async () => {
    //     return;
    //   },
    //   delete: async () => {
    //     return;
    //   },
    // },

    /**
     * Only uncomment the line below if you are using plugins, so that
     * your types can be correctly inferred:
     */
  } satisfies BetterAuthOptions;

  return baseOptions;
};

export const validateBetterAuthPlugins = ({
  service,
  plugins,
}: {
  plugins: BetterAuthPlugin[];
  service: 'backend' | 'frontend';
}) => {
  for (const plugin of plugins) {
    if (!basePlugins.some((p) => p.id === plugin.id)) {
      throw new Error(
        `Plugin ${plugin.id} is used in ${service} better auth instance but not in the base options`
      );
    }
  }
};

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
  kv,
  ...options
}: {
  webUrl: string;
  db: DatabaseInstance;
  authSecret: string;
  kv: KVNamespace<string>;
} & BetterAuthOptions) => {
  if (options.plugins) {
    validateBetterAuthPlugins({
      plugins: options.plugins,
      service: 'backend',
    });
  }
  const auth = betterAuth({
    ...getBaseOptions(db),
    ...options,
    secret: authSecret,
    secondaryStorage: {
      get: async (key) => {
        console.log('getting session', key);
        const list = await kv.list();
        console.log('list', list);
        const value = await kv.get(key);
        console.log('value', value);
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
  return auth;
};
