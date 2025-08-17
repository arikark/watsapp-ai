import type { BetterAuthOptions } from 'better-auth';
import { phoneNumber } from 'better-auth/plugins/phone-number';

/**
 * Custom options for Better Auth
 *
 * Docs: https://www.better-auth.com/docs/reference/options
 */
export const betterAuthOptions: BetterAuthOptions = {
  /**
   * The name of the application.
   */
  appName: 'WhatsApp AI',
  /**
   * Base path for Better Auth.
   * @default "/api/auth"
   */
  basePath: '/api',
  plugins: [
    phoneNumber({
      sendOTP: ({ phoneNumber, code }, request) => {
        console.log('Sending OTP to', phoneNumber, 'with code', code);
        // Implement sending OTP code via SMS
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
          return `${phoneNumber}@whatsapp-ai.com`;
        },
        //optionally, you can also pass `getTempName` function to generate a temporary name for the user
        getTempName: (phoneNumber) => {
          return phoneNumber; //by default, it will use the phone number as the name
        },
      },
    }),
  ],

  // .... More options
};
