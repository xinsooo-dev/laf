// src/components/ItemCard.jsx
import React from 'react';
import { Eye, RotateCcw, Trash2, CheckCircle, Archive, MapPin, Calendar, User } from 'lucide-react';
import { getAssetUrl } from '../utils/api';

function ItemCard({ 
    item, 
    onView, 
    onRestore, 
    onDelete, 
    onClaim, 
    onArchive,
    showRestore = false,
    showDelete = false,
    showClaim = false,
    showArchive = false,
    isArchived = false
}) {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-4 border-gray-400">
            {/* Item Image */}
            <div className="h-40 md:h-48 lg:h-52 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                {(item.image_path || item.image_url || item.imagePath) ? (
                    <img
                        src={getAssetUrl(item.image_path || item.image_url || item.imagePath)}
                        alt={item.item_name || item.itemName}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                            e.target.parentElement.innerHTML = '<div class="text-center text-gray-400"><div class="text-4xl mb-2">📦</div><p class="text-sm">No Image</p></div>';
                        }}
                    />
                ) : (
                    <div className="text-center text-gray-400">
                        <div className="text-4xl mb-2">📦</div>
                        <p className="text-sm">No Image</p>
                    </div>
                )}
                {/* Status Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'claimed' || item.status?.toLowerCase() === 'claimed'
                        ? 'bg-purple-100 text-purple-800'
                        : (item.type === 'lost' || item.type?.toLowerCase() === 'lost' || item.status === 'lost' || item.status?.toLowerCase() === 'lost')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                }`}>
                    {isArchived ? 'Archived' : (item.status === 'claimed' ? 'Claimed' : (item.type === 'lost' || item.status === 'lost' ? 'Lost' : 'Found'))}
                </div>
            </div>

            {/* Item Details */}
            <div className="p-3 md:p-4">
                <h3 className="font-bold text-sm md:text-lg text-gray-800 mb-1 md:mb-2 truncate">
                    {item.item_name || item.itemName}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3 overflow-hidden"
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                    }}>
                    {item.description}
                </p>

                <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1 md:gap-2">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                        <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                        <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                        <span className="truncate text-xs">
                            {item.date_reported ? new Date(item.date_reported.replace(' ', 'T')).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            }) : (item.created_at ? new Date(item.created_at.replace(' ', 'T')).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            }) : 'N/A')}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                        <User className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                        <span className="truncate">
                            {(item.status?.toLowerCase() === 'found' || item.type?.toLowerCase() === 'found') 
                                ? `Found by: ${item.finder_name || item.reporter_name || item.reportedBy || item.full_name || 'Unknown'}`
                                : `${item.type === 'lost' || item.status === 'lost' ? 'Lost' : 'Found'} by: ${item.reporter_name || item.reportedBy || item.full_name || 'Unknown'}`
                            }
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                    {/* View Details Button - Always Full Width */}
                    <button
                        onClick={() => onView(item)}
                        className="w-full px-2 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 group"
                    >
                        <Eye className="h-3 w-3 group-hover:scale-110 transition-transform" />
                        <span>View Details</span>
                    </button>

                    {/* Action Buttons Row */}
                    {(showRestore || showDelete || showClaim || showArchive) && (
                        <div className="flex gap-2">
                            {showRestore && onRestore && (
                                <button
                                    onClick={() => onRestore(item.id)}
                                    className="flex-1 px-2 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 group"
                                >
                                    <RotateCcw className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                    <span>Restore</span>
                                </button>
                            )}
                            
                            {showClaim && onClaim && (
                                <button
                                    onClick={() => onClaim(item)}
                                    disabled={!(item.status?.toLowerCase() === 'found' || item.type?.toLowerCase() === 'found')}
                                    className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 group ${
                                        (item.status?.toLowerCase() === 'found' || item.type?.toLowerCase() === 'found')
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md cursor-pointer'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                                    }`}
                                    title={!(item.status?.toLowerCase() === 'found' || item.type?.toLowerCase() === 'found') ? 'Item must be marked as Found first' : ''}
                                >
                                    <CheckCircle className="h-3 w-3" />
                                    <span>Mark as Claimed</span>
                                </button>
                            )}
                            
                            {showArchive && onArchive && (
                                <button
                                    onClick={() => onArchive(item.id)}
                                    className={`px-2 py-1.5 text-xs font-medium bg-gray-600 text-white rounded-md hover:bg-gray-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 group ${
                                        !showClaim ? 'flex-1' : 'w-full'
                                    }`}
                                    title="Move item to archive section"
                                >
                                    <Archive className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                    <span>Archive</span>
                                </button>
                            )}
                            
                            {showDelete && onDelete && (
                                <button
                                    onClick={() => onDelete(item.id)}
                                    className="flex-1 px-2 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 group"
                                >
                                    <Trash2 className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                    <span>Delete</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ItemCard;
