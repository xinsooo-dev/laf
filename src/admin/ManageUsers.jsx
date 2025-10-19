import React, { useState, useEffect } from 'react';
import { Search, Eye, Check, X, UserCheck, UserX, RefreshCw, Trash2, Mail, Phone, Calendar, MapPin, User, Package, Filter, Edit, MoreVertical, Shield, Users as UsersIcon } from 'lucide-react';
import { API_ENDPOINTS } from '../utils/api';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [stats, setStats] = useState({});

    useEffect(() => {
        fetchUsers();
        fetchUserStats();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, filterStatus, activeTab]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.AUTH.GET_ALL_USERS);
            const data = await response.json();

            if (data.success) {
                setUsers(data.users);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ADMIN.USERS.STATS);
            const data = await response.json();

            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        // Filter by active tab
        if (activeTab === 'pending') {
            filtered = filtered.filter(user => user.status === 'pending');
        } else if (activeTab === 'approved') {
            filtered = filtered.filter(user => user.status === 'approved');
        } else if (activeTab === 'rejected') {
            filtered = filtered.filter(user => user.status === 'rejected');
        }

        // Filter by status dropdown
        if (filterStatus !== 'all') {
            filtered = filtered.filter(user => user.status === filterStatus);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    };

    const handleStatusChange = async (userId, newStatus) => {
        setActionLoading(prev => ({ ...prev, [userId]: newStatus }));

        try {
            let response;
            if (newStatus === 'approved') {
                response = await fetch(API_ENDPOINTS.AUTH.APPROVE_USER(userId), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
            } else if (newStatus === 'rejected') {
                response = await fetch(API_ENDPOINTS.AUTH.REJECT_USER(userId), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
            } else {
                // For resetting to pending
                response = await fetch(API_ENDPOINTS.AUTH.APPROVE_USER(userId), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const data = await response.json();

            if (data.success) {
                // Update user in local state
                setUsers(prev => prev.map(user =>
                    user.id === userId ? { ...user, status: newStatus } : user
                ));
                alert(`User status updated to ${newStatus} successfully!`);
            } else {
                alert(`Failed to update user status: ${data.message}`);
            }
        } catch (error) {
            alert(`Network error occurred while updating user status`);
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: null }));
        }
    };

    const handleResetStatus = async (userId) => {
        setActionLoading(prev => ({ ...prev, [userId]: 'reset' }));

        try {
            const response = await fetch(API_ENDPOINTS.AUTH.RESET_USER_STATUS(userId), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (data.success) {
                // Update user in local state
                setUsers(prev => prev.map(user =>
                    user.id === userId ? { ...user, status: 'pending' } : user
                ));
                alert('User status reset to pending successfully! User will need to be re-approved.');
            } else {
                alert(`Failed to reset user status: ${data.message}`);
            }
        } catch (error) {
            alert(`Network error occurred while resetting user status`);
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: null }));
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        setActionLoading(prev => ({ ...prev, [userId]: 'delete' }));

        try {
            const response = await fetch(API_ENDPOINTS.ADMIN.USERS.DELETE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
            });

            const data = await response.json();

            if (data.success) {
                setUsers(prev => prev.filter(user => user.id !== userId));
                alert('User deleted successfully!');
            } else {
                alert(`Failed to delete user: ${data.message}`);
            }
        } catch (error) {
            alert('Network error occurred while deleting user');
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: null }));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading pending users...</span>
            </div>
        );
    }

    const getStatusBadge = (status, isAdmin) => {
        if (isAdmin) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                </span>
            );
        }

        const statusConfig = {
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
            'approved': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
            'rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
        };

        const config = statusConfig[status] || statusConfig['pending'];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="h-3 w-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
                        <p className="text-gray-600 mt-1">Manage user accounts, approvals, and permissions</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">{filteredUsers.length}</span> users displayed
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.total_users || 0}</p>
                            </div>
                            <UsersIcon className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.verified || 0}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-3xl font-bold text-green-600">{stats.approved || 0}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Admins</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.total_admins || 0}</p>
                            </div>
                            <Shield className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Tabs */}
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                            {[
                                { id: 'all', name: 'All Users', count: users.length },
                                { id: 'pending', name: 'Pending', count: users.filter(u => u.status === 'pending').length },
                                { id: 'approved', name: 'Approved', count: users.filter(u => u.status === 'approved').length },
                                { id: 'rejected', name: 'Rejected', count: users.filter(u => u.status === 'rejected').length }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {tab.name} ({tab.count})
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users by name, email, or student ID..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <select
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading users...</span>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-lg">
                        <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 mb-2">No users found</h3>
                        <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{user.full_name || 'N/A'}</div>
                                                        <div className="text-sm text-gray-500">ID: {user.student_id || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                                {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(user.status, user.is_admin == 1)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(user.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    {user.is_admin != 1 && (
                                                        <>
                                                            {user.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleStatusChange(user.id, 'approved')}
                                                                        disabled={actionLoading[user.id]}
                                                                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                                                        title="Approve User"
                                                                    >
                                                                        {actionLoading[user.id] === 'approved' ? (
                                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                                                        ) : (
                                                                            <CheckCircle className="h-4 w-4" />
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleStatusChange(user.id, 'rejected')}
                                                                        disabled={actionLoading[user.id]}
                                                                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                                        title="Reject User"
                                                                    >
                                                                        {actionLoading[user.id] === 'rejected' ? (
                                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                                        ) : (
                                                                            <XCircle className="h-4 w-4" />
                                                                        )}
                                                                    </button>
                                                                </>
                                                            )}
                                                            {(user.status === 'approved' || user.status === 'verified') && (
                                                                <button
                                                                    onClick={() => handleResetStatus(user.id)}
                                                                    disabled={actionLoading[user.id]}
                                                                    className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                                                                    title="Reset Status (Security: Mark as Pending)"
                                                                >
                                                                    {actionLoading[user.id] === 'reset' ? (
                                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                                                                    ) : (
                                                                        <RefreshCw className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                disabled={actionLoading[user.id]}
                                                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                                title="Delete User"
                                                            >
                                                                {actionLoading[user.id] === 'delete' ? (
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                                ) : (
                                                                    <Trash2 className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        </>
                                                    )}
                                                    {user.is_admin == 1 && (
                                                        <span className="text-gray-400 text-xs">Protected</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;
