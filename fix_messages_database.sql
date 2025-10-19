-- Comprehensive fix for messages table database issues
-- This script ensures all required columns exist and have correct structure

-- First, check if messages table exists, if not create it
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NULL,
    conversation_id VARCHAR(100) NOT NULL DEFAULT 'default',
    subject VARCHAR(255) NULL,
    message TEXT NOT NULL,
    attachment_path VARCHAR(500) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add missing columns if they don't exist (ignore errors if they already exist)
-- Add conversation_id column
ALTER TABLE messages ADD COLUMN conversation_id VARCHAR(100) NOT NULL DEFAULT 'default' AFTER receiver_id;

-- Add attachment_path column  
ALTER TABLE messages ADD COLUMN attachment_path VARCHAR(500) NULL AFTER message;

-- Make sure subject is nullable
ALTER TABLE messages MODIFY COLUMN subject VARCHAR(255) NULL;

-- Make sure is_read column exists with correct type
ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE AFTER attachment_path;

-- Add indexes for performance (ignore errors if they exist)
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_messages_read ON messages(is_read);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);

-- Update any existing messages with default conversation IDs
UPDATE messages 
SET conversation_id = CONCAT('user_', sender_id, '_', UNIX_TIMESTAMP(created_at))
WHERE conversation_id = 'default' OR conversation_id = '' OR conversation_id IS NULL;
