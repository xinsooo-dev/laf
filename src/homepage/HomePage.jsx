// src/homepage/HomePage.jsx
import { Search, Eye, Calendar, MapPin, User, FileText, X, Maximize2, ZoomIn, ZoomOut, Mail, Clock, Building2, Megaphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_ENDPOINTS, getAssetUrl } from '../utils/api';

function HomePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [lostItems, setLostItems] = useState([]);
    const [foundItems, setFoundItems] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('lost'); // 'lost' or 'found'
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [categories, setCategories] = useState([]);
    const [claimInstructions, setClaimInstructions] = useState([]);
    const [contactInfo, setContactInfo] = useState(null);

    // Item detail modal state
    const [selectedItem, setSelectedItem] = useState(null);
    const [showItemModal, setShowItemModal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    // Message modal state
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageContent, setMessageContent] = useState('');

    // Update document title and URL
    useEffect(() => {
        document.title = 'NC iFound - Homepage';
        
        // Redirect root to /homepage
        if (location.pathname === '/') {
            navigate('/homepage', { replace: true });
        }
    }, [location.pathname, navigate]);

    // Fetch latest items and announcements from database
    useEffect(() => {
        fetchLatestItems();
        fetchAnnouncements();
        fetchCategories();
        fetchClaimInstructions();
        fetchContactInfo();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.CATEGORIES.ALL);
            const data = await response.json();
            if (data.success) {
                setCategories(data.categories || []);
            }
        } catch (error) {
            // Error fetching categories
        }
    };

    const fetchLatestItems = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.LATEST);
            
            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.success) {
                setLostItems(data.lost_items || []);
                setFoundItems(data.found_items || []);
            } else {
                setLostItems([]);
                setFoundItems([]);
            }
        } catch (error) {
            setLostItems([]);
            setFoundItems([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.ACTIVE);
            const data = await response.json();

            if (data.success) {
                setAnnouncements(data.announcements || []);
            } else {
                setAnnouncements([]);
            }
        } catch (error) {
            setAnnouncements([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchClaimInstructions = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.CLAIM_INSTRUCTIONS.ALL);
            const data = await response.json();
            if (data.success) {
                setClaimInstructions(data.instructions || []);
            }
        } catch (error) {
            // Error fetching claim instructions
        }
    };

    const fetchContactInfo = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.CONTACT_INFO.GET);
            const data = await response.json();
            if (data.success && data.contact_info) {
                setContactInfo(data.contact_info);
            }
        } catch (error) {
            // Error fetching contact info
        }
    };

    const handleViewDetails = (item) => {
        setSelectedItem(item);
        setShowItemModal(true);
        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
    };

    const closeItemModal = () => {
        setShowItemModal(false);
        setSelectedItem(null);
        setIsFullscreen(false);
        setZoomLevel(1);
    };

    const handleClaimItem = () => {
        // Show different message based on item status
        // Priority: Check if item is FOUND first (regardless of original type)
        let message = '';
        if (selectedItem.status?.toLowerCase() === 'found' || selectedItem.type?.toLowerCase() === 'found') {
            // Item is found (either marked as found or reported as found) - show claim message
            message = 'Please proceed to the Student Council Office to claim this item.';
        } else if (selectedItem.status?.toLowerCase() === 'lost' || selectedItem.type?.toLowerCase() === 'lost') {
            // Item is still lost - show return message
            message = 'Please proceed to the Student Council Office to return this item to its owner. Thank you for your help!';
        } else {
            // Default - show claim message
            message = 'Please proceed to the Student Council Office to claim this item.';
        }
        setMessageContent(message);
        setShowMessageModal(true);
        closeItemModal();
    };

    const closeMessageModal = () => {
        setShowMessageModal(false);
        setMessageContent('');
    };

    // Filter items based on search and filters
    const allItems = [...lostItems, ...foundItems];
    
    const filteredItems = allItems.filter(item => {
        // Exclude claimed items
        if (item.status === 'claimed') {
            return false;
        }

        // Exclude archived items
        if (item.status === 'archived') {
            return false;
        }

        const matchesSearch = item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = item.type?.toLowerCase() === activeTab.toLowerCase();

        // Enhanced category matching - handle multiple possible category fields
        let matchesCategory = categoryFilter === 'all';

        if (!matchesCategory && categoryFilter !== 'all') {
            // Try different category field combinations
            const categoryFields = [
                item.category,
                item.category_name,
                item.category_id
            ];

            // Check if any category field matches (case-insensitive)
            matchesCategory = categoryFields.some(field => {
                if (!field) return false;

                // Handle both string and number comparisons
                const fieldStr = String(field).toLowerCase();
                const filterStr = String(categoryFilter).toLowerCase();

                return fieldStr === filterStr || field === categoryFilter;
            });
        }

        return matchesSearch && matchesType && matchesCategory;
    });

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                backgroundImage: "url('/login_signup_bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed"
            }}
        >
            <header className="bg-blue-600 text-white p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-center w-full">
                    {/* Center: Logo + Title */}
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                        <img src="/nclogo.png" alt="NC Logo" className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain flex-shrink-0" />
                        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold">NC iFound</h1>
                    </div>
                </div>
            </header>

            {/* Search Section */}
            <div className="container mx-auto p-1 sm:p-3 md:p-6">
                <div className="max-w-6xl mx-auto mb-2 sm:mb-4 md:mb-8">
                    {/* Search Bar and Category Filter */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 sm:p-2.5 md:p-3 pr-10 rounded-lg bg-white bg-opacity-90 shadow-md text-sm sm:text-base"
                            />
                            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 p-1">
                                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-3 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg bg-white shadow-md text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tab Buttons - Lost / Found (Below Search) */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('lost')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                activeTab === 'lost'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white bg-opacity-80 text-gray-600 hover:bg-blue-100'
                            }`}
                        >
                            Lost Items
                        </button>
                        <button
                            onClick={() => setActiveTab('found')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                activeTab === 'found'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white bg-opacity-80 text-gray-600 hover:bg-blue-100'
                            }`}
                        >
                            Found Items
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-4">
                <div className="max-w-6xl mx-auto">
                    {/* White Container for Items Only */}
                    <div className="bg-white rounded-lg shadow-lg p-2 sm:p-3 md:p-6 mb-2 sm:mb-4 md:mb-8">
                        {/* Items Display Section */}
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 md:mb-6 gap-2">
                                <div>
                                    <h2 className="text-sm sm:text-lg md:text-3xl font-bold text-blue-700">
                                        {activeTab === 'lost' ? 'Lost Items' : 'Found Items'}
                                    </h2>
                                    {(categoryFilter !== 'all' || searchTerm) && (
                                        <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                                            {searchTerm && (
                                                <span className="px-1 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 rounded-full text-[10px] sm:text-xs">
                                                    Search: "{searchTerm}"
                                                </span>
                                            )}
                                            {categoryFilter !== 'all' && (
                                                <span className="px-1 sm:px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-800 rounded-full text-[10px] sm:text-xs">
                                                    Category: {categoryFilter}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="text-gray-600 font-semibold text-xs sm:text-sm md:text-base">
                                    {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-4 sm:py-8 md:py-12">
                                    <p className="text-gray-600 text-xs sm:text-sm md:text-lg">Loading items...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-3 md:gap-6 max-h-[400px] sm:max-h-[600px] md:max-h-[900px] overflow-y-auto">
                                    {/* Filtered Items */}
                                    {filteredItems.length > 0 ? (
                                        filteredItems.map((item, index) => (
                                            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-4 border-gray-400">
                                                {/* Item Image */}
                                                <div className="h-20 sm:h-32 md:h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                                    {(item.image_path || item.image_url) ? (
                                                        <img
                                                            src={getAssetUrl(item.image_path || item.image_url)}
                                                            alt={item.item_name}
                                                            className="w-full h-full object-contain bg-gray-100"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.parentElement.innerHTML = '<div class="text-center text-gray-400"><div class="text-lg sm:text-4xl mb-1 sm:mb-2">📦</div><p class="text-[10px] sm:text-sm">No Image</p></div>';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="text-center text-gray-400">
                                                            <div className="text-lg sm:text-4xl mb-1 sm:mb-2">📦</div>
                                                            <p className="text-[10px] sm:text-sm">No Image</p>
                                                        </div>
                                                    )}
                                                    {/* Status Badge */}
                                                    <div className={`absolute top-0.5 sm:top-1 md:top-2 right-0.5 sm:right-1 md:right-2 px-1 sm:px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[8px] sm:text-xs font-semibold ${
                                                        item.status === 'claimed'
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : (item.status?.toLowerCase() === 'found' || item.type?.toLowerCase() === 'found')
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {item.status === 'claimed' ? 'Claimed' : (item.status?.toLowerCase() === 'found' || item.type?.toLowerCase() === 'found') ? 'Found' : 'Lost'}
                                                    </div>
                                                </div>

                                                {/* Item Details */}
                                                <div className="p-3">
                                                    <h3 className="font-bold text-sm text-gray-800 mb-1 truncate">
                                                        {item.item_name}
                                                    </h3>
                                                    <p className="text-gray-600 text-xs mb-2 overflow-hidden line-clamp-2">
                                                        {item.description}
                                                    </p>

                                                    <div className="space-y-1 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3 flex-shrink-0" />
                                                            <span className="truncate">{item.location}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3 flex-shrink-0" />
                                                            <span className="truncate text-xs">{item.date_reported ? new Date(item.date_reported.replace(' ', 'T')).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            }) : 'N/A'}</span>
                                                        </div>
                                                        {item.reporter_name && (
                                                            <div className="flex items-center gap-1">
                                                                <User className="h-3 w-3 flex-shrink-0" />
                                                                <span className="truncate">{item.type === 'lost' ? 'Lost' : 'Found'} by: {item.reporter_name}</span>
                                                            </div>
                                                        )}
                                                        {item.status === 'claimed' && item.claimant_name && (
                                                            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 text-purple-600 font-medium text-[8px] sm:text-xs">
                                                                <User className="h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 flex-shrink-0" />
                                                                <span className="truncate">Claimed by: {item.claimant_name}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => handleViewDetails(item)}
                                                        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        <span>View Details</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 md:col-span-4 text-center py-8 md:py-12">
                                            <div className="text-gray-400 mb-4">
                                                <div className="text-4xl md:text-6xl mb-2 md:mb-4">🔍</div>
                                                <p className="text-base md:text-xl font-medium text-gray-600">No items found</p>
                                                <p className="text-sm md:text-base text-gray-500">Check back later for updates</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Sections - Outside white container with blue background and blur */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-blue-600/90 backdrop-blur-md border border-blue-500/50 rounded-lg shadow-lg p-4 text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="h-5 w-5" />
                                <h2 className="text-lg font-bold">How to Claim Items</h2>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {claimInstructions.length > 0 ? (
                                    claimInstructions.map((instruction) => (
                                        <div key={instruction.id} className="bg-white rounded-lg p-3 border border-blue-200">
                                            <div className="flex gap-2">
                                                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                                    {instruction.step_number}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-blue-800 mb-1 text-sm">{instruction.title}</h3>
                                                    <p className="text-blue-700 text-xs leading-relaxed">{instruction.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white rounded-lg p-4 border border-blue-200 text-center">
                                        <p className="text-blue-600 text-lg font-medium">Loading instructions...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-blue-600/90 backdrop-blur-md border border-blue-500/50 rounded-lg shadow-lg p-4 text-white">
                            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <Megaphone className="h-5 w-5" />
                                Announcements
                            </h2>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {announcements.length > 0 ? (
                                    announcements.map((announcement) => (
                                        <div key={announcement.id} className="bg-white rounded-lg p-3 border border-blue-200">
                                            <h3 className="font-semibold text-sm mb-1 text-blue-800">{announcement.title}</h3>
                                            <p className="text-blue-700 leading-relaxed text-xs">{announcement.content}</p>
                                            <p className="text-blue-600 text-xs mt-1">
                                                {new Date(announcement.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
                                        <p className="text-blue-600 text-sm font-medium">No announcements at the moment.</p>
                                        <p className="text-blue-500 text-xs">Check back later for updates from the administration.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Item Detail Modal */}
            {showItemModal && selectedItem && (
                <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-0 sm:p-2 md:p-4 pt-8 sm:pt-16 md:pt-4">
                    <div className="bg-white rounded-t-xl sm:rounded-t-2xl md:rounded-xl shadow-2xl max-w-4xl w-full h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] md:h-auto md:max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Header - Fixed */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-1.5 sm:p-2.5 md:p-6 flex-shrink-0">
                            <div className="flex items-start justify-between gap-1 sm:gap-2">
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xs sm:text-sm md:text-xl lg:text-2xl font-bold text-white mb-0.5 sm:mb-1 md:mb-2 break-words line-clamp-2">{selectedItem.item_name}</h2>
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 md:gap-2">
                                        <span className={`px-1 sm:px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] sm:text-xs md:text-sm font-semibold ${
                                            selectedItem.status === 'claimed' 
                                                ? 'bg-purple-500 text-white' 
                                                : (selectedItem.status?.toLowerCase() === 'found' || selectedItem.type?.toLowerCase() === 'found')
                                                    ? 'bg-green-500 text-white' 
                                                    : 'bg-red-500 text-white'
                                        }`}>
                                            {selectedItem.status === 'claimed' ? 'Claimed' : (selectedItem.status?.toLowerCase() === 'found' || selectedItem.type?.toLowerCase() === 'found') ? 'Found' : 'Lost'}
                                        </span>
                                        {selectedItem.category && (
                                            <span className="px-1 sm:px-2 md:px-3 py-0.5 md:py-1 bg-white bg-opacity-90 text-blue-700 rounded-full text-[10px] sm:text-xs md:text-sm font-semibold">
                                                {selectedItem.category}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={closeItemModal}
                                    className="text-white hover:text-gray-200 transition-colors p-0.5 md:p-2 hover:bg-white hover:bg-opacity-20 rounded flex-shrink-0"
                                >
                                    <X className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="p-1.5 sm:p-3 md:p-6 overflow-y-auto flex-1">
                            {/* Responsive Layout: Stacked on mobile, side by side on large screens */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-6 mb-2 sm:mb-4 md:mb-6">
                                {/* Left Column: Image */}
                                {(selectedItem.image_path || selectedItem.image_url) && (
                                    <div className="order-1 lg:order-1">
                                        {/* Top Button - Fullscreen */}
                                        <div className="flex justify-end items-center mb-2 p-2 bg-gray-50 rounded-t-lg">
                                            <button
                                                onClick={() => setIsFullscreen(true)}
                                                className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1.5 md:p-2 rounded-lg transition-all"
                                                title="View Fullscreen"
                                            >
                                                <Maximize2 className="h-4 w-4 md:h-5 md:w-5" />
                                            </button>
                                        </div>
                                        {/* Image */}
                                        <div className="rounded-lg overflow-hidden">
                                            <img
                                                src={getAssetUrl(selectedItem.image_path || selectedItem.image_url)}
                                                alt={selectedItem.item_name}
                                                className="w-full h-32 sm:h-48 md:h-56 lg:h-64 object-contain cursor-pointer hover:opacity-90 transition-opacity bg-gray-100"
                                                onClick={() => setIsFullscreen(true)}
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = '<div class="w-full h-32 sm:h-48 md:h-56 lg:h-64 bg-gray-100 flex items-center justify-center text-gray-400"><div class="text-center"><div class="text-4xl mb-2">📦</div><p>Image not available</p></div></div>';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Right Column: Details */}
                                <div className={`order-2 lg:order-2 ${!(selectedItem.image_path || selectedItem.image_url) ? 'lg:col-span-2' : ''}`}>
                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                                        <div className="space-y-3 md:space-y-4">
                                            <div>
                                                <h3 className="text-xs md:text-sm font-semibold text-blue-600 uppercase mb-1">Description</h3>
                                                <p className="text-gray-700 leading-relaxed text-xs md:text-base break-words">{selectedItem.description || 'No description provided'}</p>
                                            </div>

                                            <div>
                                                <h3 className="text-xs md:text-sm font-semibold text-blue-600 uppercase mb-1">Location</h3>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-blue-700 flex-shrink-0" />
                                                    <span className="text-xs md:text-base break-words">{selectedItem.location || 'Not specified'}</span>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xs md:text-sm font-semibold text-blue-600 uppercase mb-1">Date Reported</h3>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-700 flex-shrink-0" />
                                                    <span className="text-xs md:text-base">{selectedItem.date_reported ? new Date(selectedItem.date_reported.replace(' ', 'T')).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    }) : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {selectedItem.date_lost && (
                                                <div>
                                                    <h3 className="text-sm font-semibold text-blue-600 uppercase mb-1">Date Lost</h3>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Calendar className="h-5 w-5 text-blue-700" />
                                                        <span>{new Date(selectedItem.date_lost).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedItem.time_lost && (
                                                <div>
                                                    <h3 className="text-sm font-semibold text-blue-600 uppercase mb-1">Time Lost</h3>
                                                    <p className="text-gray-700">{selectedItem.time_lost}</p>
                                                </div>
                                            )}

                                            {selectedItem.reporter_name && (
                                                <div>
                                                    <h3 className="text-sm font-semibold text-blue-600 uppercase mb-1">{selectedItem.type === 'lost' ? 'Lost' : 'Found'} By</h3>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <User className="h-5 w-5 text-blue-700" />
                                                        <span>{selectedItem.reporter_name}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Finder Information - Show for Lost items marked as Found */}
                                            {selectedItem.status?.toLowerCase() === 'found' && selectedItem.type?.toLowerCase() === 'lost' && selectedItem.finder_name && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                    <h3 className="text-sm font-semibold text-green-700 uppercase mb-2">Found By</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-green-800">
                                                            <User className="h-5 w-5 text-green-600" />
                                                            <span className="font-medium">{selectedItem.finder_name}</span>
                                                        </div>
                                                        {selectedItem.finder_student_id && (
                                                            <div className="text-sm text-green-700">
                                                                <span className="font-semibold">Student ID:</span> {selectedItem.finder_student_id}
                                                            </div>
                                                        )}
                                                        {selectedItem.finder_contact && (
                                                            <div className="text-sm text-green-700">
                                                                <span className="font-semibold">Contact:</span> {selectedItem.finder_contact}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedItem.status === 'claimed' && selectedItem.claimant_name && (
                                                <div>
                                                    <h3 className="text-sm font-semibold text-blue-600 uppercase mb-1">Claimed By</h3>
                                                    <div className="flex items-center gap-2 text-blue-700 font-medium">
                                                        <User className="h-5 w-5" />
                                                        <span>{selectedItem.claimant_name}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Special Message for Lost Items Marked as Found */}
                                    {selectedItem.status?.toLowerCase() === 'found' && selectedItem.type?.toLowerCase() === 'lost' && selectedItem.status !== 'claimed' && (
                                        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg mt-4">
                                            <h3 className="font-bold text-green-800 mb-2">📍 Item Has Been Found!</h3>
                                            <p className="text-green-700 text-sm mb-2">
                                                Good news! This lost item has been found and is now available for claiming.
                                            </p>
                                            <div className="bg-white border border-green-200 rounded-lg p-3 mt-3">
                                                <p className="text-green-900 font-semibold text-sm">
                                                    📌 Please proceed to the <span className="text-green-700 font-bold">Student Council Office</span> to claim this item.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Additional Info */}
                                    {selectedItem.status !== 'claimed' && (
                                        <div className="bg-blue-50 border-l-4 border-blue-700 p-4 rounded-r-lg mt-4">
                                            {(selectedItem.status?.toLowerCase() === 'found' || selectedItem.type?.toLowerCase() === 'found') ? (
                                                <>
                                                    <h3 className="font-bold text-blue-800 mb-2">Want to claim this item?</h3>
                                                    <p className="text-blue-700 text-sm">
                                                        Click "YES" below to get instruction on how to claim this item.
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <h3 className="font-bold text-blue-800 mb-2">Have you found this item?</h3>
                                                    <p className="text-blue-700 text-sm">
                                                        If you have found this item, please click "YES" below to get instructions on how to return it to the owner.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer - Fixed at bottom */}
                        <div className="bg-white p-4 rounded-b-xl border-t border-gray-200 flex-shrink-0 flex justify-center">
                            <button
                                onClick={handleClaimItem}
                                className="px-8 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors font-medium text-sm"
                            >
                                YES
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeMessageModal}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold text-blue-700">Message</h3>
                            <button
                                onClick={closeMessageModal}
                                className="text-gray-600 hover:text-gray-800 transition-colors p-1 hover:bg-gray-100 rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mb-6">
                            <p className="text-gray-700 leading-relaxed">{messageContent}</p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={closeMessageModal}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                            >
                                OK
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
                        loading="lazy"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="max-w-full max-h-full flex items-center justify-center text-white"><div class="text-center"><div class="text-6xl mb-4">📦</div><p class="text-xl">Image not available</p></div></div>';
                        }}
                    />
                </div>
            )}

            {/* Footer */}
            <footer className="bg-blue-600 text-white mt-auto">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Office Hours */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="h-5 w-5" />
                                <h3 className="text-lg font-bold">OFFICE HOURS</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                                <p>Saturday - Sunday: CLOSED</p>
                            </div>
                        </div>

                        {/* Contact Us */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Mail className="h-5 w-5" />
                                <h3 className="text-lg font-bold">CONTACT US</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                                {contactInfo ? (
                                    <>
                                        <div className="flex items-start gap-2">
                                            <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span>{contactInfo.email || 'norzagaraycollege.edu.ph'}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <a 
                                                href="https://www.facebook.com/profile.php?id=100063821722265"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:underline hover:text-blue-200 transition-colors"
                                            >
                                                {contactInfo.office_location || 'Norzagaray, Bulacan'}
                                            </a>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-start gap-2">
                                            <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span>norzagaraycollege.edu.ph</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <a 
                                                href="https://www.facebook.com/profile.php?id=100063821722265"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:underline hover:text-blue-200 transition-colors"
                                            >
                                                Norzagaray, Bulacan
                                            </a>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="border-t border-blue-500 mt-8 pt-4 text-center text-sm">
                        <p>© 2025 Norzagaray College</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default HomePage;
