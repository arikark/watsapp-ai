import type { User } from 'better-auth';

export interface WhatsAppUserSession {
  phoneNumber: string;
  user: User;
  lastActive: string;
  createdAt: string;
}

export class ChatSessionService {
  private kv: KVNamespace;
  private readonly TTL_DAYS = 30;
  private readonly TTL_SECONDS = this.TTL_DAYS * 24 * 60 * 60;

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  /**
   * Private helper method to store session with TTL
   */
  private async storeSessionWithTtl(
    phoneNumber: string,
    session: WhatsAppUserSession
  ): Promise<void> {
    await this.kv.put(phoneNumber, JSON.stringify(session), {
      expirationTtl: this.TTL_SECONDS,
    });
  }

  /**
   * Store a WhatsApp user session
   * @param phoneNumber - The phone number as the session key
   * @param user - The user object with phone number
   * @returns Promise<void>
   */
  async putWhatsAppUserSession(phoneNumber: string, user: User): Promise<void> {
    try {
      const session: WhatsAppUserSession = {
        phoneNumber,
        user,
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await this.storeSessionWithTtl(phoneNumber, session);
      console.log(
        `Session stored for phone number: ${phoneNumber} with ${this.TTL_DAYS}-day TTL`
      );
    } catch (error) {
      console.error('Error storing WhatsApp user session:', error);
      throw error;
    }
  }

  /**
   * Retrieve a WhatsApp user session by phone number
   * @param phoneNumber - The phone number to look up
   * @returns Promise<WhatsAppUserSession | null>
   */
  async getWhatsAppUserSession(
    phoneNumber: string
  ): Promise<WhatsAppUserSession | null> {
    try {
      const sessionData = await this.kv.get(phoneNumber);

      if (!sessionData) {
        console.log(`No session found for phone number: ${phoneNumber}`);
        return null;
      }

      const session: WhatsAppUserSession = JSON.parse(sessionData);

      // Update last active timestamp and refresh TTL
      session.lastActive = new Date().toISOString();
      await this.storeSessionWithTtl(phoneNumber, session);

      console.log(`Session retrieved for phone number: ${phoneNumber}`);
      return session;
    } catch (error) {
      console.error('Error retrieving WhatsApp user session:', error);
      return null;
    }
  }

  /**
   * Update the last active timestamp for a session
   * @param phoneNumber - The phone number to update
   * @returns Promise<boolean>
   */
  async updateSessionActivity(phoneNumber: string): Promise<boolean> {
    try {
      const session = await this.getWhatsAppUserSession(phoneNumber);
      if (!session) {
        return false;
      }

      session.lastActive = new Date().toISOString();
      await this.storeSessionWithTtl(phoneNumber, session);
      return true;
    } catch (error) {
      console.error('Error updating session activity:', error);
      return false;
    }
  }

  /**
   * Delete a WhatsApp user session
   * @param phoneNumber - The phone number to delete
   * @returns Promise<boolean>
   */
  async deleteWhatsAppUserSession(phoneNumber: string): Promise<boolean> {
    try {
      await this.kv.delete(phoneNumber);
      console.log(`Session deleted for phone number: ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error('Error deleting WhatsApp user session:', error);
      return false;
    }
  }

  /**
   * Check if a session exists for a phone number
   * @param phoneNumber - The phone number to check
   * @returns Promise<boolean>
   */
  async hasSession(phoneNumber: string): Promise<boolean> {
    try {
      const session = await this.kv.get(phoneNumber);
      return session !== null;
    } catch (error) {
      console.error('Error checking session existence:', error);
      return false;
    }
  }
}
