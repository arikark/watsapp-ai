import { redirect } from 'react-router';
import type { Route } from '../+types/root';

export async function loader(args: Route.LoaderArgs) {
  // const { isAuthenticated } = await getAuth(args);

  // if (isAuthenticated) {
  //   return redirect('/home');
  // }

  return redirect('/');
}
