// src/admin/ManageAnnouncements.jsx
import { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { API_ENDPOINTS } from '../utils/api';

function ManageAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        is_active: 1
    });
    const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [isDeletingId, setIsDeletingId] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState('success');

    // Confirmation modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.ALL);
            const data = await response.json();
            if (data.success) {
                setAnnouncements(data.announcements || []);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.CREATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAnnouncement)
            });

            const data = await response.json();
            if (data.success) {
                setModalMessage('Announcement created successfully!');
                setModalType('success');
                setShowModal(true);
                setNewAnnouncement({ title: '', content: '', is_active: 1 });
                setIsAddingAnnouncement(false);
                fetchAnnouncements();
            } else {
                setModalMessage('Failed to create announcement: ' + data.message);
                setModalType('error');
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error creating announcement:', error);
            setModalMessage('Error creating announcement');
            setModalType('error');
            setShowModal(true);
        }
    };


    const handleUpdateAnnouncement = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(editingAnnouncement.id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editingAnnouncement.title,
                    content: editingAnnouncement.content,
                    is_active: editingAnnouncement.is_active
                })
            });

            const data = await response.json();
            if (data.success) {
                setModalMessage('Announcement updated successfully!');
                setModalType('success');
                setShowModal(true);
                setEditingAnnouncement(null);
                fetchAnnouncements();
            } else {
                setModalMessage('Failed to update announcement: ' + data.message);
                setModalType('error');
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error updating announcement:', error);
            setModalMessage('Error updating announcement');
            setModalType('error');
            setShowModal(true);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowConfirmModal(true);
    };

    const handleDeleteAnnouncement = async () => {
        setShowConfirmModal(false);
        setIsDeletingId(deleteId);
        try {
            const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(deleteId), {
                method: 'DELETE'
            });

                const data = await response.json();
                if (data.success) {
                    setModalMessage('Announcement deleted successfully!');
                    setModalType('success');
                    setShowModal(true);
                    fetchAnnouncements();
                } else {
                    setModalMessage('Failed to delete announcement: ' + data.message);
                    setModalType('error');
                    setShowModal(true);
                }
            } catch (error) {
                console.error('Error deleting announcement:', error);
                setModalMessage('Error deleting announcement');
                setModalType('error');
                setShowModal(true);
            } finally {
                setIsDeletingId(null);
                setDeleteId(null);
            }
    };

    return (
        <div className="w-full max-w-full overflow-hidden">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 mb-4 sm:mb-6 break-words">
                Announcement Management
            </h2>
            <div className="bg-white/90 rounded-lg shadow-lg p-4 md:p-6">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Announcements</h3>
                        {!isAddingAnnouncement && (
                            <button
                                onClick={() => setIsAddingAnnouncement(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Announcement
                            </button>
                        )}
                    </div>

                    {/* Add New Announcement Form */}
                    {isAddingAnnouncement && (
                        <form onSubmit={handleCreateAnnouncement} className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={newAnnouncement.title}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter announcement title"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                                    <textarea
                                        value={newAnnouncement.content}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        rows="4"
                                        placeholder="Enter announcement content"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Add Announcement
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddingAnnouncement(false);
                                            setNewAnnouncement({ title: '', content: '', is_active: 1 });
                                        }}
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Announcements List */}
                    <div className="space-y-4">
                        {announcements.length > 0 ? (
                            announcements.map((announcement) => (
                                <div key={announcement.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                                    {editingAnnouncement && editingAnnouncement.id === announcement.id ? (
                                        <form onSubmit={handleUpdateAnnouncement} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                                <input
                                                    type="text"
                                                    value={editingAnnouncement.title}
                                                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                                                <textarea
                                                    value={editingAnnouncement.content}
                                                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    rows="4"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                                <select
                                                    value={editingAnnouncement.is_active}
                                                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, is_active: parseInt(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value={1}>Active</option>
                                                    <option value={0}>Inactive</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    type="submit"
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingAnnouncement(null)}
                                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-bold text-gray-900">{announcement.title}</h4>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            announcement.is_active 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {announcement.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 text-sm mb-2">{announcement.content}</p>
                                                    <p className="text-gray-500 text-xs">
                                                        Created: {new Date(announcement.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <button
                                                        onClick={() => setEditingAnnouncement(announcement)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(announcement.id)}
                                                        disabled={isDeletingId === announcement.id}
                                                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        {isDeletingId === announcement.id ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Megaphone className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-lg font-medium">No announcements yet</p>
                                <p className="text-sm">Add announcements to display on the homepage</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={() => setShowConfirmModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold text-red-700">Confirm Delete</h3>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="text-gray-600 hover:text-gray-800 transition-colors p-1 hover:bg-gray-100 rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mb-6">
                            <p className="text-gray-700 leading-relaxed">Are you sure you want to delete this announcement?</p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAnnouncement}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            {showModal && (
                <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <h3 className={`text-xl font-bold ${modalType === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                                {modalType === 'success' ? 'Success' : 'Error'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-600 hover:text-gray-800 transition-colors p-1 hover:bg-gray-100 rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mb-6">
                            <p className="text-gray-700 leading-relaxed">{modalMessage}</p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className={`px-6 py-2 rounded-lg transition-colors font-medium text-white ${
                                    modalType === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageAnnouncements;
