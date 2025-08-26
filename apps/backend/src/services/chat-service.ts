export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  messageId: string;
}

export interface ChatChunk {
  messages: ChatMessage[];
  chunkIndex: number;
  phoneNumber: string;
  createdAt: string;
  messageCount: number;
}

export interface ChatMetadata {
  phoneNumber: string;
  totalMessages: number;
  totalChunks: number;
  lastMessageTimestamp: string;
  lastUpdated: string;
}

export class ChatService {
  private kv: KVNamespace;
  private readonly TTL_DAYS = 90;
  private readonly TTL_SECONDS = this.TTL_DAYS * 24 * 60 * 60;
  private readonly MESSAGES_PER_CHUNK = 50; // Store 50 messages per chunk

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  private getMetadataKey(phoneNumber: string): string {
    return `metadata:${phoneNumber}`;
  }

  private getChunkKey(phoneNumber: string, chunkIndex: number): string {
    return `chunk:${phoneNumber}:${chunkIndex}`;
  }

  /**
   * Store a chat message using chunked storage
   */
  async storeMessage(
    phoneNumber: string,
    message: string,
    isFromUser: boolean
  ): Promise<void> {
    try {
      const role: 'user' | 'assistant' = isFromUser ? 'user' : 'assistant';
      const timestamp = new Date().toISOString();
      const messageId = crypto.randomUUID();

      const chatMessage: ChatMessage = {
        role,
        content: message,
        timestamp,
        messageId,
      };

      // Get or create metadata
      const metadata = (await this.getMetadata(phoneNumber)) || {
        phoneNumber,
        totalMessages: 0,
        totalChunks: 0,
        lastMessageTimestamp: timestamp,
        lastUpdated: timestamp,
      };

      // Calculate which chunk this message belongs to
      const chunkIndex = Math.floor(
        metadata.totalMessages / this.MESSAGES_PER_CHUNK
      );

      // Get or create the chunk
      const chunkKey = this.getChunkKey(phoneNumber, chunkIndex);
      const existingChunk = await this.getChunk(phoneNumber, chunkIndex);

      const chunk: ChatChunk = existingChunk || {
        messages: [],
        chunkIndex,
        phoneNumber,
        createdAt: timestamp,
        messageCount: 0,
      };

      // Add message to chunk
      chunk.messages.push(chatMessage);
      chunk.messageCount = chunk.messages.length;

      // Update metadata
      metadata.totalMessages++;
      metadata.lastMessageTimestamp = timestamp;
      metadata.lastUpdated = timestamp;

      // If this is a new chunk, increment total chunks
      if (!existingChunk) {
        metadata.totalChunks++;
      }

      // Store chunk and metadata with TTL
      await Promise.all([
        this.kv.put(chunkKey, JSON.stringify(chunk), {
          expirationTtl: this.TTL_SECONDS,
        }),
        this.kv.put(
          this.getMetadataKey(phoneNumber),
          JSON.stringify(metadata),
          {
            expirationTtl: this.TTL_SECONDS,
          }
        ),
      ]);

      console.log(
        `Message stored for ${phoneNumber}: ${role} message (chunk ${chunkIndex}, total: ${metadata.totalMessages})`
      );
    } catch (error) {
      console.error('Error storing chat message:', error);
      throw error;
    }
  }

  /**
   * Get metadata for a phone number
   */
  async getMetadata(phoneNumber: string): Promise<ChatMetadata | null> {
    try {
      const metadataData = await this.kv.get(this.getMetadataKey(phoneNumber));
      return metadataData ? JSON.parse(metadataData) : null;
    } catch (error) {
      console.error('Error retrieving metadata:', error);
      return null;
    }
  }

  /**
   * Get a specific chunk
   */
  async getChunk(
    phoneNumber: string,
    chunkIndex: number
  ): Promise<ChatChunk | null> {
    try {
      const chunkData = await this.kv.get(
        this.getChunkKey(phoneNumber, chunkIndex)
      );
      return chunkData ? JSON.parse(chunkData) : null;
    } catch (error) {
      console.error('Error retrieving chunk:', error);
      return null;
    }
  }

  /**
   * Get message count
   */
  async getMessageCount(phoneNumber: string): Promise<number> {
    try {
      const metadata = await this.getMetadata(phoneNumber);
      return metadata?.totalMessages || 0;
    } catch (error) {
      console.error('Error getting message count:', error);
      return 0;
    }
  }

