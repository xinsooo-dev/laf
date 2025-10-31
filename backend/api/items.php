<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        if (isset($_GET['action'])) {
            switch ($_GET['action']) {
                case 'all':
                    getAllItems($db);
                    break;
                case 'search':
                    searchItems($db, $_GET['query']);
                    break;
                case 'stats':
                    getStats($db);
                    break;
                case 'getRecentLostItems':
                    getRecentLostItems($db);
                    break;
                case 'getCommonItems':
                    getCommonItems($db);
                    break;
                case 'getRecentActivity':
                    getRecentActivity($db);
                    break;
                case 'latest':
                    getLatestItems($db);
                    break;
                case 'getItemById':
                    if (isset($_GET['id'])) {
                        getItemById($db, $_GET['id']);
                    } else {
                        http_response_code(400);
                        echo json_encode(array("success" => false, "message" => "Item ID required"));
                    }
                    break;
                case 'archived':
                    getArchivedItems($db);
                    break;
                case 'archive':
                    if (isset($_GET['id'])) {
                        archiveItem($db, $_GET['id']);
                    } else {
                        http_response_code(400);
                        echo json_encode(array("success" => false, "message" => "Item ID required"));
                    }
                    break;
                case 'history':
                    if (isset($_GET['id'])) {
                        getItemHistory($db, $_GET['id']);
                    } else {
                        http_response_code(400);
                        echo json_encode(array("success" => false, "message" => "Item ID required"));
                    }
                    break;
                case 'restore':
                    if (isset($_GET['id'])) {
                        restoreItem($db, $_GET['id']);
                    } else {
                        http_response_code(400);
                        echo json_encode(array("success" => false, "message" => "Item ID required"));
                    }
                    break;
                // Approve/Reject removed - items are automatically posted as lost/found
                // case 'approve':
                //     if (isset($_GET['id'])) {
                //         approveItem($db, $_GET['id']);
                //     } else {
                //         http_response_code(400);
                //         echo json_encode(array("message" => "Item ID required"));
                //     }
                //     break;
                // case 'reject':
                //     if (isset($_GET['id'])) {
                //         rejectItem($db, $_GET['id']);
                //     } else {
                //         http_response_code(400);
                //         echo json_encode(array("message" => "Item ID required"));
                //     }
                //     break;
                default:
                    http_response_code(400);
                    echo json_encode(array("message" => "Invalid action"));
            }
        } else {
            getAllItems($db);
        }
        break;
    case 'POST':
        createItem($db, $input);
        break;
    case 'PUT':
        updateItem($db, $_GET['id'], $input);
        break;
    case 'DELETE':
        deleteItem($db, $_GET['id']);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
}

function getAllItems($db)
{
    try {
        $query = "SELECT i.*, u.full_name, u.email, u.phone, u.course, u.year
                  FROM items i
                  LEFT JOIN users u ON i.user_id = u.id
                  WHERE i.status != 'archived'
                  ORDER BY i.created_at DESC";

        $stmt = $db->prepare($query);
        $stmt->execute();

        $items = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $items[] = $row;
        }

        echo json_encode(array(
            "success" => true,
            "items" => $items
        ));

    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $exception->getMessage()
        ));
    }
}

function searchItems($db, $query_text)
{
    if (!$query_text) {
        getAllItems($db);
        return;
    }

    $query = "SELECT i.*, u.full_name, u.email 
              FROM items i 
              LEFT JOIN users u ON i.user_id = u.id 
              WHERE i.item_name LIKE :query 
              OR i.description LIKE :query 
              OR i.location LIKE :query
              ORDER BY i.created_at DESC";

    $stmt = $db->prepare($query);
    $search_term = "%" . $query_text . "%";
    $stmt->bindParam(':query', $search_term);
    $stmt->execute();

    $items = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $items[] = $row;
    }

    echo json_encode($items);
}

