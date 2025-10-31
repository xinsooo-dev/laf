// src/components/SearchFilterBar.jsx
import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

function SearchFilterBar({
    searchTerm,
    onSearchChange,
    filterType,
    onFilterTypeChange,
    categoryFilter,
    onCategoryFilterChange,
    categories = [],
    showRefresh = false,
    onRefresh,
    loading = false,
    placeholder = "Search items, descriptions, or reporters..."
}) {
    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6 w-full overflow-hidden">
            <div className="flex flex-col md:flex-row gap-4 w-full">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={placeholder}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Type Filter */}
                {onFilterTypeChange && (
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={filterType}
                        onChange={(e) => onFilterTypeChange(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="lost">Lost</option>
                        <option value="found">Found</option>
                    </select>
                )}

                {/* Category Filter */}
                {onCategoryFilterChange && categories.length > 0 && (
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        value={categoryFilter}
                        onChange={(e) => onCategoryFilterChange(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                )}

                {/* Refresh Button */}
                {showRefresh && onRefresh && (
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors flex items-center gap-2"
                        title="Refresh items list"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                )}
            </div>
        </div>
    );
}

export default SearchFilterBar;
