import { phoneNumberClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export function getAuthClient({
  // the base url of your auth server
  baseURL = 'http://localhost:8787',
}: {
  baseURL?: string;
}) {
  const authClient = createAuthClient({
    baseURL,
    plugins: [phoneNumberClient()],
  });

  return authClient;
}