function getStats($db)
{
    $stats = array();

    // Total lost items
    $query = "SELECT COUNT(*) as count FROM items WHERE type = 'lost'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $stats['total_lost'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Total found items
    $query = "SELECT COUNT(*) as count FROM items WHERE type = 'found'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $stats['total_found'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Claimed items
    $query = "SELECT COUNT(*) as count FROM items WHERE status = 'claimed'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $stats['claimed'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Recent activity
    $query = "SELECT i.*, u.full_name, u.email, u.phone
              FROM items i
              LEFT JOIN users u ON i.user_id = u.id
              ORDER BY i.created_at DESC
              LIMIT 10";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $recent_activity = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $recent_activity[] = $row;
    }
    $stats['recent_activity'] = $recent_activity;

    echo json_encode($stats);
}

function createItem($db, $input)
{
    if (
        !isset($input['user_id']) || !isset($input['item_name']) ||
        !isset($input['location']) || !isset($input['type'])
    ) {
        http_response_code(400);
        echo json_encode(array("message" => "Required fields missing"));
        return;
    }

    // Debug: Log the input data
    error_log("Creating item with data: " . json_encode($input));
    error_log("Image path value: " . (isset($input['image_path']) ? $input['image_path'] : 'NOT SET'));
    error_log("Image path type: " . gettype($input['image_path'] ?? null));

    // Handle null image_path
    if (!isset($input['image_path']) || $input['image_path'] === null || $input['image_path'] === '') {
        $input['image_path'] = null;
        error_log("Image path set to null");
    }

    // Set status to the same as type (lost/found) - automatically approved
    $status = isset($input['status']) ? $input['status'] : $input['type'];
    $reporter_name = isset($input['reporter_name']) ? $input['reporter_name'] : $input['contact_info'];
    $category = isset($input['category']) ? $input['category'] : null;
    
    // Get student_id from input
    $student_id = isset($input['student_id']) ? $input['student_id'] : null;
    
    // Include category and student_id columns in insert query
    $query = "INSERT INTO items (user_id, item_name, category, description, location, date_reported, type, contact_info, image_path, status, reporter_name, student_id)
              VALUES (:user_id, :item_name, :category, :description, :location, :date_reported, :type, :contact_info, :image_path, :status, :reporter_name, :student_id)";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $input['user_id']);
    $stmt->bindParam(':item_name', $input['item_name']);
    $stmt->bindParam(':category', $category);
    $stmt->bindParam(':description', $input['description']);
    $stmt->bindParam(':location', $input['location']);
    $stmt->bindParam(':date_reported', $input['date_reported']);
    $stmt->bindParam(':type', $input['type']);
    $stmt->bindParam(':contact_info', $input['contact_info']);
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':reporter_name', $reporter_name);
    $stmt->bindParam(':student_id', $student_id);

    // Handle image_path binding - use bindValue with explicit null type
    if ($input['image_path'] === null || $input['image_path'] === '') {
        $stmt->bindValue(':image_path', null, PDO::PARAM_NULL);
        error_log("Bound image_path as NULL");
    } else {
        $stmt->bindValue(':image_path', $input['image_path'], PDO::PARAM_STR);
        error_log("Bound image_path as string: " . $input['image_path']);
    }

    if ($stmt->execute()) {
        $item_id = $db->lastInsertId();
        error_log("Item created successfully with ID: $item_id, image_path: " . $input['image_path']);
        echo json_encode(array(
            "success" => true,
            "message" => "Item reported successfully",
            "item_id" => $item_id
        ));
    } else {
        error_log("Failed to create item: " . print_r($stmt->errorInfo(), true));
        http_response_code(500);
        echo json_encode(array("message" => "Failed to create item"));
    }
}

