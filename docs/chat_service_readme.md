# ChatService - Chunked Storage Implementation

## Overview

The ChatService now uses a **chunked storage approach** to efficiently manage chat messages in Cloudflare KV. This approach provides better performance, scalability, and memory efficiency compared to storing all messages as a single value.

## How It Works

### Storage Structure

Messages are automatically split into chunks of 50 messages each:

- **Metadata**: `metadata:phoneNumber` - Stores conversation statistics
- **Chunks**: `chunk:phoneNumber:0`, `chunk:phoneNumber:1`, etc. - Store actual messages

### Key Benefits

✅ **Scalable**: No size limits on conversations
✅ **Performance**: Only loads needed chunks for AI context
✅ **Memory Efficient**: Loads only recent messages
✅ **Concurrency Safe**: Atomic chunk operations
✅ **Easy Cleanup**: Delete entire chunks instead of filtering

## Usage

### Basic Operations

```typescript
import { ChatService } from '../kv/chat-service';

const chatService = new ChatService(env.watsapp_ai_chats);

// Store messages (automatically chunked)
await chatService.storeMessage('+1234567890', 'Hello!', true);
await chatService.storeMessage('+1234567890', 'Hi there!', false);

// Get message count
const count = await chatService.getMessageCount('+1234567890');

// Get recent messages for AI
const messages = await chatService.getMessagesForAI('+1234567890', 10);

// Get formatted conversation history
const history = await chatService.getConversationHistoryForAI('+1234567890', 5);
```

### Advanced Operations

```typescript
// Get metadata about the conversation
const metadata = await chatService.getMetadata('+1234567890');
console.log(`Total messages: ${metadata.totalMessages}`);
console.log(`Total chunks: ${metadata.totalChunks}`);

// Get a specific chunk
const chunk = await chatService.getChunk('+1234567890', 0);

// Delete old messages
const deleted = await chatService.deleteOldMessages('+1234567890', 30);

// Delete all messages
await chatService.deleteAllMessages('+1234567890');
```

## Data Structures

### ChatMessage
```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  messageId: string;
}
```

### ChatMetadata
```typescript
interface ChatMetadata {
  phoneNumber: string;
  totalMessages: number;
  totalChunks: number;
  lastMessageTimestamp: string;
  lastUpdated: string;
}
```

### ChatChunk
```typescript
interface ChatChunk {
  messages: ChatMessage[];
  chunkIndex: number;
  phoneNumber: string;
  createdAt: string;
  messageCount: number;
}
```

## Performance Characteristics

| Operation | Performance | Notes |
|-----------|-------------|-------|
| **Store Message** | O(1) | Two KV writes (chunk + metadata) |
| **Get Recent Messages** | O(1) | Only loads recent chunks |
| **Get Message Count** | O(1) | Single metadata read |
| **Delete Old Messages** | O(chunks) | Processes chunks efficiently |
| **Get Full History** | O(chunks) | Loads all chunks |

## Configuration

### Chunk Size
Default: 50 messages per chunk
```typescript
private readonly MESSAGES_PER_CHUNK = 50;
```

### TTL (Time To Live)
Default: 90 days
```typescript
private readonly TTL_DAYS = 90;
```

## Migration from Single Value Storage

If you have existing data in the old single-value format, you can migrate it:

```typescript
async function migrateToChunkedStorage(
  oldService: ChatService,
  newService: ChatService,
  phoneNumber: string
): Promise<void> {
  // This would require implementing a method to read old format
  // and replay messages to new chunked format
}
```

## Best Practices

1. **Use Recent Messages for AI**: Only get the last 5-10 messages for AI context
2. **Regular Cleanup**: Run `deleteOldMessages` periodically to manage storage
3. **Monitor Chunk Count**: Large conversations will have many chunks
4. **Error Handling**: Always wrap operations in try-catch blocks

## Integration with WhatsApp AI

The ChatService is already integrated into your WhatsApp AI application:

```typescript
// In processMessage function
const chatService = new ChatService(env.watsapp_ai_chats);

// Store user message
await chatService.storeMessage(from, message, true);

// Get conversation history for AI
const conversationHistory = await chatService.getConversationHistoryForAI(from, 5);

// Store AI response
await chatService.storeMessage(from, aiResponse, false);
```

## Monitoring and Debugging

### Log Messages
The service provides detailed logging:
```
Message stored for +1234567890: user message (chunk 0, total: 1)
Message stored for +1234567890: assistant message (chunk 0, total: 2)
Deleted 15 old messages for +1234567890
```

### Key Patterns
- Metadata: `metadata:phoneNumber`
- Chunks: `chunk:phoneNumber:0`, `chunk:phoneNumber:1`, etc.

### Common Issues
1. **Missing metadata**: Check if metadata key exists
2. **Chunk not found**: Verify chunk index calculation
3. **Performance issues**: Consider reducing chunk size for very active conversations
