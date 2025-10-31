<?php
/**
 * Database Setup Script for Lost and Found System
 * This script will create all necessary tables and sample data
 */

require_once 'config/database.php';

echo "<!DOCTYPE html>";
echo "<html><head><title>Lost & Found Database Setup</title>";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .success { color: #27ae60; background: #d5f4e6; padding: 10px; border-radius: 5px; margin: 10px 0; }
    .error { color: #e74c3c; background: #fdf2f2; padding: 10px; border-radius: 5px; margin: 10px 0; }
    .info { color: #3498db; background: #ebf3fd; padding: 10px; border-radius: 5px; margin: 10px 0; }
    .warning { color: #f39c12; background: #fef9e7; padding: 10px; border-radius: 5px; margin: 10px 0; }
    h1 { color: #2c3e50; text-align: center; }
    h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    .step { margin: 20px 0; padding: 15px; border-left: 4px solid #3498db; background: #f8f9fa; }
    .btn { display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
    .btn:hover { background: #2980b9; }
    pre { background: #2c3e50; color: #ecf0f1; padding: 15px; border-radius: 5px; overflow-x: auto; }
    .table-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 20px 0; }
    .table-item { background: #ecf0f1; padding: 10px; border-radius: 5px; text-align: center; }
</style></head><body>";

echo "<div class='container'>";
echo "<h1>🔍 Lost & Found Database Setup</h1>";

try {
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Could not connect to database. Please check your XAMPP MySQL service.");
    }
    
    echo "<div class='success'>✅ Connected to database successfully!</div>";
    
    // Read and execute SQL file
    $sqlFile = __DIR__ . '/create_complete_database.sql';
    
    if (!file_exists($sqlFile)) {
        throw new Exception("SQL file not found: $sqlFile");
    }
    
    echo "<div class='info'>📄 Reading SQL file: create_complete_database.sql</div>";
    
    $sql = file_get_contents($sqlFile);
    
    // Split SQL into individual statements
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            return !empty($stmt) && !preg_match('/^--/', $stmt) && !preg_match('/^\/\*/', $stmt);
        }
    );
    
    echo "<div class='step'>";
    echo "<h2>🔧 Executing Database Setup</h2>";
    
    $successCount = 0;
    $errorCount = 0;
    
    foreach ($statements as $statement) {
        if (trim($statement)) {
            try {
                $db->exec($statement);
                $successCount++;
                
                // Check if it's a CREATE TABLE statement
                if (preg_match('/CREATE TABLE.*`(\w+)`/i', $statement, $matches)) {
                    echo "<div class='success'>✅ Created table: {$matches[1]}</div>";
                } elseif (preg_match('/INSERT.*INTO.*`(\w+)`/i', $statement, $matches)) {
                    echo "<div class='info'>📝 Inserted sample data into: {$matches[1]}</div>";
                } elseif (preg_match('/CREATE.*VIEW.*`(\w+)`/i', $statement, $matches)) {
                    echo "<div class='info'>👁️ Created view: {$matches[1]}</div>";
                } elseif (preg_match('/CREATE.*TRIGGER.*`(\w+)`/i', $statement, $matches)) {
                    echo "<div class='info'>⚡ Created trigger: {$matches[1]}</div>";
                }
                
            } catch (PDOException $e) {
                $errorCount++;
                if (strpos($e->getMessage(), 'already exists') === false) {
                    echo "<div class='warning'>⚠️ Warning: " . $e->getMessage() . "</div>";
                }
            }
        }
    }
    echo "</div>";
    
    // Verify tables were created
    echo "<div class='step'>";
    echo "<h2>📊 Database Verification</h2>";
    
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($tables) > 0) {
        echo "<div class='success'>✅ Database setup completed successfully!</div>";
        echo "<div class='info'>📈 Statistics: $successCount operations completed, $errorCount warnings</div>";
        
        echo "<h3>Created Tables:</h3>";
        echo "<div class='table-list'>";
        foreach ($tables as $table) {
            // Get row count for each table
            try {
                $count = $db->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
                echo "<div class='table-item'><strong>$table</strong><br>$count rows</div>";
            } catch (Exception $e) {
                echo "<div class='table-item'><strong>$table</strong><br>Created</div>";
            }
        }
        echo "</div>";
        
        // Show sample users
        echo "<h3>Sample Users Created:</h3>";
        $users = $db->query("SELECT full_name, email, is_admin, status FROM users LIMIT 5")->fetchAll();
        echo "<table border='1' cellpadding='10' style='width:100%; border-collapse: collapse;'>";
        echo "<tr><th>Name</th><th>Email</th><th>Type</th><th>Status</th></tr>";
        foreach ($users as $user) {
            $type = $user['is_admin'] ? 'Admin' : 'User';
            echo "<tr><td>{$user['full_name']}</td><td>{$user['email']}</td><td>$type</td><td>{$user['status']}</td></tr>";
        }
        echo "</table>";
        
        // Show sample items
        echo "<h3>Sample Items Created:</h3>";
        $items = $db->query("SELECT name, type, status, location FROM items LIMIT 5")->fetchAll();
        echo "<table border='1' cellpadding='10' style='width:100%; border-collapse: collapse;'>";
        echo "<tr><th>Item Name</th><th>Type</th><th>Status</th><th>Location</th></tr>";
        foreach ($items as $item) {
            echo "<tr><td>{$item['name']}</td><td>{$item['type']}</td><td>{$item['status']}</td><td>{$item['location']}</td></tr>";
        }
        echo "</table>";
        
    } else {
        echo "<div class='error'>❌ No tables were created. Please check for errors above.</div>";
    }
    echo "</div>";
    
    // Next steps
    echo "<div class='step'>";
    echo "<h2>🚀 Next Steps</h2>";
    echo "<p>Your Lost & Found database is now ready! Here's what you can do next:</p>";
    echo "<div style='margin: 20px 0;'>";
    echo "<a href='test_login_frontend.html' class='btn'>🧪 Test Login System</a>";
    echo "<a href='check_users_status.php' class='btn'>👥 Manage Users</a>";
    echo "<a href='admin_dashboard.php' class='btn'>🎛️ Admin Dashboard</a>";
    echo "<a href='http://localhost:5173' class='btn' target='_blank'>🏠 Open Frontend</a>";
    echo "</div>";
    
    echo "<div class='info'>";
    echo "<h4>Default Login Credentials:</h4>";
    echo "<p><strong>Admin:</strong> admin@gmail.com / password</p>";
    echo "<p><strong>User:</strong> john.doe@student.edu / password</p>";
    echo "<p><strong>User:</strong> jane.smith@student.edu / password</p>";
    echo "</div>";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div class='error'>❌ Error: " . $e->getMessage() . "</div>";
    echo "<div class='warning'>Please make sure:</div>";
    echo "<ul>";
    echo "<li>XAMPP MySQL service is running</li>";
    echo "<li>Database 'lostandfound_db' exists in phpMyAdmin</li>";
    echo "<li>Database credentials in config/database.php are correct</li>";
    echo "</ul>";
}

echo "</div></body></html>";
?>
