import { createAuth, getBaseOptions } from '@workspace/auth/server';
import { createDb, schema } from '@workspace/db';
import type { BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { AppLoadContext } from 'react-router';

// export function createBetterAuth(
//   database: BetterAuthOptions['database'],
//   env: Env
// ): ReturnType<typeof createAuth> {
//   if (!authInstance) {
//     authInstance = createAuth({
//       db: database,
//       authSecret: env.BETTER_AUTH_SECRET,
//       webUrl: env.BETTER_AUTH_URL,
//       secondaryStorage: {
//         get: async () => {
//           console.log('blob');
//           return null;
//         },
//       },
//       kv: env.BETTER_AUTH_SESSION,
//     });
//   }

//   return authInstance;
// }

// export function getAuth(ctx: AppLoadContext) {
//   if (!authInstance) {
//     authInstance = createBetterAuth(
//       {
//         // This project uses D1 so we have to use an instance of Kysely.
//         // You could swap this out if you're using a different database.
//         db: new Kysely({
//           dialect: new D1Dialect({
//             database: ctx.cloudflare.env.DB,
//           }),
//           plugins: [
//             // Drizzle schema uses snake_case so this plugin is required for
//             // better-auth to talk to the database
//             new CamelCasePlugin(),
//           ],
//         }),
//         type: 'sqlite',
//       },
//       ctx.cloudflare.env
//     );
//   }

//   return authInstance;
// }

export function getAuth(ctx: AppLoadContext): ReturnType<typeof createAuth> {
  const db = createDb({ databaseUrl: ctx.cloudflare.env.DATABASE_URL });
  return createAuth({
    db: drizzleAdapter(db, { provider: 'pg', schema }),
    authSecret: ctx.cloudflare.env.BETTER_AUTH_SECRET,
    webUrl: ctx.cloudflare.env.BETTER_AUTH_URL,
    // TODO there is an issue with the kv binding preventing session locally, it is not working as expected due to the server kv store using the remote binding (as desired) and this uses the local binding. Either they should point to the same local kv store or the server should use the remote binding.
    kv: ctx.cloudflare.env.BETTER_AUTH_SESSION,
  });
}
