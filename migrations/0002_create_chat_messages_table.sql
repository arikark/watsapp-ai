-- Create chat_messages table for storing WhatsApp conversations
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    phone_number TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    is_from_user INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Create index for faster queries by phone number
CREATE INDEX IF NOT EXISTS idx_chat_messages_phone_number ON chat_messages(phone_number);

-- Create index for timestamp-based queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

-- Create index for user messages specifically
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(phone_number, is_from_user);
