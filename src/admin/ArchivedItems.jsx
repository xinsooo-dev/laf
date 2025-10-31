// src/admin/ArchivedItems.jsx
import { useState, useEffect } from 'react';
import { Archive as ArchiveIcon } from 'lucide-react';
import { API_ENDPOINTS } from '../utils/api';
import { SuccessModal, ErrorModal, ConfirmModal } from '../components/Modals';
import ItemCard from '../components/ItemCard';
import ViewItemModal from '../components/ViewItemModal';
import FullscreenImageViewer from '../components/FullscreenImageViewer';
import SearchFilterBar from '../components/SearchFilterBar';
import LoadingSpinner from '../components/LoadingSpinner';

function ArchivedItems() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
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
        // Just fetch archived items and categories on load
        // Don't run auto-archive on every page load to prevent re-archiving recently restored items
        fetchArchivedItems();
        fetchCategories();
    }, []);

    const runAutoArchive = async () => {
        try {
            // Silently run auto-archive in the background
            await fetch(API_ENDPOINTS.ADMIN.AUTO_ARCHIVE.RUN);
            // Then fetch the archived items
            fetchArchivedItems();
        } catch (error) {
            console.error('Error running auto-archive:', error);
            // Still fetch archived items even if auto-archive fails
            fetchArchivedItems();
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.CATEGORIES.ALL);
            const data = await response.json();
            if (data.success) {
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchArchivedItems = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.ARCHIVED);
            const data = await response.json();

            if (data.success) {
                setItems(data.items || []);
            } else {
                console.error('Failed to fetch archived items:', data.message);
                setItems([]);
            }
        } catch (error) {
            console.error('Error fetching archived items:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreClick = (id) => {
        setConfirmAction(() => () => handleRestore(id));
        setConfirmMessage('Are you sure you want to restore this item? It will be moved back to active items.');
        setConfirmTitle('Restore Item');
        setShowConfirm(true);
    };

    const handleRestore = async (id) => {
        try {
            const response = await fetch(API_ENDPOINTS.ITEMS.RESTORE(id));
            const data = await response.json();

            if (data.success) {
                setSuccessMessage('Item restored successfully!');
                setShowSuccess(true);
                fetchArchivedItems(); // Refresh the list
            } else {
                setErrorMessage(`Failed to restore item: ${data.message}`);
                setShowError(true);
            }
        } catch (error) {
            console.error('Error restoring item:', error);
            setErrorMessage('Network error occurred while restoring item');
            setShowError(true);
        }
    };

    const handlePermanentDeleteClick = (id) => {
        setConfirmAction(() => () => handlePermanentDelete(id));
        setConfirmMessage('⚠️ WARNING: This will PERMANENTLY delete this item from the database. This action CANNOT be undone. Are you absolutely sure?');
        setConfirmTitle('Permanent Delete');
        setShowConfirm(true);
    };

    const handlePermanentDelete = async (id) => {
        try{
            const response = await fetch(`${API_ENDPOINTS.ITEMS.BASE}?id=${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMessage('Item permanently deleted');
                setShowSuccess(true);
                fetchArchivedItems(); // Refresh the list
            } else {
                setErrorMessage(`Failed to delete item: ${data.message}`);
                setShowError(true);
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            setErrorMessage('Error deleting item. Please try again.');
            setShowError(true);
        }
    };

    const handleView = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        setIsFullscreen(false);
    };

    // Filter items
    const filteredItems = items.filter(item => {
        const matchesSearch = item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || item.type?.toLowerCase() === filterType.toLowerCase();
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
    });

    return (
        <div className="w-full max-w-full overflow-hidden">
            {/* Mobile Header */}
            <div className="block md:hidden mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 mb-1">Archived Items</h1>
                        <p className="text-sm text-gray-600">Items that have been archived</p>
                    </div>
                </div>
            </div>

            <div className="hidden md:block mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Archived Items</h1>
                    <p className="text-sm text-gray-500">Dashboard / Archived Items</p>
                </div>
            </div>

            {/* Filtered Total Display */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                            {filterType === 'lost' ? 'Lost' : filterType === 'found' ? 'Found' : 'All'} Archived Items
                        </h3>
                        <p className="text-sm text-gray-600">
                            {filterType === 'all' ? 'Showing all archived items' : `Showing ${filterType} archived items only`}
                        </p>
                    </div>
                    <div className="text-center sm:text-right">
                        <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${filterType === 'lost' ? 'text-red-600' : filterType === 'found' ? 'text-green-600' : 'text-gray-600'}`}>
                            {filteredItems.length}
                        </div>
                        <div className="text-sm text-gray-500">Total</div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <SearchFilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterType={filterType}
                onFilterTypeChange={setFilterType}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                categories={categories}
                showRefresh={true}
                onRefresh={runAutoArchive}
                loading={loading}
                placeholder="Search archived items, descriptions, or reporters..."
            />

            {/* Items Grid */}
            {loading ? (
                <LoadingSpinner message="Loading archived items..." />
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                    <ArchiveIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No archived items found</p>
                    <p className="text-gray-500 text-sm">Archived items will appear here</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {filteredItems.map((item) => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            onView={handleView}
                            onRestore={handleRestoreClick}
                            onDelete={handlePermanentDeleteClick}
                            showRestore={true}
                            showDelete={true}
                            isArchived={true}
                        />
                    ))}
                </div>
            )}

            {/* View Modal */}
            {showModal && selectedItem && (
                <ViewItemModal
                    item={selectedItem}
                    onClose={closeModal}
                    onFullscreen={() => setIsFullscreen(true)}
                    isArchived={true}
                />
            )}

            {/* Fullscreen Image Viewer */}
            {isFullscreen && selectedItem && (selectedItem.image_path || selectedItem.image_url) && (
                <FullscreenImageViewer
                    imagePath={selectedItem.image_path || selectedItem.image_url}
                    itemName={selectedItem.item_name}
                    onClose={() => setIsFullscreen(false)}
                />
            )}

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
                onConfirm={confirmAction}
                title={confirmTitle}
                message={confirmMessage}
                confirmText="Confirm"
                type="danger"
            />
        </div>
    );
}

export default ArchivedItems;
