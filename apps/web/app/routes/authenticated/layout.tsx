import { Outlet, redirect } from 'react-router';
import { getAuth } from '~/auth/auth.server';
import type { Route } from './+types/layout';

export async function loader({ context, request }: Route.LoaderArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return redirect('/');
  }

  return {
    user: session?.user,
  };
}

export default function AuthenticatedLayout({
  loaderData,
}: Route.ComponentProps) {
  return (
    <div>
      <Outlet />
      <div>
        <h1>Authenticated Layout</h1>
        <p>User: {loaderData?.user?.email}</p>
      </div>
    </div>
  );
}
