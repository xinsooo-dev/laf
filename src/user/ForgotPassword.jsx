// src/user/ForgotPassword.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            alert('Please enter your email address');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth.php?action=forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                alert('Password reset link has been sent to your email. Please check your inbox.');
                navigate('/login');
            } else {
                alert(data.message || 'Failed to send reset email. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Network error. Please try again.');
        }
    };

    return (
        <div style={{
            backgroundImage: "url('/login_signup_bg.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
        }}
            className="min-h-screen flex items-center justify-end p-40 bg-gradient-to-r from-blue-400 to-blue-600">
            <div className="w-full max-w-md mr-12">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <h2 className="text-3xl font-bold text-blue-800 mb-2">Forgot Password</h2>
                    <p className="text-gray-500 mb-6">Enter your email to reset your password</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                            />
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> We'll send you an email with a link to reset your password.
                                Please check your inbox and spam folder.
                            </p>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                        >
                            Send Reset Link
                        </button>
                    </div>

                    <div className="mt-6 text-center space-y-2">
                        <p className="text-gray-600">Remember your password?
                            <button
                                onClick={() => navigate('/login')}
                                className="text-blue-600 hover:text-blue-800 font-medium ml-1"
                            >
                                Back to Login
                            </button>
                        </p>
                        <p className="text-gray-600">Don't have an account?
                            <button
                                onClick={() => navigate('/signup')}
                                className="text-blue-600 hover:text-blue-800 font-medium ml-1"
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

export default ForgotPassword;