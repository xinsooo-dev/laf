// src/homepage/HomePage.jsx
import { Search, ArrowRight, Eye, Calendar, MapPin, User, Filter, LogOut, FileText, X, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, getAssetUrl } from '../utils/api';

function HomePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [lostItems, setLostItems] = useState([]);
    const [foundItems, setFoundItems] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [categories, setCategories] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [claimInstructions, setClaimInstructions] = useState([]);
    const [contactInfo, setContactInfo] = useState(null);

    // Item detail modal state
    const [selectedItem, setSelectedItem] = useState(null);
    const [showItemModal, setShowItemModal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    // Check authentication status
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // Fetch latest items and announcements from database
    useEffect(() => {
        fetchLatestItems();
        fetchAnnouncements();
        fetchCategories();
        fetchClaimInstructions();
        fetchContactInfo();
    }, []);

    // Debug effect to log filter changes
    useEffect(() => {
        console.log('Filter changed:', {
            categoryFilter,
            typeFilter,
            searchTerm,
            totalItems: [...lostItems, ...foundItems].length,
            categories: categories.map(cat => cat.name)
        });
    }, [categoryFilter, typeFilter, searchTerm, lostItems, foundItems, categories]);

    const fetchCategories = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.CATEGORIES.ALL);
            const data = await response.json();
            console.log('Categories API response:', data);
            if (data.success) {
                console.log('Available categories:', data.categories);
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
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
            console.log('Raw API response:', data); // Debug log

            if (data.success) {
                console.log('Latest items data:', data); // Debug log
                console.log('Lost items:', data.lost_items); // Debug log
                console.log('Found items:', data.found_items); // Debug log

                // Debug: Log category information for each item
                const allItems = [...(data.lost_items || []), ...(data.found_items || [])];
                console.log('Items with categories:', allItems.map(item => ({
                    name: item.item_name,
                    category: item.category,
                    category_name: item.category_name,
                    category_id: item.category_id
                })));

                // Check for archived items
                const lostArchived = (data.lost_items || []).filter(item => item.status === 'archived');
                const foundArchived = (data.found_items || []).filter(item => item.status === 'archived');
                console.log('Archived lost items:', lostArchived);
                console.log('Archived found items:', foundArchived);

                setLostItems(data.lost_items || []);
                setFoundItems(data.found_items || []);
            } else {
                console.error('API error:', data.message);
                setLostItems([]);
                setFoundItems([]);
            }
        } catch (error) {
            console.error('Error fetching latest items:', error);
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
                console.error('API error:', data.message);
                setAnnouncements([]);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
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
            console.error('Error fetching claim instructions:', error);
        }
    };

    const fetchContactInfo = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.CLAIM_INSTRUCTIONS.CONTACT);
            const data = await response.json();
            if (data.success && data.contact) {
                setContactInfo(data.contact);
            }
        } catch (error) {
            console.error('Error fetching contact info:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        setUser(null);
        navigate('/', { replace: true });
    };

    const handleProfileClick = () => {
        if (user?.isAdmin) {
            navigate('/admin-dashboard');
        } else {
            navigate('/user-dashboard');
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
        // Show message box about proceeding to student council office
        alert('Please proceed to the Student Council Office to claim this item.');
        closeItemModal();
    };

    // Restore background scrolling
    document.body.style.overflow = 'unset';

    // Filter items based on search and filters
    const allItems = [...lostItems, ...foundItems];
    console.log('🔍 Filtering Debug:');
    console.log('Total items before filtering:', allItems.length);
    console.log('Items by status:', allItems.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
    }, {}));
    
    const filteredItems = allItems.filter(item => {
        // Exclude claimed items
        if (item.status === 'claimed') {
            return false;
        }

        // Exclude archived items (older than 2 weeks and not claimed)
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const itemDate = new Date(item.created_at || item.date_reported);
        const isArchived = itemDate < twoWeeksAgo && item.status !== 'claimed';
        const isNotArchived = !isArchived;
        
        if (isArchived) {
            return false;
        }

        const matchesSearch = item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || item.type?.toLowerCase() === typeFilter.toLowerCase();

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

        // Debug logging for category filtering
        if (categoryFilter !== 'all') {
            console.log('Category Filter Debug:', {
                categoryFilter,
                itemCategory: item.category,
                itemCategoryName: item.category_name,
                itemCategoryId: item.category_id,
                matchesCategory,
                itemName: item.item_name
            });
        }

        return isNotArchived && matchesSearch && matchesType && matchesCategory;
    });
    
    console.log('Final filtered items count:', filteredItems.length);
    console.log('Filtered items:', filteredItems.map(item => item.item_name));
    console.log('🔄 Loading state:', loading);
    console.log('🎯 Should show items:', !loading && filteredItems.length > 0);

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
            <header className="bg-blue-600 text-white p-2 sm:p-3 md:p-5">
                <div className="flex items-center justify-between w-full gap-2 sm:gap-2 md:gap-0">
                    {/* Left: Logo + Title */}
                    <div className="flex items-center gap-2 sm:gap-2 md:gap-3 flex-1 min-w-0">
                        <img src="/nclogo.png" alt="NC Logo" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 object-contain flex-shrink-0" />
                        <h1 className="text-xs sm:text-sm md:text-2xl font-bold break-words line-clamp-1 md:line-clamp-2">NC LOST & FOUND</h1>
                    </div>

                    {/* Right: Buttons */}
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
                        {user ? (
                            // Authenticated user buttons
                            <>
                                <div className="hidden md:flex items-center gap-2 bg-blue-700 px-3 py-2 rounded-lg">
                                    <User className="h-4 w-4" />
                                    <span className="text-sm">{user.email}</span>
                                </div>
                                <button
                                    onClick={handleProfileClick}
                                    className="bg-blue-700 hover:bg-blue-800 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded text-xs sm:text-sm md:text-base whitespace-nowrap"
                                >
                                    <span className="sm:hidden">Dash</span>
                                    <span className="hidden sm:inline">Dashboard</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 p-1 sm:p-1.5 md:px-4 md:py-2 rounded flex items-center justify-center"
                                    title="Logout"
                                >
                                    <LogOut className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5" />
                                    <span className="hidden md:inline md:ml-2">Logout</span>
                                </button>
                            </>
                        ) : (
                            // Guest user buttons - Only Sign In for mobile
                            <>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="bg-blue-700 hover:bg-blue-800 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded text-xs sm:text-sm md:text-base whitespace-nowrap"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="hidden sm:block bg-blue-700 hover:bg-blue-800 px-3 md:px-4 py-1.5 md:py-2 rounded text-sm md:text-base whitespace-nowrap"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Search Section */}
            <div className="container mx-auto p-1 sm:p-3 md:p-6">
                <div className="max-w-6xl mx-auto mb-2 sm:mb-4 md:mb-8">
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-4 mb-2 sm:mb-3 md:mb-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 sm:p-3 md:p-4 pr-12 sm:pr-12 md:pr-16 rounded-lg bg-white bg-opacity-90 shadow-lg text-sm sm:text-base md:text-lg"
                            />
                            <button className="absolute right-2 sm:right-3 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-600 p-1 sm:p-1.5 md:p-2 rounded">
                                <Search className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5" />
                            </button>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-3 sm:p-3 md:p-4 rounded-lg shadow-lg transition-colors ${showFilters ? 'bg-blue-700 text-white' : 'bg-white bg-opacity-90 text-blue-600'
                                }`}
                        >
                            <Filter className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5" />
                        </button>
                    </div>

                    {/* Filter Dropdowns */}
                    {showFilters && (
                        <div className="flex flex-col md:flex-row gap-1 sm:gap-2 md:gap-4 bg-white bg-opacity-90 p-2 sm:p-3 md:p-4 rounded-lg shadow-lg">
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="flex-1 px-4 md:px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-base md:text-base bg-white"
                            >
                                <option value="all">All Types</option>
                                <option value="lost">Lost Items</option>
                                <option value="found">Found Items</option>
                            </select>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="flex-1 px-4 md:px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-base md:text-base bg-white"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setTypeFilter('all');
                                    setCategoryFilter('all');
                                }}
                                className="px-4 sm:px-4 md:px-4 py-3 sm:py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-base sm:text-base md:text-base"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
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
                                    <h2 className="text-sm sm:text-lg md:text-3xl font-bold text-blue-700">All Items</h2>
                                    {(categoryFilter !== 'all' || typeFilter !== 'all' || searchTerm) && (
                                        <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                                            {searchTerm && (
                                                <span className="px-1 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 rounded-full text-[10px] sm:text-xs">
                                                    Search: "{searchTerm}"
                                                </span>
                                            )}
                                            {typeFilter !== 'all' && (
                                                <span className="px-1 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-800 rounded-full text-[10px] sm:text-xs">
                                                    Type: {typeFilter}
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
                                <div className="text-blue-600 font-semibold text-xs sm:text-sm md:text-base">
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
                                                                console.log('Image failed to load:', item.image_path || item.image_url);
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
                                                    <div className={`absolute top-0.5 sm:top-1 md:top-2 right-0.5 sm:right-1 md:right-2 px-1 sm:px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[8px] sm:text-xs font-semibold ${item.status === 'claimed'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : item.status === 'lost' || item.type === 'lost'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {item.status === 'claimed' ? 'Claimed' : item.status === 'lost' || item.type === 'lost' ? 'Lost' : 'Found'}
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
                                <h2 className="text-lg font-bold">How to Claim Lost Items</h2>
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

                                {contactInfo && (
                                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                                        <h3 className="font-semibold text-blue-800 mb-2 text-sm">📞 Contact Information</h3>
                                        <div className="text-blue-700 text-xs space-y-1">
                                            <p><strong className="text-blue-900">Office:</strong> {contactInfo.office_location}</p>
                                            <p><strong className="text-blue-900">Phone:</strong> {contactInfo.contact_number}</p>
                                            <p><strong className="text-blue-900">Email:</strong> {contactInfo.email}</p>
                                            <p><strong className="text-blue-900">Hours:</strong> {contactInfo.office_hours}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-blue-600/90 backdrop-blur-md border border-blue-500/50 rounded-lg shadow-lg p-4 text-white">
                            <h2 className="text-lg font-bold mb-3">Announcements</h2>
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
                <div className="fixed inset-0 bg-transparent z-50 flex items-start md:items-center justify-center p-0 sm:p-2 md:p-4 pt-8 sm:pt-16 md:pt-4">
                    <div className="bg-white rounded-t-xl sm:rounded-t-2xl md:rounded-xl shadow-2xl max-w-7xl w-full h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] md:h-auto md:max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Header - Fixed */}
                        <div className="p-1.5 sm:p-2.5 md:p-6 bg-blue-700 flex-shrink-0">
                            <div className="flex items-start justify-between gap-1 sm:gap-2">
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xs sm:text-sm md:text-xl lg:text-2xl font-bold text-white mb-0.5 sm:mb-1 md:mb-2 break-words line-clamp-2">{selectedItem.item_name}</h2>
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 md:gap-2">
                                        <span className={`px-1 sm:px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] sm:text-xs md:text-sm font-semibold ${selectedItem.status === 'claimed' ? 'bg-purple-500 text-white' : selectedItem.status === 'lost' || selectedItem.type === 'lost' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                                            {selectedItem.status === 'claimed' ? 'Claimed' : selectedItem.status === 'lost' || selectedItem.type === 'lost' ? 'Lost' : 'Found'}
                                        </span>
                                        {selectedItem.category && (
                                            <span className="px-1 sm:px-2 md:px-3 py-0.5 md:py-1 bg-white text-blue-700 rounded-full text-[10px] sm:text-xs md:text-sm font-semibold">
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
                                                className="w-full h-32 sm:h-48 md:h-64 lg:h-80 object-contain cursor-pointer hover:opacity-90 transition-opacity bg-gray-100"
                                                onClick={() => setIsFullscreen(true)}
                                                loading="lazy"
                                                onError={(e) => {
                                                    console.log('Modal image failed to load:', selectedItem.image_path || selectedItem.image_url);
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = '<div class="w-full h-32 sm:h-48 md:h-64 lg:h-80 bg-gray-100 flex items-center justify-center text-gray-400"><div class="text-center"><div class="text-4xl mb-2">📦</div><p>Image not available</p></div></div>';
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
                                                    <h3 className="text-sm font-semibold text-blue-600 uppercase mb-1">Reported By</h3>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <User className="h-5 w-5 text-blue-700" />
                                                        <span>{selectedItem.reporter_name}</span>
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

                                    {/* Additional Info */}
                                    {selectedItem.status !== 'claimed' && (
                                        <div className="bg-blue-50 border-l-4 border-blue-700 p-4 rounded-r-lg mt-4">
                                            <h3 className="font-bold text-blue-800 mb-2">✅ Want to claim this item?</h3>
                                            <p className="text-blue-700 text-sm">
                                                Click "YES" below to get instruction on how to claim this item.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer - Fixed at bottom */}
                        <div className="bg-blue-50 p-4 rounded-b-xl border-t border-blue-200 flex-shrink-0">
                            <button
                                onClick={handleClaimItem}
                                className="w-full px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors font-medium"
                            >
                                YES
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
                            console.log('Fullscreen image failed to load:', selectedItem.image_path || selectedItem.image_url);
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="max-w-full max-h-full flex items-center justify-center text-white"><div class="text-center"><div class="text-6xl mb-4">📦</div><p class="text-xl">Image not available</p></div></div>';
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default HomePage;
