import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const chat_messages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  phone_number: text('phone_number').notNull(),
  message: text('message').notNull(),
  timestamp: text('timestamp').notNull(),
  is_from_user: integer('is_from_user', { mode: 'boolean' })
    .notNull()
    .default(false),
  created_at: text('created_at').default('datetime(\'now\')'),
});

export type ChatMessage = typeof chat_messages.$inferSelect;
export type NewChatMessage = typeof chat_messages.$inferInsert;
