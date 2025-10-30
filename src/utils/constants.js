// src/utils/constants.js
// Shared constants across the application

// Location options for lost and found items
export const PREDEFINED_LOCATIONS = [
    'CLA', 'CLB', 'CLC', 
    'CSB201', 'CSB301', 
    'GYM', 'LIBRARY', 
    'NB201', 'NB202', 'NB203', 
    'NB301', 'NB302', 'NB303', 
    'NB401', 'NB402', 'NB403'
];

export const LOCATION_OPTIONS = [
    // New Building - 1st Floor
    { value: 'Prayer Room', label: 'Prayer Room (NB 1F)' },
    { value: 'Office of College Dean', label: 'Office of College Dean (NB 1F)' },
    { value: 'Board of Trustees Room', label: 'Board of Trustees Room (NB 1F)' },
    { value: 'Dean College of Education', label: 'Dean College of Education (NB 1F)' },
    { value: 'Office of the College President', label: 'Office of the College President (NB 1F)' },
    
    // New Building - 2nd Floor
    { value: 'NB201', label: 'NB 201 Room' },
    { value: 'NB202', label: 'NB 202 Room' },
    { value: 'NB203', label: 'NB 203 Room' },
    
    // New Building - 3rd Floor
    { value: 'NB301', label: 'NB 301 Room' },
    { value: 'NB302', label: 'NB 302 Room' },
    { value: 'NB303', label: 'NB 303 Room' },
    
    // New Building - 4th Floor
    { value: 'NB401', label: 'NB 401 Room' },
    { value: 'NB402', label: 'NB 402 Room' },
    { value: 'NB403', label: 'NB 403 Room' },
    
    // CS Building - 1st Floor
    { value: 'Office of Student Affairs', label: 'Office of Student Affairs (CS 1F)' },
    { value: 'Faculty Room', label: 'Faculty Room (CS 1F)' },
    { value: 'Office of College President CS', label: 'Office of College President (CS 1F)' },
    { value: 'Audio-Visual Room', label: 'Audio-Visual Room (CS 1F)' },
    
    // CS Building - 2nd Floor
    { value: 'CLB', label: 'CLB (CS 2F)' },
    { value: 'CSB201', label: 'CSB 201 (CS 2F)' },
    { value: 'CLA', label: 'CLA (CS 2F)' },
    
    // CS Building - 3rd Floor
    { value: 'CLC', label: 'CLC (CS 3F)' },
    { value: 'CSB301', label: 'CSB 301 (CS 3F)' },
    { value: 'CSB302', label: 'CSB 302 (CS 3F)' },
    { value: 'Stock Room', label: 'Stock Room (CS 3F)' },
    
    // Other Locations
    { value: 'GYM', label: 'GYM' },
    { value: 'LIBRARY', label: 'LIBRARY' },
    { value: 'Others', label: 'Others (please specify)' }
];

// Time intervals
export const REFRESH_INTERVAL_MS = 30000; // 30 seconds

// Item status options
export const ITEM_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CLAIMED: 'claimed',
    ARCHIVED: 'archived',
    LOST: 'lost',
    FOUND: 'found'
};

// Status colors for UI
export const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    claimed: 'bg-blue-100 text-blue-800',
    archived: 'bg-gray-100 text-gray-800'
};

// Type colors for UI
export const TYPE_COLORS = {
    lost: 'bg-red-100 text-red-800',
    found: 'bg-green-100 text-green-800'
};

// Archive threshold
export const ARCHIVE_DAYS_THRESHOLD = 14; // 2 weeks
