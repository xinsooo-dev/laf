-- Update existing messages to have proper conversation IDs
-- This groups existing messages by sender and creates conversation threads

UPDATE messages 
SET conversation_id = CONCAT('user_', sender_id, '_', UNIX_TIMESTAMP(created_at))
WHERE conversation_id = 'default';

-- Alternative: Group by sender and subject for better threading
-- UPDATE messages 
-- SET conversation_id = CONCAT('user_', sender_id, '_', MD5(CONCAT(sender_id, COALESCE(subject, 'no_subject'))))
-- WHERE conversation_id = 'default';
