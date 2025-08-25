import { createDb, schema } from '@workspace/db';
import type { BetterAuthOptions } from 'better-auth';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { AppLoadContext } from 'react-router';

let authInstance: ReturnType<typeof betterAuth>;

export function createBetterAuth(
  database: BetterAuthOptions['database'],
  env: Env
): ReturnType<typeof betterAuth> {
  if (!authInstance) {
    authInstance = betterAuth({
      database,
      emailAndPassword: {
        enabled: false,
      },
      secret: env.BETTER_AUTH_SECRET,
    });
  }

  return authInstance;
}

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

export function getAuth(ctx: AppLoadContext): ReturnType<typeof betterAuth> {
  const db = createDb({ databaseUrl: ctx.cloudflare.env.DATABASE_URL });
  return createBetterAuth(
    drizzleAdapter(db, { provider: 'sqlite', schema }),
    ctx.cloudflare.env
  );
}
