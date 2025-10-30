// Reusable Modal Components for Consistent Design
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

// Success Modal
export const SuccessModal = ({ show, onClose, title = "Success!", message }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 md:p-8 max-w-sm mx-4 shadow-2xl">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <button
                        onClick={onClose}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

// Error Modal
export const ErrorModal = ({ show, onClose, title = "Error", message }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 md:p-8 max-w-sm mx-4 shadow-2xl">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <button
                        onClick={onClose}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

// Confirmation Modal
export const ConfirmModal = ({ show, onClose, onConfirm, title = "Confirm Action", message, confirmText = "Confirm", cancelText = "Cancel", type = "warning" }) => {
    if (!show) return null;

    const colors = {
        warning: {
            bg: 'bg-yellow-100',
            icon: 'text-yellow-600',
            button: 'bg-yellow-600 hover:bg-yellow-700'
        },
        danger: {
            bg: 'bg-red-100',
            icon: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700'
        },
        info: {
            bg: 'bg-blue-100',
            icon: 'text-blue-600',
            button: 'bg-blue-600 hover:bg-blue-700'
        }
    };

    const colorScheme = colors[type] || colors.warning;

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 md:p-8 max-w-sm mx-4 shadow-2xl">
                <div className="text-center">
                    <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${colorScheme.bg} mb-4`}>
                        <AlertCircle className={`h-10 w-10 ${colorScheme.icon}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 ${colorScheme.button} text-white font-semibold py-2 px-4 rounded-lg transition-colors`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Info Modal
export const InfoModal = ({ show, onClose, title = "Information", message }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 md:p-8 max-w-sm mx-4 shadow-2xl">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                        <AlertCircle className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <button
                        onClick={onClose}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};
