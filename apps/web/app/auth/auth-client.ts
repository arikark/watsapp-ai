import { phoneNumberClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export function getAuthClient({
  // the base url of your auth server
  baseURL = import.meta.env.BETTER_AUTH_URL,
}: {
  baseURL?: string;
}) {
  const authClient = createAuthClient({
    baseURL,
    plugins: [phoneNumberClient()],
  });

  return authClient;
}
