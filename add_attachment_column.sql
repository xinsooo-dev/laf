-- Add attachment_path column to existing messages table
ALTER TABLE messages ADD COLUMN attachment_path VARCHAR(500) NULL AFTER message;
