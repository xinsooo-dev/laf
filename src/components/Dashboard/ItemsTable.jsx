import { Eye, MapPin, Calendar } from 'lucide-react';

function ItemsTable({ items, type, title, description, emptyMessage, onView }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'claimed': return 'bg-green-100 text-green-800';
            case 'approved': return 'bg-blue-100 text-blue-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getHeaderColor = (type) => {
        switch (type) {
            case 'lost':
                return 'bg-gradient-to-r from-red-600 to-red-700';
            case 'found':
                return 'bg-gradient-to-r from-green-600 to-green-700';
            case 'activity':
                return 'bg-gradient-to-r from-purple-600 to-purple-700';
            default:
                return 'bg-gradient-to-r from-blue-600 to-blue-700';
        }
    };

    const getEmptyIconColor = (type) => {
        return 'text-gray-300';
    };

    const getItemTypeColor = (itemType) => {
        return itemType === 'lost' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600';
    };

    const getButtonColor = (type) => {
        switch (type) {
            case 'lost':
                return 'bg-red-600 hover:bg-red-700';
            case 'found':
                return 'bg-green-600 hover:bg-green-700';
            case 'activity':
                return 'bg-purple-600 hover:bg-purple-700';
            default:
                return 'bg-blue-600 hover:bg-blue-700';
        }
    };

    const getHeaderIcon = (type) => {
        switch (type) {
            case 'lost':
                return (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">!</span>
                    </div>
                );
            case 'found':
                return (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">✓</span>
                    </div>
                );
            case 'activity':
                return (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">📋</span>
                    </div>
                );
            default:
                return (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">📦</span>
                    </div>
                );
        }
    };

    const getTableHeaderColor = (type) => {
        switch (type) {
            case 'lost':
                return 'bg-red-50 border-red-200';
            case 'found':
                return 'bg-green-50 border-green-200';
            case 'activity':
                return 'bg-purple-50 border-purple-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    const getTableHeaderTextColor = (type) => {
        switch (type) {
            case 'lost':
                return 'text-red-900';
            case 'found':
                return 'text-green-900';
            case 'activity':
                return 'text-purple-900';
            default:
                return 'text-blue-900';
        }
    };

    const getRowHoverColor = (type) => {
        switch (type) {
            case 'lost':
                return 'hover:from-red-50 hover:to-transparent';
            case 'found':
                return 'hover:from-green-50 hover:to-transparent';
            case 'activity':
                return 'hover:from-purple-50 hover:to-transparent';
            default:
                return 'hover:from-blue-50 hover:to-transparent';
        }
    };

    const getItemIconColor = (itemType) => {
        return itemType === 'lost' ? 'text-red-600' : 'text-green-600';
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className={`${getHeaderColor(type)} text-white p-4`}>
                <h2 className="text-xl font-bold flex items-center gap-3">
                    {getHeaderIcon(type)}
                    {title} ({items.length})
                </h2>
                {description && (
                    <p className="text-white/80 text-sm mt-1">{description}</p>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className={`${getTableHeaderColor(type)} border-b`}>
                        <tr>
                            <th className={`text-left py-4 px-6 font-semibold ${getTableHeaderTextColor(type)}`}>Item Details</th>
                            <th className={`text-left py-4 px-6 font-semibold ${getTableHeaderTextColor(type)}`}>Type</th>
                            <th className={`text-left py-4 px-6 font-semibold ${getTableHeaderTextColor(type)}`}>Date & Time</th>
                            <th className={`text-left py-4 px-6 font-semibold ${getTableHeaderTextColor(type)}`}>Status</th>
                            <th className={`text-left py-4 px-6 font-semibold ${getTableHeaderTextColor(type)}`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length > 0 ? (
                            items.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className={`border-b border-gray-100 ${getRowHoverColor(type)} transition-all duration-300 transform hover:scale-[1.01] hover:shadow-sm`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-12 h-12 ${getItemTypeColor(item.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                <span className={`${getItemIconColor(item.type)} font-bold text-lg`}>
                                                    {item.itemName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{item.itemName}</h4>
                                                <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                                                {type === 'activity' && (
                                                    <p className="text-gray-500 text-xs mt-1">
                                                        {item.type === 'lost' ? 'Reported as Lost' : 'Reported as Found'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${item.type === 'lost'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-green-100 text-green-800'
                                            }`}>
                                            {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar className="h-4 w-4" />
                                                <span>{item.dateFound}</span>
                                            </div>
                                            <div className="text-gray-500 text-xs mt-1">{item.timeFound}</div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 hover:scale-105 ${getStatusColor(item.status)}`}>
                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onView(item)}
                                                className={`${getButtonColor(type)} text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2`}
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Details
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-12 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className={`w-12 h-12 ${getEmptyIconColor(type)} rounded-full flex items-center justify-center`}>
                                            <span className="text-2xl">📦</span>
                                        </div>
                                        <p className="text-gray-500 font-medium">No items found</p>
                                        <p className="text-gray-400 text-sm">{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                    Total: <span className="font-semibold text-gray-900">{items.length}</span> {items.length === 1 ? 'item' : 'items'}
                </div>
            </div>
        </div>
    );
}

export default ItemsTable;
