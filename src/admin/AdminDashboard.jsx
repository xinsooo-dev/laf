// src/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Users, Package, MessageCircle, BarChart3, Download, Trash2, Check, X, FileText, ChevronLeft, ChevronRight, Menu, Plus, Archive, ChevronDown, Megaphone, MapPin, Calendar, Eye } from 'lucide-react';
import { API_ENDPOINTS, getAssetUrl } from '../utils/api';
import ManageItems from './ManageItems';
import ManageUsers from './ManageUsers';
import ManageLostItems from './ManageLostItems';
import ManageFoundItems from './ManageFoundItems';
import ManageLostFoundItems from './ManageLostFoundItems';
import SystemReports from './SystemReports';
import AdminMessaging from './AdminMessaging';
import ManageCategories from './ManageCategories';
import ArchivedItems from './ArchivedItems';

function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [settingsData, setSettingsData] = useState({
        systemName: 'Norzagaray College Lost & Found',
        contactEmail: 'lostandfound@norzagaraycollege.edu',
        autoApprove: false
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
            case 'users':
                return 'User Management';
            case 'categories-management':
                return 'Category Management';
            case 'archived-items':
                return 'Archived Items';
            case 'messaging':
                return 'Messaging';
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

    // Post Item states
    const [newItem, setNewItem] = useState({
        item_name: '',
        category: '',
        location: '',
        customLocation: '',
        description: '',
        image: null,
        date_lost: '',
        time_lost: '',
        status: 'lost',
        reporter_name: ''
    });
    const [isPostingItem, setIsPostingItem] = useState(false);
    const [itemImagePreview, setItemImagePreview] = useState(null);

    // Announcement states
    const [announcements, setAnnouncements] = useState([]);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        is_active: 1
    });
    const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
    const [isDeletingAnnouncementId, setIsDeletingAnnouncementId] = useState(null);

    // Archive states
    const [archivedItems, setArchivedItems] = useState([]);
    const [loadingArchive, setLoadingArchive] = useState(false);
    const [autoArchiveStats, setAutoArchiveStats] = useState({ ready_to_archive: 0, expiring_soon: 0 });
    const [isRunningAutoArchive, setIsRunningAutoArchive] = useState(false);

    // Categories state
    const [categories, setCategories] = useState([]);

    // Claim Instructions states
    const [claimInstructions, setClaimInstructions] = useState([]);
    const [contactInfo, setContactInfo] = useState({
        office_location: '',
        contact_number: '',
        email: '',
        office_hours: ''
    });
    const [editingInstruction, setEditingInstruction] = useState(null);
    const [isEditingContact, setIsEditingContact] = useState(false);
    const [isAddingInstruction, setIsAddingInstruction] = useState(false);
    const [newInstruction, setNewInstruction] = useState({ title: '', description: '' });
    const [isDeletingId, setIsDeletingId] = useState(null);
    const [isSavingInstruction, setIsSavingInstruction] = useState(false);

    const hardcodedCategories = [
        'Electronics',
        'Clothing & Accessories',
        'Books & Documents',
        'Keys & Cards',
        'Bags & Wallets',
        'Jewelry',
        'Sports Equipment',
        'Musical Instruments',
        'Other'
    ];

    // Check if user is logged in and authorized as admin
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login', { replace: true });
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
        fetchCategories();

        // Add debug log to check stats state
        setTimeout(() => {
            console.log('Current stats state:', stats);
        }, 2000);

        // Set up interval to refresh counts every 30 seconds
        const statsInterval = setInterval(() => {
            fetchArchivedCount();
            fetchActiveItemCounts();
        }, 30000);

        return () => {
            clearInterval(statsInterval);
        };
    }, [navigate]);

    // Fetch announcements when announcements tab is selected
    useEffect(() => {
        if (activeTab === 'announcements') {
            fetchAnnouncements();
        }
        if (activeTab === 'archive-management') {
            fetchArchivedItems();
        }
        if (activeTab === 'claim-instructions') {
            fetchClaimInstructions();
            fetchContactInfo();
        }
        if (activeTab === 'settings') {
            fetchAutoArchiveStats();
        }
        
        // Reset activity filter when leaving dashboard
        if (activeTab !== 'dashboard') {
            setActivityFilter('all');
        }
    }, [activeTab]);

    const fetchCategories = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.CATEGORIES.ALL);
            const data = await response.json();
            if (data.success && data.categories) {
                setCategories(data.categories);
            } else {
                // Fallback to hardcoded categories if API fails
                setCategories(hardcodedCategories.map((name, index) => ({ id: index + 1, name })));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Fallback to hardcoded categories
            setCategories(hardcodedCategories.map((name, index) => ({ id: index + 1, name })));
        }
    };

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.STATS);
            const data = await response.json();
            console.log('Stats API response:', data); // Debug log

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
            console.log('Common items API response:', data); // Debug log
            console.log('Common items data type:', typeof data, 'Array?', Array.isArray(data));

            if (data.success && data.items) {
                console.log('Setting most_common_lost with:', data.items);
                setStats(prev => ({
                    ...prev,
                    most_common_lost: data.items
                }));
            } else if (Array.isArray(data)) {
                // Handle old format response
                console.log('Setting most_common_lost with old format:', data);
                setStats(prev => ({
                    ...prev,
                    most_common_lost: data
                }));
            } else {
                console.error('Failed to fetch common items:', data.message || 'No data received');
                console.log('Full response object:', data);
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
            console.log('Archived items API response:', data); // Debug log

            if (data.success && data.items) {
                console.log('Setting archived count with:', data.items.length);
                setStats(prev => ({
                    ...prev,
                    archived: data.items.length
                }));
            } else if (Array.isArray(data)) {
                // Handle old format response
                console.log('Setting archived count with old format:', data.length);
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
            console.log('All items API response for active count:', data); // Debug log

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

                console.log('Active item counts:', {
                    activeLostCount,
                    activeFoundCount,
                    totalActiveItems: activeItems.length,
                    totalAllItems: data.items.length
                });

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

    const handleApprove = async (id) => {
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.APPROVE, { method: 'POST', params: { id } });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    alert(`Item ${id} approved successfully!`);
                    // Refresh recent activity and stats
                    fetchDashboardStats();
                    fetchRecentActivity();
                } else {
                    alert(`Failed to approve item: ${data.message}`);
                }
            } else {
                alert('Failed to approve item. Please try again.');
            }
        } catch (error) {
            console.error('Error approving item:', error);
            alert('Error approving item. Please try again.');
        }
    };

    const handleReject = async (id) => {
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.REJECT, { method: 'POST', params: { id } });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    alert(`Item ${id} rejected successfully!`);
                    // Refresh recent activity and stats
                    fetchDashboardStats();
                    fetchRecentActivity();
                } else {
                    alert(`Failed to reject item: ${data.message}`);
                }
            } else {
                alert('Failed to reject item. Please try again.');
            }
        } catch (error) {
            console.error('Error rejecting item:', error);
            alert('Error rejecting item. Please try again.');
        }
    };

    // Settings functionality
    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        try {
            // Simulate API call for settings save
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleBackup = async () => {
        try {
            alert('System backup initiated. You will be notified when complete.');
            // In a real implementation, this would trigger a backend backup process
        } catch (error) {
            console.error('Error creating backup:', error);
            alert('Failed to create backup. Please try again.');
        }
    };

    const handleClearRecords = async () => {
        if (window.confirm('Are you sure you want to clear old records? This action cannot be undone.')) {
            try {
                alert('Old records cleanup initiated.');
                // In a real implementation, this would call a backend cleanup endpoint
            } catch (error) {
                console.error('Error clearing records:', error);
                alert('Failed to clear records. Please try again.');
            }
        }
    };

    // Auto-archive functionality
    const fetchAutoArchiveStats = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ADMIN.AUTO_ARCHIVE.STATS);
            const data = await response.json();
            if (data.success) {
                setAutoArchiveStats({
                    ready_to_archive: data.ready_to_archive || 0,
                    expiring_soon: data.expiring_soon || 0
                });
            }
        } catch (error) {
            console.error('Error fetching auto-archive stats:', error);
        }
    };

    const handleRunAutoArchive = async () => {
        if (!window.confirm('This will automatically archive all items older than 2 weeks that are not claimed. Continue?')) {
            return;
        }

        setIsRunningAutoArchive(true);
        try {
            const response = await fetch(API_ENDPOINTS.ADMIN.AUTO_ARCHIVE.RUN);
            const data = await response.json();

            if (data.success) {
                alert(`Auto-archive completed!\n\n${data.archived_count} items were archived.`);
                fetchAutoArchiveStats(); // Refresh stats
                fetchStats(); // Refresh dashboard stats
            } else {
                alert(`Failed to run auto-archive: ${data.message}`);
            }
        } catch (error) {
            console.error('Error running auto-archive:', error);
            alert('Network error occurred while running auto-archive');
        } finally {
            setIsRunningAutoArchive(false);
        }
    };

    // Announcement handlers
    const fetchAnnouncements = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.ALL);
            const data = await response.json();
            if (data.success) {
                setAnnouncements(data.announcements || []);
            } else {
                console.error('Failed to fetch announcements:', data.message);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        setIsCreatingAnnouncement(true);

        try {
            const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.CREATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newAnnouncement)
            });

            const data = await response.json();
            if (data.success) {
                alert('Announcement created successfully!');
                setNewAnnouncement({ title: '', content: '', is_active: 1 });
                fetchAnnouncements(); // Refresh the list
            } else {
                alert('Failed to create announcement: ' + data.message);
            }
        } catch (error) {
            console.error('Error creating announcement:', error);
            alert('Error creating announcement. Please try again.');
        } finally {
            setIsCreatingAnnouncement(false);
        }
    };

    const handleEditAnnouncement = (announcement) => {
        setEditingAnnouncement({
            id: announcement.id,
            title: announcement.title,
            content: announcement.content,
            is_active: announcement.is_active
        });
    };

    const handleCancelEdit = () => {
        setEditingAnnouncement(null);
    };

    const handleUpdateAnnouncement = async (e) => {
        e.preventDefault();
        setIsSavingAnnouncement(true);

        try {
            const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.UPDATE(editingAnnouncement.id), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingAnnouncement)
            });

            const data = await response.json();
            if (data.success) {
                alert('Announcement saved successfully!');
                setEditingAnnouncement(null);
                fetchAnnouncements(); // Refresh the list
            } else {
                alert('Failed to save announcement: ' + data.message);
            }
        } catch (error) {
            console.error('Error saving announcement:', error);
            alert('Error saving announcement. Please try again.');
        } finally {
            setIsSavingAnnouncement(false);
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (window.confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
            setIsDeletingAnnouncementId(id);
            try {
                const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.DELETE(id), {
                    method: 'DELETE'
                });

                const data = await response.json();
                if (data.success) {
                    alert('Announcement deleted successfully!');
                    fetchAnnouncements(); // Refresh the list
                } else {
                    alert('Failed to delete announcement: ' + data.message);
                }
            } catch (error) {
                console.error('Error deleting announcement:', error);
                alert('Error deleting announcement. Please try again.');
            } finally {
                setIsDeletingAnnouncementId(null);
            }
        }
    };

    // Claim Instructions handlers
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

    const handleUpdateInstruction = async (instruction) => {
        setIsSavingInstruction(true);
        try {
            const response = await fetch(API_ENDPOINTS.CLAIM_INSTRUCTIONS.UPDATE, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(instruction)
            });
            const data = await response.json();
            if (data.success) {
                alert('Step updated successfully!');
                setEditingInstruction(null);
                fetchClaimInstructions();
            } else {
                alert('Failed to update step: ' + data.message);
            }
        } catch (error) {
            console.error('Error updating instruction:', error);
            alert('Error updating step. Please try again.');
        } finally {
            setIsSavingInstruction(false);
        }
    };

    const handleUpdateContactInfo = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.CLAIM_INSTRUCTIONS.UPDATE_CONTACT, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactInfo)
            });
            const data = await response.json();
            if (data.success) {
                alert('Contact information updated successfully!');
                setIsEditingContact(false);
                fetchContactInfo();
            } else {
                alert('Failed to update contact info: ' + data.message);
            }
        } catch (error) {
            console.error('Error updating contact info:', error);
            alert('Error updating contact info. Please try again.');
        }
    };

    const handleAddInstruction = async () => {
        if (!newInstruction.title || !newInstruction.description) {
            alert('Please fill in both title and description');
            return;
        }

        setIsSavingInstruction(true);
        try {
            const response = await fetch(API_ENDPOINTS.CLAIM_INSTRUCTIONS.CREATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newInstruction,
                    step_number: claimInstructions.length + 1
                })
            });
            const data = await response.json();
            if (data.success) {
                alert(`Step ${claimInstructions.length + 1} added successfully!`);
                setIsAddingInstruction(false);
                setNewInstruction({ title: '', description: '' });
                fetchClaimInstructions();
            } else {
                alert('Failed to add step: ' + data.message);
            }
        } catch (error) {
            console.error('Error adding instruction:', error);
            alert('Error adding step. Please try again.');
        } finally {
            setIsSavingInstruction(false);
        }
    };

    const handleDeleteInstruction = async (id) => {
        if (window.confirm('Are you sure you want to delete this step? All steps will be automatically renumbered.')) {
            setIsDeletingId(id);
            try {
                const response = await fetch(API_ENDPOINTS.CLAIM_INSTRUCTIONS.DELETE(id), {
                    method: 'DELETE'
                });
                const data = await response.json();
                if (data.success) {
                    alert('Step deleted and renumbered successfully!');
                    fetchClaimInstructions();
                } else {
                    alert('Failed to delete step: ' + data.message);
                }
            } catch (error) {
                console.error('Error deleting instruction:', error);
                alert('Error deleting step. Please try again.');
            } finally {
                setIsDeletingId(null);
            }
        }
    };

    const fetchArchivedItems = async () => {
        setLoadingArchive(true);
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.LATEST);
            const data = await response.json();

            if (data.success) {
                const allItems = [...(data.lost_items || []), ...(data.found_items || [])];

                // Filter items older than 2 weeks and not claimed
                const twoWeeksAgo = new Date();
                twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

                const archived = allItems.filter(item => {
                    const itemDate = new Date(item.created_at || item.date_reported);
                    return itemDate < twoWeeksAgo && item.status !== 'claimed';
                });

                setArchivedItems(archived);
            } else {
                console.error('Failed to fetch archived items:', data.message);
                setArchivedItems([]);
            }
        } catch (error) {
            console.error('Error fetching archived items:', error);
            setArchivedItems([]);
        } finally {
            setLoadingArchive(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewItem({ ...newItem, image: file });
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setItemImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePostItem = async (e) => {
        e.preventDefault();

        // Validation for text fields - check for invalid characters and typos
        const validateTextField = (value, fieldName) => {
            // Check for excessive special characters or numbers (potential typos)
            const specialCharCount = (value.match(/[^a-zA-Z0-9\s.,'-]/g) || []).length;
            const numberCount = (value.match(/\d/g) || []).length;

            if (specialCharCount > 3) {
                alert(`${fieldName} contains too many special characters. Please check for typos.`);
                return false;
            }

            // Check for repeated characters (potential typos like "aaaa" or "!!!!")
            if (/(.)\1{3,}/.test(value)) {
                alert(`${fieldName} contains repeated characters. Please check for typos.`);
                return false;
            }

            // Check for gibberish/random text (like "asdfsdfg")
            const words = value.toLowerCase().split(/\s+/);
            for (let word of words) {
                // Remove punctuation for checking
                const cleanWord = word.replace(/[.,!?;:'"()-]/g, '');

                // Skip very short words and numbers
                if (cleanWord.length < 4 || /^\d+$/.test(cleanWord)) continue;

                // Check for lack of vowels (common in gibberish)
                const vowelCount = (cleanWord.match(/[aeiou]/g) || []).length;
                const consonantCount = cleanWord.length - vowelCount;

                // If word has no vowels and is longer than 3 chars, likely gibberish
                if (vowelCount === 0 && cleanWord.length > 3) {
                    alert(`${fieldName} contains invalid text: "${word}". Please check for typos or random characters.`);
                    return false;
                }

                // Check for excessive consonants in a row (like "sdfg")
                if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(cleanWord)) {
                    alert(`${fieldName} contains invalid text: "${word}". Please check for typos or random characters.`);
                    return false;
                }

                // Check for keyboard patterns (like "asdf", "qwer", "zxcv")
                const keyboardPatterns = [
                    'qwert', 'asdf', 'zxcv', 'qaz', 'wsx', 'edc',
                    'yuiop', 'hjkl', 'bnm', 'rfv', 'tgb', 'yhn'
                ];

                for (let pattern of keyboardPatterns) {
                    if (cleanWord.includes(pattern)) {
                        alert(`${fieldName} contains keyboard pattern: "${word}". Please enter meaningful text.`);
                        return false;
                    }
                }
            }

            return true;
        };

        // Validate Reporter Name - must be full name (first and last name)
        const validateFullName = (name) => {
            const trimmedName = name.trim();
            const nameParts = trimmedName.split(/\s+/);

            if (nameParts.length < 2) {
                alert('Please enter a full name (First Name and Last Name) for the reporter.');
                return false;
            }

            // Check if each part has at least 2 characters
            for (let part of nameParts) {
                if (part.length < 2) {
                    alert('Each part of the name must be at least 2 characters long.');
                    return false;
                }
            }

            // Check for valid name characters (letters, spaces, hyphens, apostrophes)
            if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
                alert('Reporter name should only contain letters, spaces, hyphens, and apostrophes.');
                return false;
            }

            return true;
        };

        // Perform validations
        if (!validateFullName(newItem.reporter_name)) {
            setIsPostingItem(false);
            return;
        }

        if (!validateTextField(newItem.item_name, 'Item Name')) {
            setIsPostingItem(false);
            return;
        }

        if (!validateTextField(newItem.location, 'Location')) {
            setIsPostingItem(false);
            return;
        }

        // Validate custom location if "Others" is selected
        if (newItem.location === 'Others' && !validateTextField(newItem.customLocation, 'Custom Location')) {
            setIsPostingItem(false);
            return;
        }

        if (!validateTextField(newItem.description, 'Description')) {
            setIsPostingItem(false);
            return;
        }

        setIsPostingItem(true);

        try {
            let imagePath = null;

            // Upload image first if exists
            console.log('newItem.image:', newItem.image);
            if (newItem.image) {
                console.log('Uploading image...');
                const imageFormData = new FormData();
                imageFormData.append('image', newItem.image);

                const uploadResponse = await fetch(API_ENDPOINTS.UPLOAD.IMAGE, {
                    method: 'POST',
                    body: imageFormData
                });

                console.log('Upload response status:', uploadResponse.status);
                const uploadData = await uploadResponse.json();
                console.log('Upload response data:', uploadData);
                console.log('uploadData.image_path:', uploadData.image_path);
                console.log('uploadData.path:', uploadData.path);
                console.log('uploadData.file_path:', uploadData.file_path);
                console.log('All keys in uploadData:', Object.keys(uploadData));
                console.log('Full uploadData object:', JSON.stringify(uploadData, null, 2));

                if (uploadData.success) {
                    // The upload API returns 'filename' not 'image_path'
                    // We need to prepend 'uploads/' to match the database format
                    imagePath = uploadData.filename ? `uploads/${uploadData.filename}` : null;
                    console.log('Image uploaded successfully:', imagePath);
                } else {
                    console.error('Upload failed:', uploadData.message);
                    throw new Error('Failed to upload image: ' + uploadData.message);
                }
            } else {
                console.log('No image selected');
            }

            // Create item with JSON data
            const itemData = {
                user_id: user?.id || 1,
                item_name: newItem.item_name,
                description: newItem.description,
                location: newItem.location === 'Others' ? newItem.customLocation : newItem.location,
                category: newItem.category,
                date_reported: `${newItem.date_lost} ${newItem.time_lost}:00`, // Format: YYYY-MM-DD HH:MM:SS
                type: newItem.status,
                contact_info: newItem.reporter_name,
                image_path: imagePath,
                reporter_name: newItem.reporter_name,
                status: newItem.status // Automatically set status to lost or found
            };

            console.log('Posting item with data:', itemData);
            console.log('Image path:', imagePath);

            const response = await fetch(API_ENDPOINTS.ITEMS.CREATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(itemData)
            });

            const data = await response.json();
            if (data.success) {
                alert('Item posted successfully!');
                // Reset form
                setNewItem({
                    item_name: '',
                    category: '',
                    location: '',
                    customLocation: '',
                    description: '',
                    image: null,
                    date_lost: '',
                    time_lost: '',
                    status: 'lost',
                    reporter_name: ''
                });
                setItemImagePreview(null);

                // Refresh dashboard stats
                fetchDashboardStats();
                fetchRecentActivity();
            } else {
                alert('Failed to post item: ' + data.message);
            }
        } catch (error) {
            console.error('Error posting item:', error);
            alert('Error posting item. Please try again.');
        } finally {
            setIsPostingItem(false);
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
                    className={`bg-blue-600 text-white hidden md:flex flex-col transition-all duration-300 fixed h-full z-10 ${sidebarCollapsed ? 'w-16' : 'w-64'
                        }`}
                    onClick={(e) => e.stopPropagation()}
                >
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
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center transform transition-all duration-300 hover:scale-110">
                                <span className="text-blue-600 font-bold">
                                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
                                </span>
                            </div>
                            {!sidebarCollapsed && (
                                <div>
                                    <h3 className="font-semibold">{user?.fullName || 'Administrator'}</h3>
                                    <p className="text-blue-200 text-sm">Admin</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className={`flex-1 p-4 space-y-2 transition-all duration-300 overflow-y-auto ${sidebarCollapsed ? 'px-2' : ''
                        }`}>
                        {/* Dashboard */}
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
                            <BarChart3 className="h-5 w-5 flex-shrink-0" />
                            {!sidebarCollapsed && 'Dashboard'}
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
                                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-lg text-left transition-colors ${['manage-items', 'claim-management', 'archived-items', 'archive-management', 'post-item'].includes(activeTab)
                                    ? 'bg-blue-800 text-white'
                                    : 'hover:bg-blue-700 text-blue-100'
                                    }`}
                                title={sidebarCollapsed ? 'Item Management - Click to expand' : ''}
                            >
                                <div className="flex items-center gap-3">
                                    <Package className="h-5 w-5 flex-shrink-0" />
                                    {!sidebarCollapsed && 'Item Management'}
                                </div>
                                {!sidebarCollapsed && (
                                    <ChevronDown className={`h-4 w-4 transition-transform ${itemManagementOpen ? 'rotate-180' : ''}`} />
                                )}
                            </button>

                            {/* Submenu */}
                            {!sidebarCollapsed && itemManagementOpen && (
                                <div
                                    className="item-management-dropdown ml-4 mt-1 space-y-1 border-l-2 border-gray-300 pl-2 bg-white rounded-lg p-2 max-h-80 overflow-y-auto"
                                    style={{
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: '#cbd5e1 #f1f5f9'
                                    }}
                                >
                                    <button
                                        onClick={() => {
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
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg text-left transition-colors ${activeTab === 'categories-management'
                                ? 'bg-blue-800 text-white'
                                : 'hover:bg-blue-700 text-blue-100'
                                }`}
                            title={sidebarCollapsed ? 'Categories Management' : ''}
                        >
                            <Package className="h-5 w-5 flex-shrink-0" />
                            {!sidebarCollapsed && 'Categories Management'}
                        </button>

                        {/* Messaging */}
                        <button
                            onClick={() => {
                                setActiveTab('messaging');
                                setMobileMenuOpen(false);
                                setSidebarCollapsed(true);
                                setSidebarAutoExpanded(false);
                            }}
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg text-left transition-colors relative ${activeTab === 'messaging'
                                ? 'bg-blue-800 text-white'
                                : 'hover:bg-blue-700 text-blue-100'
                                }`}
                            title={sidebarCollapsed ? 'Messaging' : ''}
                        >
                            <MessageCircle className="h-5 w-5 flex-shrink-0" />
                            {!sidebarCollapsed && 'Messaging'}
                            {!sidebarCollapsed && (
                                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    3
                                </span>
                            )}
                        </button>

                        {/* Reports */}
                        <button
                            onClick={() => {
                                setActiveTab('reports');
                                setMobileMenuOpen(false);
                                setSidebarCollapsed(true);
                                setSidebarAutoExpanded(false);
                            }}
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg text-left transition-colors ${activeTab === 'reports'
                                ? 'bg-blue-800 text-white'
                                : 'hover:bg-blue-700 text-blue-100'
                                }`}
                            title={sidebarCollapsed ? 'Reports' : ''}
                        >
                            <FileText className="h-5 w-5 flex-shrink-0" />
                            {!sidebarCollapsed && 'Reports'}
                        </button>
                        {/* Claim Instructions */}
                        <button
                            onClick={() => {
                                setActiveTab('claim-instructions');
                                setMobileMenuOpen(false);
                                setSidebarCollapsed(true);
                                setSidebarAutoExpanded(false);
                            }}
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg text-left transition-colors ${activeTab === 'claim-instructions'
                                ? 'bg-blue-800 text-white'
                                : 'hover:bg-blue-700 text-blue-100'
                                }`}
                            title={sidebarCollapsed ? 'Claim Instructions' : ''}
                        >
                            <FileText className="h-5 w-5 flex-shrink-0" />
                            {!sidebarCollapsed && 'Claim Instructions'}
                        </button>

                        {/* Announcements */}
                        <button
                            onClick={() => {
                                setActiveTab('announcements');
                                setMobileMenuOpen(false);
                                setSidebarCollapsed(true);
                                setSidebarAutoExpanded(false);
                            }}
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg text-left transition-colors ${activeTab === 'announcements'
                                ? 'bg-blue-800 text-white'
                                : 'hover:bg-blue-700 text-blue-100'
                                }`}
                            title={sidebarCollapsed ? 'Announcements' : ''}
                        >
                            <Megaphone className="h-5 w-5 flex-shrink-0" />
                            {!sidebarCollapsed && 'Announcements'}
                        </button>

                        {/* Settings */}
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
                <div
                    className={`flex-1 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} ml-0 bg-gray-50 animate-slide-in-right h-screen flex flex-col transition-all duration-300 relative`}
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
                                                <Package className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">Categories</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setActiveTab('user-management');
                                                    setMobileMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-colors ${activeTab === 'user-management' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                                    }`}
                                            >
                                                <Users className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">User Management</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setActiveTab('messaging');
                                                    setMobileMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-colors ${activeTab === 'messaging' ? 'bg-blue-800' : 'hover:bg-blue-700'
                                                    }`}
                                            >
                                                <MessageCircle className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">Messaging</span>
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
                                                <FileText className="h-4 w-4 flex-shrink-0" />
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
                                                    navigate('/login');
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
                                <div className="w-full max-w-full">
                                    {/* Header */}
                                    <div className="hidden md:flex justify-between items-center mb-6 animate-fade-in-up">
                                        <h2 className="text-2xl md:text-3xl font-bold text-blue-900">Dashboard Overview</h2>
                                    </div>

                                    {/* Stats Cards - Compact for Mobile */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-8 animate-fade-in-up animation-delay-200 px-4">
                                        {/* Total Lost Items Card */}
                                        <div
                                            onClick={() => {
                                                // Toggle between 'lost' and 'all'
                                                setActivityFilter(activityFilter === 'lost' ? 'all' : 'lost');
                                            }}
                                            className={`bg-white/90 p-3 md:p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${activityFilter === 'lost' ? 'ring-2 ring-red-500 bg-red-50/90' : ''
                                                }`}
                                        >
                                            <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">Total Lost Items</h3>
                                            <p className="text-2xl md:text-4xl font-bold text-red-600 transition-all duration-500">
                                                {loading ? '...' : stats.total_lost}
                                            </p>
                                        </div>

                                        {/* Total Found Items Card */}
                                        <div
                                            onClick={() => {
                                                // Toggle between 'found' and 'all'
                                                setActivityFilter(activityFilter === 'found' ? 'all' : 'found');
                                            }}
                                            className={`bg-white/90 p-3 md:p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${activityFilter === 'found' ? 'ring-2 ring-green-500 bg-green-50/90' : ''
                                                }`}
                                        >
                                            <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">Total Found Items</h3>
                                            <p className="text-2xl md:text-4xl font-bold text-green-600 transition-all duration-500">
                                                {loading ? '...' : stats.total_found}
                                            </p>
                                        </div>

                                        {/* Archived Items Card */}
                                        <div
                                            onClick={() => setActiveTab('archived-items')}
                                            className="bg-white/90 p-3 md:p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                                        >
                                            <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">Archived Items</h3>
                                            <p className="text-2xl md:text-4xl font-bold text-gray-600 transition-all duration-500">
                                                {loading ? '...' : stats.archived}
                                            </p>
                                        </div>

                                        {/* Claimed Items Card */}
                                        <div
                                            onClick={() => {
                                                setActiveTab('claim-management');
                                                // Add a small delay to ensure the component is rendered before triggering the modal
                                                setTimeout(() => {
                                                    // Trigger the claimed items modal in ManageItems component
                                                    const claimedHistoryBtn = document.querySelector('[data-claimed-history-btn]');
                                                    if (claimedHistoryBtn) {
                                                        claimedHistoryBtn.click();
                                                    }
                                                }, 100);
                                            }}
                                            className="bg-white/90 p-3 md:p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                                        >
                                            <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">Claimed Items</h3>
                                            <p className="text-2xl md:text-4xl font-bold text-purple-600 transition-all duration-500">
                                                {loading ? '...' : stats.claimed}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Recent Activity */}
                                        <div className="lg:col-span-2">
                                            <div className="bg-white/90 rounded-lg shadow-lg">
                                                <div className="p-6 border-b border-gray-200">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-xl font-bold text-blue-900">
                                                            Recent Activity
                                                            {activityFilter !== 'all' && (
                                                                <span className={`ml-2 text-sm px-2 py-1 rounded-full ${activityFilter === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                                    }`}>
                                                                    {activityFilter === 'lost' ? 'Lost Items' : 'Found Items'}
                                                                </span>
                                                            )}
                                                        </h3>
                                                        {activityFilter !== 'all' && (
                                                            <button
                                                                onClick={() => setActivityFilter('all')}
                                                                className="text-sm text-gray-600 hover:text-gray-800 underline"
                                                            >
                                                                Show All
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="p-6">
                                                    {(() => {
                                                        // Filter recent activity based on selected filter and exclude claimed/archived items
                                                        const activeRecentActivity = (stats.recent_activity || []).filter(activity => {
                                                            const status = activity.status?.toLowerCase();
                                                            return status !== 'claimed' && status !== 'archived';
                                                        });

                                                        const filteredActivity = activityFilter === 'all'
                                                            ? activeRecentActivity
                                                            : activeRecentActivity.filter(activity => activity.type === activityFilter);

                                                        if (loading) {
                                                            return (
                                                                <div className="flex items-center justify-center py-8">
                                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                                    <span className="ml-2 text-gray-600">Loading recent activity...</span>
                                                                </div>
                                                            );
                                                        }

                                                        if (filteredActivity.length === 0) {
                                                            return (
                                                                <div className="text-center py-8">
                                                                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                                                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                                                                        {activityFilter === 'all' ? 'No Recent Activity' : `No Recent ${activityFilter.charAt(0).toUpperCase() + activityFilter.slice(1)} Items`}
                                                                    </h3>
                                                                    <p className="text-gray-600">
                                                                        {activityFilter === 'all' ? 'No items have been reported recently.' : `No ${activityFilter} items have been reported recently.`}
                                                                    </p>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                                                {filteredActivity.slice(0, 6).map((activity) => (
                                                                    <div key={activity.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
                                                                        {/* Item Image */}
                                                                        <div className="h-32 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                                                            {activity.image_path ? (
                                                                                <img
                                                                                    src={getAssetUrl(activity.image_path)}
                                                                                    alt={activity.item_name}
                                                                                    className="w-full h-full object-contain"
                                                                                    onError={(e) => {
                                                                                        e.target.style.display = 'none';
                                                                                        e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                                                                                        e.target.parentElement.innerHTML = '<div class="text-center text-gray-400"><div class="text-3xl mb-2">📦</div><p class="text-xs">No Image</p></div>';
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <div className="text-center text-gray-400">
                                                                                    <div className="text-3xl mb-2">📦</div>
                                                                                    <p className="text-xs">No Image</p>
                                                                                </div>
                                                                            )}
                                                                            {/* Type Badge */}
                                                                            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${activity.type === 'lost' ? 'bg-red-100 text-red-800' :
                                                                                activity.type === 'found' ? 'bg-green-100 text-green-800' :
                                                                                    'bg-blue-100 text-blue-800'
                                                                                }`}>
                                                                                {activity.type === 'lost' ? 'Lost' : activity.type === 'found' ? 'Found' : activity.type}
                                                                            </div>
                                                                        </div>

                                                                        {/* Item Details */}
                                                                        <div className="p-3">
                                                                            <h4 className="font-bold text-sm text-gray-800 mb-2 truncate">
                                                                                {activity.item_name}
                                                                            </h4>

                                                                            {/* Description */}
                                                                            {activity.description && (
                                                                                <div className="mb-2">
                                                                                    <p className="text-xs text-gray-600 line-clamp-2">{activity.description}</p>
                                                                                </div>
                                                                            )}

                                                                            <div className="space-y-1 text-xs text-gray-500 mb-2">
                                                                                {activity.location && (
                                                                                    <div className="flex items-center gap-1">
                                                                                        <MapPin className="h-3 w-3 flex-shrink-0" />
                                                                                        <span className="truncate">{activity.location}</span>
                                                                                    </div>
                                                                                )}
                                                                                <div className="flex items-center gap-1">
                                                                                    <Calendar className="h-3 w-3 flex-shrink-0" />
                                                                                    <span className="truncate">
                                                                                        {activity.created_at ? new Date(activity.created_at.replace(' ', 'T')).toLocaleString('en-US', {
                                                                                            month: 'short',
                                                                                            day: 'numeric',
                                                                                            hour: '2-digit',
                                                                                            minute: '2-digit',
                                                                                            hour12: true
                                                                                        }) : 'N/A'}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <User className="h-3 w-3 flex-shrink-0" />
                                                                                    <span className="truncate">By: {activity.reporter_name || activity.full_name || activity.email || 'Unknown'}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    })()}

                                                    {/* View All Link */}
                                                    {(() => {
                                                        const activeRecentActivity = (stats.recent_activity || []).filter(activity => {
                                                            const status = activity.status?.toLowerCase();
                                                            return status !== 'claimed' && status !== 'archived';
                                                        });

                                                        const filteredActivity = activityFilter === 'all'
                                                            ? activeRecentActivity
                                                            : activeRecentActivity.filter(activity => activity.type === activityFilter);
                                                        return filteredActivity.length > 6 && (
                                                            <div className="text-center mt-4 pt-4 border-t border-gray-200">
                                                                <button
                                                                    onClick={() => setActiveTab('claim-management')}
                                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center gap-1 mx-auto"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                    View All Items ({filteredActivity.length})
                                                                </button>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Most Common Lost Items Chart */}
                                        <div className="bg-white/90 rounded-lg shadow-lg p-6">
                                            <h3 className="text-lg font-bold text-blue-900 mb-4">Most Common Lost Items</h3>
                                            <div className="space-y-3">
                                                {loading ? (
                                                    <div className="text-center py-4">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                                        <span className="text-sm text-gray-500 mt-2">Loading...</span>
                                                    </div>
                                                ) : (stats.most_common_lost || []).length === 0 ? (
                                                    <div className="text-center py-4 text-gray-500">
                                                        <span className="text-sm">No lost items data available</span>
                                                    </div>
                                                ) : (
                                                    (stats.most_common_lost || []).map((item, index) => {
                                                        const maxCount = Math.max(...(stats.most_common_lost || []).map(i => i.count));
                                                        const percentage = (item.count / maxCount) * 100;
                                                        const colors = ['bg-teal-400', 'bg-teal-300', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600'];

                                                        return (
                                                            <div key={index} className="space-y-1">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm font-medium text-gray-700">{item.item_name}</span>
                                                                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                                    <div
                                                                        className={`${colors[index % colors.length]} h-2.5 rounded-full transition-all duration-300`}
                                                                        style={{ width: `${percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'manage-items' && (
                                <div className="w-full max-w-full overflow-hidden">
                                    <ManageLostFoundItems key="manage-items" />
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

                            {activeTab === 'messaging' && (
                                <div className="w-full max-w-full overflow-hidden">
                                    <AdminMessaging />
                                </div>
                            )}

                            {activeTab === 'reports' && (
                                <div className="w-full max-w-full overflow-hidden">
                                    <SystemReports />
                                </div>
                            )}

                            {/* Claim Instructions Section */}
                            {activeTab === 'claim-instructions' && (
                                <div className="w-full max-w-full overflow-hidden">
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 mb-4 sm:mb-6 break-words">Claim Instructions Management</h2>
                                    <div className="bg-white/90 rounded-lg shadow-lg p-4 md:p-6">
                                        <div className="mb-4 md:mb-6">
                                            <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                                                <FileText className="h-5 w-5 md:h-6 md:w-6 text-blue-600 flex-shrink-0" />
                                                <span className="break-words">How to Claim Lost Items</span>
                                            </h3>
                                            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 md:p-4 rounded-r-lg">
                                                <p className="text-xs md:text-sm text-gray-700 mb-4">
                                                    These instructions will be displayed to users on the homepage when they want to claim an item.
                                                    Click Edit to modify each step.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 md:space-y-6">
                                            {/* Step-by-Step Instructions */}
                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 md:p-6 border border-blue-200">
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                                                    <h4 className="text-base md:text-lg font-bold text-blue-900 break-words">Claiming Process Steps</h4>
                                                    <button
                                                        onClick={() => setIsAddingInstruction(true)}
                                                        disabled={editingInstruction !== null || isAddingInstruction}
                                                        className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-xs md:text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap w-full md:w-auto"
                                                    >
                                                        <span>+</span>
                                                        Add New Step
                                                    </button>
                                                </div>
                                                <div className="space-y-4">
                                                    {claimInstructions.map((instruction) => (
                                                        <div key={instruction.id} className="flex flex-col md:flex-row gap-3 md:gap-4 bg-white p-3 md:p-4 rounded-lg border border-blue-200">
                                                            <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base">
                                                                {instruction.step_number}
                                                            </div>
                                                            {editingInstruction?.id === instruction.id ? (
                                                                <div className="flex-1 space-y-3">
                                                                    <input
                                                                        type="text"
                                                                        value={editingInstruction.title}
                                                                        onChange={(e) => setEditingInstruction({ ...editingInstruction, title: e.target.value })}
                                                                        className="w-full px-2 md:px-3 py-2 border border-gray-300 rounded-lg font-semibold text-sm md:text-base"
                                                                        placeholder="Step Title"
                                                                    />
                                                                    <textarea
                                                                        value={editingInstruction.description}
                                                                        onChange={(e) => setEditingInstruction({ ...editingInstruction, description: e.target.value })}
                                                                        className="w-full px-2 md:px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm"
                                                                        rows="3"
                                                                        placeholder="Step Description"
                                                                    />
                                                                    <div className="flex flex-col md:flex-row gap-2">
                                                                        <button
                                                                            onClick={() => handleUpdateInstruction(editingInstruction)}
                                                                            disabled={isSavingInstruction}
                                                                            className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-xs md:text-sm flex items-center justify-center gap-2 transition-colors w-full md:w-auto"
                                                                        >
                                                                            {isSavingInstruction ? (
                                                                                <>
                                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                                    Saving...
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Check className="h-4 w-4" />
                                                                                    Save
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setEditingInstruction(null)}
                                                                            disabled={isSavingInstruction}
                                                                            className="px-3 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg text-xs md:text-sm flex items-center justify-center gap-2 transition-colors w-full md:w-auto"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                                                        <div className="flex-1 min-w-0">
                                                                            <h5 className="font-semibold text-gray-800 mb-1 text-sm md:text-base break-words">{instruction.title}</h5>
                                                                            <p className="text-xs md:text-sm text-gray-600 break-words">{instruction.description}</p>
                                                                        </div>
                                                                        <div className="flex gap-2 md:ml-4 flex-shrink-0">
                                                                            <button
                                                                                onClick={() => setEditingInstruction(instruction)}
                                                                                disabled={editingInstruction !== null || isAddingInstruction || isDeletingId !== null}
                                                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded text-xs md:text-sm transition-colors flex-1 md:flex-none"
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteInstruction(instruction.id)}
                                                                                disabled={editingInstruction !== null || isAddingInstruction || isDeletingId !== null}
                                                                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded text-xs md:text-sm transition-colors flex items-center justify-center gap-1 flex-1 md:flex-none"
                                                                            >
                                                                                {isDeletingId === instruction.id ? (
                                                                                    <>
                                                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                                                        Deleting...
                                                                                    </>
                                                                                ) : (
                                                                                    'Delete'
                                                                                )}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}

                                                    {/* Add New Instruction Form */}
                                                    {isAddingInstruction && (
                                                        <div className="flex gap-4 bg-green-50 p-4 rounded-lg border-2 border-green-300">
                                                            <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                                                                {claimInstructions.length + 1}
                                                            </div>
                                                            <div className="flex-1 space-y-3">
                                                                <input
                                                                    type="text"
                                                                    value={newInstruction.title}
                                                                    onChange={(e) => setNewInstruction({ ...newInstruction, title: e.target.value })}
                                                                    className="w-full px-3 py-2 border border-green-300 rounded-lg font-semibold"
                                                                    placeholder="Step Title"
                                                                />
                                                                <textarea
                                                                    value={newInstruction.description}
                                                                    onChange={(e) => setNewInstruction({ ...newInstruction, description: e.target.value })}
                                                                    className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm"
                                                                    rows="3"
                                                                    placeholder="Step Description"
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={handleAddInstruction}
                                                                        disabled={isSavingInstruction}
                                                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
                                                                    >
                                                                        {isSavingInstruction ? (
                                                                            <>
                                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                                Adding...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Check className="h-4 w-4" />
                                                                                Add Step
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setIsAddingInstruction(false);
                                                                            setNewInstruction({ title: '', description: '' });
                                                                        }}
                                                                        disabled={isSavingInstruction}
                                                                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Contact Information */}
                                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-bold text-purple-900">Contact Information</h4>
                                                    {!isEditingContact ? (
                                                        <button
                                                            onClick={() => setIsEditingContact(true)}
                                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                                                        >
                                                            Edit
                                                        </button>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={handleUpdateContactInfo}
                                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-2"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setIsEditingContact(false);
                                                                    fetchContactInfo();
                                                                }}
                                                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm flex items-center gap-2"
                                                            >
                                                                <X className="h-4 w-4" />
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                {isEditingContact ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-800 mb-2">Office Location</label>
                                                            <input
                                                                type="text"
                                                                value={contactInfo.office_location}
                                                                onChange={(e) => setContactInfo({ ...contactInfo, office_location: e.target.value })}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-800 mb-2">Contact Number</label>
                                                            <input
                                                                type="text"
                                                                value={contactInfo.contact_number}
                                                                onChange={(e) => setContactInfo({ ...contactInfo, contact_number: e.target.value })}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
                                                            <input
                                                                type="email"
                                                                value={contactInfo.email}
                                                                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-800 mb-2">Office Hours</label>
                                                            <input
                                                                type="text"
                                                                value={contactInfo.office_hours}
                                                                onChange={(e) => setContactInfo({ ...contactInfo, office_hours: e.target.value })}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p className="font-semibold text-gray-800">Lost & Found Office</p>
                                                            <p className="text-gray-600">{contactInfo.office_location || 'Not set'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800">Contact Number</p>
                                                            <p className="text-gray-600">{contactInfo.contact_number || 'Not set'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800">Email</p>
                                                            <p className="text-gray-600">{contactInfo.email || 'Not set'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800">Office Hours</p>
                                                            <p className="text-gray-600">{contactInfo.office_hours || 'Not set'}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'announcements' && (
                                <div className="w-full max-w-full overflow-hidden">
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 mb-4 sm:mb-6 break-words">Announcement Management</h2>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Create New Announcement */}
                                        <div className="bg-white/90 rounded-lg shadow-lg p-6">
                                            <h3 className="text-xl font-bold text-blue-900 mb-4">Create New Announcement</h3>
                                            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Title</label>
                                                    <input
                                                        type="text"
                                                        value={newAnnouncement.title}
                                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                                        placeholder="Enter announcement title"
                                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Content</label>
                                                    <textarea
                                                        rows={6}
                                                        value={newAnnouncement.content}
                                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                                        placeholder="Enter announcement content"
                                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium resize-vertical"
                                                        required
                                                    ></textarea>
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={isCreatingAnnouncement}
                                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
                                                >
                                                    {isCreatingAnnouncement ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                            Creating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>📢</span>
                                                            Create Announcement
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        </div>

                                        {/* Existing Announcements */}
                                        <div className="bg-white/90 rounded-lg shadow-lg p-6">
                                            <h3 className="text-xl font-bold text-blue-900 mb-4">Existing Announcements</h3>

                                            {editingAnnouncement ? (
                                                /* Edit Form */
                                                <div className="space-y-4">
                                                    <form onSubmit={handleUpdateAnnouncement} className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-800 mb-2">Title</label>
                                                            <input
                                                                type="text"
                                                                value={editingAnnouncement.title}
                                                                onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                                                                placeholder="Enter announcement title"
                                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-800 mb-2">Content</label>
                                                            <textarea
                                                                rows={6}
                                                                value={editingAnnouncement.content}
                                                                onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })}
                                                                placeholder="Enter announcement content"
                                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium resize-vertical"
                                                                required
                                                            ></textarea>
                                                        </div>
                                                        <div className="flex space-x-3">
                                                            <button
                                                                type="submit"
                                                                disabled={isSavingAnnouncement}
                                                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
                                                            >
                                                                {isSavingAnnouncement ? (
                                                                    <>
                                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                                        Saving...
                                                                    </>
                                                                ) : (
                                                                    "Save Changes"
                                                                )}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleCancelEdit}
                                                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            ) : (
                                                /* Announcements List */
                                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                                    {announcements.length > 0 ? (
                                                        announcements.map((announcement) => (
                                                            <div key={announcement.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <h4 className="font-bold text-gray-900 text-lg">{announcement.title}</h4>
                                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${announcement.is_active ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                                                                        {announcement.is_active ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-gray-800 text-base leading-relaxed mb-3 bg-gray-50 p-3 rounded border-l-4 border-blue-400">{announcement.content}</p>
                                                                <p className="text-gray-600 text-sm mb-3 font-medium">
                                                                    Created: {new Date(announcement.created_at).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </p>
                                                                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
                                                                    <button
                                                                        onClick={() => handleEditAnnouncement(announcement)}
                                                                        disabled={editingAnnouncement !== null || isDeletingAnnouncementId !== null}
                                                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                                                                        disabled={editingAnnouncement !== null || isDeletingAnnouncementId !== null}
                                                                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                                    >
                                                                        {isDeletingAnnouncementId === announcement.id ? (
                                                                            <>
                                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                                Deleting...
                                                                            </>
                                                                        ) : (
                                                                            'Delete'
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-8">
                                                            <div className="text-gray-400 mb-2">📢</div>
                                                            <p className="text-gray-600 text-lg">No announcements yet.</p>
                                                            <p className="text-gray-500 text-sm">Create your first announcement above.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'archive-management' && (
                                <div>
                                    <h2 className="text-3xl font-bold text-blue-900 mb-6">Archive Management</h2>
                                    <div className="bg-white/90 rounded-lg shadow-lg p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-blue-900">Archived Items</h3>
                                                <p className="text-sm text-gray-600 mt-1">Items older than 2 weeks that haven't been claimed</p>
                                            </div>
                                            <button
                                                onClick={fetchArchivedItems}
                                                disabled={loadingArchive}
                                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                                            >
                                                {loadingArchive ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Archive className="h-4 w-4" />
                                                        Refresh Archive
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {loadingArchive ? (
                                            <div className="text-center py-12">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                                <p className="text-gray-600">Loading archived items...</p>
                                            </div>
                                        ) : archivedItems.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {archivedItems.map((item, index) => (
                                                    <div key={index} className="bg-gray-50 rounded-lg shadow-md p-4 border border-gray-200">
                                                        {/* Item Image */}
                                                        <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                                                            {item.image_url ? (
                                                                <img
                                                                    src={item.image_url}
                                                                    alt={item.item_name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div className={`w-full h-full flex items-center justify-center ${item.image_url ? 'hidden' : ''}`}>
                                                                <div className="text-center text-gray-400">
                                                                    <div className="text-2xl mb-1">📦</div>
                                                                    <p className="text-xs">No Image</p>
                                                                </div>
                                                            </div>
                                                            {/* Status Badge */}
                                                            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'lost' || item.type === 'lost'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-green-100 text-green-800'
                                                                }`}>
                                                                {item.status === 'lost' || item.type === 'lost' ? 'Lost' : 'Found'}
                                                            </div>
                                                            {/* Archive Badge */}
                                                            <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold bg-gray-600 text-white">
                                                                Archived
                                                            </div>
                                                        </div>

                                                        {/* Item Details */}
                                                        <div className="space-y-2">
                                                            <h4 className="font-bold text-gray-800 truncate">{item.item_name}</h4>
                                                            <p className="text-gray-600 text-sm overflow-hidden"
                                                                style={{
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical'
                                                                }}>
                                                                {item.description}
                                                            </p>
                                                            <div className="space-y-1 text-sm text-gray-500">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">Category:</span>
                                                                    <span>{item.category || 'N/A'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">Date:</span>
                                                                    <span>{new Date(item.created_at || item.date_reported).toLocaleDateString()}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">Reporter:</span>
                                                                    <span>{item.reporter_name || 'Unknown'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="text-gray-400 mb-4">
                                                    <Archive className="h-16 w-16 mx-auto mb-4" />
                                                    <p className="text-xl font-medium text-gray-600">No archived items</p>
                                                    <p className="text-gray-500">Items older than 2 weeks that haven't been claimed will appear here</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'post-item' && (
                                <div>
                                    <h2 className="text-3xl font-bold text-blue-900 mb-6">Post New Item</h2>
                                    <div className="max-w-2xl mx-auto">
                                        <div className="bg-white/90 rounded-lg shadow-lg p-8">
                                            <form onSubmit={handlePostItem} className="space-y-6">
                                                {/* Item Name */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Item Name *</label>
                                                    <input
                                                        type="text"
                                                        value={newItem.item_name}
                                                        onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                                                        placeholder="Enter item name (e.g., Black iPhone 13)"
                                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                                        required
                                                    />
                                                </div>

                                                {/* Category Dropdown */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Category *</label>
                                                    <select
                                                        value={newItem.category}
                                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                                        required
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map((cat) => (
                                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Location */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Location *</label>
                                                    <select
                                                        value={newItem.location}
                                                        onChange={(e) => {
                                                            setNewItem({ ...newItem, location: e.target.value });
                                                            if (e.target.value !== 'Others') {
                                                                setNewItem(prev => ({ ...prev, customLocation: '' }));
                                                            }
                                                        }}
                                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                                        required
                                                    >
                                                        <option value="">Select Location</option>
                                                        <option value="CLA">CLA</option>
                                                        <option value="CLB">CLB</option>
                                                        <option value="CLC">CLC</option>
                                                        <option value="CSB201">CSB201</option>
                                                        <option value="CSB301">CSB301</option>
                                                        <option value="GYM">GYM</option>
                                                        <option value="LIBRARY">LIBRARY</option>
                                                        <option value="NB201">NB201</option>
                                                        <option value="NB202">NB202</option>
                                                        <option value="NB203">NB203</option>
                                                        <option value="NB301">NB301</option>
                                                        <option value="NB302">NB302</option>
                                                        <option value="NB303">NB303</option>
                                                        <option value="NB401">NB401</option>
                                                        <option value="NB402">NB402</option>
                                                        <option value="NB403">NB403</option>
                                                        <option value="Others">Others (please specify)</option>
                                                    </select>

                                                    {/* Custom location input when "Others" is selected */}
                                                    {newItem.location === 'Others' && (
                                                        <input
                                                            type="text"
                                                            value={newItem.customLocation || ''}
                                                            onChange={(e) => setNewItem({ ...newItem, customLocation: e.target.value })}
                                                            placeholder="Please specify the location"
                                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium mt-2"
                                                            required
                                                        />
                                                    )}
                                                </div>

                                                {/* Description */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Item Description *</label>
                                                    <textarea
                                                        rows={4}
                                                        value={newItem.description}
                                                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                                        placeholder="Describe the item in detail (color, brand, distinctive features, etc.)"
                                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium resize-vertical"
                                                        required
                                                    ></textarea>
                                                </div>

                                                {/* Reporter Name */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Reporter's Name *</label>
                                                    <input
                                                        type="text"
                                                        value={newItem.reporter_name}
                                                        onChange={(e) => setNewItem({ ...newItem, reporter_name: e.target.value })}
                                                        placeholder="Enter the name of the person who reported this item"
                                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                                        required
                                                    />
                                                </div>

                                                {/* Image Upload */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Item Image</label>
                                                    <div className="space-y-3">
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleImageChange}
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                id="image-upload"
                                                            />
                                                            <label
                                                                htmlFor="image-upload"
                                                                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 focus-within:border-blue-500 bg-white text-gray-700 font-medium cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 hover:bg-blue-50"
                                                            >
                                                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                {newItem.image ? newItem.image.name : 'Choose Image'}
                                                            </label>
                                                        </div>
                                                        {itemImagePreview && (
                                                            <div className="mt-3">
                                                                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                                                <img
                                                                    src={itemImagePreview}
                                                                    alt="Item preview"
                                                                    className="w-full max-w-xs h-48 object-cover rounded-lg border-2 border-gray-200"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Date and Time */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-800 mb-2">Date *</label>
                                                        <input
                                                            type="date"
                                                            value={newItem.date_lost}
                                                            onChange={(e) => setNewItem({ ...newItem, date_lost: e.target.value })}
                                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-800 mb-2">Time *</label>
                                                        <input
                                                            type="time"
                                                            value={newItem.time_lost}
                                                            onChange={(e) => setNewItem({ ...newItem, time_lost: e.target.value })}
                                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Status */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
                                                    <select
                                                        value={newItem.status}
                                                        onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                                    >
                                                        <option value="lost">Lost Item</option>
                                                        <option value="found">Found Item</option>
                                                    </select>
                                                </div>

                                                {/* Submit Button */}
                                                <button
                                                    type="submit"
                                                    disabled={isPostingItem}
                                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
                                                >
                                                    {isPostingItem ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                            Posting Item...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="h-5 w-5" />
                                                            Post Item
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="w-full max-w-full overflow-hidden">
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 mb-4 sm:mb-6 break-words">System Settings</h2>
                                    <div className="space-y-6">
                                        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
                                            <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">System Name</label>
                                                    <input
                                                        type="text"
                                                        defaultValue="Norzagaray College Lost & Found"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                                                    <input
                                                        type="email"
                                                        defaultValue="lostandfound@norzagaraycollege.edu"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleSaveSettings}
                                                    disabled={isSavingSettings}
                                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                                                >
                                                    {isSavingSettings ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        'Save Settings'
                                                    )}
                                                </button>
                                            </div>
                                        </div>



                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminDashboard;