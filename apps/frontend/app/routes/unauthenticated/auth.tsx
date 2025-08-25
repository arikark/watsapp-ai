import { Button, Input } from '@workspace/ui/components';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '~/clients/authClient';

export default function AuthPage() {
  const { useSession } = authClient;
  const [otp, setOtp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { data: session } = useSession();
  const navigate = useNavigate();
  const onClickSendOtp = async () => {
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
      navigate('/');
    }
  };

  console.log(session);

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
