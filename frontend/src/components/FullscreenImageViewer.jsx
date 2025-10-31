// src/components/FullscreenImageViewer.jsx
import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { getAssetUrl } from '../utils/api';

function FullscreenImageViewer({ imagePath, itemName, onClose }) {
    const [zoomLevel, setZoomLevel] = useState(1);

    if (!imagePath) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-95 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 hover:bg-opacity-70 p-3 rounded-lg transition-all z-10"
                title="Close Fullscreen"
            >
                <X size={32} />
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
                src={getAssetUrl(imagePath)}
                alt={itemName}
                className="max-w-full max-h-full object-contain"
                style={{
                    transform: `scale(${zoomLevel})`,
                    transition: 'transform 0.2s ease-in-out'
                }}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}

export default FullscreenImageViewer;
