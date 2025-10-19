// src/admin/ManageLostFoundItems.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, MapPin, Calendar, User, Package, Edit, Check, X, Maximize2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { API_ENDPOINTS, getAssetUrl } from '../utils/api';

function ManageLostFoundItems() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [categories, setCategories] = useState([]);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [editImagePreview, setEditImagePreview] = useState(null);
    const [editImageFile, setEditImageFile] = useState(null);

    useEffect(() => {
        fetchItems();
        fetchCategories();

        // Add event listener to refresh data when window gains focus
        const handleFocus = () => {
            fetchItems();
        };

        window.addEventListener('focus', handleFocus);
        
        // Set up interval to refresh data every 30 seconds
        const interval = setInterval(() => {
            fetchItems();
        }, 30000);

        return () => {
            window.removeEventListener('focus', handleFocus);
            clearInterval(interval);
        };
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

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.ALL);
            const data = await response.json();

            if (data.success) {
                // Filter lost and found items, but exclude claimed and archived items
                const lostFoundItems = data.items.filter(item => {
                    const isLostOrFound = item.type === 'lost' || item.type === 'found' ||
                                         item.status === 'lost' || item.status === 'found';
                    const isNotClaimedOrArchived = item.status !== 'claimed' && item.status !== 'archived';
                    return isLostOrFound && isNotClaimedOrArchived;
                });
                setItems(lostFoundItems);
            } else {
                console.error('Failed to fetch items:', data.message);
                setItems([]);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setEditingItem({ ...item });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        try {
            let imagePath = editingItem.image_path;

            // Handle image upload if a new image was selected
            if (editImageFile) {
                const formData = new FormData();
                formData.append('image', editImageFile);

                const uploadResponse = await fetch(API_ENDPOINTS.UPLOAD_IMAGE, {
                    method: 'POST',
                    body: formData
                });

                const uploadData = await uploadResponse.json();
                if (uploadData.success) {
                    imagePath = uploadData.filename ? `uploads/${uploadData.filename}` : null;
                } else {
                    alert('Failed to upload image. Proceeding without image update.');
                }
            }

            const response = await fetch(API_ENDPOINTS.ITEMS.BY_ID(editingItem.id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_name: editingItem.item_name,
                    description: editingItem.description,
                    location: editingItem.location,
                    category: editingItem.category,
                    type: editingItem.type,
                    image_path: imagePath
                })
            });

            const data = await response.json();

            if (data.success) {
                setItems(prev => prev.map(item =>
                    item.id === editingItem.id ? { ...item, ...editingItem, image_path: imagePath } : item
                ));
                alert('Item updated successfully!');
                closeEditModal();
            } else {
                alert(`Failed to update item: ${data.message}`);
            }
        } catch (error) {
            alert('Network error occurred while updating item');
        }
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingItem(null);
        setEditImagePreview(null);
        setEditImageFile(null);
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditImageFile(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
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
                // Remove item from list if it's claimed or archived
                if (newStatus.toLowerCase() === 'claimed' || newStatus.toLowerCase() === 'archived') {
                    setItems(prev => prev.filter(item => item.id !== itemId));
                } else {
                    // Update status for other changes
                    setItems(prev => prev.map(item =>
                        item.id === itemId ? { ...item, status: newStatus } : item
                    ));
                }
                alert(`Item ${newStatus} successfully!`);
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


    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        setIsFullscreen(false);
        setZoomLevel(1);
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' ||
            (filterType === 'lost' && (item.type === 'lost' || item.status === 'lost')) ||
            (filterType === 'found' && (item.type === 'found' || item.status === 'found'));
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
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

    const getTypeColor = (type) => {
        return type === 'lost' || type === 'Lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading items...</span>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full overflow-hidden">
            {/* Mobile Header */}
            <div className="block md:hidden mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 mb-1">Manage Lost & Found Items</h1>
                        <p className="text-sm text-gray-600">Manage all reported lost and found items</p>
                    </div>
                </div>
            </div>

            <div className="hidden md:block mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 break-words">Manage Lost & Found Items</h1>
                        <p className="text-sm md:text-base text-gray-600">Manage all reported lost and found items</p>
                    </div>
                </div>
            </div>

            {/* Filtered Total Display */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                            {filterType === 'lost' ? 'Lost' : filterType === 'found' ? 'Found' : 'All'} Items
                        </h3>
                        <p className="text-sm text-gray-600">
                            {filterType === 'all' ? 'Showing all items' : `Showing ${filterType} items only`}
                        </p>
                    </div>
                    <div className="text-center sm:text-right">
                        <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${filterType === 'lost' ? 'text-red-600' : filterType === 'found' ? 'text-green-600' : 'text-gray-600'}`}>
                            {filteredItems.length}
                        </div>
                        <div className="text-sm text-gray-500">Total</div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6 w-full overflow-hidden">
                <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search items, descriptions, or reporters..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="lost">Lost</option>
                        <option value="found">Found</option>
                    </select>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={fetchItems}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors flex items-center gap-2"
                        title="Refresh items list"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Items Grid */}
            {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                        {filterType === 'all' ? 'No items found' : `No ${filterType} items found`}
                    </h3>
                    <p className="text-gray-600">
                        {filterType === 'all'
                            ? 'No items match your current filters.'
                            : `No ${filterType} items match your current filters.`
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-4 border-gray-400">
                            {/* Item Image */}
                            <div className="h-40 md:h-48 lg:h-52 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                {(item.image_path || item.image_url) ? (
                                    <img
                                        src={getAssetUrl(item.image_path || item.image_url)}
                                        alt={item.item_name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                                            e.target.parentElement.innerHTML = '<div class="text-center text-gray-400"><div class="text-4xl mb-2">📦</div><p class="text-sm">No Image</p></div>';
                                        }}
                                    />
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <div className="text-4xl mb-2">📦</div>
                                        <p className="text-sm">No Image</p>
                                    </div>
                                )}
                                {/* Status Badge */}
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(item.type || item.status)}`}>
                                    {item.type === 'lost' || item.status === 'lost' ? 'Lost' : 'Found'}
                                </div>
                            </div>

                            {/* Item Details */}
                            <div className="p-3 md:p-4">
                                <h3 className="font-bold text-sm md:text-base lg:text-lg text-gray-800 mb-2 truncate">
                                    {item.item_name}
                                </h3>

                                {/* Full Description Section */}
                                <div className="mb-3">
                                    <p className="text-xs md:text-sm text-gray-600 mb-1 font-medium">Description:</p>
                                    <p className="text-xs md:text-sm text-gray-800 leading-relaxed">{item.description}</p>
                                </div>

                                <div className="space-y-1.5 text-xs md:text-sm text-gray-500 mb-3">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-3 w-3 md:h-4 flex-shrink-0" />
                                        <span className="truncate">{item.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3 md:h-4 flex-shrink-0" />
                                        <span className="truncate text-xs">{item.date_reported ? new Date(item.date_reported.replace(' ', 'T')).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        }) : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-3 w-3 md:h-4 flex-shrink-0" />
                                        <span className="truncate">By: {item.reporter_name || 'Unknown'}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5 mt-2">
                                    <button
                                        onClick={() => handleView(item)}
                                        className="w-full px-2 py-1.5 text-xs md:text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 group"
                                    >
                                        <Eye className="h-3 w-3 md:h-4 group-hover:scale-110 transition-transform" />
                                        <span>View Details</span>
                                    </button>

                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="w-full px-2 py-1.5 text-xs md:text-sm font-medium bg-orange-600 text-white rounded-md hover:bg-orange-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 group"
                                    >
                                        <Edit className="h-3 w-3 md:h-4 group-hover:scale-110 transition-transform" />
                                        <span>Edit Item</span>
                                    </button>

                                    {item.status === 'pending' && (
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => handleStatusUpdate(item.id, 'approved')}
                                                className="flex-1 px-2 py-1.5 text-xs md:text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 group"
                                            >
                                                <Check className="h-3 w-3 md:h-4 group-hover:scale-110 transition-transform" />
                                                <span>Approve</span>
                                            </button>

                                            <button
                                                onClick={() => handleStatusUpdate(item.id, 'rejected')}
                                                className="flex-1 px-2 py-1.5 text-xs md:text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 group"
                                            >
                                                <X className="h-3 w-3 md:h-4 group-hover:scale-110 transition-transform" />
                                                <span>Reject</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Item Details Modal */}
            {showModal && selectedItem && (
                <>
                    {/* Transparent Overlay */}
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
                            {/* Modal Header */}
                            <div className={`text-white p-2.5 md:p-4 flex-shrink-0 ${selectedItem.type === 'lost' ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gradient-to-r from-green-600 to-green-700'}`}>
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-sm md:text-lg lg:text-xl font-bold mb-1 break-words line-clamp-1 md:line-clamp-2">
                                            {selectedItem.item_name}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                                            <span className={`inline-flex px-1.5 md:px-3 py-0.5 text-xs md:text-sm font-semibold rounded-full ${getTypeColor(selectedItem.type)}`}>
                                                {selectedItem.type === 'lost' ? 'Lost' : 'Found'}
                                            </span>
                                            <span className={`inline-flex px-1.5 md:px-3 py-0.5 text-xs md:text-sm font-semibold rounded-full ${getStatusColor(selectedItem.status)}`}>
                                                {selectedItem.status}
                                            </span>
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

                            {/* Modal Body */}
                            <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
                                {/* Image Section */}
                                <div className="w-full md:w-2/5 bg-gray-50 flex flex-col md:border-r border-gray-200 relative">
                                    {selectedItem.image_path && selectedItem.image_path !== 'NULL' && selectedItem.image_path !== 'null' && selectedItem.image_path !== '' ? (
                                        <div className="relative w-full h-full flex flex-col">
                                            {/* Fullscreen Button */}
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
                                                    alt={selectedItem.item_name}
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
                                    <div className={`flex-col items-center justify-center w-full h-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 ${selectedItem.image_path && selectedItem.image_path !== 'NULL' && selectedItem.image_path !== 'null' && selectedItem.image_path !== '' ? 'hidden' : 'flex'}`}>
                                        <Package className="h-16 w-16 text-gray-400 mb-3" />
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
                                                    <span>Location</span>
                                                </h3>
                                                <p className="text-gray-700 text-xs md:text-sm break-words">
                                                    {selectedItem.location || 'Location not specified'}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                                                <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-2 flex items-center">
                                                    <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-2 text-green-600 flex-shrink-0" />
                                                    <span>Date Reported</span>
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
                                                        {selectedItem.reporter_name || 'Not provided'}
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
                        alt={selectedItem.item_name}
                        className="max-w-full max-h-full object-contain"
                        style={{
                            transform: `scale(${zoomLevel})`,
                            transition: 'transform 0.2s ease-in-out'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Edit Item Modal */}
            {showEditModal && editingItem && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-transparent"
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-orange-600 text-white p-4 rounded-t-xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">Edit Item</h2>
                                <button
                                    onClick={closeEditModal}
                                    className="text-white hover:text-gray-200 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body - Landscape Layout */}
                        <div className="flex flex-1 overflow-hidden">
                            {/* Left Column: Form Fields */}
                            <div className="w-1/2 p-6 overflow-y-auto">
                                <div className="space-y-4">
                                    {/* Item Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Item Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editingItem.item_name || ''}
                                            onChange={(e) => setEditingItem(prev => ({ ...prev, item_name: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Enter item name"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={editingItem.description || ''}
                                            onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            rows="3"
                                            placeholder="Enter item description"
                                        />
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            value={editingItem.location || ''}
                                            onChange={(e) => setEditingItem(prev => ({ ...prev, location: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Enter location where item was found/lost"
                                        />
                                    </div>

                                    {/* Category and Type */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Category
                                            </label>
                                            <select
                                                value={editingItem.category || ''}
                                                onChange={(e) => setEditingItem(prev => ({ ...prev, category: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Type
                                            </label>
                                            <select
                                                value={editingItem.type || ''}
                                                onChange={(e) => setEditingItem(prev => ({ ...prev, type: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            >
                                                <option value="">Select Type</option>
                                                <option value="lost">Lost</option>
                                                <option value="found">Found</option>
                                            </select>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Right Column: Image Display and Upload */}
                            <div className="w-1/2 bg-gray-50 border-l border-gray-200 flex flex-col p-6">
                                {/* Image Display Area */}
                                <div className="flex-1 flex flex-col items-center justify-center mb-6">
                                    {(editImagePreview || (editingItem.image_path && editingItem.image_path !== 'NULL' && editingItem.image_path !== 'null' && editingItem.image_path !== '')) ? (
                                        <div className="text-center w-full">
                                            <p className="text-sm text-gray-600 mb-4 font-medium">
                                                {editImagePreview ? 'New Image Preview' : 'Current Image'}
                                            </p>
                                            <img
                                                src={editImagePreview || getAssetUrl(editingItem.image_path)}
                                                alt="Item preview"
                                                className="max-w-full max-h-64 object-contain rounded-lg border-2 border-gray-200 bg-white shadow-lg mx-auto"
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <div className="text-6xl mb-4">📦</div>
                                            <p className="text-lg font-medium">No Image</p>
                                            <p className="text-sm">Choose an image below to upload</p>
                                        </div>
                                    )}
                                </div>

                                {/* Image Upload Section */}
                                <div className="w-full">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleEditImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            id="edit-image-upload"
                                        />
                                        <label
                                            htmlFor="edit-image-upload"
                                            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 focus-within:border-orange-500 bg-white text-gray-700 font-medium cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 hover:bg-orange-50"
                                        >
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {editImageFile ? editImageFile.name : 'Choose Image'}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closeEditModal}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                            >
                                <Check className="h-4 w-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageLostFoundItems;
