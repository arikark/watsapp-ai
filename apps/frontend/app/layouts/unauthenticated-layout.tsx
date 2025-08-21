import { getAuth } from '@clerk/react-router/ssr.server';

import { Outlet, redirect } from 'react-router';
import type { Route } from '../+types/root';

export async function loader(args: Route.LoaderArgs) {
  //   const { isAuthenticated } = await getAuth(args);
  //   if (isAuthenticated) {
  //     return redirect('/introductions');
}

//   return null;
// }

export default function Layout() {
  return (
    // <SignedOut>
    <Outlet />
    // </SignedOut>
  );
}
