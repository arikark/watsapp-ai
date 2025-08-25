// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { Outlet, redirect } from 'react-router';
import { authClient, get, getAuthServer } from '~/clients/authClient';
// import { QueryProvider } from '~/lib/query-provider';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet, redirect, useNavigate } from 'react-router';
import { QueryProvider } from '~/lib/query-provider';
import type { Route } from '../+types/root';

export async function loader({ context, request }: Route.LoaderArgs) {
  const auth = getAuthServer({
    databaseUrl: context.cloudflare.env.DATABASE_URL,
    authSecret: context.cloudflare.env.BETTER_AUTH_SECRET,
    webUrl: context.cloudflare.env.BETTER_AUTH_URL,
    kv: context.cloudflare.env.BETTER_AUTH_SESSION as KVNamespace<string>,
  });

  const { getSession } = auth.api;
  const session = await getSession({ headers: request.headers });

  return { session };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  return (
    <QueryProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      <div className="flex justify-center bg-slate-50">
        <div className="p-3 h-dvh flex md:w-[600px] w-full">
          <Outlet />
        </div>
      </div>
    </QueryProvider>
  );
}
