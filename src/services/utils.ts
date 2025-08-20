// Utility functions for phone number validation and formatting

export const AUTHORIZED_PHONE_NUMBER = '+972585722391';

/**
 * Validates if a phone number is the authorized number
 * @param phoneNumber - The phone number to validate
 * @returns true if the phone number is authorized, false otherwise
 */
export function isAuthorizedPhoneNumber(phoneNumber: string): boolean {
  // Handle both formats: with and without + prefix
  const normalizedPhone = phoneNumber.startsWith('+')
    ? phoneNumber
    : `+${phoneNumber}`;
  return normalizedPhone === AUTHORIZED_PHONE_NUMBER;
}

/**
 * Validates and throws an error if the phone number is not authorized
 * @param phoneNumber - The phone number to validate
 * @throws Error if the phone number is not authorized
 */
export function validateAuthorizedPhoneNumber(phoneNumber: string): void {
  if (!isAuthorizedPhoneNumber(phoneNumber)) {
    throw new Error(`Unauthorized phone number: ${phoneNumber}`);
  }
}

/**
 * Formats a phone number to ensure consistency
 * @param phoneNumber - The phone number to format
 * @returns The formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // Ensure it starts with +
  if (!cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }

  return cleaned;
}

/**
 * Validates webhook payload signature using SHA256
 * According to Meta documentation: https://developers.facebook.com/docs/graph-api/webhooks/getting-started/#validating-payloads
 *
 * @param payload - The raw request body
 * @param signature - The X-Hub-Signature-256 header value
 * @param appSecret - Your app's secret
 * @returns Promise<boolean> - true if signature is valid, false otherwise
 */
export async function validatePayloadSignature(
  payload: string,
  signature: string,
  appSecret: string
): Promise<boolean> {
  try {
    // Extract the signature value (remove 'sha256=' prefix)
    const signatureValue = signature.replace('sha256=', '');

    // Generate SHA256 signature using payload and app secret
    const expectedSignature = await generateSHA256Signature(payload, appSecret);

    // Compare signatures (constant-time comparison for security)
    return constantTimeCompare(signatureValue, expectedSignature);
  } catch (error) {
    console.error('Error validating payload signature:', error);
    return false;
  }
}

/**
 * Generates SHA256 signature for webhook payload
 * @param payload - The raw request body
 * @param appSecret - Your app's secret
 * @returns Promise<string> - The SHA256 signature as a hex string
 */
async function generateSHA256Signature(
  payload: string,
  appSecret: string
): Promise<string> {
  // Create HMAC-SHA256 signature
  const encoder = new TextEncoder();
  const key = encoder.encode(appSecret);
  const data = encoder.encode(payload);

  // Use Web Crypto API for HMAC-SHA256
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);

  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Performs constant-time comparison of two strings
 * This prevents timing attacks when comparing signatures
 * @param a - First string
 * @param b - Second string
 * @returns true if strings are equal, false otherwise
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
