<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Remove database include since we don't need it for file uploads
// include_once 'config/database.php';
// $database = new Database();
// $db = $database->getConnection();

$response = array();

// Check if file was uploaded
if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "No image file uploaded"
    ));
    exit;
}

$file = $_FILES['image'];

// Check for upload errors
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Upload error: " . $file['error']
    ));
    exit;
}

// Validate file type
$allowedTypes = array('image/jpeg', 'image/png', 'image/gif', 'image/webp');
if (!in_array($file['type'], $allowedTypes)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed"
    ));
    exit;
}

// Validate file size (5MB max)
$maxSize = 5 * 1024 * 1024; // 5MB
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "File too large. Maximum size is 5MB"
    ));
    exit;
}

// Create uploads directory if it doesn't exist
$uploadDir = 'uploads/';
if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        error_log("Failed to create upload directory: " . $uploadDir);
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Failed to create upload directory"
        ));
        exit;
    }
    error_log("Created upload directory: " . $uploadDir);
}

// Check if directory is writable
if (!is_writable($uploadDir)) {
    error_log("Upload directory is not writable: " . $uploadDir);
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Upload directory is not writable"
    ));
    exit;
}

error_log("Upload directory exists and is writable: " . $uploadDir);

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_') . '.' . $extension;
$uploadPath = $uploadDir . $filename;

error_log("Generated filename: " . $filename);
error_log("Generated upload path: " . $uploadPath);

// Move uploaded file
if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
    error_log("File moved successfully to: " . $uploadPath);
    // Save file info to database if needed
    // For now, just return the filename

    echo json_encode(array(
        "success" => true,
        "message" => "Image uploaded successfully",
        "filename" => $filename,
        "url" => "http://localhost/lostandfound-backend/uploads/" . $filename
    ));
} else {
    error_log("Failed to move uploaded file to: " . $uploadPath);
    error_log("Upload error details: " . print_r(error_get_last(), true));
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Failed to save uploaded file"
    ));
}
?>