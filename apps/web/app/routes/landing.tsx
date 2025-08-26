import { Input } from '@workspace/ui/components';
import { Button } from 'node_modules/@workspace/ui/src/components/button';
import { useState } from 'react';
import { redirect, useNavigate } from 'react-router';
import { getAuth } from '~/auth/auth.server';
import { getAuthClient } from '~/auth/auth-client';
import type { Route } from './+types/landing';

export function meta() {
  return [
    { title: 'Better Auth / React Router App + Cloudflare Workers' },
    {
      name: 'description',
      content: 'Welcome to React Router hosted on Cloudflare Workers!',
    },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  if (session) {
    return redirect('/dashboard');
  }

  return null;
}

export default function AuthPage() {
  const authClient = getAuthClient({
    baseURL: import.meta.env.BETTER_AUTH_URL,
  });
  const [otp, setOtp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();
  const onClickSendOtp = async () => {
    console.log('phoneNumber', phoneNumber);
    const { data, error } = await authClient.phoneNumber.sendOtp({
      phoneNumber: phoneNumber,
    });
    console.log(data, error);
  };

  const onClickVerifyOtp = async () => {
    const { data, error } = await authClient.phoneNumber.verify({
      phoneNumber: phoneNumber,
      code: otp,
    });
    if (error) {
      console.error(error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <main className="container flex grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6">
      <Button onClick={onClickSendOtp}>Send OTP</Button>
      <Input
        type="text"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />

      <Input
        type="text"
        placeholder="OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <Button onClick={onClickVerifyOtp}>Verify OTP</Button>
    </main>
  );
}
