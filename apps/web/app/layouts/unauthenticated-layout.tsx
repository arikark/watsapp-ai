import { Outlet } from 'react-router';

// export async function loader({ context, request }: Route.LoaderArgs) {
//   const auth = getAuthServer({
//     databaseUrl: context.cloudflare.env.DATABASE_URL,
//     authSecret: context.cloudflare.env.BETTER_AUTH_SECRET,
//     webUrl: context.cloudflare.env.BETTER_AUTH_URL,
//     kv: context.cloudflare.env.BETTER_AUTH_SESSION as KVNamespace<string>,
//   });

//   const { getSession } = auth.api;
//   const session = await getSession({ headers: request.headers });

//   // Redirect authenticated users to home
//   if (session) {
//     console.log('redirecting to home');
//     return redirect('/');
//   }

//   return null;
// }

export default function Layout() {
  return <Outlet />;
}
