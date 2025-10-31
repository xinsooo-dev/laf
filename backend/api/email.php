<?php
require_once '../config/database.php';

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Email configuration - Update these with your Gmail SMTP settings
$smtp_host = 'smtp.gmail.com';
$smtp_port = 587;
$smtp_username = 'adrian.layag.2001@gmail.com'; // ← Your actual Gmail
$smtp_password = 'hihdlkteqizdrodl'; // ← Your Gmail App Password
$from_email = 'adrian.layag.2001@gmail.com'; // ← Your actual Gmail
$from_name = 'Norzagaray College Lost & Found';

// Check if PHPMailer exists
if (!file_exists('../phpmailer/src/PHPMailer.php')) {
    echo json_encode(['success' => false, 'message' => 'PHPMailer not found. Please install PHPMailer.']);
    exit;
}

require_once '../phpmailer/src/PHPMailer.php';
require_once '../phpmailer/src/SMTP.php';
require_once '../phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

function sendEmail($to, $subject, $body) {
    global $smtp_host, $smtp_port, $smtp_username, $smtp_password, $from_email, $from_name;

    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host = $smtp_host;
        $mail->SMTPAuth = true;
        $mail->Username = $smtp_username;
        $mail->Password = $smtp_password;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = $smtp_port;

        // Enable SMTP debugging (remove in production)
        $mail->SMTPDebug = 0; // 0 = off, 1 = client messages, 2 = client and server messages
        $mail->Debugoutput = 'error_log';

        // Recipients
        $mail->setFrom($from_email, $from_name);
        $mail->addAddress($to);

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->AltBody = strip_tags($body); // Plain text alternative

        $mail->send();
        return true;

    } catch (PHPMailerException $e) {
        error_log("PHPMailer Error: {$mail->ErrorInfo}");
        return false;
    } catch (Exception $e) {
        error_log("General Error: " . $e->getMessage());
        return false;
    }
}

function generateVerificationToken() {
    return bin2hex(random_bytes(32));
}

// Initialize database connection
$database = new Database();
$pdo = $database->getConnection();

if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'send_verification':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            exit;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $email = $data['email'] ?? '';
        $user_id = $data['user_id'] ?? '';
        
        if (empty($email) || empty($user_id)) {
            echo json_encode(['success' => false, 'message' => 'Email and user ID required']);
            exit;
        }
        
        try {
            // Generate verification token
            $token = generateVerificationToken();
            
            // Update user with verification token
            $stmt = $pdo->prepare("UPDATE users SET verification_token = ? WHERE id = ?");
            $stmt->execute([$token, $user_id]);
            
            // Create verification link
            $verification_link = "http://localhost:5173/verify-email?token=$token";
            
            // Email content
            $subject = "Verify Your Email - Lost & Found System";
            $body = "
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #1e40af; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>Lost & Found System</h1>
                    </div>
                    <div class='content'>
                        <h2>Email Verification Required</h2>
                        <p>Thank you for registering with our Lost & Found System!</p>
                        <p>To complete your registration, please verify your email address by clicking the button below:</p>
                        <a href='$verification_link' class='button'>Verify Email Address</a>
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p>$verification_link</p>
                        <p><strong>Note:</strong> After email verification, your account will be reviewed by our administrators for approval.</p>
                    </div>
                    <div class='footer'>
                        <p>This is an automated message. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>";
            
            // Send email
            if (sendEmail($email, $subject, $body)) {
                echo json_encode(['success' => true, 'message' => 'Verification email sent']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to send verification email']);
            }
            
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
        break;
        
    case 'verify_email':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            exit;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $token = $data['token'] ?? '';
        
        if (empty($token)) {
            echo json_encode(['success' => false, 'message' => 'Verification token required']);
            exit;
        }
        
        try {
            // Find user with this token
            $stmt = $pdo->prepare("SELECT * FROM users WHERE verification_token = ? AND status = 'pending'");
            $stmt->execute([$token]);
            $user = $stmt->fetch();
            
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Invalid or expired verification token']);
                exit;
            }
            
            // Update user status to verified
            $stmt = $pdo->prepare("UPDATE users SET status = 'verified', verified_at = NOW(), verification_token = NULL WHERE id = ?");
            $stmt->execute([$user['id']]);
            
            // Notify admins about new verified user
            notifyAdminsNewUser($user);
            
            echo json_encode(['success' => true, 'message' => 'Email verified successfully. Your account is now pending admin approval.']);
            
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
        break;
        
    case 'approve_user':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            exit;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = $data['user_id'] ?? '';
        $action_type = $data['action_type'] ?? ''; // 'approve' or 'reject'
        
        if (empty($user_id) || empty($action_type)) {
            echo json_encode(['success' => false, 'message' => 'User ID and action type required']);
            exit;
        }
        
        try {
            // Get user details
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? AND status = 'verified'");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch();
            
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'User not found or not verified']);
                exit;
            }
            
            $new_status = $action_type === 'approve' ? 'approved' : 'rejected';
            $approved_at = $action_type === 'approve' ? 'NOW()' : 'NULL';
            
            // Update user status
            $stmt = $pdo->prepare("UPDATE users SET status = ?, approved_at = $approved_at WHERE id = ?");
            $stmt->execute([$new_status, $user_id]);
            
            // Send notification email to user
            $subject = $action_type === 'approve' ? 
                "Account Approved - Lost & Found System" : 
                "Account Application Update - Lost & Found System";
                
            $body = $action_type === 'approve' ? 
                createApprovalEmail($user['full_name']) : 
                createRejectionEmail($user['full_name']);
            
            sendEmail($user['email'], $subject, $body);
            
            echo json_encode(['success' => true, 'message' => "User $action_type" . "d successfully"]);
            
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

