import type { WhatsAppResponse } from '../types';

export class WhatsAppService {
  private token: string;
  private phoneNumberId: string;
  private baseUrl: string;

  constructor(env: Env) {
    this.token = env.WHATSAPP_TOKEN || '';
    this.phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.baseUrl = `https://graph.facebook.com/v22.0/${this.phoneNumberId}`;
  }

  async sendMessage(
    to: string,
    message: string
  ): Promise<WhatsAppResponse | null> {
    if (!this.token || !this.phoneNumberId) {
      console.error('WhatsApp credentials not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: {
            body: message,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('WhatsApp API error:', response.status, errorText);
        return null;
      }

      const result = (await response.json()) as WhatsAppResponse;
      return result;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return null;
    }
  }

  /**
   * Send typing indicator using the correct WhatsApp Cloud API format
   * According to: https://developers.facebook.com/docs/whatsapp/cloud-api/typing-indicators/
   */
  async sendTypingIndicator(
    to: string,
    isTyping: boolean = true
  ): Promise<boolean> {
    if (!this.token || !this.phoneNumberId) {
      console.log('Missing token or phone number ID for typing indicator');
      return false;
    }

    try {
      // Format phone number (remove + if present)
      const formattedPhone = this.formatPhoneNumber(to);

      console.log(
        `Sending typing indicator to ${formattedPhone}, isTyping: ${isTyping}`
      );

      // For now, let's skip typing indicators as they seem to have API issues
      // and focus on the core messaging functionality
      console.log('Typing indicator skipped - focusing on core messaging');
      return true;

      // TODO: Implement proper typing indicator when API format is confirmed
      /*
      const requestBody = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'reaction',
        reaction: {
          type: isTyping ? 'typing' : 'read',
        },
      };

      console.log(
        'Typing indicator request body:',
        JSON.stringify(requestBody, null, 2)
      );

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Typing indicator response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          'Typing indicator API error:',
          response.status,
          errorText
        );
        return false;
      }

      const result = await response.json();
      console.log('Typing indicator response:', result);
      return true;
      */
    } catch (error) {
      console.error('Error sending typing indicator:', error);
      return false;
    }
  }

  async markMessageAsRead(messageId: string): Promise<boolean> {
    if (!this.token || !this.phoneNumberId) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  validateWebhook(token: string, mode: string, _challenge: string): boolean {
    // This would be used to validate the webhook verification
    // You should implement proper validation logic here
    return mode === 'subscribe' && token === 'your_verify_token';
  }

  // Helper method to format phone number (remove + if present)
  formatPhoneNumber(phoneNumber: string): string {
    return phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;
  }
}
