import type { chat_messages } from './schema';

export type ChatMessage = typeof chat_messages.$inferSelect;
export type NewChatMessage = typeof chat_messages.$inferInsert;
