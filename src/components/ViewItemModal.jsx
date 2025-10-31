// src/components/ViewItemModal.jsx
import React from 'react';
import { X, MapPin, Calendar, User, Eye, Maximize2 } from 'lucide-react';
import { getAssetUrl } from '../utils/api';

function ViewItemModal({ 
    item, 
    onClose, 
    onFullscreen,
    isArchived = false,
    children // For additional content like history or custom sections
}) {
    if (!item) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-0 sm:p-2 md:p-4 pt-8 sm:pt-16 md:pt-4" onClick={onClose}>
            <div className="bg-white rounded-t-xl sm:rounded-t-2xl md:rounded-xl shadow-2xl max-w-3xl w-full h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] md:h-auto md:max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 md:p-6 flex-shrink-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-base md:text-xl lg:text-2xl font-bold text-white mb-2 break-words line-clamp-2">
                                {item.item_name || item.itemName}
                            </h2>
                            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                                <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-semibold ${
                                    (item.type === 'lost' || item.type?.toLowerCase() === 'lost' || item.status === 'lost' || item.status?.toLowerCase() === 'lost')
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                }`}>
                                    {item.type || item.status}
                                </span>
                                {isArchived && (
                                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-white bg-opacity-90 text-gray-800 rounded-full text-xs md:text-sm font-semibold">
                                        Archived
                                    </span>
                                )}
                                {item.category && (
                                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-purple-100 text-purple-800 rounded-full text-xs md:text-sm font-semibold">
                                        {item.category}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors p-1 md:p-2 hover:bg-white hover:bg-opacity-20 rounded flex-shrink-0"
                        >
                            <X className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    </div>
                </div>

                {/* Body - Scrollable */}
                <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
                    {/* Image Section */}
                    <div className="w-full md:w-2/5 bg-gray-50 flex flex-col md:border-r border-gray-200 relative">
                        {(item.image_path || item.image_url || item.imagePath) ? (
                            <div className="relative w-full h-full flex flex-col">
                                {/* Fullscreen Button */}
                                {onFullscreen && (
                                    <div className="flex justify-end items-center p-2 md:p-3 bg-gray-50 border-b border-gray-200 md:border-0">
                                        <button
                                            onClick={onFullscreen}
                                            className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1.5 md:p-2 rounded-lg transition-all"
                                            title="View Fullscreen"
                                        >
                                            <Maximize2 className="h-4 w-4 md:h-5 md:w-5" />
                                        </button>
                                    </div>
                                )}
                                {/* Image */}
                                <div className="flex-1 flex items-center justify-center p-3 md:p-6 pt-0 md:pt-0">
                                    <img
                                        src={getAssetUrl(item.image_path || item.image_url || item.imagePath)}
                                        alt={item.item_name || item.itemName}
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={onFullscreen}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                                <Eye className="h-16 w-16 text-gray-400 mb-3" />
                                <p className="text-gray-500 text-lg font-medium">No image attached</p>
                                <p className="text-gray-400 text-sm">Image not provided for this item</p>
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="w-full md:w-3/5 p-3 md:p-6 flex flex-col md:overflow-y-auto">
                        <div className="flex-1 space-y-3 md:space-y-4">
                            {/* Details Grid */}
                            <div className="grid grid-cols-1 gap-4 md:gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-600 uppercase mb-1">Description</h3>
                                        <p className="text-gray-700">{item.description || 'No description provided'}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-600 uppercase mb-1">Location</h3>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <MapPin className="h-5 w-5 text-gray-500" />
                                            <span>{item.location || 'Not specified'}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-600 uppercase mb-1">Date Reported</h3>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Calendar className="h-5 w-5 text-gray-500" />
                                            <span>
                                                {item.date_reported 
                                                    ? new Date(item.date_reported.replace(' ', 'T')).toLocaleDateString() 
                                                    : (item.created_at ? new Date(item.created_at.replace(' ', 'T')).toLocaleDateString() : 'N/A')
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {isArchived && item.archived_at && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-1">Archived Date</h3>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Calendar className="h-5 w-5 text-gray-500" />
                                                <span>{new Date(item.archived_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {/* Reporter Information */}
                                    <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                                        <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-3 flex items-center">
                                            <User className="h-3 w-3 md:h-4 md:w-4 mr-2 text-purple-600 flex-shrink-0" />
                                            <span>Reported By</span>
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Name</p>
                                                <p className="text-gray-800 font-medium text-xs md:text-sm break-words">
                                                    {item.reporter_name || item.reportedBy || item.full_name || 'Not provided'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Student ID</p>
                                                <p className="text-gray-800 font-medium text-xs md:text-sm break-words">
                                                    {item.student_id || 'Not provided'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Contact Info</p>
                                                <p className="text-gray-800 font-medium text-xs md:text-sm break-words">
                                                    {item.contact_info || item.contactInfo || 'Not provided'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Finder Information (for found items) */}
                                    {(item.finder_name || item.finder_student_id || item.finder_contact) && (
                                        <div className="bg-green-50 rounded-lg p-3 md:p-4">
                                            <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-3 flex items-center">
                                                <User className="h-3 w-3 md:h-4 md:w-4 mr-2 text-green-600 flex-shrink-0" />
                                                <span>Found By</span>
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Name</p>
                                                    <p className="text-gray-800 font-medium text-xs md:text-sm break-words">
                                                        {item.finder_name || 'Not provided'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Student ID</p>
                                                    <p className="text-gray-800 font-medium text-xs md:text-sm break-words">
                                                        {item.finder_student_id || 'Not provided'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Contact Info</p>
                                                    <p className="text-gray-800 font-medium text-xs md:text-sm break-words">
                                                        {item.finder_contact || 'Not provided'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Additional Children Content */}
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Actions */}
                <div className="bg-gray-50 p-3 md:p-4 border-t border-gray-200 flex-shrink-0 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 md:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm md:text-base font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ViewItemModal;
