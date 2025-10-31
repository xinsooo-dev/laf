// src/admin/DashboardOverview.jsx
import { Package, MapPin, Calendar, User, Eye } from 'lucide-react';
import { getAssetUrl } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

function DashboardOverview({ stats, loading, activityFilter, setActivityFilter, setActiveTab }) {
    return (
        <div className="w-full max-w-full overflow-hidden">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 mb-4 sm:mb-6 break-words">
                Dashboard Overview
            </h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 mb-6">
                {/* Lost Items Card */}
                <div
                    onClick={() => {
                        setActivityFilter('lost');
                    }}
                    className="bg-white/90 p-3 md:p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                >
                    <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">Lost Items</h3>
                    <p className="text-2xl md:text-4xl font-bold text-red-600 transition-all duration-500">
                        {loading ? '...' : stats.total_lost}
                    </p>
                </div>

                {/* Found Items Card */}
                <div
                    onClick={() => {
                        setActivityFilter('found');
                    }}
                    className="bg-white/90 p-3 md:p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                >
                    <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">Found Items</h3>
                    <p className="text-2xl md:text-4xl font-bold text-green-600 transition-all duration-500">
                        {loading ? '...' : stats.total_found}
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
                                        <span className={`ml-2 text-sm px-2 py-1 rounded-full ${activityFilter === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
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
                                const activeRecentActivity = (stats.recent_activity || []).filter(activity => {
                                    const status = activity.status?.toLowerCase();
                                    return status !== 'claimed' && status !== 'archived';
                                });

                                const filteredActivity = activityFilter === 'all'
                                    ? activeRecentActivity
                                    : activeRecentActivity.filter(activity => activity.type === activityFilter);

                                if (loading) {
                                    return <LoadingSpinner message="Loading recent activity..." />;
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
                                                                e.target.parentElement.innerHTML = '<div class="text-center text-gray-400"><div class="text-3xl mb-2">📦</div><p class="text-xs">No Image</p></div>';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="text-center text-gray-400">
                                                            <div className="text-3xl mb-2">📦</div>
                                                            <p className="text-xs">No Image</p>
                                                        </div>
                                                    )}
                                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${activity.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                        {activity.type === 'lost' ? 'Lost' : 'Found'}
                                                    </div>
                                                </div>

                                                {/* Item Details */}
                                                <div className="p-3">
                                                    <h4 className="font-bold text-sm text-gray-800 mb-2 truncate">
                                                        {activity.item_name}
                                                    </h4>
                                                    {activity.description && (
                                                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{activity.description}</p>
                                                    )}
                                                    <div className="space-y-1 text-xs text-gray-500">
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
                                                            <span className="truncate">{activity.type === 'lost' ? 'Lost' : 'Found'} by: {activity.reporter_name || activity.full_name || 'Unknown'}</span>
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
                            <LoadingSpinner message="Loading..." size="small" />
                        ) : (stats.most_common_lost || []).length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                                <span className="text-sm">No lost items data available</span>
                            </div>
                        ) : (
                            (stats.most_common_lost || []).map((item, index) => {
                                const maxCount = Math.max(...(stats.most_common_lost || []).map(i => i.count));
                                const percentage = (item.count / maxCount) * 100;
                                const displayName = item.category || item.item_name || 'Unknown';
                                
                                return (
                                    <div key={index} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-gray-700">{displayName}</span>
                                            <span className="text-gray-600">{item.count}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
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
    );
}

export default DashboardOverview;
