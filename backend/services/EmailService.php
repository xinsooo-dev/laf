<?php
require_once __DIR__ . '/../config/email_config.php';

class EmailService {
    private $config;
    
    public function __construct() {
        $this->config = require __DIR__ . '/../config/email_config.php';
    }
    
    private function createMailer() {
        $mail = new PHPMailer(true);
        
        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host = $this->config['smtp_host'];
            $mail->SMTPAuth = true;
            $mail->Username = $this->config['smtp_username'];
            $mail->Password = $this->config['smtp_password'];
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = $this->config['smtp_port'];
            
            // Recipients
            $mail->setFrom($this->config['from_email'], $this->config['from_name']);
            $mail->addReplyTo($this->config['reply_to'], $this->config['from_name']);
            
            // Content
            $mail->isHTML(true);
            $mail->CharSet = 'UTF-8';
            
            return $mail;
        } catch (Exception $e) {
            error_log("Mailer Error: " . $e->getMessage());
            return false;
        }
    }
    
    public function sendVerificationEmail($to_email, $full_name, $verification_token) {
        try {
            $mail = $this->createMailer();
            if (!$mail) return false;
            
            $mail->addAddress($to_email, $full_name);
            
            $mail->Subject = 'Verify Your Account - Norzagaray College Lost & Found';
            
            $verification_link = "http://localhost:3000/verify-email?token=" . $verification_token;
            
            $mail->Body = $this->getVerificationEmailTemplate($full_name, $verification_link);
            $mail->AltBody = "Hello $full_name,\n\nPlease verify your account by clicking this link: $verification_link\n\nThank you!";
            
            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Email sending failed: " . $e->getMessage());
            return false;
        }
    }
    
    public function sendPasswordResetEmail($to_email, $full_name, $reset_token) {
        try {
            $mail = $this->createMailer();
            if (!$mail) return false;
            
            $mail->addAddress($to_email, $full_name);
            
            $mail->Subject = 'Password Reset Request - Norzagaray College Lost & Found';
            
            $reset_link = "http://localhost:3000/reset-password?token=" . $reset_token;
            
            $mail->Body = $this->getPasswordResetEmailTemplate($full_name, $reset_link);
            $mail->AltBody = "Hello $full_name,\n\nClick this link to reset your password: $reset_link\n\nThis link will expire in 1 hour.";
            
            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Email sending failed: " . $e->getMessage());
            return false;
        }
    }
    
    private function getVerificationEmailTemplate($full_name, $verification_link) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
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
                    
                    <p>If you didn't create an account with us, please ignore this email.</p>
                    
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
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
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
                            <li>Your password will remain unchanged until you click the link above</li>
                        </ul>
                    </div>
                    
                    <p>For security reasons, we recommend:</p>
                    <ul>
                        <li>Using a strong, unique password</li>
                        <li>Not sharing your login credentials</li>
                        <li>Logging out from shared computers</li>
                    </ul>
                    
                    <p>If you have any concerns about your account security, please contact our support team immediately.</p>
                    
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
