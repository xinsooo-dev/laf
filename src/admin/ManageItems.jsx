// src/admin/ManageItems.jsx
import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle, X, MapPin, Calendar, User, Phone, Mail, Maximize2, ZoomIn, ZoomOut, Package, Archive, History } from 'lucide-react';
import { API_ENDPOINTS, getAssetUrl } from '../utils/api';

function ManageItems() {
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
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [claimantInfo, setClaimantInfo] = useState({
        name: '',
        student_id: '',
        contact: ''
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [showClaimedItemsModal, setShowClaimedItemsModal] = useState(false);
    const [claimedItems, setClaimedItems] = useState([]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.BY_ID(id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus.toLowerCase()
                })
            });

            const data = await response.json();

            if (data.success) {
                if (newStatus.toLowerCase() === 'claimed') {
                    // Move item from items to claimedItems
                    const claimedItem = items.find(item => item.id === id);
                    if (claimedItem) {
                        const updatedClaimedItem = {
                            ...claimedItem,
                            status: 'claimed',
                            claimed_at: new Date().toISOString()
                        };
                        setItems(prev => prev.filter(item => item.id !== id));
                        setClaimedItems(prev => [...prev, updatedClaimedItem]);
                    }
                } else {
                    // Update local state for other status changes
                    setItems(prev => prev.map(item =>
                        item.id === id ? { ...item, status: newStatus } : item
                    ));
                }
                alert(`Item ${newStatus} successfully!`);
            } else {
                alert(`Failed to update item: ${data.message}`);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Network error occurred while updating item');
        }
    };

    const handleArchive = async (id) => {
        if (window.confirm('Are you sure you want to archive this item? You can restore it later from the Archived Items section.')) {
            try {
                const response = await fetch(API_ENDPOINTS.ITEMS.ARCHIVE(id));
                const data = await response.json();

                if (data.success) {
                    setItems(items.filter(item => item.id !== id));
                    alert('Item archived successfully!');
                } else {
                    alert(`Failed to archive item: ${data.message}`);
                }
            } catch (error) {
                console.error('Error archiving item:', error);
                alert('Network error occurred while archiving item');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const response = await fetch(API_ENDPOINTS.ITEMS.BY_ID(id), {
                    method: 'DELETE'
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setItems(items.filter(item => item.id !== id));
                        alert(`Item ${id} deleted successfully`);
                    } else {
                        alert(`Failed to delete item: ${data.message}`);
                    }
                } else {
                    alert('Failed to delete item. Please try again.');
                }
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Error deleting item. Please try again.');
            }
        }
    };

    const handleView = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleClaimSubmit = async (e) => {
        e.preventDefault();

        // Check for validation errors
        if (Object.values(validationErrors).some(error => error !== '')) {
            alert('Please fix all validation errors before submitting');
            return;
        }

        if (!claimantInfo.name || !claimantInfo.student_id) {
            alert('Please fill in at least Name and Student ID');
            return;
        }

        // Validate student ID format
        if (!/^\d{4}-\d{4}$/.test(claimantInfo.student_id)) {
            alert('Student ID must be in format: 1234-5678');
            return;
        }

        try {
            // Generate reference number - more natural format
            const referenceNumber = `LF${Math.floor(Math.random() * 9999) + 1000}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 999) + 100}`;

            const response = await fetch(API_ENDPOINTS.ITEMS.BY_ID(selectedItem.id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'claimed',
                    claimant_name: claimantInfo.name,
                    claimant_student_id: claimantInfo.student_id,
                    claimant_contact: claimantInfo.contact,
                    reference_number: referenceNumber,
                    claimed_at: new Date().toISOString()
                })
            });

            const data = await response.json();

            if (data.success) {
                // Update local state - move item from items to claimedItems
                const updatedItem = {
                    ...selectedItem,
                    status: 'claimed',
                    reference_number: referenceNumber,
                    claimed_at: new Date().toISOString(),
                    claimant_name: claimantInfo.name,
                    claimant_student_id: claimantInfo.student_id,
                    claimant_contact: claimantInfo.contact
                };

                setItems(prev => prev.filter(item => item.id !== selectedItem.id));
                setClaimedItems(prev => [...prev, updatedItem]);

                alert('Item marked as claimed successfully!');
                setShowClaimModal(false);
                setClaimantInfo({ name: '', student_id: '', contact: '', email: '' });
                fetchItems(); // Refresh the list
            } else {
                alert(`Failed to mark as claimed: ${data.message}`);
            }
        } catch (error) {
            console.error('Error marking item as claimed:', error);
            alert('Error marking item as claimed. Please try again.');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        setIsFullscreen(false);
        setZoomLevel(1);
    };

    // Fetch items from database
    const fetchItems = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.ALL);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Transform database data to match component expectations
                    const transformedItems = data.items.map(item => ({
                        id: item.id,
                        type: item.type === 'lost' ? 'Lost' : item.type === 'found' ? 'Found' : (item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'Unknown'),
                        itemName: item.item_name,
                        description: item.description,
                        location: item.location,
                        status: item.status || 'Pending',
                        reportedBy: item.reporter_name || item.full_name || 'Anonymous',
                        contactInfo: item.contact_info || item.email || 'N/A',
                        reportedDate: item.created_at,
                        imagePath: item.image_path || null,
                        // Additional fields from database
                        item_name: item.item_name,
                        date_reported: item.date_reported,
                        reporter_name: item.reporter_name || item.full_name || 'Unknown',
                        contact_info: item.contact_info || item.email || 'N/A',
                        // Add reference number for claimed items
                        reference_number: item.reference_number || null,
                        claimed_at: item.claimed_at || null,
                        claimant_name: item.claimant_name || null,
                        claimant_student_id: item.claimant_student_id || null,
                        claimant_contact: item.claimant_contact || null,
                        claimant_email: item.claimant_email || null
                    }));
                    setItems(transformedItems);

                    // Separate claimed items
                    const claimed = transformedItems.filter(item => item.status?.toLowerCase() === 'claimed');
                    setClaimedItems(claimed);
                    console.log('Fetched items:', transformedItems); // Debug log
                    console.log('Image analysis:', {
                        totalItems: transformedItems.length,
                        lostItems: transformedItems.filter(item => item.type === 'Lost').length,
                        foundItems: transformedItems.filter(item => item.type === 'Found').length,
                        lostWithImages: transformedItems.filter(item => item.type === 'Lost' && item.imagePath).length,
                        foundWithImages: transformedItems.filter(item => item.type === 'Found' && item.imagePath).length,
                        lostImagePaths: transformedItems.filter(item => item.type === 'Lost').map(item => item.imagePath),
                        foundImagePaths: transformedItems.filter(item => item.type === 'Found').map(item => item.imagePath),
                        lostItemsData: transformedItems.filter(item => item.type === 'Lost'),
                        foundItemsData: transformedItems.filter(item => item.type === 'Found')
                    });
                    console.log('Status counts:', {
                        pending: transformedItems.filter(item => item.status?.toLowerCase() === 'pending').length,
                        approved: transformedItems.filter(item => item.status?.toLowerCase() === 'approved').length,
                        claimed: transformedItems.filter(item => item.status?.toLowerCase() === 'claimed').length,
                        rejected: transformedItems.filter(item => item.status?.toLowerCase() === 'rejected').length,
                        total: transformedItems.length
                    });
                } else {
                    console.error('Failed to fetch items:', data.message);
                    setItems([]); // Set empty array if fetch fails
                }
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
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

    const filteredItems = items.filter(item => {
        const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || item.type.toLowerCase() === filterType.toLowerCase();
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        // Exclude claimed items from main view
        const notClaimed = item.status?.toLowerCase() !== 'claimed';

        return matchesSearch && matchesType && matchesCategory && notClaimed;
    });

    const getStatusBadge = (status) => {
        const statusColors = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Approved': 'bg-green-100 text-green-800',
            'Claimed': 'bg-blue-100 text-blue-800',
            'Rejected': 'bg-red-100 text-red-800'
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    const getTypeBadge = (type) => {
        return type === 'Lost'
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800';
    };

    return (
        <div className="w-full max-w-full overflow-hidden">
            {/* Mobile Header */}
            <div className="block md:hidden mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 mb-1">Manage Items</h1>
                        <p className="text-sm text-gray-600">Manage all reported lost and found items</p>
                    </div>
                    <button
                        onClick={() => setShowClaimedItemsModal(true)}
                        data-claimed-history-btn
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                        <History className="h-4 w-4" />
                        <span>Claim Items</span>
                    </button>
                </div>
            </div>

            <div className="hidden md:block mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 break-words">Manage Items</h1>
                        <p className="text-sm md:text-base text-gray-600">Manage all reported lost and found items</p>
                    </div>
                    <button
                        onClick={() => setShowClaimedItemsModal(true)}
                        data-claimed-history-btn
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                        <History className="h-5 w-5" />
                        <span>Claim Items</span>
                    </button>
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
                </div>
            </div>

            {/* Items Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading items...</p>
                </div>
            ) : filteredItems.length === 0 ? (
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
                                {(item.imagePath || item.image_url) ? (
                                    <img
                                        src={getAssetUrl(item.imagePath || item.image_url)}
                                        alt={item.item_name || item.itemName}
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
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'claimed'
                                    ? 'bg-purple-100 text-purple-800'
                                    : item.status === 'lost' || item.type === 'lost'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                    {item.status === 'claimed' ? 'Claimed' : item.status === 'lost' || item.type === 'lost' ? 'Lost' : 'Found'}
                                </div>
                            </div>

                            {/* Item Details */}
                            <div className="p-3 md:p-4">
                                <h3 className="font-bold text-sm md:text-base lg:text-lg text-gray-800 mb-2 truncate">
                                    {item.item_name || item.itemName}
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
                                        <span className="truncate">By: {item.reporter_name || item.reportedBy || 'Unknown'}</span>
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

                                    {(item.status?.toLowerCase() === 'approved' || item.status?.toLowerCase() === 'lost' || item.status?.toLowerCase() === 'found' || item.type?.toLowerCase() === 'found') && item.status?.toLowerCase() !== 'claimed' && (
                                        <button
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setShowClaimModal(true);
                                            }}
                                            className="w-full px-2 py-1.5 text-xs md:text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 group"
                                        >
                                            <CheckCircle className="h-3 w-3 md:h-4 group-hover:scale-110 transition-transform" />
                                            <span>Mark as Claimed</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleArchive(item.id)}
                                        className="w-full px-2 py-1.5 text-xs md:text-sm font-medium bg-gray-600 text-white rounded-md hover:bg-gray-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 group"
                                        title="Move item to archive section"
                                    >
                                        <Archive className="h-3 w-3 md:h-4 group-hover:scale-110 transition-transform" />
                                        <span>Move to Archive</span>
                                    </button>
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
                            <div className={`text-white p-2.5 md:p-4 flex-shrink-0 ${selectedItem.type === 'Lost' ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gradient-to-r from-green-600 to-green-700'}`}>
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-sm md:text-lg lg:text-xl font-bold mb-1 break-words line-clamp-1 md:line-clamp-2">
                                            {selectedItem.item_name || selectedItem.itemName}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                                            <span className={`inline-flex px-1.5 md:px-3 py-0.5 text-xs md:text-sm font-semibold rounded-full ${getStatusBadge(selectedItem.status)}`}>
                                                {selectedItem.status}
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
                                    {selectedItem.imagePath && selectedItem.imagePath !== 'NULL' && selectedItem.imagePath !== 'null' && selectedItem.imagePath !== '' ? (
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
                                                    src={getAssetUrl(selectedItem.imagePath)}
                                                    alt={selectedItem.item_name || selectedItem.itemName}
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
                                    <div className={`flex-col items-center justify-center w-full h-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 ${selectedItem.imagePath && selectedItem.imagePath !== 'NULL' && selectedItem.imagePath !== 'null' && selectedItem.imagePath !== '' ? 'hidden' : 'flex'}`}>
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
                                                        : selectedItem.reportedDate || 'Date not available'
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
                                                        {selectedItem.reporter_name || selectedItem.reportedBy || 'Not provided'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Contact Info</p>
                                                    <p className="text-gray-800 font-medium text-xs md:text-sm break-words">
                                                        {selectedItem.contact_info || selectedItem.contactInfo || 'Not provided'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-3 pt-3 md:pt-4 mt-3 md:mt-4 border-t border-gray-200">
                                        {selectedItem.status?.toLowerCase() === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        handleStatusChange(selectedItem.id, 'Approved');
                                                        closeModal();
                                                    }}
                                                    className={`hover:opacity-90 text-white px-3 md:px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm md:text-base w-full md:w-auto ${selectedItem.type === 'Lost' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                                                >
                                                    <CheckCircle size={16} />
                                                    <span>Approve</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleStatusChange(selectedItem.id, 'Rejected');
                                                        closeModal();
                                                    }}
                                                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 md:px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm md:text-base w-full md:w-auto"
                                                >
                                                    <XCircle size={16} />
                                                    <span>Reject</span>
                                                </button>
                                            </>
                                        )}

                                        {(selectedItem.status?.toLowerCase() === 'approved' || selectedItem.type?.toLowerCase() === 'found') && (
                                            <button
                                                onClick={() => {
                                                    handleStatusChange(selectedItem.id, 'Claimed');
                                                    closeModal();
                                                }}
                                                className={`hover:opacity-90 text-white px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base w-full md:w-auto ${selectedItem.type === 'Lost' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                                            >
                                                Mark as Claimed
                                            </button>
                                        )}

                                        <button
                                            onClick={closeModal}
                                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base w-full md:w-auto"
                                        >
                                            Close
                                        </button>

                                        <button
                                            onClick={() => {
                                                handleArchive(selectedItem.id);
                                                closeModal();
                                            }}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 md:px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm md:text-base w-full md:w-auto"
                                        >
                                            <Archive size={16} />
                                            <span>Archive</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Claim Modal */}
            {showClaimModal && selectedItem && (
                <>
                    {/* Full screen blocking overlay */}
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        style={{
                            pointerEvents: 'auto',
                            touchAction: 'none',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    ></div>

                    <div
                        className="fixed inset-0 flex items-start md:items-center justify-center z-50 p-0 md:p-4 pt-16 md:pt-4"
                        style={{
                            pointerEvents: 'auto',
                            touchAction: 'auto'
                        }}
                    >
                        <div
                            className="bg-blue-50 rounded-t-2xl md:rounded-xl shadow-2xl max-w-2xl w-full h-[calc(100vh-4rem)] md:h-auto md:max-h-[85vh] transform transition-all duration-300 scale-100 border-2 border-blue-200 flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-3 md:p-6 rounded-t-2xl md:rounded-t-xl flex-shrink-0">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-base md:text-2xl font-bold text-white break-words">Mark Item as Claimed</h2>
                                        <p className="text-purple-100 mt-0.5 md:mt-1 text-xs md:text-base">Enter claimant information</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowClaimModal(false);
                                            setClaimantInfo({ name: '', student_id: '', contact: '', email: '' });
                                            setValidationErrors({});
                                        }}
                                        className="text-white hover:text-gray-200 transition-colors p-1 md:p-2 hover:bg-white hover:bg-opacity-20 rounded-lg flex-shrink-0"
                                    >
                                        <X className="w-5 h-5 md:w-6 md:h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body - Scrollable */}
                            <form onSubmit={handleClaimSubmit} className="flex flex-col flex-1 overflow-y-auto">
                                <div className="p-3 md:p-6">
                                    <div className="mb-4 md:mb-6 bg-blue-100 rounded-lg p-3 md:p-4 border border-blue-200">
                                        <div className="flex flex-col md:flex-row gap-4 items-start">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-blue-900 mb-1 md:mb-2 text-sm md:text-base break-words">Item: {selectedItem.item_name || selectedItem.itemName}</h3>
                                                <p className="text-xs md:text-sm text-blue-800 break-words">{selectedItem.description}</p>
                                            </div>
                                            {selectedItem.imagePath && selectedItem.imagePath !== 'NULL' && selectedItem.imagePath !== 'null' && selectedItem.imagePath !== '' && (
                                                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={getAssetUrl(selectedItem.imagePath)}
                                                        alt={selectedItem.item_name || selectedItem.itemName}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3 md:space-y-4">
                                        <div>
                                            <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-1.5 md:mb-2">
                                                Claimant Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={claimantInfo.name}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    // Only allow letters and spaces
                                                    if (/^[a-zA-Z\s]*$/.test(value) || value === '') {
                                                        setClaimantInfo({ ...claimantInfo, name: value });
                                                        setValidationErrors({ ...validationErrors, name: '' });
                                                    } else {
                                                        setValidationErrors({ ...validationErrors, name: 'Only letters and spaces allowed' });
                                                    }
                                                }}
                                                className={`w-full px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white ${validationErrors.name ? 'border-red-500' : 'border-blue-300'
                                                    }`}
                                                placeholder="Enter claimant's full name"
                                                required
                                            />
                                            {validationErrors.name && (
                                                <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-1.5 md:mb-2">
                                                Student ID <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={claimantInfo.student_id}
                                                onChange={(e) => {
                                                    let value = e.target.value.replace(/[^0-9]/g, ''); // Only numbers

                                                    // Auto-format: add hyphen after 4 digits
                                                    if (value.length > 4) {
                                                        value = value.slice(0, 4) + '-' + value.slice(4, 8);
                                                    }

                                                    // Limit to 9 characters (4 digits + hyphen + 4 digits)
                                                    if (value.replace('-', '').length <= 8) {
                                                        setClaimantInfo({ ...claimantInfo, student_id: value });

                                                        // Validate format
                                                        if (value.length === 9 && /^\d{4}-\d{4}$/.test(value)) {
                                                            setValidationErrors({ ...validationErrors, student_id: '' });
                                                        } else if (value.length > 0 && value.length < 9) {
                                                            setValidationErrors({ ...validationErrors, student_id: 'Student ID must be 8 digits (format: 1234-5678)' });
                                                        }
                                                    }
                                                }}
                                                className={`w-full px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white ${validationErrors.student_id ? 'border-red-500' : 'border-blue-300'
                                                    }`}
                                                placeholder="1234-5678"
                                                maxLength="9"
                                                required
                                            />
                                            {validationErrors.student_id && (
                                                <p className="text-red-500 text-sm mt-1">{validationErrors.student_id}</p>
                                            )}
                                            <p className="text-blue-600 text-xs mt-1">Format: 1234-5678 (8 digits)</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-1.5 md:mb-2">
                                                Contact Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={claimantInfo.contact}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    // Only allow numbers, spaces, hyphens, and plus
                                                    if (/^[0-9\s\-+]*$/.test(value) || value === '') {
                                                        setClaimantInfo({ ...claimantInfo, contact: value });

                                                        // Validate phone number (at least 10 digits)
                                                        const digitsOnly = value.replace(/[^0-9]/g, '');
                                                        if (digitsOnly.length >= 10 || value === '') {
                                                            setValidationErrors({ ...validationErrors, contact: '' });
                                                        } else if (digitsOnly.length > 0) {
                                                            setValidationErrors({ ...validationErrors, contact: 'Phone number must be at least 10 digits' });
                                                        }
                                                    } else {
                                                        setValidationErrors({ ...validationErrors, contact: 'Only numbers, spaces, hyphens, and + allowed' });
                                                    }
                                                }}
                                                className={`w-full px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white ${validationErrors.contact ? 'border-red-500' : 'border-blue-300'
                                                    }`}
                                                placeholder="09123456789"
                                            />
                                            {validationErrors.contact && (
                                                <p className="text-red-500 text-sm mt-1">{validationErrors.contact}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer - Fixed */}
                                <div className="flex gap-2 md:gap-3 p-3 md:p-6 pt-3 md:pt-4 border-t border-blue-200 bg-blue-50 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowClaimModal(false);
                                            setClaimantInfo({ name: '', student_id: '', contact: '' });
                                        }}
                                        className="flex-1 px-3 md:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium text-sm md:text-base"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-3 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
                                    >
                                        <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                                        <span className="hidden sm:inline">Mark as Claimed</span>
                                        <span className="sm:hidden">Claim</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Claimed Items History Modal */}
            {showClaimedItemsModal && (
                <>
                    <div className="fixed inset-0 bg-transparent z-50"></div>

                    <div className="fixed inset-0 flex items-start md:items-center justify-center z-[60] p-0 md:p-4 pt-16 md:pt-4">
                        <div
                            className="bg-white rounded-t-2xl md:rounded-xl shadow-2xl max-w-4xl w-full h-[calc(100vh-4rem)] md:h-auto md:max-h-[85vh] transform transition-all duration-300 scale-100 flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 md:p-6 rounded-t-2xl md:rounded-t-xl flex-shrink-0">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-base md:text-2xl font-bold text-white break-words flex items-center gap-2">
                                            <History className="h-5 w-5" />
                                            Claimed Items History
                                        </h2>
                                        <p className="text-blue-100 mt-0.5 md:mt-1 text-xs md:text-base">
                                            {claimedItems.length} claimed items
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowClaimedItemsModal(false)}
                                        className="text-white hover:text-gray-200 transition-colors p-1 md:p-2 hover:bg-white hover:bg-opacity-20 rounded-lg flex-shrink-0"
                                    >
                                        <X className="w-5 h-5 md:w-6 md:h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-3 md:p-6">
                                {claimedItems.length === 0 ? (
                                    <div className="text-center py-12">
                                        <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">No claimed items yet</h3>
                                        <p className="text-gray-600">Items that are marked as claimed will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {claimedItems
                                            .sort((a, b) => new Date(b.claimed_at || b.date_reported) - new Date(a.claimed_at || a.date_reported))
                                            .map((item) => (
                                                <div key={item.id} className="bg-white rounded-lg p-5 border-4 border-gray-400 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex flex-col gap-4">
                                                        {/* Image Section - Mobile First */}
                                                        {item.imagePath && item.imagePath !== 'NULL' && item.imagePath !== 'null' && item.imagePath !== '' && (
                                                            <div className="w-full h-48 sm:h-56 md:h-64 bg-gray-100 rounded-lg overflow-hidden">
                                                                <img
                                                                    src={getAssetUrl(item.imagePath)}
                                                                    alt={item.item_name || item.itemName}
                                                                    className="w-full h-full object-contain bg-gray-100"
                                                                    loading="lazy"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><div class="text-center"><div class="text-4xl mb-2">📦</div><p>Image not available</p></div></div>';
                                                                    }}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Content Section */}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                    Claimed
                                                                </span>
                                                                {item.reference_number && (
                                                                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                                                                        Ref: {item.reference_number}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <h4 className="text-xl font-semibold text-gray-800 mb-3">
                                                                {item.item_name || item.itemName}
                                                            </h4>

                                                            <div className="space-y-3 text-sm text-gray-600 mb-4">
                                                                <p><strong>Description:</strong> {item.description}</p>
                                                                <p><strong>Location:</strong> {item.location}</p>
                                                                <p><strong>Reported by:</strong> {item.reporter_name || item.reportedBy}</p>
                                                                <p><strong>Date Reported:</strong> {item.date_reported ? new Date(item.date_reported).toLocaleDateString() : new Date(item.reportedDate).toLocaleDateString()}</p>
                                                            </div>

                                                            {item.claimant_name && (
                                                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                                    <h5 className="font-semibold text-blue-900 mb-3">Claimant Information</h5>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                                        <p><strong>Name:</strong> {item.claimant_name}</p>
                                                                        <p><strong>Student ID:</strong> {item.claimant_student_id}</p>
                                                                        {item.claimant_contact && <p><strong>Contact:</strong> {item.claimant_contact}</p>}
                                                                        {item.claimed_at && (
                                                                            <p><strong>Claimed Date:</strong> {new Date(item.claimed_at).toLocaleDateString()}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end p-3 md:p-6 pt-3 md:pt-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                                <button
                                    onClick={() => setShowClaimedItemsModal(false)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Fullscreen Image Viewer */}
            {isFullscreen && selectedItem?.imagePath && (
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
                        src={getAssetUrl(`uploads/${selectedItem.imagePath}`)}
                        alt={selectedItem.item_name || selectedItem.itemName}
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
}

export default ManageItems;