function updateItem($db, $item_id, $input)
{
    if (!$item_id) {
        http_response_code(400);
        echo json_encode(array("message" => "Item ID required"));
        return;
    }

    // Get current item data before update (for audit log)
    $currentItemQuery = "SELECT type, status FROM items WHERE id = :id";
    $currentItemStmt = $db->prepare($currentItemQuery);
    $currentItemStmt->execute([':id' => $item_id]);
    $currentItem = $currentItemStmt->fetch(PDO::FETCH_ASSOC);

    $fields = array();
    $params = array(':id' => $item_id);

    if (isset($input['status'])) {
        $fields[] = "status = :status";
        $params[':status'] = $input['status'];
    }

    if (isset($input['item_name'])) {
        $fields[] = "item_name = :item_name";
        $params[':item_name'] = $input['item_name'];
    }

    if (isset($input['description'])) {
        $fields[] = "description = :description";
        $params[':description'] = $input['description'];
    }

    if (isset($input['location'])) {
        $fields[] = "location = :location";
        $params[':location'] = $input['location'];
    }

    if (isset($input['type'])) {
        $fields[] = "type = :type";
        $params[':type'] = $input['type'];
    }

    // Handle finder information (for marking lost items as found)
    if (isset($input['finder_name'])) {
        $fields[] = "finder_name = :finder_name";
        $params[':finder_name'] = $input['finder_name'];
    }

    if (isset($input['finder_student_id'])) {
        $fields[] = "finder_student_id = :finder_student_id";
        $params[':finder_student_id'] = $input['finder_student_id'];
    }

    if (isset($input['finder_contact'])) {
        $fields[] = "finder_contact = :finder_contact";
        $params[':finder_contact'] = $input['finder_contact'];
    }

    // Handle claimant information
    if (isset($input['claimant_name'])) {
        $fields[] = "claimant_name = :claimant_name";
        $params[':claimant_name'] = $input['claimant_name'];
    }

    if (isset($input['claimant_student_id'])) {
        $fields[] = "claimant_student_id = :claimant_student_id";
        $params[':claimant_student_id'] = $input['claimant_student_id'];
    }

    if (isset($input['claimant_contact'])) {
        $fields[] = "claimant_contact = :claimant_contact";
        $params[':claimant_contact'] = $input['claimant_contact'];
    }

    if (isset($input['claimant_email'])) {
        $fields[] = "claimant_email = :claimant_email";
        $params[':claimant_email'] = $input['claimant_email'];
    }

    // Handle claimed_at timestamp when status is changed to claimed
    if (isset($input['status']) && $input['status'] === 'claimed') {
        $fields[] = "claimed_at = NOW()";
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(array("message" => "No fields to update"));
        return;
    }

    $query = "UPDATE items SET " . implode(', ', $fields) . " WHERE id = :id";
    $stmt = $db->prepare($query);

    if ($stmt->execute($params)) {
        // Log type changes to history table (only when lost items are marked as found)
        if (isset($input['type']) && $currentItem && $input['type'] !== $currentItem['type']) {
            // Only log when type actually changes (e.g., lost to found)
            try {
                $changeReason = "Item type changed from '{$currentItem['type']}' to '{$input['type']}'";
                
                // Special case: Lost item marked as found
                if ($input['type'] === 'found' && $currentItem['type'] === 'lost') {
                    $changeReason = "Lost item marked as found";
                }

                $historyQuery = "INSERT INTO item_status_history 
                    (item_id, previous_type, new_type, change_reason, 
                     finder_name, finder_student_id, finder_contact, created_at) 
                    VALUES 
                    (:item_id, :previous_type, :new_type, :change_reason, 
                     :finder_name, :finder_student_id, :finder_contact, NOW())";
                
                $historyStmt = $db->prepare($historyQuery);
                $historyStmt->execute([
                    ':item_id' => $item_id,
                    ':previous_type' => $currentItem['type'],
                    ':new_type' => $input['type'],
                    ':change_reason' => $changeReason,
                    ':finder_name' => $input['finder_name'] ?? null,
                    ':finder_student_id' => $input['finder_student_id'] ?? null,
                    ':finder_contact' => $input['finder_contact'] ?? null
                ]);
            } catch (PDOException $e) {
                // Log error but don't fail the update
                error_log("Failed to log type change history: " . $e->getMessage());
            }
        }

        echo json_encode(array(
            "success" => true,
            "message" => "Item updated successfully"
        ));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Failed to update item"));
    }
}

function deleteItem($db, $item_id)
{
    if (!$item_id) {
        http_response_code(400);
        echo json_encode(array("message" => "Item ID required"));
        return;
    }

    $query = "DELETE FROM items WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $item_id);

    if ($stmt->execute()) {
        echo json_encode(array(
            "success" => true,
            "message" => "Item deleted successfully"
        ));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Failed to delete item"));
    }
}

