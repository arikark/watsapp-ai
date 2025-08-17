-- Drizzle setup migration for existing chat_messages table
-- This migration ensures the table structure is compatible with Drizzle ORM

-- Add any missing indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_chat_messages_phone_number ON chat_messages(phone_number);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(phone_number, is_from_user);
