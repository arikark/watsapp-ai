import { Toaster } from '@workspace/ui/components';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

import '@workspace/ui/globals.css';
import { QueryProvider } from './lib/query-provider';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Intro App</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body style={{ fontFamily: "'Rubik', sans-serif" }}>
        <QueryProvider>
          {children}
          <Toaster />
          <ScrollRestoration />
          <Scripts />
        </QueryProvider>
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
