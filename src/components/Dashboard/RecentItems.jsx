function RecentItems({ commonItems }) {
    const iconClasses = [
        'bg-blue-100 text-blue-600',
        'bg-green-100 text-green-600',
        'bg-purple-100 text-purple-600',
        'bg-orange-100 text-orange-600',
        'bg-pink-100 text-pink-600',
        'bg-indigo-100 text-indigo-600',
        'bg-yellow-100 text-yellow-600',
        'bg-red-100 text-red-600'
    ];

    return (
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-blue-200 animate-fade-in-up animation-delay-600">
            <h3 className="text-xl font-bold text-blue-900 mb-4">Most Recent Lost Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {commonItems.length > 0 ? (
                    commonItems.map((item, index) => {
                        const iconClass = iconClasses[index % iconClasses.length];
                        return (
                            <div key={index} className="bg-blue-50 p-4 rounded-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                                <div className={`w-12 h-12 mx-auto mb-2 ${iconClass} rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110`}>
                                    <span className="font-bold text-lg">{item.item_name.charAt(0).toUpperCase()}</span>
                                </div>
                                <h4 className="font-semibold text-blue-900">{item.item_name}</h4>
                                <p className="text-blue-600 text-sm">{new Date(item.created_at).toLocaleDateString()}</p>
                                <p className="text-gray-600 text-xs mt-1">{item.reporter_name}</p>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center text-blue-600">
                        <p>No recent lost items available</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecentItems;
