import { ChatService } from '../kv/chat-service';

// Example usage of ChatService with chunked storage
export async function chatServiceExample(env: Env) {
  const chatService = new ChatService(env.watsapp_ai_chats);
  const phoneNumber = '+1234567890';

  try {
    // 1. Store messages (will be automatically chunked)
    console.log('Storing messages...');
    await chatService.storeMessage(phoneNumber, 'Hello, how are you?', true);
    await chatService.storeMessage(
      phoneNumber,
      'I am doing well, thank you!',
      false
    );
    await chatService.storeMessage(
      phoneNumber,
      'Can you help me with a question?',
      true
    );
    await chatService.storeMessage(
      phoneNumber,
      "Of course! I'd be happy to help.",
      false
    );

    // 2. Get message count
    const messageCount = await chatService.getMessageCount(phoneNumber);
    console.log(`Total messages for ${phoneNumber}: ${messageCount}`);

    // 3. Get metadata
    const metadata = await chatService.getMetadata(phoneNumber);
    console.log('Chat metadata:', metadata);

    // 4. Get messages in OpenAI format
    const messagesForAI = await chatService.getMessagesForAI(phoneNumber, 3);
    console.log('Messages for AI (last 3):', messagesForAI);

    // 5. Get conversation history as formatted string
    const formattedHistory = await chatService.getConversationHistoryForAI(
      phoneNumber,
      2
    );
    console.log('Formatted history for AI:', formattedHistory);

    // 6. Get last message
    const lastMessage = await chatService.getLastMessage(phoneNumber);
    console.log('Last message:', lastMessage);

    // 7. Check if chat history exists
    const hasHistory = await chatService.hasChatHistory(phoneNumber);
    console.log(`Has chat history: ${hasHistory}`);

    // 8. Delete old messages (keep only last 7 days)
    const deletedCount = await chatService.deleteOldMessages(phoneNumber, 7);
    console.log(`Deleted ${deletedCount} old messages`);

    // 9. Get updated message count
    const updatedCount = await chatService.getMessageCount(phoneNumber);
    console.log(`Updated message count: ${updatedCount}`);
  } catch (error) {
    console.error('Error in chat service example:', error);
  }
}

// Example of bulk operations
export async function bulkChatOperations(env: Env) {
  const chatService = new ChatService(env.watsapp_ai_chats);
  const phoneNumbers = ['+1234567890', '+0987654321', '+5555555555'];

  try {
    // Store messages for multiple phone numbers
    for (const phoneNumber of phoneNumbers) {
      await chatService.storeMessage(phoneNumber, 'Welcome message!', false);
      await chatService.storeMessage(phoneNumber, 'Thank you!', true);
    }

    // Get message counts for all phone numbers
    for (const phoneNumber of phoneNumbers) {
      const count = await chatService.getMessageCount(phoneNumber);
      console.log(`${phoneNumber}: ${count} messages`);
    }

    // Clean up old messages for all phone numbers
    for (const phoneNumber of phoneNumbers) {
      const deleted = await chatService.deleteOldMessages(phoneNumber, 30);
      if (deleted > 0) {
        console.log(`Cleaned up ${deleted} old messages for ${phoneNumber}`);
      }
    }
  } catch (error) {
    console.error('Error in bulk operations:', error);
  }
}

// Example demonstrating chunked storage benefits
export async function chunkedStorageExample(env: Env) {
  const chatService = new ChatService(env.watsapp_ai_chats);
  const phoneNumber = '+1234567890';

  try {
    console.log('Demonstrating chunked storage...');

    // Store many messages to create multiple chunks
    for (let i = 1; i <= 120; i++) {
      await chatService.storeMessage(
        phoneNumber,
        `Message ${i} from user`,
        true
      );
      await chatService.storeMessage(
        phoneNumber,
        `Response ${i} from AI`,
        false
      );
    }

    // Get metadata to see chunk information
    const metadata = await chatService.getMetadata(phoneNumber);
    console.log('Metadata after 240 messages:', {
      totalMessages: metadata?.totalMessages,
      totalChunks: metadata?.totalChunks,
      lastMessageTimestamp: metadata?.lastMessageTimestamp,
    });

    // Demonstrate efficient retrieval of recent messages
    console.log('Getting recent messages for AI context...');
    const startTime = Date.now();
    const recentMessages = await chatService.getMessagesForAI(phoneNumber, 10);
    const endTime = Date.now();

    console.log(
      `Retrieved ${recentMessages.length} recent messages in ${endTime - startTime}ms`
    );
    console.log(
      'Recent messages:',
      recentMessages.map((m) => `${m.role}: ${m.content.substring(0, 20)}...`)
    );

    // Show that we can still get message count efficiently
    const messageCount = await chatService.getMessageCount(phoneNumber);
    console.log(`Total message count: ${messageCount}`);

    // Demonstrate chunk cleanup
    console.log('Cleaning up old messages...');
    const deletedCount = await chatService.deleteOldMessages(phoneNumber, 1); // Keep only last day
    console.log(`Deleted ${deletedCount} old messages`);

    // Show updated metadata
    const updatedMetadata = await chatService.getMetadata(phoneNumber);
    console.log('Updated metadata:', {
      totalMessages: updatedMetadata?.totalMessages,
      totalChunks: updatedMetadata?.totalChunks,
    });
  } catch (error) {
    console.error('Error in chunked storage example:', error);
  }
}
