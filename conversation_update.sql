-- Add conversation_id column to existing messages table for threading
ALTER TABLE messages ADD COLUMN conversation_id VARCHAR(100) NOT NULL DEFAULT 'default' AFTER receiver_id;

-- Make subject nullable since only first message needs subject
ALTER TABLE messages MODIFY COLUMN subject VARCHAR(255) NULL;

-- Add index for conversation queries
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
