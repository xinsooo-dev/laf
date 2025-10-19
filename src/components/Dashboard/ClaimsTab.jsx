import { useState, useEffect } from 'react';
import { Package, Calendar, MapPin, User, Eye } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';

function ClaimsTab({ userId, onViewItem }) {
    const [claimedItems, setClaimedItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchClaimedItems();
        }
    }, [userId]);

    const fetchClaimedItems = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/items.php?action=getClaimedItems&user_id=${userId}`);
            const data = await response.json();
            
            if (data.success) {
                setClaimedItems(data.items || []);
            } else {
                console.error('Failed to fetch claimed items:', data.message);
                setClaimedItems([]);
            }
        } catch (error) {
            console.error('Error fetching claimed items:', error);
            setClaimedItems([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-blue-200">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading claimed items...</span>
                </div>
            </div>
        );
    }

    if (claimedItems.length === 0) {
        return (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-blue-200">
                <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Claimed Items</h3>
                    <p className="text-gray-600">You haven't claimed any items yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">My Claimed Items</h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Package className="h-4 w-4" />
                        <span>{claimedItems.length} item{claimedItems.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                <div className="grid gap-4">
                    {claimedItems.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className={`rounded-full p-2 flex-shrink-0 ${
                                            item.type === 'lost' ? 'bg-red-100' : 'bg-green-100'
                                        }`}>
                                            <Package className={`h-5 w-5 ${
                                                item.type === 'lost' ? 'text-red-600' : 'text-green-600'
                                            }`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-lg font-semibold text-gray-800 truncate">
                                                {item.item_name}
                                            </h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                item.type === 'lost' 
                                                    ? 'bg-red-100 text-red-800' 
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                <strong>Description:</strong>
                                            </p>
                                            <p className="text-sm text-gray-800">{item.description || 'No description'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">{item.location || 'Unknown'}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                                <span>Claimed: {formatDate(item.claimed_at)}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <User className="h-4 w-4 flex-shrink-0" />
                                                <span>Reported by: {item.reporter_name || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="ml-4 flex-shrink-0">
                                    <button
                                        onClick={() => onViewItem(item)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                                    >
                                        <Eye className="h-4 w-4" />
                                        <span>View Details</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ClaimsTab;
