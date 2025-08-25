import { SignedOut } from '@daveyplate/better-auth-ui';
import { Outlet, useNavigate } from 'react-router';
import { authClient } from '~/clients/authClient';

// export async function loader(args: Route.LoaderArgs) {
//   //   const { isAuthenticated } = await getAuth(args);
//   //   if (isAuthenticated) {
//   //     return redirect('/introductions');
// }

// //   return null;
// // }

export default function Layout() {
  const navigate = useNavigate();
  // const { data: session } = authClient.useSession();
  // console.log('session', session);
  // if (session) {
  //   // navigate('/home');
  // }
  return (
    <SignedOut>
      <Outlet />
    </SignedOut>
  );
}
