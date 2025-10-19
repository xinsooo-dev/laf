import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Menu, X, Home, Package, List, Plus, MessageCircle, Eye, FileText, Settings, LogOut, RefreshCw, Bell } from 'lucide-react';
import { API_ENDPOINTS } from '../../utils/api';
import ReportItem from '../../user/ReportItem';
import UserMessaging from '../../user/UserMessaging';

// Import new components
import DashboardStats from './DashboardStats';
import RecentItems from './RecentItems';
import ItemsTable from './ItemsTable';
import ItemModal from './ItemModal';
import SettingsTab from '../Settings/SettingsTab';
import ClaimsTab from './ClaimsTab';

// Import new hooks
import { useUserData } from '../../hooks/useUserData';
import { useItems } from '../../hooks/useItems';

function UserDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [sidebarAutoExpanded, setSidebarAutoExpanded] = useState(false);

    // Use custom hooks
    const { currentUser, userStats, loading: userLoading, updateUserProfile } = useUserData();
    const { lostItems, foundItems, allLostItems, commonItems, loading: itemsLoading, refetchItems } = useItems(currentUser?.id);

    const refreshDashboard = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
        refetchItems();
    }, [refetchItems]);

    const handleView = (item) => {
        console.log('Viewing item:', item);
        console.log('Item image_path:', item.imagePath);
        setSelectedItem(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
    };

    // Check if user is logged in and authorized
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login', { replace: true });
            return;
        }
        const userData = JSON.parse(user);
        if (userData.isAdmin) {
            navigate('/admin-dashboard', { replace: true });
        }
    }, [navigate]);

    return (
        <div style={{
            backgroundImage: "url('/ncbg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
        }} className="h-screen flex animate-fade-in overflow-hidden"
            onClick={() => {
                if (!sidebarCollapsed) {
                    setSidebarCollapsed(true);
                    setSidebarAutoExpanded(false);
                }
            }}
        >
            {/* Sidebar */}
            <div className={`bg-blue-600 text-white flex flex-col transition-all duration-300 fixed h-full z-10 ${sidebarCollapsed ? 'w-16' : 'w-64'
                }`}>
                {/* Sidebar Toggle Button */}
                <div className="relative p-4 border-b border-blue-500">
                    {!sidebarCollapsed && (
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
                <div className={`p-6 border-b border-blue-500 transition-all duration-300 ${sidebarCollapsed ? 'px-2' : ''
                    }`}>
                    <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center transform transition-all duration-300 hover:scale-110">
                            <span className="text-blue-600 font-bold text-lg">
                                {currentUser?.full_name?.charAt(0) || 'A'}
                            </span>
                        </div>
                        {!sidebarCollapsed && (
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold truncate">{currentUser?.full_name || 'Loading...'}</h3>
                                <p className="text-blue-200 text-sm truncate">{currentUser?.student_id || 'Loading...'}</p>
                                <p className="text-blue-300 text-xs truncate">
                                    {currentUser?.course && currentUser?.year
                                        ? `${currentUser.course}-${currentUser.year}`
                                        : 'Course/Year: Not set'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className={`flex-1 p-4 space-y-1 transition-all duration-300 ${sidebarCollapsed ? 'px-2' : ''
                    }`}>
                    <button
                        onClick={() => {
                            setActiveTab('dashboard');
                            setMobileMenuOpen(false);
                            setSidebarCollapsed(true);
                            setSidebarAutoExpanded(false);
                        }}
                        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg text-left transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${activeTab === 'dashboard'
                            ? 'bg-blue-800 text-white scale-105 shadow-lg'
                            : 'hover:bg-blue-700 text-blue-100'
                            }`}
                        title={sidebarCollapsed ? 'Dashboard' : ''}
                    >
                        <Home className="h-5 w-5 flex-shrink-0" />
                        {!sidebarCollapsed && 'Dashboard'}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('lost-items');
                            setMobileMenuOpen(false);
                            setSidebarCollapsed(true);
                            setSidebarAutoExpanded(false);
                        }}
                        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg text-left transition-colors ${activeTab === 'lost-items'
                            ? 'bg-blue-800 text-white'
                            : 'hover:bg-blue-700 text-blue-100'
                            }`}
                        title={sidebarCollapsed ? 'Lost Items' : ''}
                    >
                        <Package className="h-5 w-5 flex-shrink-0" />
                        {!sidebarCollapsed && 'Lost Items'}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('found-items');
                            setMobileMenuOpen(false);
                            setSidebarCollapsed(true);
                            setSidebarAutoExpanded(false);
                        }}
                        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg text-left transition-colors ${activeTab === 'found-items'
                            ? 'bg-blue-800 text-white'
                            : 'hover:bg-blue-700 text-blue-100'
                            }`}
                        title={sidebarCollapsed ? 'Found Items' : ''}
                    >
                        <List className="h-5 w-5 flex-shrink-0" />
                        {!sidebarCollapsed && 'Found Items'}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('report-item');
                            setMobileMenuOpen(false);
                            setSidebarCollapsed(true);
                            setSidebarAutoExpanded(false);
                        }}
                        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg text-left transition-colors ${activeTab === 'report-item'
                            ? 'bg-blue-800 text-white'
                            : 'hover:bg-blue-700 text-blue-100'
                            }`}
                        title={sidebarCollapsed ? 'Report Item' : ''}
                    >
                        <Plus className="h-5 w-5 flex-shrink-0" />
                        {!sidebarCollapsed && 'Report Item'}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('messaging');
                            setMobileMenuOpen(false);
                            setSidebarCollapsed(true);
                            setSidebarAutoExpanded(false);
                        }}
                        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg text-left transition-colors ${activeTab === 'messaging'
                            ? 'bg-blue-800 text-white'
                            : 'hover:bg-blue-700 text-blue-100'
                            }`}
                        title={sidebarCollapsed ? 'Messaging' : ''}
                    >
                        <MessageCircle className="h-5 w-5 flex-shrink-0" />
                        {!sidebarCollapsed && 'Messaging'}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('claims');
                            setMobileMenuOpen(false);
                            setSidebarCollapsed(true);
                            setSidebarAutoExpanded(false);
                        }}
                        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg text-left transition-colors ${activeTab === 'claims'
                            ? 'bg-blue-800 text-white'
                            : 'hover:bg-blue-700 text-blue-100'
                            }`}
                        title={sidebarCollapsed ? 'Claims' : ''}
                    >
                        <Eye className="h-5 w-5 flex-shrink-0" />
                        {!sidebarCollapsed && 'Claims'}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('my-activity');
                            setMobileMenuOpen(false);
                            setSidebarCollapsed(true);
                            setSidebarAutoExpanded(false);
                        }}
                        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg text-left transition-colors ${activeTab === 'my-activity'
                            ? 'bg-blue-800 text-white'
                            : 'hover:bg-blue-700 text-blue-100'
                            }`}
                        title={sidebarCollapsed ? 'My Activity' : ''}
                    >
                        <FileText className="h-5 w-5 flex-shrink-0" />
                        {!sidebarCollapsed && 'My Activity'}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('settings');
                            setMobileMenuOpen(false);
                            setSidebarCollapsed(true);
                            setSidebarAutoExpanded(false);
                        }}
                        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg text-left transition-colors ${activeTab === 'settings'
                            ? 'bg-blue-800 text-white'
                            : 'hover:bg-blue-700 text-blue-100'
                            }`}
                        title={sidebarCollapsed ? 'Settings' : ''}
                    >
                        <Settings className="h-5 w-5 flex-shrink-0" />
                        {!sidebarCollapsed && 'Settings'}
                    </button>
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-blue-500">
                    <button
                        onClick={() => {
                            // Show confirmation dialog
                            if (window.confirm('Are you sure you want to logout?')) {
                                // Clear any stored user data
                                localStorage.removeItem('user');
                                sessionStorage.removeItem('user');
                                // Navigate to homepage
                                navigate('/');
                            }
                        }}
                        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg text-left hover:bg-blue-700 text-blue-100 transition-colors`}
                        title={sidebarCollapsed ? 'Logout' : ''}
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        {!sidebarCollapsed && 'Logout'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-6 bg-white/20 animate-slide-in-right h-screen overflow-y-auto transition-all duration-300`}>
                {/* Mobile Menu Button */}
                <div className="lg:hidden mb-4">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setMobileMenuOpen(false)}>
                        <div className="bg-blue-600 text-white w-64 h-full p-4" onClick={(e) => e.stopPropagation()}>
                            {/* Mobile Navigation */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        setActiveTab('dashboard');
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'dashboard' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                        }`}
                                >
                                    <Home className="h-5 w-5" />
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('lost-items');
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'lost-items' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                        }`}
                                >
                                    <Package className="h-5 w-5" />
                                    Lost Items
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('found-items');
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'found-items' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                        }`}
                                >
                                    <List className="h-5 w-5" />
                                    Found Items
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('report-item');
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'report-item' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                        }`}
                                >
                                    <Plus className="h-5 w-5" />
                                    Report Item
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('messaging');
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'messaging' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                        }`}
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    Messaging
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('claims');
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'claims' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                        }`}
                                >
                                    <Eye className="h-5 w-5" />
                                    Claims
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('my-activity');
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'my-activity' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                        }`}
                                >
                                    <FileText className="h-5 w-5" />
                                    My Activity
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('settings');
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'settings' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                        }`}
                                >
                                    <Settings className="h-5 w-5" />
                                    Settings
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-center mb-6 animate-fade-in-up">
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-bold text-blue-900">
                            {activeTab === 'lost-items' && 'View Lost Items'}
                            {activeTab === 'found-items' && 'View Found Items'}
                            {activeTab === 'dashboard' && 'Student Dashboard'}
                            {activeTab === 'report-item' && 'Report Item'}
                            {activeTab === 'messaging' && 'Messaging'}
                            {activeTab === 'claims' && 'Claims'}
                            {activeTab === 'my-activity' && 'My Activity'}
                            {activeTab === 'settings' && 'Settings'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={refreshDashboard}
                            className="p-2 text-blue-900 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Refresh Dashboard"
                        >
                            <RefreshCw className={`w-6 h-6 ${itemsLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <Bell className="w-6 h-6 text-blue-900 animate-pulse" />
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 animate-fade-in-up animation-delay-200">
                    {/* Lost Items Table */}
                    {activeTab === 'lost-items' && (
                        <ItemsTable
                            items={allLostItems}
                            type="lost"
                            title="All Lost Items"
                            emptyMessage="No lost items reported yet"
                            onView={handleView}
                        />
                    )}

                    {/* Found Items Table */}
                    {activeTab === 'found-items' && (
                        <ItemsTable
                            items={foundItems}
                            type="found"
                            title="My Found Items"
                            emptyMessage="You haven't reported any found items yet"
                            onView={handleView}
                        />
                    )}

                    {/* Dashboard */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            {userLoading || itemsLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <>
                                    <DashboardStats userStats={userStats} loading={userLoading} />
                                    <RecentItems commonItems={commonItems} />
                                </>
                            )}
                        </div>
                    )}

                    {/* Report Item */}
                    {activeTab === 'report-item' && <ReportItem onItemReported={refreshDashboard} />}

                    {/* Messaging */}
                    {activeTab === 'messaging' && <UserMessaging />}

                    {/* Other sections */}
                    {activeTab === 'claims' && (
                        <ClaimsTab userId={currentUser?.id} onViewItem={handleView} />
                    )}

                    {activeTab === 'my-activity' && (
                        <div className="space-y-6">
                            <ItemsTable
                                items={[...lostItems, ...foundItems].sort((a, b) => new Date(b.dateFound) - new Date(a.dateFound))}
                                type="activity"
                                title="My Activity History"
                                description="Complete history of your reported and claimed items"
                                emptyMessage="You haven't reported or claimed any items yet"
                                onView={handleView}
                            />
                        </div>
                    )}

                    {activeTab === 'settings' && <SettingsTab currentUser={currentUser} onUpdateUser={updateUserProfile} />}
                </div>
            </div>

            {/* Item Details Modal */}
            <ItemModal
                selectedItem={selectedItem}
                showModal={showModal}
                closeModal={closeModal}
            />
        </div>
    );
}

export default UserDashboard;
