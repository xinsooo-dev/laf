<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['action'])) {
            switch ($_GET['action']) {
                case 'summary':
                    getSystemSummary($db);
                    break;
                case 'monthly':
                    getMonthlyReport($db);
                    break;
                case 'locations':
                    getLocationAnalytics($db);
                    break;
                case 'trends':
                    getTrendAnalytics($db);
                    break;
                default:
                    http_response_code(400);
                    echo json_encode(array("message" => "Invalid action"));
            }
        } else {
            getSystemSummary($db);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
}

function getSystemSummary($db) {
    try {
        $summary = array();

        // Overall statistics
        // Separate active Lost/Found items from Claimed/Archived items
        $query = "SELECT 
                    COUNT(*) as total_items,
                    COUNT(CASE WHEN type = 'lost' AND status != 'claimed' THEN 1 END) as total_lost,
                    COUNT(CASE WHEN type = 'found' AND status NOT IN ('claimed', 'archived') THEN 1 END) as total_found,
                    COUNT(CASE WHEN status = 'claimed' THEN 1 END) as total_claimed
                  FROM items";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $summary['overview'] = $stmt->fetch(PDO::FETCH_ASSOC);

        // Success rate calculation
        $total_items = $summary['overview']['total_items'];
        $claimed_items = $summary['overview']['total_claimed'];
        $summary['success_rate'] = $total_items > 0 ? round(($claimed_items / $total_items) * 100, 2) : 0;

        // Recent activity (last 30 days)
        $query = "SELECT COUNT(*) as recent_reports 
                  FROM items 
                  WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $summary['recent_activity'] = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode(array("success" => true, "data" => $summary));

    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $exception->getMessage()
        ));
    }
}

function getMonthlyReport($db) {
    try {
        $monthly_data = array();

        // Monthly item reports for the last 12 months
        // Separate active Lost/Found items from Claimed/Archived items
        $query = "SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    COUNT(*) as total,
                    COUNT(CASE WHEN type = 'lost' AND status != 'claimed' THEN 1 END) as lost,
                    COUNT(CASE WHEN type = 'found' AND status NOT IN ('claimed', 'archived') THEN 1 END) as found,
                    COUNT(CASE WHEN status = 'claimed' THEN 1 END) as claimed
                  FROM items 
                  WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                  GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                  ORDER BY month DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $monthly_data['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(array("success" => true, "data" => $monthly_data));

    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $exception->getMessage()
        ));
    }
}

function getLocationAnalytics($db) {
    try {
        $location_data = array();

        // Most common locations for lost items
        $query = "SELECT 
                    location,
                    COUNT(*) as count,
                    COUNT(CASE WHEN type = 'lost' THEN 1 END) as lost_count,
                    COUNT(CASE WHEN type = 'found' THEN 1 END) as found_count
                  FROM items 
                  GROUP BY location 
                  ORDER BY count DESC 
                  LIMIT 10";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $location_data['top_locations'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Location success rates
        $query = "SELECT 
                    location,
                    COUNT(*) as total_items,
                    COUNT(CASE WHEN status = 'claimed' THEN 1 END) as claimed_items,
                    ROUND((COUNT(CASE WHEN status = 'claimed' THEN 1 END) / COUNT(*)) * 100, 2) as success_rate
                  FROM items 
                  GROUP BY location 
                  HAVING total_items >= 2
                  ORDER BY success_rate DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $location_data['success_rates'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(array("success" => true, "data" => $location_data));

    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $exception->getMessage()
        ));
    }
}

function getTrendAnalytics($db) {
    try {
        $trend_data = array();

        // Daily activity for the last 30 days
        $query = "SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as total_reports,
                    COUNT(CASE WHEN type = 'lost' THEN 1 END) as lost_reports,
                    COUNT(CASE WHEN type = 'found' THEN 1 END) as found_reports
                  FROM items 
                  WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                  GROUP BY DATE(created_at)
                  ORDER BY date DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $trend_data['daily_activity'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Item category trends
        $query = "SELECT 
                    item_name,
                    COUNT(*) as count,
                    DATE(MAX(created_at)) as last_reported
                  FROM items 
                  WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
                  GROUP BY item_name 
                  ORDER BY count DESC 
                  LIMIT 15";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $trend_data['item_trends'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(array("success" => true, "data" => $trend_data));

    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $exception->getMessage()
        ));
    }
}
?>
