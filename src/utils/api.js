// API Configuration for Lost and Found System
// This file centralizes all API endpoint configurations

// Use environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/ifound%20project/backend/api';

// Debug logging
console.log('🔧 iFound API Configuration:');
console.log('System initialized successfully');
console.log('API Connection: Ready');

// API endpoints configuration
export const API_ENDPOINTS = {
    // Authentication endpoints (Admin only)
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth.php?action=login`
    },

    // Items endpoints
    ITEMS: {
        BASE: `${API_BASE_URL}/items.php`,
        CREATE: `${API_BASE_URL}/items.php`,
        ALL: `${API_BASE_URL}/items.php?action=all`,
        LATEST: `${API_BASE_URL}/items.php?action=latest`,
        COMMON_ITEMS: `${API_BASE_URL}/items.php?action=getCommonItems`,
        RECENT_ACTIVITY: `${API_BASE_URL}/items.php?action=getRecentActivity`,
        BY_ID: (itemId) => `${API_BASE_URL}/items.php?id=${itemId}`,
        GET_RECENT_LOST_ITEMS: `${API_BASE_URL}/items.php?action=getRecentLostItems`,
        STATS: `${API_BASE_URL}/items.php?action=stats`,
        COMMON: `${API_BASE_URL}/items.php?action=getCommonItems`,
        ARCHIVED: `${API_BASE_URL}/items.php?action=archived`,
        ARCHIVE: (itemId) => `${API_BASE_URL}/items.php?action=archive&id=${itemId}`,
        RESTORE: (itemId) => `${API_BASE_URL}/items.php?action=restore&id=${itemId}`,
        HISTORY: (itemId) => `${API_BASE_URL}/items.php?action=history&id=${itemId}`
    },

    // Categories endpoints
    CATEGORIES: {
        BASE: `${API_BASE_URL}/categories.php`,
        ALL: `${API_BASE_URL}/categories.php?action=all`,
        CREATE: `${API_BASE_URL}/categories.php?action=create`,
        UPDATE: (id) => `${API_BASE_URL}/categories.php?action=update&id=${id}`,
        DELETE: (id) => `${API_BASE_URL}/categories.php?action=delete&id=${id}`
    },

    // Announcements endpoints
    ANNOUNCEMENTS: {
        BASE: `${API_BASE_URL}/announcements.php`,
        ALL: `${API_BASE_URL}/announcements.php?action=all`,
        ACTIVE: `${API_BASE_URL}/announcements.php?action=active`,
        BY_ID: (id) => `${API_BASE_URL}/announcements.php?id=${id}`,
        CREATE: `${API_BASE_URL}/announcements.php`,
        UPDATE: (id) => `${API_BASE_URL}/announcements.php?id=${id}`,
        DELETE: (id) => `${API_BASE_URL}/announcements.php?id=${id}`
    },

    // Claim Instructions endpoints
    CLAIM_INSTRUCTIONS: {
        BASE: `${API_BASE_URL}/claim_instructions.php`,
        ALL: `${API_BASE_URL}/claim_instructions.php?action=all`,
        CREATE: `${API_BASE_URL}/claim_instructions.php?action=create`,
        UPDATE: `${API_BASE_URL}/claim_instructions.php?action=update`,
        DELETE: (id) => `${API_BASE_URL}/claim_instructions.php?action=delete&id=${id}`,
        CONTACT: `${API_BASE_URL}/claim_instructions.php?action=contact`,
        UPDATE_CONTACT: `${API_BASE_URL}/claim_instructions.php?action=contact`
    },

    // Contact Info endpoints
    CONTACT_INFO: {
        GET: `${API_BASE_URL}/claim_instructions.php?action=contact`,
        UPDATE: `${API_BASE_URL}/claim_instructions.php?action=update_contact`
    },

    // Upload endpoints
    UPLOAD: {
        IMAGE: `${API_BASE_URL.replace('/api', '')}/upload.php`
    },
    
    // Direct image upload endpoint for consistency
    UPLOAD_IMAGE: `${API_BASE_URL.replace('/api', '')}/upload.php`,

    // Admin endpoints
    ADMIN: {
        REPORTS: (reportType) => `${API_BASE_URL}/reports.php?action=${reportType}`,
        AUTO_ARCHIVE: {
            RUN: `${API_BASE_URL}/auto_archive.php?action=run`,
            STATS: `${API_BASE_URL}/auto_archive.php?action=stats`
        }
    }
};

// Helper function to get asset URLs
export const getAssetUrl = (path) => {
    // Use the same base URL as API_BASE_URL but without /api
    const baseUrl = API_BASE_URL.replace('/api', '');
    const fullUrl = `${baseUrl}/${path}`;
    console.log('🖼️ iFound: Loading image asset');
    return fullUrl;
};

// Export the base URL for any custom endpoints
export { API_BASE_URL };
