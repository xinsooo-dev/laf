// src/components/LoadingSpinner.jsx
import React from 'react';

function LoadingSpinner({ message = 'Loading...', size = 'default' }) {
    const sizeClasses = {
        small: 'h-4 w-4',
        default: 'h-8 w-8',
        large: 'h-12 w-12'
    };

    return (
        <div className="text-center py-12">
            <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-blue-600 mx-auto`}></div>
            {message && <p className="text-gray-600 mt-2">{message}</p>}
        </div>
    );
}

export default LoadingSpinner;
