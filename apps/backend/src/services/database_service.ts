import { count, desc, eq, lt } from 'drizzle-orm';
import { createDb } from '../db-delete/db';
import { chat_messages } from '../db-delete/schema';
import type { ChatMessage, NewChatMessage } from '../db-delete/types';

export class DatabaseService {
  private db: ReturnType<typeof createDb>;

  constructor(env: Env) {
    this.db = createDb(env.DATABASE_URL);
  }

  async saveMessage(
    phoneNumber: string,
    message: string,
    isFromUser: boolean
  ): Promise<string> {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    try {
      const newMessage: NewChatMessage = {
        id,
        phone_number: phoneNumber,
        message,
        timestamp,
        is_from_user: isFromUser,
      };

      await this.db.insert(chat_messages).values(newMessage);
      return id;
    } catch (error) {
      console.error('Error saving message to database:', error);
      throw error;
    }
  }

  async getConversationHistory(
    phoneNumber: string,
    limit: number = 10
  ): Promise<ChatMessage[]> {
    try {
      const messages = await this.db
        .select()
        .from(chat_messages)
        .where(eq(chat_messages.phone_number, phoneNumber))
        .orderBy(desc(chat_messages.timestamp))
        .limit(limit);

      return messages;
    } catch (error) {
      console.error('Error retrieving conversation history:', error);
      return [];
    }
  }

  async getConversationHistoryForAI(
    phoneNumber: string,
    limit: number = 5
  ): Promise<string> {
    try {
      const messages = await this.getConversationHistory(phoneNumber, limit);

      // Reverse to get chronological order and format for AI context
      const formattedHistory = messages
        .reverse()
        .map((msg) => `${msg.is_from_user ? 'User' : 'AI'}: ${msg.message}`)
        .join('\n');

      return formattedHistory;
    } catch (error) {
      console.error('Error formatting conversation history for AI:', error);
      return '';
    }
  }

  async getMessageCount(phoneNumber: string): Promise<number> {
    try {
      const result = await this.db
        .select({ count: count() })
        .from(chat_messages)
        .where(eq(chat_messages.phone_number, phoneNumber));

      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting message count:', error);
      return 0;
    }
  }

  async deleteOldMessages(
    phoneNumber: string,
    daysToKeep: number = 30
  ): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      await this.db
        .delete(chat_messages)
        .where(
          eq(chat_messages.phone_number, phoneNumber) &&
            lt(chat_messages.timestamp, cutoffDate.toISOString())
        );
    } catch (error) {
      console.error('Error deleting old messages:', error);
    }
  }
}
