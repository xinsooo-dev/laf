-- Migration script for existing messages table
-- Both attachment_path and conversation_id columns already exist

-- Step 1: Make subject nullable 
ALTER TABLE messages MODIFY COLUMN subject VARCHAR(255) NULL;

-- Step 2: Add indexes for better performance (ignore errors if they exist)
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_read ON messages(is_read);

-- Step 3: Update existing messages with conversation IDs
UPDATE messages 
SET conversation_id = CONCAT('user_', sender_id, '_', UNIX_TIMESTAMP(created_at))
WHERE conversation_id = 'default' OR conversation_id = '';
