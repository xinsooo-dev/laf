# Email Verification & Admin Approval Setup Guide

## 🚀 Complete Email Verification System Implementation

Your Lost & Found system now includes a complete email verification and admin approval workflow! Here's how it works and how to set it up:

## 📧 How the Email Verification Process Works

### 1. **User Registration Flow:**
```
User Signs Up → Email Verification Sent → User Clicks Link → Account Verified → Admin Approval → User Can Login
```

### 2. **User Status Progression:**
- `pending` - Just registered, needs email verification
- `verified` - Email verified, awaiting admin approval  
- `approved` - Admin approved, can login and use system
- `rejected` - Admin rejected, cannot login

## 🛠️ Setup Instructions

### Step 1: Update Database Schema
1. Open phpMyAdmin in your XAMPP
2. Select your `lostandfound` database
3. Go to SQL tab and run the script in `database_update.sql`:

```sql
-- Add new columns to users table
ALTER TABLE `users` 
ADD COLUMN `status` ENUM('pending','verified','approved','rejected') DEFAULT 'pending' AFTER `is_admin`,
ADD COLUMN `verification_token` VARCHAR(255) NULL AFTER `status`,
ADD COLUMN `verified_at` TIMESTAMP NULL DEFAULT NULL AFTER `verification_token`,
ADD COLUMN `approved_at` TIMESTAMP NULL DEFAULT NULL AFTER `verified_at`;

-- Update existing users to approved status
UPDATE `users` SET `status` = 'approved', `verified_at` = NOW(), `approved_at` = NOW() WHERE `status` = 'pending';

-- Create indexes for performance
CREATE INDEX `idx_users_status` ON `users` (`status`);
CREATE INDEX `idx_users_verification_token` ON `users` (`verification_token`);
```

### Step 2: Configure Email Settings
1. Open `C:\xampp\htdocs\lostandfound-backend\api\email.php`
2. Update these lines with your Gmail credentials:

```php
// Email configuration - Update these with your Gmail SMTP settings
$smtp_host = 'smtp.gmail.com';
$smtp_port = 587;
$smtp_username = 'your-email@gmail.com'; // Replace with your Gmail
$smtp_password = 'your-app-password'; // Replace with your Gmail App Password
$from_email = 'your-email@gmail.com'; // Replace with your Gmail
$from_name = 'Lost & Found System';
```

### Step 3: Set Up Gmail App Password
1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled
3. Go to Security → App passwords
4. Generate an app password for "Mail"
5. Use this app password (not your regular Gmail password) in the PHP config

### Step 4: Test the System
1. Make sure XAMPP Apache and MySQL are running
2. Start your React app: `npm run dev`
3. Try registering a new user
4. Check your email for verification link
5. Login as admin to approve/reject users

## 🔧 New Features Added

### Frontend Components:
- **EmailVerification.jsx** - Handles email verification from links
- **ManageUsers.jsx** - Admin interface for approving/rejecting users
- Updated **Signup.jsx** - Now sends verification emails
- Updated **Login.jsx** - Checks user status before allowing login

### Backend APIs:
- **email.php** - Handles email sending and verification
- **users.php** - Manages user data and statistics
- Updated **auth.php** - Includes status checks in login

### Admin Dashboard:
- New "User Management" tab to approve/reject pending users
- Real-time user statistics and status tracking

## 📱 User Experience

### For New Users:
1. Sign up with email, password, and optional details
2. Receive verification email with secure link
3. Click link to verify email address
4. Wait for admin approval notification
5. Login once approved

### For Admins:
1. Receive email notifications when users verify their email
2. Use Admin Dashboard → User Management to review pending users
3. Approve or reject users with one click
4. Users automatically receive approval/rejection emails

## 🔒 Security Features

- **Secure tokens** - Random 64-character verification tokens
- **Status validation** - Multiple status checks prevent unauthorized access
- **Email verification** - Ensures valid email addresses
- **Admin approval** - Manual review process for account security
- **Automatic cleanup** - Tokens are cleared after verification

## 🚨 Important Notes

1. **Email Configuration Required**: The system won't send emails until you configure Gmail credentials
2. **Existing Users**: All existing users are automatically marked as "approved" to maintain system functionality
3. **Admin Access**: Admins bypass the approval process and can login immediately
4. **Error Handling**: Comprehensive error messages guide users through each step

## 📊 Admin Dashboard Features

The new User Management section provides:
- List of all users pending approval
- User details (name, email, student ID, phone, registration date)
- One-click approve/reject buttons
- Automatic email notifications to users
- Real-time status updates

## 🔄 Email Templates

The system includes professional email templates for:
- **Verification emails** - Clean, branded verification links
- **Admin notifications** - Alerts when users need approval
- **Approval emails** - Welcome messages for approved users
- **Rejection emails** - Polite rejection notifications

Your Lost & Found system now has enterprise-grade user management with email verification and admin approval workflows! 🎉
