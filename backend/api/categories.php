<?php
// categories.php - API for managing item categories
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Handle preflight requests
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get all categories
if ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'all') {
    try {
        $query = "SELECT * FROM categories ORDER BY name ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'categories' => $categories
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching categories: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Add new category
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['name']) || empty(trim($input['name']))) {
        echo json_encode([
            'success' => false,
            'message' => 'Category name is required'
        ]);
        exit();
    }
    
    try {
        $query = "INSERT INTO categories (name, description, is_active) 
                  VALUES (:name, :description, 1)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':name', $input['name']);
        $stmt->bindParam(':description', $input['description']);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Category added successfully',
                'id' => $db->lastInsertId()
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to add category'
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error adding category: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Update category
if ($method === 'PUT' && isset($_GET['id'])) {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $_GET['id'];
    
    if (!isset($input['name']) || empty(trim($input['name']))) {
        echo json_encode([
            'success' => false,
            'message' => 'Category name is required'
        ]);
        exit();
    }
    
    try {
        $query = "UPDATE categories 
                  SET name = :name, description = :description 
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':name', $input['name']);
        $stmt->bindParam(':description', $input['description']);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Category updated successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update category'
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error updating category: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Delete category
if ($method === 'DELETE' && isset($_GET['id'])) {
    $id = $_GET['id'];
    
    try {
        $query = "DELETE FROM categories WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Category deleted successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to delete category'
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error deleting category: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Invalid request
echo json_encode([
    'success' => false,
    'message' => 'Invalid request'
]);
?>
