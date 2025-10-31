<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

class AnnouncementsAPI {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? '';

        switch ($method) {
            case 'GET':
                if ($action === 'all' || empty($action)) {
                    $this->getAllAnnouncements();
                } elseif ($action === 'active') {
                    $this->getActiveAnnouncements();
                } else {
                    $this->getAnnouncement($action);
                }
                break;
            case 'POST':
                $this->createAnnouncement();
                break;
            case 'PUT':
                $this->updateAnnouncement();
                break;
            case 'DELETE':
                $this->deleteAnnouncement();
                break;
            default:
                $this->sendError('Method not allowed', 405);
        }
    }

    private function getAllAnnouncements() {
        try {
            $query = "SELECT * FROM announcements ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $announcements = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $announcements[] = [
                    'id' => $row['id'],
                    'title' => $row['title'],
                    'content' => $row['content'],
                    'is_active' => (bool)$row['is_active'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at']
                ];
            }

            $this->sendResponse(['success' => true, 'announcements' => $announcements]);
        } catch (PDOException $e) {
            $this->sendError('Database error: ' . $e->getMessage());
        }
    }

    private function getActiveAnnouncements() {
        try {
            $query = "SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $announcements = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $announcements[] = [
                    'id' => $row['id'],
                    'title' => $row['title'],
                    'content' => $row['content'],
                    'is_active' => (bool)$row['is_active'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at']
                ];
            }

            $this->sendResponse(['success' => true, 'announcements' => $announcements]);
        } catch (PDOException $e) {
            $this->sendError('Database error: ' . $e->getMessage());
        }
    }

    private function getAnnouncement($id) {
        try {
            $query = "SELECT * FROM announcements WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $announcement = [
                    'id' => $row['id'],
                    'title' => $row['title'],
                    'content' => $row['content'],
                    'is_active' => (bool)$row['is_active'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at']
                ];
                $this->sendResponse(['success' => true, 'announcement' => $announcement]);
            } else {
                $this->sendError('Announcement not found', 404);
            }
        } catch (PDOException $e) {
            $this->sendError('Database error: ' . $e->getMessage());
        }
    }

    private function createAnnouncement() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['title']) || !isset($data['content'])) {
                $this->sendError('Title and content are required', 400);
                return;
            }

            $query = "INSERT INTO announcements (title, content, is_active, created_at, updated_at)
                     VALUES (:title, :content, :is_active, NOW(), NOW())";
            $stmt = $this->conn->prepare($query);

            $is_active = isset($data['is_active']) ? $data['is_active'] : true;

            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':content', $data['content']);
            $stmt->bindParam(':is_active', $is_active);

            if ($stmt->execute()) {
                $announcement_id = $this->conn->lastInsertId();
                $this->sendResponse([
                    'success' => true,
                    'message' => 'Announcement created successfully',
                    'announcement_id' => $announcement_id
                ], 201);
            } else {
                $this->sendError('Failed to create announcement');
            }
        } catch (PDOException $e) {
            $this->sendError('Database error: ' . $e->getMessage());
        }
    }

    private function updateAnnouncement() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $_GET['id'] ?? null;

            if (!$id) {
                $this->sendError('Announcement ID is required', 400);
                return;
            }

            if (!isset($data['title']) || !isset($data['content'])) {
                $this->sendError('Title and content are required', 400);
                return;
            }

            $query = "UPDATE announcements SET title = :title, content = :content,
                     is_active = :is_active, updated_at = NOW() WHERE id = :id";
            $stmt = $this->conn->prepare($query);

            $is_active = isset($data['is_active']) ? $data['is_active'] : true;

            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':content', $data['content']);
            $stmt->bindParam(':is_active', $is_active);

            if ($stmt->execute()) {
                if ($stmt->rowCount() > 0) {
                    $this->sendResponse(['success' => true, 'message' => 'Announcement updated successfully']);
                } else {
                    $this->sendError('Announcement not found', 404);
                }
            } else {
                $this->sendError('Failed to update announcement');
            }
        } catch (PDOException $e) {
            $this->sendError('Database error: ' . $e->getMessage());
        }
    }

    private function deleteAnnouncement() {
        try {
            $id = $_GET['id'] ?? null;

            if (!$id) {
                $this->sendError('Announcement ID is required', 400);
                return;
            }

            $query = "DELETE FROM announcements WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);

            if ($stmt->execute()) {
                if ($stmt->rowCount() > 0) {
                    $this->sendResponse(['success' => true, 'message' => 'Announcement deleted successfully']);
                } else {
                    $this->sendError('Announcement not found', 404);
                }
            } else {
                $this->sendError('Failed to delete announcement');
            }
        } catch (PDOException $e) {
            $this->sendError('Database error: ' . $e->getMessage());
        }
    }

    private function sendResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data);
    }

    private function sendError($message, $statusCode = 400) {
        http_response_code($statusCode);
        echo json_encode(['success' => false, 'message' => $message]);
    }
}

// Initialize and handle the request
$api = new AnnouncementsAPI();
$api->handleRequest();
?>
