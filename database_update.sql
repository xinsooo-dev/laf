-- Database update script to add email verification and approval workflow
-- Run this script in phpMyAdmin to update your existing database

-- Add new columns to users table
ALTER TABLE `users` 
ADD COLUMN `status` ENUM('pending','verified','approved','rejected') DEFAULT 'pending' AFTER `is_admin`,
ADD COLUMN `verification_token` VARCHAR(255) NULL AFTER `status`,
ADD COLUMN `verified_at` TIMESTAMP NULL DEFAULT NULL AFTER `verification_token`,
ADD COLUMN `approved_at` TIMESTAMP NULL DEFAULT NULL AFTER `verified_at`;

-- Update existing users to have approved status (so they can continue using the system)
UPDATE `users` SET `status` = 'approved', `verified_at` = NOW(), `approved_at` = NOW() WHERE `status` = 'pending';

-- Create index for faster lookups
CREATE INDEX `idx_users_status` ON `users` (`status`);
CREATE INDEX `idx_users_verification_token` ON `users` (`verification_token`);
