import { redirect } from 'react-router';
import { authClient } from '~/lib/auth-client';

export default function Landing() {
  const { data: session } = authClient.useSession();
  if (session) {
    return redirect('/home');
  }
  return <div>Landing</div>;
}
