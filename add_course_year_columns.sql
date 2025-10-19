-- Add course and year columns to users table
ALTER TABLE users 
ADD COLUMN course VARCHAR(100) DEFAULT NULL,
ADD COLUMN year VARCHAR(10) DEFAULT NULL;

-- Update existing users with sample data
UPDATE users SET course = 'Computer Science', year = '4th Year' WHERE id = 2;
UPDATE users SET course = 'Information Technology', year = '3rd Year' WHERE id = 3;
UPDATE users SET course = 'Administration', year = 'Staff' WHERE id = 1;
