// src/user/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { API_ENDPOINTS } from '../utils/api';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Check if user is already logged in
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            console.log('User data from localStorage:', userData);
            if (userData.isAdmin) {
                console.log('User is admin, redirecting to admin dashboard');
                navigate('/admin-dashboard', { replace: true });
            } else {
                console.log('User is regular user, redirecting to user dashboard');
                navigate('/user-dashboard', { replace: true });
            }
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (data.success) {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify({
                    id: data.user.id,
                    email: data.user.email,
                    fullName: data.user.full_name,
                    isAdmin: !!data.user.is_admin, // Convert to boolean
                    dashboard: data.user.is_admin ? 'admin' : 'user'
                }));

                // Show confirmation dialog
                const userType = data.user.is_admin ? 'Admin' : 'User';
                const confirmed = window.confirm(`Login successful! Welcome ${data.user.full_name}.\n\nClick OK to continue to ${userType} Dashboard.`);

                if (confirmed) {
                    // Redirect based on user type
                    if (data.user.is_admin) {
                        console.log('Redirecting to admin dashboard...');
                        navigate('/admin-dashboard', { replace: true });
                    } else {
                        console.log('Redirecting to user dashboard...');
                        navigate('/user-dashboard', { replace: true });
                    }
                } else {
                    // User cancelled, redirect anyway after a short delay
                    setTimeout(() => {
                        if (data.user.is_admin) {
                            navigate('/admin-dashboard', { replace: true });
                        } else {
                            navigate('/user-dashboard', { replace: true });
                        }
                    }, 1000);
                }
            } else {
                setError(data.message || 'Login failed');
                window.showNotification && window.showNotification('Login failed', 'error', 3000);
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Network error. Please try again.');
            window.showNotification && window.showNotification('Network error occurred', 'error', 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            backgroundImage: "url('/login_signup_bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
        }}
            className="min-h-screen flex items-center justify-center lg:justify-end p-4 sm:p-6 md:p-12 lg:p-40 bg-gradient-to-r from-blue-400 to-blue-600 animate-fade-in">
            {/* Back to Homepage Button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 z-10 text-sm sm:text-base"
            >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Homepage</span>
                <span className="sm:hidden">Back</span>
            </button>
            <div className="w-full max-w-md lg:mr-12 animate-slide-in-right">
                <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-2 animate-fade-in-up">Login</h2>
                    <p className="text-sm sm:text-base text-gray-500 mb-6 animate-fade-in-up animation-delay-200">Enter your account details</p>

                    <form className="space-y-4 animate-fade-in-up animation-delay-400" onSubmit={handleSubmit}>
                        <div className="animate-fade-in-up animation-delay-500">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-300 hover:shadow-md focus:scale-105"
                            />
                        </div>

                        <div className="animate-fade-in-up animation-delay-600">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Password"
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-300 hover:shadow-md focus:scale-105"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="text-right animate-fade-in-up animation-delay-700">
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-sm text-blue-600 hover:text-blue-800 transition-all duration-200 hover:scale-105"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-fade-in-up">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-fade-in-up animation-delay-800 active:scale-95 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="mt-6 text-center animate-fade-in-up animation-delay-900">
                        <p className="text-gray-600">
                            Don't have an Account?
                            <button
                                onClick={() => navigate('/signup')}
                                className="text-blue-600 hover:text-blue-800 font-medium ml-1 transition-all duration-200 hover:scale-105"
                            >
                                Sign Up
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
