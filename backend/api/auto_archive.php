<?php
// auto_archive.php - Automatic archiving of items older than 2 weeks
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

/**
 * Auto-archive items that are:
 * 1. Older than 2 weeks (14 days)
 * 2. Not yet claimed (status != 'claimed')
 * 3. Not already archived (status != 'archived')
 */
function autoArchiveOldItems($db) {
    try {
        // Calculate the date 2 weeks ago
        $twoWeeksAgo = date('Y-m-d H:i:s', strtotime('-14 days'));
        
        // Find items to archive
        $selectQuery = "SELECT id, item_name, created_at, status 
                       FROM items 
                       WHERE created_at < :two_weeks_ago 
                       AND status NOT IN ('claimed', 'archived')";
        
        $selectStmt = $db->prepare($selectQuery);
        $selectStmt->bindParam(':two_weeks_ago', $twoWeeksAgo);
        $selectStmt->execute();
        
        $itemsToArchive = $selectStmt->fetchAll(PDO::FETCH_ASSOC);
        $archivedCount = 0;
        
        if (count($itemsToArchive) > 0) {
            // Archive the items
            $updateQuery = "UPDATE items 
                           SET status = 'archived', archived_at = NOW() 
                           WHERE created_at < :two_weeks_ago 
                           AND status NOT IN ('claimed', 'archived')";
            
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->bindParam(':two_weeks_ago', $twoWeeksAgo);
            
            if ($updateStmt->execute()) {
                $archivedCount = $updateStmt->rowCount();
            }
        }
        
        echo json_encode(array(
            "success" => true,
            "message" => "Auto-archive completed",
            "archived_count" => $archivedCount,
            "items_archived" => $itemsToArchive,
            "cutoff_date" => $twoWeeksAgo
        ));
        
    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $exception->getMessage()
        ));
    }
}

/**
 * Get statistics about items that will be archived soon
 */
function getAutoArchiveStats($db) {
    try {
        $twoWeeksAgo = date('Y-m-d H:i:s', strtotime('-14 days'));
        $oneWeekAgo = date('Y-m-d H:i:s', strtotime('-7 days'));
        
        // Count items older than 2 weeks (ready to archive)
        $readyQuery = "SELECT COUNT(*) as count 
                      FROM items 
                      WHERE created_at < :two_weeks_ago 
                      AND status NOT IN ('claimed', 'archived')";
        $readyStmt = $db->prepare($readyQuery);
        $readyStmt->bindParam(':two_weeks_ago', $twoWeeksAgo);
        $readyStmt->execute();
        $readyCount = $readyStmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // Count items older than 1 week (warning)
        $warningQuery = "SELECT COUNT(*) as count 
                        FROM items 
                        WHERE created_at < :one_week_ago 
                        AND created_at >= :two_weeks_ago
                        AND status NOT IN ('claimed', 'archived')";
        $warningStmt = $db->prepare($warningQuery);
        $warningStmt->bindParam(':one_week_ago', $oneWeekAgo);
        $warningStmt->bindParam(':two_weeks_ago', $twoWeeksAgo);
        $warningStmt->execute();
        $warningCount = $warningStmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        echo json_encode(array(
            "success" => true,
            "ready_to_archive" => (int)$readyCount,
            "expiring_soon" => (int)$warningCount,
            "cutoff_date" => $twoWeeksAgo
        ));
        
    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $exception->getMessage()
        ));
    }
}

// Handle requests
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['action'])) {
        switch ($_GET['action']) {
            case 'run':
                // Run auto-archive process
                autoArchiveOldItems($db);
                break;
            case 'stats':
                // Get statistics
                getAutoArchiveStats($db);
                break;
            default:
                http_response_code(400);
                echo json_encode(array("message" => "Invalid action"));
        }
    } else {
        // Default: run auto-archive
        autoArchiveOldItems($db);
    }
} elseif ($method === 'POST') {
    // Also allow POST for running auto-archive
    autoArchiveOldItems($db);
} else {
    http_response_code(405);
    echo json_encode(array("message" => "Method not allowed"));
}
?>
