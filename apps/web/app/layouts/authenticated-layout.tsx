// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { Outlet, redirect } from 'react-router';
// import { QueryProvider } from '~/lib/query-provider';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet, redirect } from 'react-router';
// import { auth } from '~/clients/auth.server';
import { QueryProvider } from '~/lib/query-provider';
import type { Route } from '../+types/root';

export const loader = async ({ request }: Route.LoaderArgs) => {
  // const session = await auth.api.getSession({ headers: request.headers });
  // if (!session) return redirect('/');
  // console.log(session);
  return {};
};

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
