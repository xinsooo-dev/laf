import React, { useState, useEffect } from 'react';
import { Search, Eye, Check, X, MapPin, Calendar, User, Package, Edit, Phone, Mail, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { API_ENDPOINTS, getAssetUrl } from '../utils/api';

const ManageFoundItems = () => {
    const [foundItems, setFoundItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [categories, setCategories] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    useEffect(() => {
        fetchFoundItems();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.CATEGORIES.ALL);
            const data = await response.json();
            if (data.success) {
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchFoundItems = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.ALL);
            const data = await response.json();
            console.log('Found items API response:', data); // Debug log

            if (data.success && data.items) {
                // Debug: Log all items to see their status values
                console.log('All items from API:', data.items.map(item => ({ id: item.id, status: item.status, item_name: item.item_name })));

                // Filter only found items - check for both 'found' status and 'Found' type
                const foundItemsData = data.items.filter(item =>
                    item.status === 'found' ||
                    item.type === 'found' ||
                    item.status === 'Found' ||
                    item.type === 'Found'
                );
                setFoundItems(foundItemsData);
                console.log('Found items loaded:', foundItemsData.length);
            } else if (Array.isArray(data)) {
                // Handle old format response (direct array)
                console.log('All items from API (old format):', data.map(item => ({ id: item.id, status: item.status, item_name: item.item_name })));
                const foundItemsData = data.filter(item =>
                    item.status === 'found' ||
                    item.type === 'found' ||
                    item.status === 'Found' ||
                    item.type === 'Found'
                );
                setFoundItems(foundItemsData);
                console.log('Found items loaded (old format):', foundItemsData.length);
            } else {
                console.error('Failed to fetch found items:', data.message);
                setFoundItems([]);
            }
        } catch (error) {
            console.error('Error fetching found items:', error);
            setFoundItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        setIsFullscreen(false);
        setZoomLevel(1);
    };

    const handleStatusUpdate = async (itemId, newStatus) => {
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.BY_ID(itemId), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus
                })
            });

            const data = await response.json();

            if (data.success) {
                // Update local state
                setFoundItems(prev => prev.map(item =>
                    item.id === itemId ? { ...item, status: newStatus } : item
                ));
                alert(`Item ${newStatus} successfully!`);

                // Close modal if item was updated from within modal
                if (selectedItem && selectedItem.id === itemId) {
                    closeModal();
                }
            } else {
                alert(`Failed to update item: ${data.message}`);
            }
        } catch (error) {
            alert('Network error occurred while updating item');
        }
    };
    const filteredItems = foundItems.filter(item => {
        const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'claimed': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading found items...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 w-full">
            <div className="hidden md:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">Manage Found Items</h2>
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 flex-shrink-0">
                    <Package className="h-4 w-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">{filteredItems.length} found items</span>
                </div>
            </div>
            
            {/* Mobile item count */}
            <div className="md:hidden flex items-center justify-end">
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Package className="h-4 w-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">{filteredItems.length} found items</span>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 w-full overflow-hidden">
                <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="flex-1 relative min-w-0">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search found items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Items Grid */}
            {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No found items found</h3>
                    <p className="text-gray-600">No found items match your current filters.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 md:p-6">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                                                <Package className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-lg font-semibold text-gray-800 truncate">{item.item_name || item.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                                    </span>
                                                    {item.category && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                            {item.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="md:col-span-2">
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            <strong>Item Description:</strong>
                                                        </p>
                                                        <p className="text-sm text-gray-800">{item.description}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <MapPin className="h-4 w-4 flex-shrink-0" />
                                                        <span className="truncate">{item.location}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <User className="h-4 w-4 flex-shrink-0" />
                                                    <span className="truncate">Reported by: {item.reporter_name || item.full_name || 'Unknown'}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4 flex-shrink-0" />
                                                    <span>Found on: {formatDate(item.date_reported)}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4 flex-shrink-0" />
                                                    <span>Reported: {formatDate(item.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-col space-y-2 md:ml-6 w-full md:w-auto md:flex-shrink-0">
                                        <button
                                            onClick={() => handleView(item)}
                                            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                                        >
                                            View Details
                                        </button>

                                        {item.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(item.id, 'approved')}
                                                    className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                                                >
                                                    Approve
                                                </button>

                                                <button
                                                    onClick={() => handleStatusUpdate(item.id, 'rejected')}
                                                    className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Item Details Modal - Landscape Layout */}
            {showModal && selectedItem && (
                <>
                    {/* Transparent Overlay - Blocks background clicks but keeps it visible */}
                    <div
                        className="fixed inset-0 z-40"
                        style={{ pointerEvents: 'auto' }}
                        onClick={(e) => e.stopPropagation()}
                    ></div>

                    {/* Modal Content */}
                    <div
                        className="fixed inset-0 flex items-start md:items-center justify-center z-50 p-0 md:p-4 pt-16 md:pt-4"
                        onClick={closeModal}
                    >
                        <div
                            className="bg-white rounded-t-2xl md:rounded-xl shadow-2xl max-w-5xl w-full h-[calc(100vh-4rem)] md:h-auto md:max-h-[85vh] transform transition-all duration-300 scale-100 animate-fade-in flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header - Fixed */}
                            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-2.5 md:p-4 flex-shrink-0">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-sm md:text-lg lg:text-xl font-bold mb-1 break-words line-clamp-1 md:line-clamp-2">
                                            {selectedItem.item_name || selectedItem.name}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                                            <span className={`inline-flex px-1.5 md:px-3 py-0.5 text-xs md:text-sm font-semibold rounded-full ${getStatusColor(selectedItem.status)}`}>
                                                {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                                            </span>
                                            {selectedItem.category && (
                                                <span className="inline-flex px-1.5 md:px-3 py-0.5 text-xs md:text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                                                    {selectedItem.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="text-white hover:text-gray-200 transition-colors p-0.5 md:p-1.5 hover:bg-white hover:bg-opacity-20 rounded flex-shrink-0"
                                    >
                                        <X className="w-4 h-4 md:w-6 md:h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body - Scrollable */}
                            <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
                                {/* Image Section */}
                                <div className="w-full md:w-2/5 bg-gray-50 flex flex-col md:border-r border-gray-200 relative">
                                    {selectedItem.image_path && selectedItem.image_path !== 'NULL' ? (
                                        <div className="relative w-full h-full flex flex-col">
                                            {/* Top Button - Fullscreen */}
                                            <div className="flex justify-end items-center p-2 md:p-3 bg-gray-50 border-b border-gray-200 md:border-0">
                                                <button
                                                    onClick={() => setIsFullscreen(true)}
                                                    className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1.5 md:p-2 rounded-lg transition-all"
                                                    title="View Fullscreen"
                                                >
                                                    <Maximize2 className="h-4 w-4 md:h-5 md:w-5" />
                                                </button>
                                            </div>
                                            {/* Image */}
                                            <div className="flex-1 flex items-center justify-center p-3 md:p-6 pt-0 md:pt-0">
                                                <img
                                                    src={getAssetUrl(selectedItem.image_path)}
                                                    alt={selectedItem.item_name || selectedItem.name}
                                                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => setIsFullscreen(true)}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.parentElement.nextElementSibling.style.display = 'flex';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ) : null}
                                    <div className={`flex-col items-center justify-center w-full h-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 ${selectedItem.image_path && selectedItem.image_path !== 'NULL' ? 'hidden' : 'flex'}`}>
                                        <Eye className="h-16 w-16 text-gray-400 mb-3" />
                                        <p className="text-gray-500 text-lg font-medium">No image attached</p>
                                        <p className="text-gray-400 text-sm">Image not provided for this item</p>
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="w-full md:w-3/5 p-3 md:p-6 flex flex-col md:overflow-y-auto">
                                    <div className="flex-1 space-y-3 md:space-y-4">
                                        {/* Description */}
                                        <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                                            <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-2 flex items-center">
                                                <Edit className="h-3 w-3 md:h-4 md:w-4 mr-2 text-blue-600 flex-shrink-0" />
                                                <span>Description</span>
                                            </h3>
                                            <p className="text-gray-700 text-xs md:text-sm leading-relaxed break-words">
                                                {selectedItem.description || 'No description provided'}
                                            </p>
                                        </div>

                                        {/* Location & Date */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                                                <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-2 flex items-center">
                                                    <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-2 text-red-600 flex-shrink-0" />
                                                    <span>Location Found</span>
                                                </h3>
                                                <p className="text-gray-700 text-xs md:text-sm break-words">
                                                    {selectedItem.location || 'Location not specified'}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                                                <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-2 flex items-center">
                                                    <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-2 text-green-600 flex-shrink-0" />
                                                    <span>Date Found</span>
                                                </h3>
                                                <p className="text-gray-700 text-xs md:text-sm">
                                                    {selectedItem.date_reported
                                                        ? new Date(selectedItem.date_reported).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })
                                                        : 'Date not available'
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* Reporter Information */}
                                        <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                                            <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-3 flex items-center">
                                                <User className="h-3 w-3 md:h-4 md:w-4 mr-2 text-purple-600 flex-shrink-0" />
                                                <span>Reporter Information</span>
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Reporter Name</p>
                                                    <p className="text-gray-800 font-medium text-xs md:text-sm break-words">
                                                        {selectedItem.reporter_name || selectedItem.full_name || 'Not provided'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Contact Info</p>
                                                    <p className="text-gray-800 font-medium text-xs md:text-sm break-words">
                                                        {selectedItem.contact_info || 'Not provided'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-3 pt-3 md:pt-4 mt-3 md:mt-4 border-t border-gray-200">
                                        {selectedItem.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        handleStatusUpdate(selectedItem.id, 'approved');
                                                        closeModal();
                                                    }}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 md:px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm md:text-base w-full md:w-auto"
                                                >
                                                    <Check size={16} />
                                                    <span>Approve</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleStatusUpdate(selectedItem.id, 'rejected');
                                                        closeModal();
                                                    }}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm md:text-base w-full md:w-auto"
                                                >
                                                    <X size={16} />
                                                    <span>Reject</span>
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={closeModal}
                                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base w-full md:w-auto"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Fullscreen Image Viewer */}
            {isFullscreen && selectedItem?.image_path && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-95 z-[100] flex items-center justify-center p-4"
                    onClick={() => setIsFullscreen(false)}
                >
                    <button
                        onClick={() => setIsFullscreen(false)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 hover:bg-opacity-70 p-3 rounded-lg transition-all z-10"
                        title="Close Fullscreen"
                    >
                        <X size={32} />
                    </button>

                    {/* Zoom Controls */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-[101]">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setZoomLevel(prev => Math.max(0.5, prev - 0.25));
                            }}
                            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg transition-all flex items-center gap-2 shadow-lg border border-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            title="Zoom Out"
                            disabled={zoomLevel <= 0.5}
                        >
                            <ZoomOut size={20} />
                            <span className="text-sm font-medium">-</span>
                        </button>
                        <div className="bg-gray-800 text-white px-4 py-3 rounded-lg flex items-center shadow-lg border border-gray-600">
                            <span className="text-sm font-medium">{Math.round(zoomLevel * 100)}%</span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setZoomLevel(prev => Math.min(3, prev + 0.25));
                            }}
                            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg transition-all flex items-center gap-2 shadow-lg border border-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            title="Zoom In"
                            disabled={zoomLevel >= 3}
                        >
                            <ZoomIn size={20} />
                            <span className="text-sm font-medium">+</span>
                        </button>
                    </div>

                    <img
                        src={getAssetUrl(selectedItem.image_path)}
                        alt={selectedItem.item_name || selectedItem.name}
                        className="max-w-full max-h-full object-contain"
                        style={{
                            transform: `scale(${zoomLevel})`,
                            transition: 'transform 0.2s ease-in-out'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default ManageFoundItems;
