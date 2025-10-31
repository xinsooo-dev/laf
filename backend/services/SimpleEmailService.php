<?php
require_once __DIR__ . '/../config/email_config.php';

class SimpleEmailService {
    private $config;
    
    public function __construct() {
        $this->config = require __DIR__ . '/../config/email_config.php';
    }
    
    public function sendVerificationEmail($to_email, $full_name, $verification_token) {
        $subject = 'Verify Your Account - Norzagaray College Lost & Found';
        $verification_link = "http://localhost:3000/verify-email?token=" . $verification_token;
        
        $message = $this->getVerificationEmailTemplate($full_name, $verification_link);
        
        // For development, log the email instead of sending
        $this->logEmail($to_email, $subject, $message, 'verification');
        
        // Return true to simulate successful sending
        return true;
    }
    
    public function sendPasswordResetEmail($to_email, $full_name, $reset_token) {
        $subject = 'Password Reset Request - Norzagaray College Lost & Found';
        $reset_link = "http://localhost:3000/reset-password?token=" . $reset_token;
        
        $message = $this->getPasswordResetEmailTemplate($full_name, $reset_link);
        
        // For development, log the email instead of sending
        $this->logEmail($to_email, $subject, $message, 'password_reset');
        
        // Return true to simulate successful sending
        return true;
    }
    
    private function logEmail($to_email, $subject, $message, $type) {
        $log_dir = __DIR__ . '/../logs';
        if (!file_exists($log_dir)) {
            mkdir($log_dir, 0777, true);
        }
        
        $log_file = $log_dir . '/email_log.txt';
        $timestamp = date('Y-m-d H:i:s');
        
        $log_entry = "\n" . str_repeat("=", 80) . "\n";
        $log_entry .= "EMAIL LOG - {$timestamp}\n";
        $log_entry .= "Type: {$type}\n";
        $log_entry .= "To: {$to_email}\n";
        $log_entry .= "Subject: {$subject}\n";
        $log_entry .= str_repeat("-", 40) . "\n";
        $log_entry .= "Message:\n{$message}\n";
        $log_entry .= str_repeat("=", 80) . "\n";
        
        file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
        
        // Also create individual email files for easy viewing
        $email_file = $log_dir . "/email_{$type}_" . date('Y-m-d_H-i-s') . '.html';
        file_put_contents($email_file, $message);
        
        error_log("Email logged: {$type} to {$to_email} - Check {$log_file}");
    }
    
    private function getVerificationEmailTemplate($full_name, $verification_link) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Verify Your Account</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Welcome to Norzagaray College Lost & Found!</h1>
                </div>
                <div class='content'>
                    <h2>Hello $full_name,</h2>
                    <p>Thank you for registering with our Lost & Found system. To complete your registration, please verify your email address by clicking the button below:</p>
                    
                    <div style='text-align: center;'>
                        <a href='$verification_link' class='button'>Verify My Account</a>
                    </div>
                    
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style='word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;'>$verification_link</p>
                    
                    <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
                    
                    <p>Best regards,<br>Norzagaray College Lost & Found Team</p>
                </div>
                <div class='footer'>
                    <p>© 2024 Norzagaray College. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>";
    }
    
    private function getPasswordResetEmailTemplate($full_name, $reset_link) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Password Reset Request</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Password Reset Request</h1>
                </div>
                <div class='content'>
                    <h2>Hello $full_name,</h2>
                    <p>We received a request to reset your password for your Norzagaray College Lost & Found account.</p>
                    
                    <div style='text-align: center;'>
                        <a href='$reset_link' class='button'>Reset My Password</a>
                    </div>
                    
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style='word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;'>$reset_link</p>
                    
                    <div class='warning'>
                        <strong>⚠️ Security Notice:</strong>
                        <ul>
                            <li>This link will expire in 1 hour for security reasons</li>
                            <li>If you didn't request this reset, please ignore this email</li>
                        </ul>
                    </div>
                    
                    <p>Best regards,<br>Norzagaray College Lost & Found Team</p>
                </div>
                <div class='footer'>
                    <p>© 2024 Norzagaray College. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>";
    }
}
?>
