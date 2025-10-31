<?php
/**
 * Authentication API for Lost and Found System
 * Admin-only authentication
 *
 * @author Lost & Found System
 * @version 3.0
 */

declare(strict_types=1);

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Include required files
require_once __DIR__ . '/../config/database.php';

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

// Check database connection
if (!$db) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

class AuthAPI
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function handleRequest(): void
    {
        try {
            $action = $_GET['action'] ?? '';

            switch ($action) {
                case 'login':
                    $this->login();
                    break;
                default:
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Invalid action']);
            }
        } catch (Exception $e) {
            error_log("Auth API Error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Internal server error: ' . $e->getMessage()]);
        }
    }

    /**
     * Handle admin login only
     */
    private function login(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || !isset($input['email']) || !isset($input['password'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email and password are required']);
            return;
        }

        $email = filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL);
        $password = $input['password'];

        if (!$email) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid email format']);
            return;
        }

        // Get admin user from database
        $query = "SELECT * FROM users WHERE email = :email AND is_admin = 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            // Login successful - admin only
            $userData = [
                'id' => $user['id'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'isAdmin' => true
            ];

            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'user' => $userData
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid admin credentials']);
        }
    }
}

// Initialize and handle the request
$api = new AuthAPI($db);
$api->handleRequest();
?>