// src/user/Signup.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../utils/api';
import { ArrowLeft } from 'lucide-react';

function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Check if user is already logged in
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            if (userData.isAdmin) {
                navigate('/admin-dashboard', { replace: true });
            } else {
                navigate('/user-dashboard', { replace: true });
            }
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Special handling for student ID
        if (name === 'studentId') {
            // Only allow numbers
            const numbersOnly = value.replace(/[^0-9]/g, '');

            // Format as XXXX-XXXX (max 8 digits)
            let formattedValue = '';
            if (numbersOnly.length > 0) {
                if (numbersOnly.length <= 4) {
                    formattedValue = numbersOnly;
                } else {
                    formattedValue = numbersOnly.slice(0, 4) + '-' + numbersOnly.slice(4, 8);
                }
            }

            setFormData(prev => ({
                ...prev,
                [name]: formattedValue
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.firstName.trim()) {
            alert('First name is required');
            return;
        }

        if (!formData.lastName.trim()) {
            alert('Last name is required');
            return;
        }

        if (!formData.email.trim()) {
            alert('Email is required');
            return;
        }

        // Validate email format and domain
        const emailPattern = /^[^\s@]+@gmail\.com$/;
        if (!emailPattern.test(formData.email)) {
            alert('Please enter a valid Gmail address (must end with @gmail.com)');
            return;
        }

        if (!formData.password.trim()) {
            alert('Password is required');
            return;
        }

        // Password complexity validation
        const hasCapitalLetter = /[A-Z]/.test(formData.password);
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
        const hasNumber = /\d/.test(formData.password);

        if (!hasCapitalLetter) {
            alert('Password must contain at least one capital letter');
            return;
        }

        if (!hasSymbol) {
            alert('Password must contain at least one symbol (!@#$%^&*()_+-=[]{}|;\':".,<>?/)');
            return;
        }

        if (!hasNumber) {
            alert('Password must contain at least one number');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (formData.password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    full_name: `${formData.firstName} ${formData.lastName}`,
                    first_name: formData.firstName,
                    last_name: formData.lastName
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert('Registration successful! Your account is pending approval. You will be notified once approved by an administrator.');
                navigate('/login');
            } else {
                alert('Registration failed: ' + data.message);
            }
        } catch (error) {
            alert('Registration failed: Network error');
        }
    };

    return (
        <div style={{
            backgroundImage: "url('/login_signup_bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
        }}
            className="min-h-screen flex items-center justify-end p-40 bg-gradient-to-r from-blue-400 to-blue-600 animate-fade-in">
            {/* Back to Homepage Button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 z-10"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Homepage
            </button>
            <div className="w-full max-w-lg mr-12 animate-slide-in-right">
                <div className="bg-white rounded-lg shadow-xl p-8 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                    <h2 className="text-3xl font-bold text-blue-800 mb-2 animate-fade-in-up">Sign Up</h2>
                    <p className="text-gray-500 mb-3 animate-fade-in-up animation-delay-200">Create your account</p>

                    <div className="space-y-2 animate-fade-in-up animation-delay-400">
                        <div className="grid grid-cols-2 gap-3 animate-fade-in-up animation-delay-500">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="First name"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-300 hover:shadow-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Last name"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-300 hover:shadow-md"
                                />
                            </div>
                        </div>

                        <div className="animate-fade-in-up animation-delay-600">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="yourname@gmail.com"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-300 hover:shadow-md text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">Must be a valid Gmail address ending with @gmail.com</p>
                        </div>

                        <div className="animate-fade-in-up animation-delay-700">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Create a password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-300 hover:shadow-md text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">Must contain at least one capital letter, one symbol, and one number</p>
                        </div>

                        <div className="animate-fade-in-up animation-delay-800">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm your password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-300 hover:shadow-md text-sm"
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-fade-in-up animation-delay-1200 active:scale-95"
                        >
                            Create Account
                        </button>
                    </div>

                    <div className="mt-6 text-center animate-fade-in-up animation-delay-1300">
                        <p className="text-gray-600">
                            Already have an Account?
                            <button
                                onClick={() => navigate('/login')}
                                className="text-blue-600 hover:text-blue-800 font-medium ml-1 transition-all duration-200 hover:scale-105"
                            >
                                Login
                            </button>
                        </p>
                        <p className="text-gray-600">
                            <button
                                onClick={() => navigate('/forgot-password')}
                                className="text-blue-600 hover:text-blue-800 font-medium transition-all duration-200 hover:scale-105"
                            >
                                Forgot Password?
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;