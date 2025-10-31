// src/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, LogOut, Package, BarChart3, Check, X, FileText, ChevronRight, Menu, Plus, Archive, ChevronDown, Megaphone, ClipboardList, LayoutGrid } from 'lucide-react';
import { API_ENDPOINTS } from '../utils/api';
import { showCustomConfirm } from '../components/CustomDialog';
import ManageItems from './ManageItems';
import ManageLostFoundItems from './ManageLostFoundItems';
import SystemReports from './SystemReports';
import ManageCategories from './ManageCategories';
import ArchivedItems from './ArchivedItems';
import DashboardOverview from './DashboardOverview';
import PostItem from './PostItem';
import ManageAnnouncements from './ManageAnnouncements';
import ClaimInstructions from './ClaimInstructions';
import SystemSettings from './SystemSettings';

function AdminDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(() => {
        // Check URL path first, then localStorage
        const path = location.pathname.replace('/admin-dashboard/', '').replace('/admin-dashboard', '');
        if (path && path !== '') {
            return path;
        }
        return localStorage.getItem('adminActiveTab') || 'dashboard';
    });
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        total_lost: 0,
        total_found: 0,
        claimed: 0,
        pending: 0,
        archived: 0,
        recent_activity: []
    });
    const [activityFilter, setActivityFilter] = useState('all'); // 'all', 'lost', 'found'
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarAutoExpanded, setSidebarAutoExpanded] = useState(false);
    const [itemManagementOpen, setItemManagementOpen] = useState(false);

    // Get header title based on active tab
    const getHeaderTitle = () => {
        switch (activeTab) {
            case 'dashboard':
                return 'Dashboard Overview';
            case 'manage-items':
                return 'Manage Items';
            case 'claim-management':
                return 'Claim Management';
            case 'categories-management':
                return 'Category Management';
            case 'archived-items':
                return 'Archived Items';
            case 'reports':
                return 'System Reports';
            case 'claim-instructions':
                return 'Claim Instructions Management';
            case 'post-item':
                return 'Post New Item';
            case 'announcements':
                return 'Announcements';
            case 'settings':
                return 'Settings';
            default:
                return 'Admin Dashboard';
        }
    };

    // Update document title and URL based on active tab
    useEffect(() => {
        const title = getHeaderTitle();
        document.title = `${title} - NC iFound Admin`;
        
        // Update URL to match active tab
        const newPath = activeTab === 'dashboard' ? '/admin-dashboard' : `/admin-dashboard/${activeTab}`;
        if (location.pathname !== newPath) {
            navigate(newPath, { replace: true });
        }
    }, [activeTab]);

    // Save active tab to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('adminActiveTab', activeTab);
    }, [activeTab]);

    // Check if user is logged in and authorized as admin
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/admin-login', { replace: true });
            return;
        }
        const parsedUser = JSON.parse(userData);
        if (!parsedUser.isAdmin) {
            navigate('/user-dashboard', { replace: true });
            return;
        }
        setUser(parsedUser);
        fetchDashboardStats();
        fetchRecentActivity();
    }, [navigate]);

    // Reset activity filter when leaving dashboard
    useEffect(() => {
        if (activeTab !== 'dashboard') {
            setActivityFilter('all');
        }
    }, [activeTab]);

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.STATS);
            const data = await response.json();

            if (data.success && data.stats) {
                setStats({
                    total_lost: data.stats.total_lost || 0,
                    total_found: data.stats.total_found || 0,
                    claimed: data.stats.claimed || 0,
                    pending: data.stats.pending || 0,
                    archived: data.stats.archived || 0,
                    recent_activity: data.stats.recent_activity || []
                });
            } else if (data.total_lost !== undefined) {
                // Handle old format response
                setStats({
                    total_lost: data.total_lost || 0,
                    total_found: data.total_found || 0,
                    claimed: data.claimed || 0,
                    pending: data.pending || 0,
                    archived: data.archived || 0,
                    recent_activity: data.recent_activity || []
                });
            } else {
                console.error('Failed to fetch stats:', data.message || 'No stats data received');
                // Set default stats if API fails
                setStats({
                    total_lost: 0,
                    total_found: 0,
                    claimed: 0,
                    pending: 0,
                    archived: 0,
                    recent_activity: []
                });
            }

            // Fetch common items and archived count separately
            await fetchCommonItems();
            await fetchArchivedCount();
            await fetchActiveItemCounts();

        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Set default stats if network error
            setStats({
                total_lost: 0,
                total_found: 0,
                claimed: 0,
                pending: 0,
                archived: 0,
                recent_activity: []
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCommonItems = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.COMMON_ITEMS);
            const data = await response.json();

            if (data.success && data.items) {
                setStats(prev => ({
                    ...prev,
                    most_common_lost: data.items
                }));
            } else if (Array.isArray(data)) {
                // Handle old format response
                setStats(prev => ({
                    ...prev,
                    most_common_lost: data
                }));
            } else {
                setStats(prev => ({
                    ...prev,
                    most_common_lost: []
                }));
            }
        } catch (error) {
            console.error('Error fetching common items:', error);
            setStats(prev => ({
                ...prev,
                most_common_lost: []
            }));
        }
    };

    const fetchArchivedCount = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.ARCHIVED);
            const data = await response.json();

            if (data.success && data.items) {
                setStats(prev => ({
                    ...prev,
                    archived: data.items.length
                }));
            } else if (Array.isArray(data)) {
                // Handle old format response
                setStats(prev => ({
                    ...prev,
                    archived: data.length
                }));
            } else {
                console.error('Failed to fetch archived items:', data.message || 'No data received');
                setStats(prev => ({
                    ...prev,
                    archived: 0
                }));
            }
        } catch (error) {
            console.error('Error fetching archived items:', error);
            setStats(prev => ({
                ...prev,
                archived: 0
            }));
        }
    };

    const fetchActiveItemCounts = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.ALL);
            const data = await response.json();

            if (data.success && data.items) {
                // Filter out claimed and archived items, then count by type
                const activeItems = data.items.filter(item => {
                    const status = item.status?.toLowerCase();
                    return status !== 'claimed' && status !== 'archived';
                });

                const activeLostCount = activeItems.filter(item => {
                    const type = item.type?.toLowerCase();
                    const status = item.status?.toLowerCase();
                    return type === 'lost' || status === 'lost';
                }).length;

                const activeFoundCount = activeItems.filter(item => {
                    const type = item.type?.toLowerCase();
                    const status = item.status?.toLowerCase();
                    return type === 'found' || status === 'found';
                }).length;

                setStats(prev => ({
                    ...prev,
                    total_lost: activeLostCount,
                    total_found: activeFoundCount
                }));
            } else {
                console.error('Failed to fetch all items for active count:', data.message || 'No data received');
            }
        } catch (error) {
            console.error('Error fetching active item counts:', error);
        }
    };

    // Fetch recent activity from database
    const fetchRecentActivity = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.RECENT_ACTIVITY);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setStats(prev => ({ ...prev, recent_activity: data.recent_activity }));
                } else {
                    console.error('Failed to fetch recent activity:', data.message);
                }
            }
        } catch (error) {
            console.error('Error fetching recent activity:', error);
        }
    };

    return (
        <>
            <style>{`
                .item-management-dropdown::-webkit-scrollbar {
                    width: 8px;
                }
                .item-management-dropdown::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }
                .item-management-dropdown::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .item-management-dropdown::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
            <div
                className="h-screen flex animate-fade-in overflow-hidden bg-white"
                onClick={() => {
                    if (!sidebarCollapsed) {
                        setSidebarCollapsed(true);
                        setSidebarAutoExpanded(false);
                    }
                }}
            >
                {/* Sidebar */}
                <div
                    className={`bg-blue-600 text-white hidden md:flex flex-col transition-all duration-300 fixed h-full z-10 ${sidebarCollapsed && !sidebarAutoExpanded ? 'w-16' : 'w-64'
                        }`}
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={() => {
                        if (sidebarCollapsed) {
                            setSidebarAutoExpanded(true);
                        }
                    }}
                    onMouseLeave={() => {
                        if (sidebarCollapsed) {
                            setSidebarAutoExpanded(false);
                        }
                    }}
                >
                    {/* Sidebar Toggle Button */}
                    <div className="relative p-4 border-b border-blue-500">
                        {(!sidebarCollapsed || sidebarAutoExpanded) && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <h2 className="text-white text-lg font-bold tracking-wide">Menu</h2>
                            </div>
                        )}
                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    setSidebarCollapsed(!sidebarCollapsed);
                                    setSidebarAutoExpanded(!sidebarCollapsed);
                                }}
                                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                                title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                            >
                                {sidebarCollapsed ? (
                                    <ChevronRight className="h-5 w-5" />
                                ) : (
                                    <ChevronRight className="h-5 w-5 rotate-180" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className={`p-6 border-b border-blue-500 transition-all duration-300 ${sidebarCollapsed && !sidebarAutoExpanded ? 'px-2' : ''
                        }`}>
                        <div className={`flex items-center ${sidebarCollapsed && !sidebarAutoExpanded ? 'justify-center' : 'gap-3'}`}>
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center transform transition-all duration-300 hover:scale-110">
                                <span className="text-blue-600 font-bold">
                                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
                                </span>
                            </div>
                            {(!sidebarCollapsed || sidebarAutoExpanded) && (
                                <div>
                                    <h3 className="font-semibold">{user?.fullName || user?.email || 'Administrator'}</h3>
                                    <p className="text-blue-200 text-sm">Admin</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className={`flex-1 p-4 space-y-2 transition-all duration-300 overflow-y-auto ${sidebarCollapsed && !sidebarAutoExpanded ? 'px-2' : ''
                        }`}>
                        {/* Dashboard */}
                        <button
                            onClick={() => {
                                setActiveTab('dashboard');
                                setMobileMenuOpen(false);
                                setSidebarCollapsed(true);
                                setSidebarAutoExpanded(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${activeTab === 'dashboard'
                                ? 'bg-blue-800 text-white scale-105 shadow-lg'
                                : 'hover:bg-blue-700 text-blue-100'
                                }`}
                            title={sidebarCollapsed && !sidebarAutoExpanded ? 'Dashboard' : ''}
                        >
                            <BarChart3 className="h-5 w-5 flex-shrink-0" />
                            {(!sidebarCollapsed || sidebarAutoExpanded) && 'Dashboard'}
                        </button>

                        {/* Item Management - Parent */}
                        <div>
                            <button
                                onClick={() => {
                                    if (sidebarCollapsed) {
                                        // Expand sidebar and open submenu
                                        setSidebarCollapsed(false);
                                        setSidebarAutoExpanded(true);
                                        setItemManagementOpen(true);
                                    } else {
                                        // Toggle submenu
                                        setItemManagementOpen(!itemManagementOpen);
                                    }
                                }}
                                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${['manage-items', 'claim-management', 'archived-items', 'archive-management', 'post-item'].includes(activeTab)
                                    ? 'bg-blue-800 text-white'
                                    : 'hover:bg-blue-700 text-blue-100'
                                    }`}
                                title={sidebarCollapsed ? 'Item Management - Click to expand' : ''}
                            >
                                <div className="flex items-center gap-3">
                                    <Package className="h-5 w-5 flex-shrink-0" />
                                    {(!sidebarCollapsed || sidebarAutoExpanded) && 'Item Management'}
                                </div>
                                {(!sidebarCollapsed || sidebarAutoExpanded) && (
                                    <ChevronDown className={`h-4 w-4 transition-transform ${itemManagementOpen ? 'rotate-180' : ''}`} />
                                )}
                            </button>

                            {/* Submenu */}
                            {(!sidebarCollapsed || sidebarAutoExpanded) && itemManagementOpen && (
                                <div
                                    className="item-management-dropdown ml-4 mt-1 space-y-1 border-l-2 border-gray-300 pl-2 bg-white rounded-lg p-2 max-h-80 overflow-y-auto"
                                    style={{
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: '#cbd5e1 #f1f5f9'
                                    }}
                                >
                                    <button
                                        onClick={() => {
                                            setActivityFilter('all');
                                            setActiveTab('manage-items');
                                            setMobileMenuOpen(false);
                                            setSidebarCollapsed(true);
                                            setSidebarAutoExpanded(false);
                                        }}
                                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${activeTab === 'manage-items'
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        Manage Items
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveTab('claim-management');
                                            setMobileMenuOpen(false);
                                            setSidebarCollapsed(true);
                                            setSidebarAutoExpanded(false);
                                        }}
                                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${activeTab === 'claim-management'
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        Claim Management
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveTab('archived-items');
                                            setMobileMenuOpen(false);
                                            setSidebarCollapsed(true);
                                            setSidebarAutoExpanded(false);
                                        }}
                                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${activeTab === 'archived-items'
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        Archived Items
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveTab('post-item');
                                            setMobileMenuOpen(false);
                                            setSidebarCollapsed(true);
                                            setSidebarAutoExpanded(false);
                                        }}
                                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${activeTab === 'post-item'
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        Post Item
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Categories Management */}
                        <button
                            onClick={() => {
                                setActiveTab('categories-management');
                                setMobileMenuOpen(false);
                                setSidebarCollapsed(true);
                                setSidebarAutoExpanded(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'categories-management'
                                ? 'bg-blue-800 text-white'
                                : 'hover:bg-blue-700 text-blue-100'
                                }`}
                            title={sidebarCollapsed ? 'Categories Management' : ''}
                        >
                            <LayoutGrid className="h-5 w-5 flex-shrink-0" />
                            {(!sidebarCollapsed || sidebarAutoExpanded) && 'Categories Management'}
                        </button>

                        {/* Reports */}
                        <button
                            onClick={() => {
                                setActiveTab('reports');
                                setMobileMenuOpen(false);
                                setSidebarCollapsed(true);
                                setSidebarAutoExpanded(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'reports'
                                ? 'bg-blue-800 text-white'
                                : 'hover:bg-blue-700 text-blue-100'
                                }`}
                            title={sidebarCollapsed ? 'Reports' : ''}
                        >
                            <FileText className="h-5 w-5 flex-shrink-0" />
                            {(!sidebarCollapsed || sidebarAutoExpanded) && 'Reports'}
                        </button>
                        {/* Claim Instructions */}
                        <button
                            onClick={() => {
                                setActiveTab('claim-instructions');
                                setMobileMenuOpen(false);
                                setSidebarCollapsed(true);
                                setSidebarAutoExpanded(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'claim-instructions'
                                ? 'bg-blue-800 text-white'
                                : 'hover:bg-blue-700 text-blue-100'
                                }`}
                            title={sidebarCollapsed ? 'Claim Instructions' : ''}
                        >
                            <ClipboardList className="h-5 w-5 flex-shrink-0" />
                            {(!sidebarCollapsed || sidebarAutoExpanded) && 'Claim Instructions'}
                        </button>

                        {/* Announcements */}
                        <button
                            onClick={() => {
                                setActiveTab('announcements');
                                setMobileMenuOpen(false);
                                setSidebarCollapsed(true);
                                setSidebarAutoExpanded(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'announcements'
                                ? 'bg-blue-800 text-white'
                                : 'hover:bg-blue-700 text-blue-100'
                                }`}
                            title={sidebarCollapsed ? 'Announcements' : ''}
                        >
                            <Megaphone className="h-5 w-5 flex-shrink-0" />
                            {(!sidebarCollapsed || sidebarAutoExpanded) && 'Announcements'}
                        </button>

                        {/* Settings */}
                        <button
                            onClick={() => {
                                setActiveTab('settings');
                                setMobileMenuOpen(false);
                                setSidebarCollapsed(true);
                                setSidebarAutoExpanded(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'settings'
                                ? 'bg-blue-800 text-white'
                                : 'hover:bg-blue-700 text-blue-100'
                                }`}
                            title={sidebarCollapsed ? 'Settings' : ''}
                        >
                            <Settings className="h-5 w-5 flex-shrink-0" />
                            {(!sidebarCollapsed || sidebarAutoExpanded) && 'Settings'}
                        </button>
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-blue-500">
                        <button
                            onClick={() => {
                                // Show custom confirmation dialog
                                showCustomConfirm(
                                    'Are you sure you want to logout?',
                                    () => {
                                        // Clear any stored user data
                                        localStorage.removeItem('user');
                                        sessionStorage.removeItem('user');
                                        localStorage.removeItem('adminActiveTab');
                                        // Navigate to login page
                                        navigate('/admin-login');
                                    }
                                );
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-blue-700 text-blue-100 transition-colors`}
                            title={sidebarCollapsed ? 'Logout' : ''}
                        >
                            <LogOut size={20} className="flex-shrink-0" />
                            {(!sidebarCollapsed || sidebarAutoExpanded) && 'Logout'}
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div
                    className={`flex-1 ${sidebarCollapsed && !sidebarAutoExpanded ? 'md:ml-16' : 'md:ml-64'} ml-0 bg-gray-50 animate-slide-in-right h-screen flex flex-col transition-all duration-300 relative`}
                >
                    {/* Mobile Header - Fixed */}
                    <div className="md:hidden flex items-center justify-between bg-blue-600 text-white p-3 shadow-lg sticky top-0 z-40">
                        <h1 className="text-lg font-bold">{getHeaderTitle()}</h1>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 hover:bg-blue-700 rounded-lg transition-colors flex-shrink-0"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-white w-full relative z-0">
                        <div className="max-w-full overflow-hidden w-full min-w-0">

                            {/* Mobile Menu Overlay */}
                            {mobileMenuOpen && (
                                <div className="md:hidden fixed inset-0 bg-transparent z-50 animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
                                    <div className="bg-blue-600 text-white w-72 sm:w-80 h-full shadow-2xl animate-slide-in-left overflow-y-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
                                        {/* Mobile Menu Header */}
                                        <div className="flex items-center justify-between p-4 border-b border-blue-500">
                                            <h2 className="text-lg font-bold">Menu</h2>
                                            <button
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>

                                        {/* User Profile Mobile */}
                                        <div className="p-4 border-b border-blue-500">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 font-bold">
                                                        {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-sm">{user?.fullName || 'Administrator'}</h3>
                                                    <p className="text-blue-200 text-xs">Admin</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mobile Navigation */}
                                        <div className="flex-1 p-3 space-y-1 overflow-y-auto">
                                            <button
                                                onClick={() => {
                                                    setActiveTab('dashboard');
                                                    setMobileMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                                    }`}
                                            >
                                                <BarChart3 className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">Dashboard</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setActivityFilter('all');
                                                    setActiveTab('manage-items');
                                                    setMobileMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-colors ${activeTab === 'manage-items' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                                    }`}
                                            >
                                                <Package className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">Manage Items</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setActiveTab('claim-management');
                                                    setMobileMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-colors ${activeTab === 'claim-management' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                                    }`}
                                            >
                                                <Check className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">Claim Management</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setActiveTab('archived-items');
                                                    setMobileMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-colors ${activeTab === 'archived-items' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                                    }`}
                                            >
                                                <Archive className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">Archived Items</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setActiveTab('post-item');
                                                    setMobileMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-colors ${activeTab === 'post-item' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                                    }`}
                                            >
                                                <Plus className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">Post Item</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setActiveTab('categories-management');
                                                    setMobileMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-colors ${activeTab === 'categories-management' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                                    }`}
                                            >
                                                <LayoutGrid className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">Categories</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setActiveTab('reports');
                                                    setMobileMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-colors ${activeTab === 'reports' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                                    }`}
                                            >
                                                <FileText className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">Reports</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setActiveTab('claim-instructions');
                                                    setMobileMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-colors ${activeTab === 'claim-instructions' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                                    }`}
                                            >
                                                <ClipboardList className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">Claim Instructions</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setActiveTab('announcements');
                                                    setMobileMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-colors ${activeTab === 'announcements' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                                    }`}
                                            >
                                                <Megaphone className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">Announcements</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setActiveTab('settings');
                                                    setMobileMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-colors ${activeTab === 'settings' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                                    }`}
                                            >
                                                <Settings className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">Settings</span>
                                            </button>
                                        </div>

                                        {/* Mobile Logout Button */}
                                        <div className="p-3 border-t border-blue-500">
                                            <button
                                                onClick={() => {
                                                    localStorage.removeItem('user');
                                                    localStorage.removeItem('adminActiveTab');
                                                    navigate('/admin-login');
                                                    if (window.showNotification) {
                                                        window.showNotification('Logged out successfully', 'success', 3000);
                                                    }
                                                }}
                                                className="w-full flex items-center gap-2 p-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-left text-sm transition-colors"
                                            >
                                                <LogOut className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'dashboard' && (
                                <DashboardOverview 
                                    stats={stats}
                                    loading={loading}
                                    activityFilter={activityFilter}
                                    setActivityFilter={setActivityFilter}
                                    setActiveTab={setActiveTab}
                                />
                            )}

                            {activeTab === 'manage-items' && (
                                <div className="w-full max-w-full overflow-hidden">
                                    <ManageLostFoundItems 
                                        key="manage-items" 
                                        initialFilterType={activityFilter}
                                    />
                                </div>
                            )}

                            {activeTab === 'categories-management' && (
                                <div className="w-full max-w-full overflow-hidden">
                                    <ManageCategories key="categories-management" />
                                </div>
                            )}

                            {activeTab === 'claim-management' && (
                                <div className="w-full max-w-full overflow-hidden">
                                    <ManageItems key="claim-management" />
                                </div>
                            )}

                            {activeTab === 'archived-items' && (
                                <div className="w-full max-w-full overflow-hidden">
                                    <ArchivedItems key="archived-items" />
                                </div>
                            )}

                            {activeTab === 'reports' && (
                                <div className="w-full max-w-full overflow-hidden">
                                    <SystemReports />
                                </div>
                            )}

                            {/* Claim Instructions Section */}
                            {activeTab === 'claim-instructions' && (
                                <ClaimInstructions />
                            )}

                            {/* Announcements Section */}
                            {activeTab === 'announcements' && (
                                <ManageAnnouncements />
                            )}

                            {/* Post Item Section */}
                            {activeTab === 'post-item' && (
                                <PostItem 
                                    user={user} 
                                    onSuccess={() => {
                                        fetchDashboardStats();
                                        fetchRecentActivity();
                                    }} 
                                />
                            )}

                            {/* Settings Section */}
                            {activeTab === 'settings' && (
                                <SystemSettings />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminDashboard;
