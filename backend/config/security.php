<?php
// Security utilities for Lost and Found System

class Security {
    private static $rateLimits = [];
    private static $loginAttempts = [];
    
    // Input validation and sanitization
    public static function validateEmail($email) {
        $email = filter_var(trim($email), FILTER_SANITIZE_EMAIL);
        return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : false;
    }
    
    public static function validatePhone($phone) {
        $phone = preg_replace('/[^0-9+\-\(\)\s]/', '', trim($phone));
        return strlen($phone) >= 10 ? $phone : false;
    }
    
    public static function validateStudentId($studentId) {
        $studentId = preg_replace('/[^0-9A-Za-z\-]/', '', trim($studentId));
        return strlen($studentId) >= 3 ? $studentId : false;
    }
    
    public static function sanitizeString($input) {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }
    
    // Password hashing with Argon2ID
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_ARGON2ID, [
            'memory_cost' => 65536,
            'time_cost' => 4,
            'threads' => 3
        ]);
    }
    
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    // Rate limiting
    public static function checkRateLimit($identifier, $maxRequests = 10, $timeWindow = 900) { // 15 minutes
        $currentTime = time();
        $windowStart = $currentTime - $timeWindow;
        
        if (!isset(self::$rateLimits[$identifier])) {
            self::$rateLimits[$identifier] = [];
        }
        
        // Clean old requests
        self::$rateLimits[$identifier] = array_filter(
            self::$rateLimits[$identifier],
            function($timestamp) use ($windowStart) {
                return $timestamp > $windowStart;
            }
        );
        
        // Check if limit exceeded
        if (count(self::$rateLimits[$identifier]) >= $maxRequests) {
            return false;
        }
        
        // Add current request
        self::$rateLimits[$identifier][] = $currentTime;
        return true;
    }
    
    // Login attempt tracking
    public static function checkLoginAttempts($email, $maxAttempts = 5, $timeWindow = 900) {
        $currentTime = time();
        $windowStart = $currentTime - $timeWindow;
        
        if (!isset(self::$loginAttempts[$email])) {
            self::$loginAttempts[$email] = [];
        }
        
        // Clean old attempts
        self::$loginAttempts[$email] = array_filter(
            self::$loginAttempts[$email],
            function($timestamp) use ($windowStart) {
                return $timestamp > $windowStart;
            }
        );
        
        return count(self::$loginAttempts[$email]) < $maxAttempts;
    }
    
    public static function recordLoginAttempt($email) {
        if (!isset(self::$loginAttempts[$email])) {
            self::$loginAttempts[$email] = [];
        }
        self::$loginAttempts[$email][] = time();
    }
    
    // CSRF token generation and verification
    public static function generateCSRFToken() {
        if (!isset($_SESSION)) {
            session_start();
        }
        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;
        return $token;
    }
    
    public static function verifyCSRFToken($token) {
        if (!isset($_SESSION)) {
            session_start();
        }
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
    
    // Get client IP (proxy-aware)
    public static function getClientIP() {
        $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = trim(explode(',', $_SERVER[$key])[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    
    // Security logging
    public static function logSecurityEvent($event, $details = []) {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'ip' => self::getClientIP(),
            'event' => $event,
            'details' => $details
        ];
        
        error_log("SECURITY: " . json_encode($logEntry));
    }
}
?>
