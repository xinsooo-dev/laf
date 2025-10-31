<?php
// Check if PHPMailer files exist
if (!file_exists('phpmailer/src/PHPMailer.php')) {
    die('PHPMailer not found. Please make sure PHPMailer is installed in the phpmailer directory.');
}

require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';
require 'phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

echo "Starting email test...<br>";

$mail = new PHPMailer(true);

try {
    //Server settings
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com'; // SMTP server ng Gmail
    $mail->SMTPAuth = true;
    $mail->Username = 'adrian.layag.2001@gmail.com'; // Gmail mo
    $mail->Password = 'hihdlkteqizdrodl';   // Gmail App Password (hindi yung normal password)
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    //Recipients
    $mail->setFrom('adrian.layag.2001@gmail.com', 'Norzagaray College Lost and Found');
    $mail->addAddress('adrian.layag.2001@gmail.com');

    //Content
    $mail->isHTML(true);
    $mail->Subject = 'Test Email from PHPMailer';
    $mail->Body = '<h1>Hello!</h1>This is a test email using <b>PHPMailer + Composer</b>.';

    $mail->send();
    echo 'Message has been sent ✅';
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}