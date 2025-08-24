import { boolean, pgTable, text } from 'drizzle-orm/pg-core';

export const chat_messages = pgTable('chat_messages', {
  id: text('id').primaryKey(),
  phone_number: text('phone_number').notNull(),
  message: text('message').notNull(),
  timestamp: text('timestamp').notNull(),
  is_from_user: boolean('is_from_user').notNull().default(false),
  created_at: text('created_at').default("datetime('now')"),
});
