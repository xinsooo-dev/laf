// src/admin/ManageLostFoundItems.jsx
import { useState, useEffect } from 'react';
import { Search, Eye, MapPin, Calendar, User, Package, Edit, Check, X, Maximize2, ZoomIn, ZoomOut, RefreshCw, History } from 'lucide-react';
import { API_ENDPOINTS, getAssetUrl } from '../utils/api';
import { PREDEFINED_LOCATIONS, LOCATION_OPTIONS, STATUS_COLORS, TYPE_COLORS } from '../utils/constants';
import { validateFinderInfo, isCustomLocation } from '../utils/validation';
import { SuccessModal, ErrorModal } from '../components/Modals';

function ManageLostFoundItems({ initialFilterType = 'all' }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState(initialFilterType);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [categories, setCategories] = useState([]);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [originalItem, setOriginalItem] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [editImagePreview, setEditImagePreview] = useState(null);
    const [editImageFile, setEditImageFile] = useState(null);
    
    // Modal states for messages
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
    
    // Mark as Found modal states
    const [showMarkFoundModal, setShowMarkFoundModal] = useState(false);
    const [itemToMarkFound, setItemToMarkFound] = useState(null);
    const [finderInfo, setFinderInfo] = useState({
        name: '',
        studentId: '',
        contactInfo: '',
        found_date: new Date().toISOString().split('T')[0],
        found_time: new Date().toTimeString().split(' ')[0].substring(0, 5)
    });

    // History/Audit log states
    const [itemHistory, setItemHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        fetchItems();
        fetchCategories();

        // Add event listener to refresh data when window gains focus
        const handleFocus = () => {
            fetchItems();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // Update filter when initialFilterType prop changes
    useEffect(() => {
        setFilterType(initialFilterType);
    }, [initialFilterType]);

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
                console.log('Raw items from API:', data.items); // Debug log
                
                // Filter lost and found items, but exclude claimed and archived items
                const lostFoundItems = data.items.filter(item => {
                    const typeLower = (item.type || '').toLowerCase();
                    const statusLower = (item.status || '').toLowerCase();
                    
                    const isLostOrFound = typeLower === 'lost' || typeLower === 'found' ||
                                         statusLower === 'lost' || statusLower === 'found';
                    const isNotClaimedOrArchived = statusLower !== 'claimed' && statusLower !== 'archived';
                    
                    console.log(`Item ${item.id}: type="${item.type}", status="${item.status}", isLostOrFound=${isLostOrFound}, isNotClaimedOrArchived=${isNotClaimedOrArchived}`);
                    
                    return isLostOrFound && isNotClaimedOrArchived;
                });
                
                console.log('Filtered lost/found items:', lostFoundItems);
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

    const fetchItemHistory = async (itemId) => {
        setLoadingHistory(true);
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.HISTORY(itemId));
            const data = await response.json();
            
            if (data.success) {
                setItemHistory(data.history || []);
            } else {
                console.error('Failed to fetch history:', data.message);
                setItemHistory([]);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
            setItemHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleView = (item) => {
        setSelectedItem(item);
        setShowModal(true);
        // Fetch history when opening modal
        fetchItemHistory(item.id);
    };

    const handleEdit = (item) => {
        // Check if location exists in LOCATION_OPTIONS
        const locationExists = LOCATION_OPTIONS.some(loc => loc.value === item.location);
        
        const itemData = { 
            ...item, 
            location: locationExists ? item.location : 'Others',
            customLocation: locationExists ? '' : item.location
        };
        
        setEditingItem(itemData);
        setOriginalItem(itemData); // Store original for comparison
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
                    setErrorMessage('Failed to upload image. Proceeding without image update.');
                    setShowError(true);
                }
            }

            const response = await fetch(API_ENDPOINTS.ITEMS.BY_ID(editingItem.id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_name: editingItem.item_name,
                    description: editingItem.description,
                    location: editingItem.location === 'Others' ? editingItem.customLocation : editingItem.location,
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
                setSuccessMessage('Item updated successfully!');
                setShowSuccess(true);
                closeEditModal();
            } else {
                setErrorMessage(`Failed to update item: ${data.message}`);
                setShowError(true);
            }
        } catch (error) {
            setErrorMessage('Network error occurred while updating item');
            setShowError(true);
        }
    };

    const hasUnsavedChanges = () => {
        if (!editingItem || !originalItem) return false;
        
        // Check if any field has changed
        const fieldsChanged = 
            editingItem.item_name !== originalItem.item_name ||
            editingItem.description !== originalItem.description ||
            editingItem.location !== originalItem.location ||
            editingItem.customLocation !== originalItem.customLocation ||
            editingItem.category !== originalItem.category ||
            editingItem.type !== originalItem.type ||
            editImageFile !== null; // Image changed
        
        return fieldsChanged;
    };

    const closeEditModal = () => {
        // Check if there are unsaved changes
        if (hasUnsavedChanges()) {
            setShowDiscardConfirm(true);
            return;
        }
        
        // No changes, close immediately
        setShowEditModal(false);
        setEditingItem(null);
        setOriginalItem(null);
        setEditImagePreview(null);
        setEditImageFile(null);
    };

    const confirmDiscardChanges = () => {
        setShowDiscardConfirm(false);
        setShowEditModal(false);
        setEditingItem(null);
        setOriginalItem(null);
        setEditImagePreview(null);
        setEditImageFile(null);
    };

    const cancelDiscardChanges = () => {
        setShowDiscardConfirm(false);
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

    const handleMarkAsFound = (item) => {
        setItemToMarkFound(item);
        setShowMarkFoundModal(true);
    };

    const closeMarkFoundModal = () => {
        setShowMarkFoundModal(false);
        setItemToMarkFound(null);
        setFinderInfo({
            name: '',
            studentId: '',
            contactInfo: '',
            found_date: new Date().toISOString().split('T')[0],
            found_time: new Date().toTimeString().split(' ')[0].substring(0, 5)
        });
    };

    const handleSubmitMarkFound = async () => {
        // Validate inputs
        const validationError = validateFinderInfo(finderInfo);
        if (validationError) {
            setErrorMessage(validationError);
            setShowError(true);
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.BY_ID(itemToMarkFound.id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'found',
                    status: 'found',
                    finder_name: finderInfo.name,
                    finder_student_id: finderInfo.studentId,
                    finder_contact: finderInfo.contactInfo
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMessage('Item marked as found successfully!');
                setShowSuccess(true);
                closeMarkFoundModal();
                // Refetch items to get updated data from server
                await fetchItems();
            } else {
                setErrorMessage(`Failed to mark item as found: ${data.message}`);
                setShowError(true);
            }
        } catch (error) {
            console.error('Error marking item as found:', error);
            setErrorMessage('Network error occurred while marking item as found');
            setShowError(true);
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
        return STATUS_COLORS[status] || STATUS_COLORS.archived;
    };

    const getTypeColor = (type) => {
        const normalizedType = type?.toLowerCase();
        return TYPE_COLORS[normalizedType] || TYPE_COLORS.found;
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
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manage Lost & Found Items</h1>
                    <p className="text-sm text-gray-500">Dashboard / Manage Items</p>
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
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(item.status?.toLowerCase() === 'found' || item.type?.toLowerCase() === 'found' ? 'found' : (item.type || item.status))}`}>
                                    {item.status?.toLowerCase() === 'found' || item.type?.toLowerCase() === 'found' ? 'Found' : 'Lost'}
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
                                        <span className="truncate">
                                            {(item.status?.toLowerCase() === 'found' || item.type?.toLowerCase() === 'found') 
                                                ? `Found by: ${item.finder_name || item.reporter_name || 'Unknown'}`
                                                : `Lost by: ${item.reporter_name || 'Unknown'}`
                                            }
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 mt-2">
                                    {/* View Details - Full Width */}
                                    <button
                                        onClick={() => handleView(item)}
                                        className="w-full px-2 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 group"
                                        style={{ minHeight: '32px', maxHeight: '32px' }}
                                    >
                                        <Eye className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                        <span>View Details</span>
                                    </button>

                                    {/* Edit and Mark as Found - Side by Side */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="flex-1 px-2 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 group"
                                            style={{ minHeight: '32px', maxHeight: '32px' }}
                                        >
                                            <Edit className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                            <span>Edit</span>
                                        </button>

                                        {/* Only show Mark as Found button for Lost items that are NOT already marked as found */}
                                        {(item.type?.toLowerCase() === 'lost' || item.status?.toLowerCase() === 'lost') && 
                                         item.status?.toLowerCase() !== 'found' && 
                                         item.type?.toLowerCase() !== 'found' && (
                                            <button
                                                onClick={() => handleMarkAsFound(item)}
                                                className="flex-1 px-2 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 group"
                                                style={{ minHeight: '32px', maxHeight: '32px' }}
                                            >
                                                <Check className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                                <span>Mark as Found</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Item Details Modal */}
            {showModal && selectedItem && (
                <div
                    className="fixed inset-0 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-0 sm:p-2 md:p-4 pt-8 sm:pt-16 md:pt-4"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-t-xl sm:rounded-t-2xl md:rounded-xl shadow-2xl max-w-3xl w-full h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] md:h-auto md:max-h-[85vh] flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`text-white p-2.5 md:p-4 flex-shrink-0 ${(selectedItem.status?.toLowerCase() === 'found' || selectedItem.type?.toLowerCase() === 'found') ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-red-600 to-red-700'}`}>
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-sm md:text-lg lg:text-xl font-bold mb-1 break-words line-clamp-1 md:line-clamp-2">
                                        {selectedItem.item_name}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                                        <span className={`inline-flex px-1.5 md:px-3 py-0.5 text-xs md:text-sm font-semibold rounded-full ${getTypeColor(selectedItem.status?.toLowerCase() === 'found' || selectedItem.type?.toLowerCase() === 'found' ? 'found' : selectedItem.type)}`}>
                                            {selectedItem.status?.toLowerCase() === 'found' || selectedItem.type?.toLowerCase() === 'found' ? 'Found' : 'Lost'}
                                        </span>
                                        {/* Only show status badge if it's not 'found' and not 'lost' (to avoid duplicate with type badge) */}
                                        {selectedItem.status?.toLowerCase() !== 'found' && 
                                         selectedItem.status?.toLowerCase() !== 'lost' && (
                                            <span className={`inline-flex px-1.5 md:px-3 py-0.5 text-xs md:text-sm font-semibold rounded-full ${getStatusColor(selectedItem.status)}`}>
                                                {selectedItem.status}
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

                                    {/* Lost By Information */}
                                    <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                                        <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-3 flex items-center">
                                            <User className="h-3 w-3 md:h-4 md:w-4 mr-2 text-purple-600 flex-shrink-0" />
                                            <span>Lost By</span>
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

                                    {/* Change History / Audit Log */}
                                    {itemHistory.length > 0 && (
                                        <div className="bg-blue-50 rounded-lg p-3 md:p-4 border border-blue-200">
                                            <h3 className="text-sm md:text-base font-semibold text-blue-900 mb-3 flex items-center">
                                                <History className="h-3 w-3 md:h-4 md:w-4 mr-2 text-blue-600 flex-shrink-0" />
                                                <span>Change History</span>
                                            </h3>
                                            {loadingHistory ? (
                                                <p className="text-xs text-blue-700">Loading history...</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {itemHistory.map((record) => (
                                                        <div key={record.id} className="bg-white rounded-lg p-3 border border-blue-100">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <span className="text-xs font-semibold text-blue-800">
                                                                    {record.change_reason}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {new Date(record.created_at).toLocaleString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                <div>
                                                                    <span className="text-gray-600">Previous: </span>
                                                                    <span className="font-medium text-red-600">{record.previous_type}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">New: </span>
                                                                    <span className="font-medium text-green-600">{record.new_type}</span>
                                                                </div>
                                                            </div>
                                                            {record.finder_name && (
                                                                <div className="mt-2 pt-2 border-t border-blue-100">
                                                                    <p className="text-xs text-gray-700">
                                                                        <span className="font-semibold">Found by:</span> {record.finder_name}
                                                                        {record.finder_student_id && ` (${record.finder_student_id})`}
                                                                    </p>
                                                                    {record.finder_contact && (
                                                                        <p className="text-xs text-gray-700">
                                                                            <span className="font-semibold">Contact:</span> {record.finder_contact}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end pt-3 md:pt-4 mt-3 md:mt-4 border-t border-gray-200">
                                    <button
                                        onClick={closeModal}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 rounded-lg transition-colors text-sm md:text-base font-medium"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
                    className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={closeEditModal}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold">Edit Item</h2>
                                    <p className="text-blue-100 mt-1">Update item information</p>
                                </div>
                                <button
                                    onClick={closeEditModal}
                                    className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows="3"
                                            placeholder="Enter item description"
                                        />
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Location
                                        </label>
                                        <select
                                            value={editingItem.location || ''}
                                            onChange={(e) => {
                                                setEditingItem(prev => ({ ...prev, location: e.target.value }));
                                                if (e.target.value !== 'Others') {
                                                    setEditingItem(prev => ({ ...prev, customLocation: '' }));
                                                }
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select Location</option>
                                            {LOCATION_OPTIONS.map(location => (
                                                <option key={location.value} value={location.value}>
                                                    {location.label}
                                                </option>
                                            ))}
                                        </select>

                                        {/* Custom location input when "Others" is selected */}
                                        {editingItem.location === 'Others' && (
                                            <input
                                                type="text"
                                                value={editingItem.customLocation || ''}
                                                onChange={(e) => setEditingItem(prev => ({ ...prev, customLocation: e.target.value }))}
                                                placeholder="Please specify the location"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mt-2"
                                                required
                                            />
                                        )}
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 focus-within:border-blue-500 bg-white text-gray-700 font-medium cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 hover:bg-blue-50"
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
                                disabled={!hasUnsavedChanges()}
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                                    hasUnsavedChanges()
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <Check className="h-4 w-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mark as Found Modal */}
            {showMarkFoundModal && itemToMarkFound && (
                <div
                    className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={closeMarkFoundModal}
                >
                    <div
                        className="bg-blue-50 rounded-xl shadow-2xl max-w-2xl w-full border-2 border-blue-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Mark Item as Found</h2>
                                    <p className="text-blue-100 mt-1 text-base">Enter finder information</p>
                                </div>
                                <button
                                    onClick={closeMarkFoundModal}
                                    className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="mb-6 bg-blue-100 rounded-lg p-4 border border-blue-200">
                                <div className="flex gap-4 items-start">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-blue-900 mb-2">Item: {itemToMarkFound.item_name}</h3>
                                        <p className="text-sm text-blue-800">{itemToMarkFound.description}</p>
                                    </div>
                                    {itemToMarkFound.image_path && itemToMarkFound.image_path !== 'NULL' && itemToMarkFound.image_path !== 'null' && itemToMarkFound.image_path !== '' && (
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={getAssetUrl(itemToMarkFound.image_path)}
                                                alt={itemToMarkFound.item_name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-blue-900 mb-2">
                                        Finder Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={finderInfo.name}
                                        onChange={(e) => setFinderInfo(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        placeholder="Enter finder's full name"
                                        required
                                    />
                                </div>

                                {/* Student ID */}
                                <div>
                                    <label className="block text-sm font-semibold text-blue-900 mb-2">
                                        Student ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={finderInfo.studentId}
                                        onChange={(e) => setFinderInfo(prev => ({ ...prev, studentId: e.target.value }))}
                                        className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        placeholder="1234-5678"
                                        required
                                    />
                                </div>

                                {/* Contact Info */}
                                <div>
                                    <label className="block text-sm font-semibold text-blue-900 mb-2">
                                        Contact Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={finderInfo.contactInfo}
                                        onChange={(e) => setFinderInfo(prev => ({ ...prev, contactInfo: e.target.value }))}
                                        className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        placeholder="09123456789"
                                        required
                                    />
                                </div>

                                {/* Date and Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-blue-900 mb-2">
                                            Found Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={finderInfo.found_date}
                                            onChange={(e) => setFinderInfo(prev => ({ ...prev, found_date: e.target.value }))}
                                            className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-blue-900 mb-2">
                                            Found Time <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            value={finderInfo.found_time}
                                            onChange={(e) => setFinderInfo(prev => ({ ...prev, found_time: e.target.value }))}
                                            className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-6 border-t border-blue-200 bg-blue-50">
                            <button
                                onClick={closeMarkFoundModal}
                                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitMarkFound}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                <Check className="h-4 w-4" />
                                Mark as Found
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Discard Changes Confirmation Modal */}
            {showDiscardConfirm && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Discard Changes?</h3>
                            <p className="text-gray-600 mb-6">
                                You have unsaved changes. Are you sure you want to discard them?
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={cancelDiscardChanges}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDiscardChanges}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Discard
                                </button>
                            </div>
                        </div>
                    </div>
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
        </div>
    );
}

export default ManageLostFoundItems;
