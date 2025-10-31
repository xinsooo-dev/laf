// src/admin/ManageAnnouncements.jsx
import { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit, Trash2 } from 'lucide-react';
import { API_ENDPOINTS } from '../utils/api';
import { SuccessModal, ErrorModal, ConfirmModal } from '../components/Modals';

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

    // Modal states
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
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
                setSuccessMessage('Announcement created successfully!');
                setShowSuccess(true);
                setNewAnnouncement({ title: '', content: '', is_active: 1 });
                setIsAddingAnnouncement(false);
                fetchAnnouncements();
            } else {
                setErrorMessage('Failed to create announcement: ' + data.message);
                setShowError(true);
            }
        } catch (error) {
            console.error('Error creating announcement:', error);
            setErrorMessage('Error creating announcement');
            setShowError(true);
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
                setSuccessMessage('Announcement updated successfully!');
                setShowSuccess(true);
                setEditingAnnouncement(null);
                fetchAnnouncements();
            } else {
                setErrorMessage('Failed to update announcement: ' + data.message);
                setShowError(true);
            }
        } catch (error) {
            console.error('Error updating announcement:', error);
            setErrorMessage('Error updating announcement');
            setShowError(true);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const handleDeleteAnnouncement = async () => {
        setIsDeletingId(deleteId);
        try {
            const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(deleteId), {
                method: 'DELETE'
            });

                const data = await response.json();
                if (data.success) {
                    setSuccessMessage('Announcement deleted successfully!');
                    setShowSuccess(true);
                    fetchAnnouncements();
                } else {
                    setErrorMessage('Failed to delete announcement: ' + data.message);
                    setShowError(true);
                }
            } catch (error) {
                console.error('Error deleting announcement:', error);
                setErrorMessage('Error deleting announcement');
                setShowError(true);
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
                onConfirm={handleDeleteAnnouncement}
                title="Confirm Delete"
                message="Are you sure you want to delete this announcement?"
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
}

export default ManageAnnouncements;
