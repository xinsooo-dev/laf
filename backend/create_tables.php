<?php
require_once 'config/database.php';

echo "Creating database tables for email system...\n\n";

$database = new Database();
$db = $database->getConnection();

try {
    // Create password_resets table
    echo "1. Creating password_resets table...\n";
    $sql1 = "CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(64) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at)
    )";
    
    $db->exec($sql1);
    echo "✅ password_resets table created successfully\n\n";

    // Check if verification_token column exists
    echo "2. Checking users table structure...\n";
    $check_columns = "SHOW COLUMNS FROM users LIKE 'verification_token'";
    $result = $db->query($check_columns);
    
    if ($result->rowCount() == 0) {
        echo "Adding verification_token column...\n";
        $sql2 = "ALTER TABLE users ADD COLUMN verification_token VARCHAR(64) NULL";
        $db->exec($sql2);
        echo "✅ verification_token column added\n";
    } else {
        echo "✅ verification_token column already exists\n";
    }

    // Check if status column exists
    $check_status = "SHOW COLUMNS FROM users LIKE 'status'";
    $result = $db->query($check_status);
    
    if ($result->rowCount() == 0) {
        echo "Adding status column...\n";
        $sql3 = "ALTER TABLE users ADD COLUMN status ENUM('pending', 'verified', 'approved', 'rejected') DEFAULT 'pending'";
        $db->exec($sql3);
        echo "✅ status column added\n";
    } else {
        echo "✅ status column already exists\n";
    }

    // Add indexes
    echo "\n3. Adding indexes...\n";
    try {
        $sql4 = "ALTER TABLE users ADD INDEX idx_verification_token (verification_token)";
        $db->exec($sql4);
        echo "✅ verification_token index added\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
            echo "✅ verification_token index already exists\n";
        } else {
            throw $e;
        }
    }

    echo "\n✅ All database tables and columns created successfully!\n";
    
    // Show current users table structure
    echo "\n4. Current users table structure:\n";
    $describe = $db->query("DESCRIBE users");
    while ($row = $describe->fetch(PDO::FETCH_ASSOC)) {
        echo "- {$row['Field']}: {$row['Type']} {$row['Null']} {$row['Key']} {$row['Default']}\n";
    }

} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}
?>
