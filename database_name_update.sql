-- Update users table to separate first_name and last_name
-- Run this in phpMyAdmin after backing up your database

-- Add new columns for first_name and last_name
ALTER TABLE users 
ADD COLUMN first_name VARCHAR(50) AFTER id,
ADD COLUMN last_name VARCHAR(50) AFTER first_name;

-- Migrate existing full_name data to first_name and last_name
-- This will split full_name by the first space
UPDATE users 
SET 
    first_name = CASE 
        WHEN LOCATE(' ', full_name) > 0 
        THEN SUBSTRING(full_name, 1, LOCATE(' ', full_name) - 1)
        ELSE full_name
    END,
    last_name = CASE 
        WHEN LOCATE(' ', full_name) > 0 
        THEN SUBSTRING(full_name, LOCATE(' ', full_name) + 1)
        ELSE ''
    END
WHERE full_name IS NOT NULL AND full_name != '';

-- Make first_name and last_name NOT NULL after migration
ALTER TABLE users 
MODIFY COLUMN first_name VARCHAR(50) NOT NULL,
MODIFY COLUMN last_name VARCHAR(50) NOT NULL;

-- Optional: Remove full_name column after confirming migration worked
-- ALTER TABLE users DROP COLUMN full_name;
