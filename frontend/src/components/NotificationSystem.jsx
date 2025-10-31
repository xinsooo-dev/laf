import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationSystem = () => {
    const [notifications, setNotifications] = useState([]);

    // Add notification function
    const addNotification = (message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        const notification = {
            id,
            message,
            type, // 'success', 'error', 'warning', 'info'
            duration
        };

        setNotifications(prev => [...prev, notification]);

        // Auto remove notification after duration
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    };

    // Remove notification function
    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    // Expose addNotification globally
    useEffect(() => {
        window.showNotification = addNotification;
        return () => {
            delete window.showNotification;
        };
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getBackgroundColor = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`${getBackgroundColor(notification.type)} border rounded-lg p-4 shadow-lg transform transition-all duration-300 ease-in-out animate-slide-in`}
                >
                    <div className="flex items-start space-x-3">
                        {getIcon(notification.type)}
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                                {notification.message}
                            </p>
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationSystem;
