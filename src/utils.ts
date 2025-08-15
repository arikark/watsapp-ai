// Utility functions for phone number validation and formatting

export const AUTHORIZED_PHONE_NUMBER = '+972585722391';

/**
 * Validates if a phone number is the authorized number
 * @param phoneNumber - The phone number to validate
 * @returns true if the phone number is authorized, false otherwise
 */
export function isAuthorizedPhoneNumber(phoneNumber: string): boolean {
  // Handle both formats: with and without + prefix
  const normalizedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
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