function getCommonItems($db)
{
    try {
        $query = "SELECT item_name, COUNT(*) as count
                  FROM items
                  WHERE type = 'lost' 
                    AND status NOT IN ('archived', 'claimed')
                    AND item_name IS NOT NULL 
                    AND item_name != ''
                  GROUP BY LOWER(item_name)
                  ORDER BY count DESC
                  LIMIT 8";

        $stmt = $db->prepare($query);
        $stmt->execute();

        $items = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $items[] = array(
                "item_name" => $row['item_name'],
                "count" => (int) $row['count']
            );
        }

        echo json_encode(array(
            "success" => true,
            "items" => $items
        ));

    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $exception->getMessage()
        ));
    }
}

function getRecentActivity($db)
{
    try {
        $query = "SELECT i.id, i.item_name, i.type, i.status, i.reporter_name, u.email, u.full_name, i.created_at
                  FROM items i
                  LEFT JOIN users u ON i.user_id = u.id
                  ORDER BY i.created_at DESC
                  LIMIT 10";

        $stmt = $db->prepare($query);
        $stmt->execute();

        $activities = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $activities[] = array(
                "id" => $row['id'],
                "item_name" => $row['item_name'],
                "type" => $row['type'],
                "status" => $row['status'],
                "reporter_name" => $row['reporter_name'],
                "full_name" => $row['full_name'],
                "email" => $row['email'],
                "created_at" => $row['created_at']
            );
        }

        echo json_encode(array(
            "success" => true,
            "recent_activity" => $activities
        ));

    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $exception->getMessage()
        ));
    }
}

function getLatestItems($db)
{
    try {
        // Get latest lost items with claimant information
        $lostQuery = "SELECT i.*, 
                             u.email as user_email,
                             i.claimant_name,
                             i.claimant_student_id,
                             i.claimant_contact,
                             i.claimant_email
                      FROM items i
                      LEFT JOIN users u ON i.user_id = u.id
                      WHERE i.type = 'lost'
                      ORDER BY i.created_at DESC
                      LIMIT 50";
        $lostStmt = $db->prepare($lostQuery);
        $lostStmt->execute();
        $lostItemsRaw = $lostStmt->fetchAll(PDO::FETCH_ASSOC);

        // Get latest found items with claimant information
        $foundQuery = "SELECT i.*, 
                              u.email as user_email,
                              i.claimant_name,
                              i.claimant_student_id,
                              i.claimant_contact,
                              i.claimant_email
                       FROM items i
                       LEFT JOIN users u ON i.user_id = u.id
                       WHERE i.type = 'found'
                       ORDER BY i.created_at DESC
                       LIMIT 50";
        $foundStmt = $db->prepare($foundQuery);
        $foundStmt->execute();
        $foundItemsRaw = $foundStmt->fetchAll(PDO::FETCH_ASSOC);

        // Format image URLs for lost items
        $lostItems = array_map(function($item) {
            if (!empty($item['image_path'])) {
                $item['image_url'] = 'http://localhost/lostandfound-backend/' . $item['image_path'];
            } else {
                $item['image_url'] = null;
            }
            return $item;
        }, $lostItemsRaw);

        // Format image URLs for found items
        $foundItems = array_map(function($item) {
            if (!empty($item['image_path'])) {
                $item['image_url'] = 'http://localhost/lostandfound-backend/' . $item['image_path'];
            } else {
                $item['image_url'] = null;
            }
            return $item;
        }, $foundItemsRaw);

        echo json_encode(array(
            "success" => true,
            "lost_items" => $lostItems,
            "found_items" => $foundItems
        ));

    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $exception->getMessage()
        ));
    }
}

