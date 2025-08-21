import { getAuth } from '@clerk/react-router/ssr.server';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet, redirect } from 'react-router-dom';
import { QueryProvider } from '~/lib/query-provider';
import type { Route } from '../+types/root';

export async function loader(args: Route.LoaderArgs) {
  // Use `getAuth()` to get the user's ID
  const { userId } = await getAuth(args);

  // Protect the route by checking if the user is signed in
  if (!userId) {
    return redirect('/');
  }

  return null;
}
export default function Layout() {
  // const { user } = useUser();
  // if (user?.fullName) {
  //   amplitude.setUserId(user.fullName);
  // }
  return (
    // <SignedIn>
    <QueryProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      <div className="flex justify-center bg-slate-50">
        <div className="p-3 h-dvh flex md:w-[600px] w-full">
          <Outlet />
        </div>
      </div>
    </QueryProvider>
    // </SignedIn>
  );
}
