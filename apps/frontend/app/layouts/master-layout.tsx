import { AuthUIProvider } from '@workspace/ui/components';
import { createAuthClient } from 'better-auth/react';
import {
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'react-router';
import type { Route } from '../+types/root';

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <div className="text-2xl font-bold">Uh oh! Something went wrong.</div>
        <div className="text-sm text-gray-500">
          Send through an email to{' '}
          <a
            href={`mailto:theintroapp101@gmail.com?subject=Error%20in%20theintroapp%20app&body=${encodeURIComponent(
              `Error: ${error.message}\n\nStack: ${error.stack}`
            )}`}
            className="text-blue-500"
            target="_blank"
            rel="noopener noreferrer"
          >
            theintroapp101@gmail.com
          </a>
        </div>
        <div className="text-sm text-gray-500 mt-6">
          <pre>{error.message}</pre>
        </div>
      </div>
    </div>
  );
}

export async function loader(args: Route.LoaderArgs) {
  return {};
}
export default function MasterLayout() {
  // only initialize amplitude if not in dev mode
  // if (process.env.NODE_ENV !== 'development') {
  //   amplitude.add(sessionReplayPlugin());
  //   amplitude.init('942065ace62b3284a915db5b31aeaa7e', {
  //     autocapture: true,
  //     instanceName: 'web-app',
  //   });
  // }
  // const loaderData = useLoaderData();

  const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: 'http://localhost:3000',
  });
  return (
    <>
      <ScrollRestoration />
      <Scripts />
      <Outlet />
    </>
  );
}
