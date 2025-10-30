// src/admin/ArchivedItems.jsx
import { useState, useEffect } from 'react';
import { Search, Filter, Eye, RotateCcw, Trash2, X, MapPin, Calendar, User, Archive as ArchiveIcon, Maximize2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { API_ENDPOINTS, getAssetUrl } from '../utils/api';
import { SuccessModal, ErrorModal, ConfirmModal } from '../components/Modals';

function ArchivedItems() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    
    // Modal states
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmTitle, setConfirmTitle] = useState('Confirm Action');

    useEffect(() => {
        // Just fetch archived items and categories on load
        // Don't run auto-archive on every page load to prevent re-archiving recently restored items
        fetchArchivedItems();
        fetchCategories();
    }, []);

    const runAutoArchive = async () => {
        try {
            // Silently run auto-archive in the background
            await fetch(API_ENDPOINTS.ADMIN.AUTO_ARCHIVE.RUN);
            // Then fetch the archived items
            fetchArchivedItems();
        } catch (error) {
            console.error('Error running auto-archive:', error);
            // Still fetch archived items even if auto-archive fails
            fetchArchivedItems();
        }
    };

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

    const fetchArchivedItems = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.ARCHIVED);
            const data = await response.json();

            if (data.success) {
                setItems(data.items || []);
            } else {
                console.error('Failed to fetch archived items:', data.message);
                setItems([]);
            }
        } catch (error) {
            console.error('Error fetching archived items:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreClick = (id) => {
        setConfirmAction(() => () => handleRestore(id));
        setConfirmMessage('Are you sure you want to restore this item? It will be moved back to active items.');
        setConfirmTitle('Restore Item');
        setShowConfirm(true);
    };

    const handleRestore = async (id) => {
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.RESTORE(id));
            const data = await response.json();

            if (data.success) {
                setSuccessMessage('Item restored successfully!');
                setShowSuccess(true);
                fetchArchivedItems(); // Refresh the list
            } else {
                setErrorMessage(`Failed to restore item: ${data.message}`);
                setShowError(true);
            }
        } catch (error) {
            console.error('Error restoring item:', error);
            setErrorMessage('Network error occurred while restoring item');
            setShowError(true);
        }
    };

    const handlePermanentDeleteClick = (id) => {
        setConfirmAction(() => () => handlePermanentDelete(id));
        setConfirmMessage('⚠️ WARNING: This will PERMANENTLY delete this item from the database. This action CANNOT be undone. Are you absolutely sure?');
        setConfirmTitle('Permanent Delete');
        setShowConfirm(true);
    };

    const handlePermanentDelete = async (id) => {
        try{
            const response = await fetch(`${API_ENDPOINTS.ITEMS.BASE}?id=${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMessage('Item permanently deleted');
                setShowSuccess(true);
                fetchArchivedItems(); // Refresh the list
            } else {
                setErrorMessage(`Failed to delete item: ${data.message}`);
                setShowError(true);
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            setErrorMessage('Error deleting item. Please try again.');
            setShowError(true);
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

    // Filter items
    const filteredItems = items.filter(item => {
        const matchesSearch = item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || item.type?.toLowerCase() === filterType.toLowerCase();
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
    });

    return (
        <div className="w-full max-w-full overflow-hidden">
            {/* Mobile Header */}
            <div className="block md:hidden mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 mb-1">Archived Items</h1>
                        <p className="text-sm text-gray-600">Items that have been archived</p>
                    </div>
                </div>
            </div>

            <div className="hidden md:block mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Archived Items</h1>
                    <p className="text-sm text-gray-500">Dashboard / Archived Items</p>
                </div>
            </div>

            {/* Filtered Total Display */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                            {filterType === 'lost' ? 'Lost' : filterType === 'found' ? 'Found' : 'All'} Archived Items
                        </h3>
                        <p className="text-sm text-gray-600">
                            {filterType === 'all' ? 'Showing all archived items' : `Showing ${filterType} archived items only`}
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
                            placeholder="Search archived items, descriptions, or reporters..."
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
                        onClick={() => {
                            runAutoArchive();
                        }}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors flex items-center gap-2"
                        title="Refresh archived items list"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Items Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">Loading archived items...</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                    <ArchiveIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No archived items found</p>
                    <p className="text-gray-500 text-sm">Archived items will appear here</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-4 border-gray-400">
                            {/* Item Image - Same sizing as ManageItems */}
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
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${item.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                    {item.type}
                                </div>
                            </div>

                            {/* Item Details */}
                            <div className="p-3 md:p-4">
                                <h3 className="font-bold text-sm md:text-lg text-gray-800 mb-1 md:mb-2 truncate">
                                    {item.item_name}
                                </h3>
                                <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3 overflow-hidden"
                                    style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                    {item.description}
                                </p>

                                <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-500 mb-3">
                                    <div className="flex items-center gap-1 md:gap-2">
                                        <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                        <span className="truncate">{item.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1 md:gap-2">
                                        <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                        <span className="truncate text-xs">{item.date_reported ? new Date(item.date_reported.replace(' ', 'T')).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        }) : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-1 md:gap-2">
                                        <User className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                        <span className="truncate">{item.type === 'lost' ? 'Lost' : 'Found'} by: {item.reporter_name || item.reportedBy || 'Unknown'}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 mt-2">
                                    {/* View Details - Full Width */}
                                    <button
                                        onClick={() => handleView(item)}
                                        className="w-full px-2 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 group"
                                    >
                                        <Eye className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                        <span>View Details</span>
                                    </button>

                                    {/* Restore and Delete - Side by Side */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleRestoreClick(item.id)}
                                            className="flex-1 px-2 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 group"
                                        >
                                            <RotateCcw className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                            <span>Restore</span>
                                        </button>
                                        <button
                                            onClick={() => handlePermanentDeleteClick(item.id)}
                                            className="flex-1 px-2 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 group"
                                        >
                                            <Trash2 className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Modal */}
            {showModal && selectedItem && (
                <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-0 sm:p-2 md:p-4 pt-8 sm:pt-16 md:pt-4" onClick={closeModal}>
                    <div className="bg-white rounded-t-xl sm:rounded-t-2xl md:rounded-xl shadow-2xl max-w-3xl w-full h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] md:h-auto md:max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 md:p-6 flex-shrink-0">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-base md:text-xl lg:text-2xl font-bold text-white mb-2 break-words line-clamp-2">{selectedItem.item_name}</h2>
                                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                                        <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-semibold ${selectedItem.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {selectedItem.type}
                                        </span>
                                        <span className="px-2 md:px-3 py-0.5 md:py-1 bg-white bg-opacity-90 text-gray-800 rounded-full text-xs md:text-sm font-semibold">
                                            Archived
                                        </span>
                                        {selectedItem.category && (
                                            <span className="px-2 md:px-3 py-0.5 md:py-1 bg-purple-100 text-purple-800 rounded-full text-xs md:text-sm font-semibold">
                                                {selectedItem.category}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={closeModal}
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
                                {(selectedItem.image_path || selectedItem.image_url) ? (
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
                                                src={getAssetUrl(selectedItem.image_path || selectedItem.image_url)}
                                                alt={selectedItem.item_name}
                                                className="max-w-full max-h-full object-contain rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() => setIsFullscreen(true)}
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
                                        <p className="text-gray-700">{selectedItem.description || 'No description provided'}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-600 uppercase mb-1">Location</h3>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <MapPin className="h-5 w-5 text-gray-500" />
                                            <span>{selectedItem.location || 'Not specified'}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-600 uppercase mb-1">Date Reported</h3>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Calendar className="h-5 w-5 text-gray-500" />
                                            <span>{selectedItem.date_reported ? new Date(selectedItem.date_reported).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-600 uppercase mb-1">Archived Date</h3>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Calendar className="h-5 w-5 text-gray-500" />
                                            <span>{selectedItem.archived_at ? new Date(selectedItem.archived_at).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>

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
                                                    {selectedItem.reporter_name || 'Not provided'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Student ID</p>
                                                <p className="text-gray-800 font-medium text-xs md:text-sm break-words">
                                                    {selectedItem.student_id || 'Not provided'}
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
                            </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer - Actions */}
                        <div className="bg-gray-50 p-3 md:p-4 border-t border-gray-200 flex-shrink-0 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 md:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm md:text-base font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fullscreen Image Viewer */}
            {isFullscreen && selectedItem && (selectedItem.image_path || selectedItem.image_url) && (
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
                        src={getAssetUrl(selectedItem.image_path || selectedItem.image_url)}
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

            {/* Success Modal */}
            <SuccessModal 
                show={showSuccess}
                onClose={() => setShowSuccess(false)}
                message={successMessage}
            />

            {/* Error Modal */}
            <ErrorModal 
                show={showError}
                onClose={() => setShowError(false)}
                message={errorMessage}
            />

            {/* Confirm Modal */}
            <ConfirmModal 
                show={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={confirmAction}
                title={confirmTitle}
                message={confirmMessage}
                confirmText="Confirm"
                type="danger"
            />
        </div>
    );
}

export default ArchivedItems;
