// src/admin/ManageCategories.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Save, X, Search } from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '../utils/api';

function ManageCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.CATEGORIES.ALL);
            const data = await response.json();

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
            alert('Category name is required');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(API_ENDPOINTS.CATEGORIES.BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName })
            });

            const data = await response.json();

            if (data.success) {
                alert('Category added successfully!');
                setNewCategoryName('');
                setIsAdding(false);
                fetchCategories();
            } else {
                alert(`Failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Error adding category. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setEditingName(category.name);
    };

    const handleSaveEdit = async (id) => {
        if (!editingName.trim()) {
            alert('Category name is required');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(API_ENDPOINTS.CATEGORIES.UPDATE(id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editingName })
            });

            const data = await response.json();

            if (data.success) {
                alert('Category updated successfully!');
                setEditingId(null);
                setEditingName('');
                fetchCategories();
            } else {
                alert(`Failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Error updating category. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            return;
        }

        setIsDeletingId(id);
        try {
            const response = await fetch(API_ENDPOINTS.CATEGORIES.DELETE(id), {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                alert('Category deleted successfully!');
                fetchCategories();
            } else {
                alert(`Failed to delete: ${data.message}`);
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Error deleting category. Please try again.');
        } finally {
            setIsDeletingId(null);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="hidden md:flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Categories Management</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>{categories.length} categories</span>
                </div>
            </div>

            {/* Mobile category count */}
            <div className="md:hidden flex items-center justify-end">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>{categories.length} categories</span>
                </div>
            </div>

            {/* Search and Add */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        disabled={editingId !== null || isAdding}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                        Add Category
                    </button>
                </div>
            </div>

            {/* Add New Category Card */}
            {isAdding && (
                <div className="bg-white rounded-lg border border-blue-200 shadow-sm">
                    <div className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Enter category name..."
                                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-col space-y-2 md:ml-6 w-full md:w-auto md:flex-shrink-0">
                                <button
                                    onClick={handleAddNew}
                                    disabled={isSaving}
                                    className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save'
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAdding(false);
                                        setNewCategoryName('');
                                    }}
                                    disabled={isSaving}
                                    className="px-3 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 transition-colors whitespace-nowrap"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Categories Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading categories...</span>
                </div>
            ) : filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No categories found</h3>
                    <p className="text-gray-600">Add your first category to get started</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredCategories.map((category) => (
                        <div key={category.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 md:p-6">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="mb-4">
                                            {editingId === category.id ? (
                                                <input
                                                    type="text"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    autoFocus
                                                />
                                            ) : (
                                                <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-col space-y-2 md:ml-6 w-full md:w-auto md:flex-shrink-0">
                                        {editingId === category.id ? (
                                            <>
                                                <button
                                                    onClick={() => handleSaveEdit(category.id)}
                                                    disabled={isSaving}
                                                    className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        'Save'
                                                    )}
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    disabled={isSaving}
                                                    className="px-3 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 transition-colors whitespace-nowrap"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    disabled={editingId !== null || isAdding || isDeletingId !== null}
                                                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    disabled={editingId !== null || isAdding || isDeletingId !== null}
                                                    className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                                                >
                                                    {isDeletingId === category.id ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Deleting...
                                                        </>
                                                    ) : (
                                                        'Delete'
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ManageCategories;