  /**
   * Get recent messages for AI processing
   */
  async getMessagesForAI(
    phoneNumber: string,
    limit: number = 10
  ): Promise<ChatMessage[]> {
    try {
      const metadata = await this.getMetadata(phoneNumber);

      if (!metadata || metadata.totalMessages === 0) {
        return [];
      }

      const messages: ChatMessage[] = [];
      const startChunk = Math.max(
        0,
        metadata.totalChunks - Math.ceil(limit / this.MESSAGES_PER_CHUNK)
      );

      // Get messages from the most recent chunks
      for (let i = startChunk; i < metadata.totalChunks; i++) {
        const chunk = await this.getChunk(phoneNumber, i);
        if (chunk) {
          messages.push(...chunk.messages);
        }
      }

      // Return the most recent messages up to the limit
      return messages.slice(-limit);
    } catch (error) {
      console.error('Error getting messages for AI:', error);
      return [];
    }
  }

  /**
   * Delete old messages by date
   */
  async deleteOldMessages(
    phoneNumber: string,
    daysToKeep: number = 30
  ): Promise<number> {
    try {
      const metadata = await this.getMetadata(phoneNumber);

      if (!metadata || metadata.totalMessages === 0) {
        return 0;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      let totalDeleted = 0;
      const newMetadata = { ...metadata };

      // Process each chunk
      for (let i = 0; i < metadata.totalChunks; i++) {
        const chunk = await this.getChunk(phoneNumber, i);
        if (!chunk) continue;

        const originalCount = chunk.messages.length;
        const filteredMessages = chunk.messages.filter(
          (message) => new Date(message.timestamp) >= cutoffDate
        );

        const deletedInChunk = originalCount - filteredMessages.length;
        totalDeleted += deletedInChunk;

        if (filteredMessages.length === 0) {
          // Delete entire chunk if no messages remain
          await this.kv.delete(this.getChunkKey(phoneNumber, i));
          newMetadata.totalChunks--;
        } else if (deletedInChunk > 0) {
          // Update chunk with filtered messages
          const updatedChunk: ChatChunk = {
            ...chunk,
            messages: filteredMessages,
            messageCount: filteredMessages.length,
          };

          await this.kv.put(
            this.getChunkKey(phoneNumber, i),
            JSON.stringify(updatedChunk),
            {
              expirationTtl: this.TTL_SECONDS,
            }
          );
        }
      }

      // Update metadata
      newMetadata.totalMessages -= totalDeleted;
      newMetadata.lastUpdated = new Date().toISOString();

      await this.kv.put(
        this.getMetadataKey(phoneNumber),
        JSON.stringify(newMetadata),
        {
          expirationTtl: this.TTL_SECONDS,
        }
      );

      console.log(`Deleted ${totalDeleted} old messages for ${phoneNumber}`);
      return totalDeleted;
    } catch (error) {
      console.error('Error deleting old messages:', error);
      return 0;
    }
  }

  /**
   * Delete all messages for a phone number
   */
  async deleteAllMessages(phoneNumber: string): Promise<boolean> {
    try {
      const metadata = await this.getMetadata(phoneNumber);
      if (!metadata) return true;

      // Delete all chunks
      for (let i = 0; i < metadata.totalChunks; i++) {
        await this.kv.delete(this.getChunkKey(phoneNumber, i));
      }

      // Delete metadata
      await this.kv.delete(this.getMetadataKey(phoneNumber));

      console.log(`All messages deleted for ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error('Error deleting all messages:', error);
      return false;
    }
  }

  /**
   * Get conversation history as formatted string
   */
  async getConversationHistoryForAI(
    phoneNumber: string,
    limit: number = 5
  ): Promise<string> {
    try {
      const messages = await this.getMessagesForAI(phoneNumber, limit);

      if (!messages.length) {
        return '';
      }

      const formattedHistory = messages
        .map((msg) => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
        .join('\n');

      return formattedHistory;
    } catch (error) {
      console.error('Error formatting conversation history for AI:', error);
      return '';
    }
  }

  /**
   * Get the last message from a conversation
   */
  async getLastMessage(phoneNumber: string): Promise<ChatMessage | null> {
    try {
      const metadata = await this.getMetadata(phoneNumber);
      if (!metadata || metadata.totalMessages === 0) {
        return null;
      }

      // Get the last chunk
      const lastChunkIndex = metadata.totalChunks - 1;
      const lastChunk = await this.getChunk(phoneNumber, lastChunkIndex);

      if (!lastChunk || !lastChunk.messages.length) {
        return null;
      }

      return lastChunk.messages[lastChunk.messages.length - 1] || null;
    } catch (error) {
      console.error('Error getting last message:', error);
      return null;
    }
  }

  /**
   * Check if a phone number has any chat history
   */
  async hasChatHistory(phoneNumber: string): Promise<boolean> {
    try {
      const metadata = await this.getMetadata(phoneNumber);
      return metadata !== null && metadata.totalMessages > 0;
    } catch (error) {
      console.error('Error checking chat history existence:', error);
      return false;
    }
  }
}
