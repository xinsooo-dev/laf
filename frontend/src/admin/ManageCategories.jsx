// src/admin/ManageCategories.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Save, X, Search } from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '../utils/api';
import { SuccessModal, ErrorModal, ConfirmModal } from '../components/Modals';

function ManageCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [editingDescription, setEditingDescription] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState(null);
    
    // Modal states
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmTitle, setConfirmTitle] = useState('Confirm Action');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.CATEGORIES.ALL);
            const data = await response.json();
            
            console.log('📋 Fetched categories:', data.categories);

            if (data.success) {
                setCategories(data.categories || []);
            } else {
                console.error('Failed to fetch categories:', data.message);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = async () => {
        if (!newCategoryName.trim()) {
            setErrorMessage('Category name is required');
            setShowError(true);
            return;
        }

        setIsSaving(true);
        
        const payload = { 
            name: newCategoryName,
            description: newCategoryDescription 
        };
        
        console.log('📤 Sending category data:', payload);
        
        try {
            const response = await fetch(API_ENDPOINTS.CATEGORIES.BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log('📥 Backend response:', data);

            if (data.success) {
                setSuccessMessage('Category added successfully!');
                setShowSuccess(true);
                setNewCategoryName('');
                setNewCategoryDescription('');
                setIsAdding(false);
                fetchCategories();
            } else {
                setErrorMessage(`Failed: ${data.message}`);
                setShowError(true);
            }
        } catch (error) {
            console.error('Error adding category:', error);
            setErrorMessage('Error adding category. Please try again.');
            setShowError(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setEditingName(category.name);
        setEditingDescription(category.description || '');
    };

    const handleSaveEdit = async (id) => {
        if (!editingName.trim()) {
            setErrorMessage('Category name is required');
            setShowError(true);
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(API_ENDPOINTS.CATEGORIES.UPDATE(id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: editingName,
                    description: editingDescription 
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMessage('Category updated successfully!');
                setShowSuccess(true);
                setEditingId(null);
                setEditingName('');
                setEditingDescription('');
                fetchCategories();
            } else {
                setErrorMessage(`Failed: ${data.message}`);
                setShowError(true);
            }
        } catch (error) {
            console.error('Error updating category:', error);
            setErrorMessage('Error updating category. Please try again.');
            setShowError(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName('');
        setEditingDescription('');
    };

    const handleDeleteClick = (id) => {
        setConfirmAction(() => () => handleDelete(id));
        setConfirmMessage('Are you sure you want to delete this category? This action cannot be undone.');
        setConfirmTitle('Delete Category');
        setShowConfirm(true);
    };

    const handleDelete = async (id) => {
        setIsDeletingId(id);
        try {
            const response = await fetch(API_ENDPOINTS.CATEGORIES.DELETE(id), {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMessage('Category deleted successfully!');
                setShowSuccess(true);
                fetchCategories();
            } else {
                setErrorMessage(`Failed to delete: ${data.message}`);
                setShowError(true);
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            setErrorMessage('Error deleting category. Please try again.');
            setShowError(true);
        } finally {
            setIsDeletingId(null);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
                <p className="text-sm text-gray-500">Dashboard / Categories</p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <select
                            value={entriesPerPage}
                            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-gray-600">entries per page</span>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={() => setIsAdding(true)}
                            disabled={editingId !== null || isAdding}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Create New
                        </button>
                    </div>
                </div>
            </div>


            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isAdding && (
                                <tr className="bg-blue-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            placeholder="Category name"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            autoFocus
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            value={newCategoryDescription}
                                            onChange={(e) => setNewCategoryDescription(e.target.value)}
                                            placeholder="Description"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4">-</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleAddNew}
                                                disabled={isSaving}
                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400"
                                            >
                                                {isSaving ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsAdding(false);
                                                    setNewCategoryName('');
                                                    setNewCategoryDescription('');
                                                }}
                                                disabled={isSaving}
                                                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="ml-2 text-gray-600">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No categories found
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.slice(0, entriesPerPage).map((category, index) => (
                                    <tr key={category.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {category.created_at ? new Date(category.created_at).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            }) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {editingId === category.id ? (
                                                <input
                                                    type="text"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                category.name
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                            {editingId === category.id ? (
                                                <input
                                                    type="text"
                                                    value={editingDescription}
                                                    onChange={(e) => setEditingDescription(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Description"
                                                />
                                            ) : (
                                                <div className="truncate" title={category.description}>
                                                    {category.description || '-'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {editingId === category.id ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSaveEdit(category.id)}
                                                        disabled={isSaving}
                                                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400"
                                                    >
                                                        {isSaving ? 'Saving...' : 'Save'}
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        disabled={isSaving}
                                                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative inline-block text-left">
                                                    <button
                                                        onClick={() => handleEdit(category)}
                                                        disabled={editingId !== null || isAdding}
                                                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 mr-2"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(category.id)}
                                                        disabled={editingId !== null || isAdding || isDeletingId !== null}
                                                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                                                    >
                                                        {isDeletingId === category.id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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

            {/* Confirm Delete Modal */}
            <ConfirmModal 
                show={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={confirmAction}
                title={confirmTitle}
                message={confirmMessage}
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
}

export default ManageCategories;
