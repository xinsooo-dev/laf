<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    switch ($method) {
        case 'GET':
            if ($action === 'all') {
                getAllInstructions($db);
            } elseif ($action === 'contact') {
                getContactInfo($db);
            } else {
                getAllInstructions($db);
            }
            break;
            
        case 'POST':
            if ($action === 'create') {
                createInstruction($db);
            } elseif ($action === 'update_contact') {
                updateContactInfo($db);
            }
            break;
            
        case 'PUT':
            if ($action === 'update') {
                updateInstruction($db);
            } elseif ($action === 'contact') {
                updateContactInfo($db);
            }
            break;
            
        case 'DELETE':
            if ($action === 'delete') {
                deleteInstruction($db);
            }
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid request method']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

function getAllInstructions($db) {
    try {
        $query = "SELECT * FROM claim_instructions WHERE is_active = 1 ORDER BY step_number ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $instructions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'instructions' => $instructions
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching instructions: ' . $e->getMessage()
        ]);
    }
}

function getContactInfo($db) {
    try {
        $query = "SELECT * FROM claim_contact_info ORDER BY id DESC LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $contact = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'contact_info' => $contact
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching contact info: ' . $e->getMessage()
        ]);
    }
}

function createInstruction($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $query = "INSERT INTO claim_instructions (step_number, title, description, is_active) 
                  VALUES (:step_number, :title, :description, :is_active)";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':step_number', $data['step_number']);
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':description', $data['description']);
        $is_active = isset($data['is_active']) ? $data['is_active'] : 1;
        $stmt->bindParam(':is_active', $is_active);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Instruction created successfully',
                'id' => $db->lastInsertId()
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create instruction'
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error creating instruction: ' . $e->getMessage()
        ]);
    }
}

function updateInstruction($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $query = "UPDATE claim_instructions 
                  SET step_number = :step_number, 
                      title = :title, 
                      description = :description,
                      is_active = :is_active
                  WHERE id = :id";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':id', $data['id']);
        $stmt->bindParam(':step_number', $data['step_number']);
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':is_active', $data['is_active']);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Instruction updated successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update instruction'
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error updating instruction: ' . $e->getMessage()
        ]);
    }
}

function updateContactInfo($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Check if contact info exists
        $checkQuery = "SELECT id FROM claim_contact_info LIMIT 1";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute();
        $exists = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($exists) {
            // Update existing
            $query = "UPDATE claim_contact_info 
                      SET office_location = :office_location,
                          contact_number = :contact_number,
                          email = :email,
                          office_hours = :office_hours
                      WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $exists['id']);
        } else {
            // Insert new
            $query = "INSERT INTO claim_contact_info (office_location, contact_number, email, office_hours)
                      VALUES (:office_location, :contact_number, :email, :office_hours)";
            $stmt = $db->prepare($query);
        }
        
        $stmt->bindParam(':office_location', $data['office_location']);
        $stmt->bindParam(':contact_number', $data['contact_number']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':office_hours', $data['office_hours']);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Contact info updated successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update contact info'
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error updating contact info: ' . $e->getMessage()
        ]);
    }
}

function deleteInstruction($db) {
    try {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        
        if (!$id) {
            echo json_encode([
                'success' => false,
                'message' => 'Instruction ID is required'
            ]);
            return;
        }
        
        // Soft delete by setting is_active to 0
        $query = "UPDATE claim_instructions SET is_active = 0 WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Instruction deleted successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to delete instruction'
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error deleting instruction: ' . $e->getMessage()
        ]);
    }
}
?>
