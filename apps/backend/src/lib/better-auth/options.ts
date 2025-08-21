import type { BetterAuthOptions } from 'better-auth';
import { phoneNumber } from 'better-auth/plugins/phone-number';
import { ChatSessionService } from '../../services/chat-session-service';
import { WhatsAppService } from '../../services/whatsapp_service';

/**
 * Custom options for Better Auth
 *
 * Docs: https://www.better-auth.com/docs/reference/options
 */

export const getBetterAuthOptions = (env: Env) => {
  const kv = env.watsapp_ai_session;

  return {
    /**
     * The name of the application.
     */

    appName: 'WhatsApp AI',
    /**
     * Base path for Better Auth.
     * @default "/api/auth"
     */
    basePath: '/api/auth',
    trustedOrigins: ['http://localhost:5173'],
    plugins: [
      phoneNumber({
        callbackOnVerification: async ({ phoneNumber, user }, _request) => {
          const chatSessionService = new ChatSessionService(
            env.watsapp_ai_session
          );
          await chatSessionService.putWhatsAppUserSession(phoneNumber, user);
        },
        sendOTP: async ({ phoneNumber, code }, request) => {
          console.log(request);
          console.log('Sending OTP to', phoneNumber, 'with code', code);
          // Send OTP to user via whatsapp
          const whatsappService = new WhatsAppService(env);
          const baseUrl = env.BETTER_AUTH_URL;
          const url = `${baseUrl}/api/auth/verify?phoneNumber=${phoneNumber}&code=${code}`;
          console.log('sending url for sign in', url);
          await whatsappService.sendMessage(phoneNumber, url);
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
    session: {
      additionalFields: {
        phoneNumber: {
          type: 'string',
          required: true,
        },
      },
    },
    secondaryStorage: {
      get: async (key) => {
        const value = await kv.get(key);
        return value ? value : null;
      },
      set: async (key, value, ttl) => {
        console.log('setting', key, value, ttl);
        if (ttl) {
          // Convert relative TTL to absolute expiration timestamp
          const expiration = Math.floor(Date.now() / 1000) + ttl;
          await kv.put(key, value, { expiration });
        } else {
          await kv.put(key, value);
        }
      },
      delete: async (key) => {
        await kv.delete(key);
      },
    },
  } satisfies BetterAuthOptions;
};
