import type { BetterAuthOptions } from 'better-auth';
import { magicLink } from 'better-auth/plugins';
import { phoneNumber } from 'better-auth/plugins/phone-number';
import { WhatsAppService } from '../../services/whatsapp_service';

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
    magicLink({
      sendMagicLink: async ({ email, token, url }, request) => {
        const phoneNumber = email.split('@')[0];
        console.log(phoneNumber);
        const whatsappService = new WhatsAppService(request as Env);
        const response = await whatsappService.sendMessage(
          phoneNumber,
          `Your magic link is ${url}`
        );
        console.log(response);
        // send email to user
      },
    }),
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }, request) => {
        console.log(request);
        console.log('Sending OTP to', phoneNumber, 'with code', code);
        // Send OTP to user via whatsapp
        const whatsappService = new WhatsAppService(request as Env);
        const response = await whatsappService.sendMessage(
          phoneNumber,
          `Your OTP is ${code}`
        );
        console.log(response);
        // whatsappService.sendOTP(phoneNumber, code);
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
