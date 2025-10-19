// src/admin/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User } from 'lucide-react';

function AdminLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simple admin validation (replace with real authentication)
        if (formData.username === 'admin' && formData.password === 'admin123') {
            console.log('Admin login successful:', formData);
            navigate('/admin-dashboard');
        } else {
            alert('Invalid admin credentials! Use username: admin, password: admin123');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                            <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Admin Portal</h1>
                        <p className="text-sm sm:text-base text-gray-600">NC Lost & Found System</p>
                        <div className="w-20 h-1 bg-blue-600 mx-auto mt-3 rounded-full"></div>
                    </div>

                    {/* Login Form */}
                    <div className="space-y-4 sm:space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Enter admin username"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter admin password"
                                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? '👁️' : '🔒'}
                                </button>
                            </div>
                        </div>

                        {/* Demo Credentials Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2">Demo Credentials:</h4>
                            <p className="text-sm text-blue-700">
                                <strong>Username:</strong> admin<br />
                                <strong>Password:</strong> admin123
                            </p>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                        >
                            <Shield size={20} />
                            Access Admin Panel
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="text-center space-y-3">
                            <button
                                onClick={() => navigate('/')}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                                ← Back to Homepage
                            </button>

                            <div className="text-xs text-gray-500">
                                <p>Authorized personnel only</p>
                                <p>© 2025 Norzagaray College</p>
                            </div>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start">
                            <div className="text-yellow-600 mr-2">⚠️</div>
                            <div className="text-xs text-yellow-800">
                                <strong>Security Notice:</strong> All admin activities are logged and monitored for security purposes.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Security Features */}
                <div className="mt-6 text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
                        🔒 Secured by SSL Encryption
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;