function DashboardStats({ userStats, loading }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up animation-delay-400">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-blue-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <h3 className="text-sm font-medium text-blue-700 mb-2">My Lost Items</h3>
                <p className="text-4xl font-bold text-blue-600 transition-all duration-500">{loading ? '...' : userStats.lostItems}</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-blue-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <h3 className="text-sm font-medium text-blue-700 mb-2">My Found Items</h3>
                <p className="text-4xl font-bold text-blue-600 transition-all duration-500">{loading ? '...' : userStats.foundItems}</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-blue-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <h3 className="text-sm font-medium text-blue-700 mb-2">Items Claimed</h3>
                <p className="text-4xl font-bold text-blue-600 transition-all duration-500">{loading ? '...' : userStats.claimedItems}</p>
            </div>
        </div>
    );
}

export default DashboardStats;
