import type { KVNamespace } from '@cloudflare/workers-types';
import { SignedIn } from '@daveyplate/better-auth-ui';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet, redirect } from 'react-router-dom';
import { authClient, getAuthServer } from '~/clients/authClient';
import { QueryProvider } from '../../../web/app/lib/query-provider';
import type { Route } from '../+types/root';

export default function Layout() {
  const { data: session, isPending } = authClient.useSession();
  console.log('session', session, isPending);
  if (isPending) {
    return <div>Loading...</div>;
  }
  if (!session) {
    return redirect('/auth/sign-in');
  }
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
