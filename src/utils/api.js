// API Configuration for Lost and Found System
// This file centralizes all API endpoint configurations

// Use environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/lostandfound-backend/api';

// Debug logging
console.log('🔧 API Configuration Debug:');
console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('Final API_BASE_URL:', API_BASE_URL);
console.log('Using current IP:', API_BASE_URL.includes('172.21.7.105'));

// API endpoints configuration
export const API_ENDPOINTS = {
    // Authentication endpoints
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth.php?action=login`,
        REGISTER: `${API_BASE_URL}/auth.php?action=register`,
        GET_USER: (userId) => `${API_BASE_URL}/auth.php?action=getUser&user_id=${userId}`,
        UPDATE_USER: (userId) => `${API_BASE_URL}/auth.php?action=updateUser&user_id=${userId}`,
        GET_ALL_USERS: `${API_BASE_URL}/auth.php?action=getAllUsers`,
        APPROVE_USER: (userId) => `${API_BASE_URL}/auth.php?action=approveUser&user_id=${userId}`,
        REJECT_USER: (userId) => `${API_BASE_URL}/auth.php?action=rejectUser&user_id=${userId}`,
        RESET_USER_STATUS: (userId) => `${API_BASE_URL}/auth.php?action=resetUserStatus&user_id=${userId}`
    },

    // Items endpoints
    ITEMS: {
        BASE: `${API_BASE_URL}/items.php`,
        CREATE: `${API_BASE_URL}/items.php`,
        ALL: `${API_BASE_URL}/items.php?action=all`,
        LATEST: `${API_BASE_URL}/items.php?action=latest`,
        USER_STATS: (userId) => `${API_BASE_URL}/items.php?action=getUserStats&user_id=${userId}`,
        COMMON_ITEMS: `${API_BASE_URL}/items.php?action=getCommonItems`,
        RECENT_ACTIVITY: `${API_BASE_URL}/items.php?action=getRecentActivity`,
        APPROVE: `${API_BASE_URL}/items.php?action=approve`,
        REJECT: `${API_BASE_URL}/items.php?action=reject`,
        BY_ID: (itemId) => `${API_BASE_URL}/items.php?id=${itemId}`,
        GET_RECENT_LOST_ITEMS: `${API_BASE_URL}/items.php?action=getRecentLostItems`,
        STATS: `${API_BASE_URL}/items.php?action=stats`,
        COMMON: `${API_BASE_URL}/items.php?action=getCommonItems`,
        ARCHIVED: `${API_BASE_URL}/items.php?action=archived`,
        ARCHIVE: (itemId) => `${API_BASE_URL}/items.php?action=archive&id=${itemId}`,
        RESTORE: (itemId) => `${API_BASE_URL}/items.php?action=restore&id=${itemId}`
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
        BY_ID: (id) => `${API_BASE_URL}/announcements.php?action=${id}`,
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

    // Upload endpoints
    UPLOAD: {
        IMAGE: `${API_BASE_URL.replace('/api', '')}/upload.php`
    },
    
    // Direct image upload endpoint for consistency
    UPLOAD_IMAGE: `${API_BASE_URL.replace('/api', '')}/upload.php`,

    // Messages endpoints
    MESSAGES: {
        SEND: `${API_BASE_URL}/messages.php?action=send`,
        CONVERSATION: (conversationId) => `${API_BASE_URL}/messages.php?action=conversation_messages&conversation_id=${conversationId}`,
        CONVERSATIONS: (userId) => `${API_BASE_URL}/messages.php?action=conversations&user_id=${userId}`,
        START_CONVERSATION: `${API_BASE_URL}/messages.php?action=start_conversation`
    },

    // Email endpoints
    EMAIL: {
        VERIFY: `${API_BASE_URL}/email.php?action=verify_email`
    },

    // Admin endpoints
    ADMIN: {
        USERS: {
            ALL: `${API_BASE_URL}/users.php?action=all`,
            STATS: `${API_BASE_URL}/users.php?action=stats`,
            UPDATE_STATUS: `${API_BASE_URL}/users.php?action=update_status`,
            DELETE: `${API_BASE_URL}/users.php?action=delete`
        },
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
    console.log('🖼️ Image URL:', fullUrl);
    return fullUrl;
};

// Export the base URL for any custom endpoints
export { API_BASE_URL };
