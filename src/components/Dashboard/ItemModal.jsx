import { X, Edit, MapPin, Calendar, User, Eye, Maximize2, Package, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import { getAssetUrl } from '../../utils/api';

const ItemModal = ({ selectedItem, showModal, closeModal }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    if (!showModal || !selectedItem) return null;

    return (
        <>
            {/* Transparent Overlay - Blocks background clicks but keeps it visible */}
            <div
                className="fixed inset-0 z-40"
                style={{ pointerEvents: 'auto' }}
                onClick={(e) => e.stopPropagation()}
            ></div>

            {/* Modal Content */}
            <div
                className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
                <div
                    className={`bg-white rounded-xl shadow-2xl transform transition-all duration-300 scale-100 animate-fade-in flex flex-col pointer-events-auto ${
                        isFullscreen ? 'w-full h-full' : 'max-w-5xl w-[90%] h-[80vh]'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className={`text-white p-4 rounded-t-xl flex-shrink-0 ${selectedItem.type === 'lost'
                        ? 'bg-gradient-to-r from-red-600 to-red-700'
                        : 'bg-gradient-to-r from-green-600 to-green-700'
                        }`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">
                                    {selectedItem.itemName}
                                </h2>
                                <div className="flex items-center space-x-4">
                                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${selectedItem.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {selectedItem.type === 'lost' ? 'Lost Item' : 'Found Item'}
                                    </span>
                                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${selectedItem.status === 'claimed' ? 'bg-blue-100 text-blue-800' :
                                        selectedItem.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            selectedItem.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={closeModal}
                                    className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Modal Body - Landscape Layout */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* Left Side - Image */}
                        <div className={`bg-gray-50 p-6 flex flex-col items-center justify-center border-r border-gray-200 relative ${
                            isFullscreen ? 'w-1/2' : 'w-2/5'
                        }`}>
                            {selectedItem.imagePath && selectedItem.imagePath !== 'NULL' && selectedItem.imagePath !== null && selectedItem.imagePath !== '' ? (
                                <>
                                    <img
                                        src={getAssetUrl(`uploads/${selectedItem.imagePath}`)}
                                        alt={selectedItem.itemName}
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg cursor-pointer"
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                        onError={(e) => {
                                            console.log('Image failed to load:', selectedItem.imagePath);
                                            console.log('Image path exists:', !!selectedItem.imagePath);
                                            console.log('Full selectedItem:', selectedItem);
                                            console.log('Trying alternative path...');
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                    />
                                    <button
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                        className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-lg transition-all z-10"
                                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                                    >
                                        <Maximize2 size={20} />
                                    </button>
                                </>
                            ) : null}
                            <div className={`flex-col items-center justify-center w-full h-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 ${selectedItem.imagePath && selectedItem.imagePath !== 'NULL' && selectedItem.imagePath !== null && selectedItem.imagePath !== '' ? 'hidden' : 'flex'}`}>
                                <Eye className="h-16 w-16 text-gray-400 mb-3" />
                                <p className="text-gray-500 text-lg font-medium">No image attached</p>
                                <p className="text-gray-400 text-sm">Item image not available</p>
                            </div>
                        </div>

                        {/* Fullscreen Image Overlay */}
                        {isFullscreen && selectedItem.imagePath && selectedItem.imagePath !== 'NULL' && selectedItem.imagePath !== null && selectedItem.imagePath !== '' && (
                            <div 
                                className="fixed inset-0 bg-black bg-opacity-95 z-[100] flex items-center justify-center overflow-auto"
                                onClick={() => {
                                    setIsFullscreen(false);
                                    setZoomLevel(1);
                                }}
                            >
                                {/* Close Button */}
                                <button
                                    onClick={() => {
                                        setIsFullscreen(false);
                                        setZoomLevel(1);
                                    }}
                                    className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg transition-all z-[101] shadow-lg border border-gray-600"
                                    title="Exit Fullscreen"
                                >
                                    <X size={24} />
                                </button>

                                {/* Zoom Controls */}
                                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-[101]">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setZoomLevel(prev => Math.max(0.5, prev - 0.25));
                                        }}
                                        className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg transition-all flex items-center gap-2 shadow-lg border border-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed"
                                        title="Zoom Out"
                                        disabled={zoomLevel <= 0.5}
                                    >
                                        <ZoomOut size={20} />
                                        <span className="text-sm font-medium">-</span>
                                    </button>
                                    <div className="bg-gray-800 text-white px-4 py-3 rounded-lg flex items-center shadow-lg border border-gray-600">
                                        <span className="text-sm font-medium">{Math.round(zoomLevel * 100)}%</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setZoomLevel(prev => Math.min(3, prev + 0.25));
                                        }}
                                        className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg transition-all flex items-center gap-2 shadow-lg border border-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed"
                                        title="Zoom In"
                                        disabled={zoomLevel >= 3}
                                    >
                                        <ZoomIn size={20} />
                                        <span className="text-sm font-medium">+</span>
                                    </button>
                                </div>

                                <img
                                    src={getAssetUrl(`uploads/${selectedItem.imagePath}`)}
                                    alt={selectedItem.itemName}
                                    className="object-contain transition-transform duration-200"
                                    style={{ 
                                        transform: `scale(${zoomLevel})`,
                                        maxWidth: '95%',
                                        maxHeight: '95%'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        )}

                        {/* Right Side - Details */}
                        <div className={`p-6 flex flex-col ${
                            isFullscreen ? 'w-1/2' : 'w-3/5'
                        }`}>
                            <div className="flex-1 space-y-4 overflow-y-auto">
                                {/* Description */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                                        <Edit className="h-4 w-4 mr-2 text-blue-600" />
                                        Description
                                    </h3>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        {selectedItem.description || 'No description provided'}
                                    </p>
                                </div>

                                {/* Location & Date */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                                            <MapPin className="h-4 w-4 mr-2 text-red-600" />
                                            Location
                                        </h3>
                                        <p className="text-gray-700 text-sm">
                                            {selectedItem.location || 'Location not specified'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-green-600" />
                                            Date & Time
                                        </h3>
                                        <p className="text-gray-700 text-sm">
                                            {selectedItem.dateFound} at {selectedItem.timeFound}
                                        </p>
                                    </div>
                                </div>

                                {/* Item Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                                        <User className="h-4 w-4 mr-2 text-purple-600" />
                                        Item Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Item ID</p>
                                            <p className="text-gray-800 font-medium text-sm">
                                                #{selectedItem.id}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Status</p>
                                            <p className="text-gray-800 font-medium text-sm">
                                                {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 pt-4 mt-4 border-t border-gray-200">
                                {/* Request Item Button - Only show for lost items that are not rejected, pending, or claimed */}
                                {selectedItem.type === 'lost' && selectedItem.status !== 'rejected' && selectedItem.status !== 'pending' && selectedItem.status !== 'claimed' && (
                                    <button
                                        onClick={() => {
                                            // TODO: Add request item functionality
                                            alert('');
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                                    >
                                        <Package className="h-4 w-4" />
                                        <span>Request Claim</span>
                                    </button>
                                )}

                                <button
                                    onClick={closeModal}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ItemModal;
