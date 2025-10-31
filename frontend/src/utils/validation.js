// src/utils/validation.js
// Validation helper functions

/**
 * Validate finder information for Mark as Found feature
 * @param {Object} info - Finder information object
 * @param {string} info.name - Finder's full name
 * @param {string} info.studentId - Finder's student ID
 * @param {string} info.contactInfo - Finder's contact information
 * @returns {string|null} Error message or null if valid
 */
export const validateFinderInfo = (info) => {
    if (!info.name || !info.name.trim()) {
        return 'Full name is required';
    }
    
    if (!info.studentId || !info.studentId.trim()) {
        return 'Student ID is required';
    }
    
    if (!info.contactInfo || !info.contactInfo.trim()) {
        return 'Contact information is required';
    }
    
    return null;
};

/**
 * Validate item form data
 * @param {Object} item - Item data object
 * @returns {string|null} Error message or null if valid
 */
export const validateItemForm = (item) => {
    if (!item.item_name || !item.item_name.trim()) {
        return 'Item name is required';
    }
    
    if (!item.description || !item.description.trim()) {
        return 'Description is required';
    }
    
    if (!item.location || !item.location.trim()) {
        return 'Location is required';
    }
    
    if (!item.category || !item.category.trim()) {
        return 'Category is required';
    }
    
    return null;
};

/**
 * Check if a location is a custom location (not in predefined list)
 * @param {string} location - Location to check
 * @param {Array} predefinedLocations - Array of predefined locations
 * @returns {boolean} True if custom location
 */
export const isCustomLocation = (location, predefinedLocations) => {
    return location && !predefinedLocations.includes(location);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number format (Philippine format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
export const isValidPhoneNumber = (phone) => {
    // Accepts formats: +639XXXXXXXXX or 09XXXXXXXXX
    const phoneRegex = /^(\+639|09)\d{9}$/;
    return phoneRegex.test(phone);
};