function getRecentLostItems($db)
{
    try {
        $query = "SELECT i.*, u.full_name as reporter_name, u.email as contact_info
                  FROM items i
                  LEFT JOIN users u ON i.user_id = u.id
                  WHERE i.type = 'lost'
                  ORDER BY i.created_at DESC
                  LIMIT 8";

        $stmt = $db->prepare($query);
        $stmt->execute();

        $items = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $items[] = array(
                "id" => $row['id'],
                "item_name" => $row['item_name'],
                "description" => $row['description'],
                "location" => $row['location'],
                "status" => $row['status'],
                "created_at" => $row['created_at'],
                "reporter_name" => $row['reporter_name'],
                "contact_info" => $row['contact_info']
            );
        }

        echo json_encode(array(
            "success" => true,
            "items" => $items
        ));

    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $exception->getMessage()
        ));
    }
}

function getItemById($db, $item_id)
{
    try {
        $query = "SELECT i.*, u.full_name as reporter_name, u.email as contact_info
                  FROM items i
                  LEFT JOIN users u ON i.user_id = u.id
                  WHERE i.id = :item_id";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':item_id', $item_id);
        $stmt->execute();

        $item = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($item) {
            echo json_encode(array(
                "success" => true,
                "item" => $item
            ));
        } else {
            http_response_code(404);
            echo json_encode(array(
                "success" => false,
                "message" => "Item not found"
            ));
        }

    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $exception->getMessage()
        ));
    }
}

// Archive Functions
function getArchivedItems($db)
{
    try {
        $query = "SELECT i.*, u.full_name, u.email, u.phone, u.course, u.year
                  FROM items i
                  LEFT JOIN users u ON i.user_id = u.id
                  WHERE i.status = 'archived'
                  ORDER BY i.archived_at DESC";

        $stmt = $db->prepare($query);
        $stmt->execute();

        $items = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Format image URL if exists
            if (!empty($row['image_path'])) {
                $row['image_url'] = 'http://localhost/lostandfound-backend/' . $row['image_path'];
            } else {
                $row['image_url'] = null;
            }
            $items[] = $row;
        }

        echo json_encode(array(
            "success" => true,
            "items" => $items
        ));

    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $exception->getMessage()
        ));
    }
}

function archiveItem($db, $item_id)
{
    if (!$item_id) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Item ID required"));
        return;
    }

    try {
        // Update item status to archived and set archived_at timestamp
        $query = "UPDATE items SET status = 'archived', archived_at = NOW() WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $item_id);

        if ($stmt->execute()) {
            echo json_encode(array(
                "success" => true,
                "message" => "Item archived successfully"
            ));
        } else {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Failed to archive item"
            ));
        }

    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $exception->getMessage()
        ));
    }
}

function restoreItem($db, $item_id)
{
    if (!$item_id) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Item ID required"));
        return;
    }

    try {
        // Get the item's original type to restore it to the correct status
        $getQuery = "SELECT type FROM items WHERE id = :id";
        $getStmt = $db->prepare($getQuery);
        $getStmt->bindParam(':id', $item_id);
        $getStmt->execute();
        $item = $getStmt->fetch(PDO::FETCH_ASSOC);

        if (!$item) {
            http_response_code(404);
            echo json_encode(array("success" => false, "message" => "Item not found"));
            return;
        }

        // Restore item to its original type status (lost/found)
        $query = "UPDATE items SET status = :status, archived_at = NULL WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $item_id);
        $stmt->bindParam(':status', $item['type']);

        if ($stmt->execute()) {
            echo json_encode(array(
                "success" => true,
                "message" => "Item restored successfully"
            ));
        } else {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Failed to restore item"
            ));
        }

    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $exception->getMessage()
        ));
    }
}

function getItemHistory($db, $item_id)
{
    if (!$item_id) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Item ID required"));
        return;
    }

    try {
        $query = "SELECT 
                    id,
                    previous_type,
                    new_type,
                    change_reason,
                    finder_name,
                    finder_student_id,
                    finder_contact,
                    notes,
                    created_at
                  FROM item_status_history
                  WHERE item_id = :item_id
                  ORDER BY created_at DESC";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':item_id', $item_id);
        $stmt->execute();

        $history = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $history[] = $row;
        }

        echo json_encode(array(
            "success" => true,
            "history" => $history,
            "count" => count($history)
        ));

    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $exception->getMessage()
        ));
    }
}
?>