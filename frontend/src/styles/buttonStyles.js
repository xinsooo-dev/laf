// Consistent Button Styles for All Admin Pages

export const buttonStyles = {
    // Primary Actions
    primary: "bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md",
    
    // Success Actions (Mark as Found, Approve, etc.)
    success: "bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md",
    
    // Warning Actions (Archive, etc.)
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md",
    
    // Danger Actions (Delete, Reject, etc.)
    danger: "bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md",
    
    // Secondary Actions (Close, Cancel, etc.)
    secondary: "bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md",
    
    // Info Actions (View, Edit, etc.)
    info: "bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md",
    
    // Purple Actions (Claim, Special, etc.)
    purple: "bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md",
    
    // Archive Actions
    archive: "bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md",
    
    // Disabled State
    disabled: "bg-gray-300 text-gray-500 font-medium px-4 py-2 rounded-lg cursor-not-allowed opacity-60",
    
    // Small Buttons (for cards)
    small: {
        primary: "bg-blue-600 hover:bg-blue-700 text-white font-medium px-2 py-1.5 text-xs md:text-sm rounded-md transition-all duration-200 shadow-sm hover:shadow-md",
        success: "bg-green-600 hover:bg-green-700 text-white font-medium px-2 py-1.5 text-xs md:text-sm rounded-md transition-all duration-200 shadow-sm hover:shadow-md",
        danger: "bg-red-600 hover:bg-red-700 text-white font-medium px-2 py-1.5 text-xs md:text-sm rounded-md transition-all duration-200 shadow-sm hover:shadow-md",
        secondary: "bg-gray-500 hover:bg-gray-600 text-white font-medium px-2 py-1.5 text-xs md:text-sm rounded-md transition-all duration-200 shadow-sm hover:shadow-md",
        purple: "bg-purple-600 hover:bg-purple-700 text-white font-medium px-2 py-1.5 text-xs md:text-sm rounded-md transition-all duration-200 shadow-sm hover:shadow-md",
        archive: "bg-gray-600 hover:bg-gray-700 text-white font-medium px-2 py-1.5 text-xs md:text-sm rounded-md transition-all duration-200 shadow-sm hover:shadow-md",
        disabled: "bg-gray-300 text-gray-500 font-medium px-2 py-1.5 text-xs md:text-sm rounded-md cursor-not-allowed opacity-60"
    }
};

// Modal Styles
export const modalStyles = {
    overlay: "fixed inset-0 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-0 sm:p-2 md:p-4 pt-8 sm:pt-16 md:pt-4",
    
    container: {
        small: "bg-white rounded-lg shadow-2xl max-w-md w-full mx-4",
        medium: "bg-white rounded-t-xl sm:rounded-t-2xl md:rounded-xl shadow-2xl max-w-2xl w-full h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] md:h-auto md:max-h-[85vh] flex flex-col overflow-hidden",
        large: "bg-white rounded-t-xl sm:rounded-t-2xl md:rounded-xl shadow-2xl max-w-4xl w-full h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] md:h-auto md:max-h-[90vh] flex flex-col overflow-hidden"
    },
    
    header: {
        blue: "bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 md:p-4 flex-shrink-0",
        green: "bg-gradient-to-r from-green-600 to-green-700 text-white p-3 md:p-4 flex-shrink-0",
        red: "bg-gradient-to-r from-red-600 to-red-700 text-white p-3 md:p-4 flex-shrink-0",
        purple: "bg-gradient-to-r from-purple-600 to-purple-700 text-white p-3 md:p-4 flex-shrink-0",
        gray: "bg-gradient-to-r from-gray-600 to-gray-700 text-white p-3 md:p-4 flex-shrink-0"
    },
    
    body: "flex-1 overflow-y-auto p-4 md:p-6",
    
    footer: "flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-3 pt-3 md:pt-4 mt-3 md:mt-4 border-t border-gray-200"
};

// Card Styles
export const cardStyles = {
    container: "bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200",
    header: "p-4 border-b border-gray-200",
    body: "p-4",
    footer: "p-4 border-t border-gray-200 bg-gray-50"
};