function notifyAdminsNewUser($user) {
    global $pdo;
    
    // Get all admin emails
    $stmt = $pdo->prepare("SELECT email, full_name FROM users WHERE is_admin = 1");
    $stmt->execute();
    $admins = $stmt->fetchAll();
    
    $subject = "New User Pending Approval - Lost & Found System";
    $body = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .user-info { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>Admin Notification</h1>
            </div>
            <div class='content'>
                <h2>New User Awaiting Approval</h2>
                <p>A new user has verified their email and is awaiting approval:</p>
                <div class='user-info'>
                    <strong>Name:</strong> {$user['full_name']}<br>
                    <strong>Email:</strong> {$user['email']}<br>
                    <strong>Student ID:</strong> {$user['student_id']}<br>
                    <strong>Phone:</strong> {$user['phone']}<br>
                    <strong>Verified At:</strong> " . date('Y-m-d H:i:s') . "
                </div>
                <p>Please log in to the admin dashboard to approve or reject this user.</p>
            </div>
        </div>
    </body>
    </html>";
    
    foreach ($admins as $admin) {
        sendEmail($admin['email'], $subject, $body);
    }
}

function createApprovalEmail($fullName) {
    return "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>Account Approved!</h1>
            </div>
            <div class='content'>
                <h2>Welcome to Lost & Found System, $fullName!</h2>
                <p>Great news! Your account has been approved by our administrators.</p>
                <p>You can now log in and start using the Lost & Found System to:</p>
                <ul>
                    <li>Report lost items</li>
                    <li>Browse found items</li>
                    <li>Claim items that belong to you</li>
                    <li>Manage your submissions</li>
                </ul>
                <a href='http://localhost:5173/login' class='button'>Login Now</a>
                <p>Thank you for joining our community!</p>
            </div>
        </div>
    </body>
    </html>";
}

function createRejectionEmail($fullName) {
    return "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>Account Application Update</h1>
            </div>
            <div class='content'>
                <h2>Dear $fullName,</h2>
                <p>Thank you for your interest in the Lost & Found System.</p>
                <p>After review, we are unable to approve your account at this time. This may be due to:</p>
                <ul>
                    <li>Incomplete or invalid information provided</li>
                    <li>Account verification requirements not met</li>
                    <li>System access restrictions</li>
                </ul>
                <p>If you believe this is an error or would like to reapply, please contact our administrators.</p>
                <p>Thank you for your understanding.</p>
            </div>
        </div>
    </body>
    </html>";
}
?>
