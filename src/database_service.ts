import type { ChatMessage, Env } from './types';

export class DatabaseService {
  private db: D1Database;

  constructor(env: Env) {
    this.db = env.DB;
  }

  async saveMessage(
    phoneNumber: string,
    message: string,
    isFromUser: boolean
  ): Promise<string> {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    try {
      await this.db
        .prepare(`
        INSERT INTO chat_messages (id, phone_number, message, timestamp, is_from_user)
        VALUES (?, ?, ?, ?, ?)
      `)
        .bind(id, phoneNumber, message, timestamp, isFromUser ? 1 : 0)
        .run();

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
      const result = await this.db
        .prepare(`
        SELECT id, phone_number, message, timestamp, is_from_user
        FROM chat_messages
        WHERE phone_number = ?
        ORDER BY timestamp DESC
        LIMIT ?
      `)
        .bind(phoneNumber, limit)
        .all();

      return result.results as ChatMessage[];
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
        .prepare(`
        SELECT COUNT(*) as count
        FROM chat_messages
        WHERE phone_number = ?
      `)
        .bind(phoneNumber)
        .first();

      return (result as any)?.count || 0;
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
        .prepare(`
        DELETE FROM chat_messages
        WHERE phone_number = ? AND timestamp < ?
      `)
        .bind(phoneNumber, cutoffDate.toISOString())
        .run();
    } catch (error) {
      console.error('Error deleting old messages:', error);
    }
  }
}
