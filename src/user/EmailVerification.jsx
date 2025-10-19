import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../utils/api';
import { CheckCircle, XCircle, Mail, Clock } from 'lucide-react';

const EmailVerification = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');
    const token = searchParams.get('token');

    useEffect(() => {
        if (token) {
            verifyEmail(token);
        } else {
            setStatus('error');
            setMessage('Invalid verification link');
        }
    }, [token]);

    const verifyEmail = async (verificationToken) => {
        try {
            const response = await fetch(API_ENDPOINTS.EMAIL.VERIFY, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: verificationToken })
            });

            const data = await response.json();
            
            if (data.success) {
                setStatus('success');
                setMessage(data.message);
            } else {
                setStatus('error');
                setMessage(data.message);
            }
        } catch (error) {
            setStatus('error');
            setMessage('Network error occurred. Please try again.');
        }
    };

    const handleGoToLogin = () => {
        navigate('/login');
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('/src/assets/login_signup_bg.jpeg')` }}
        >
            <div className="w-full max-w-md">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8 border border-white/20">
                    <div className="text-center">
                        {status === 'verifying' && (
                            <>
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email</h2>
                                <p className="text-gray-600">Please wait while we verify your email address...</p>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
                                <p className="text-gray-600 mb-6">{message}</p>
                                
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-center">
                                        <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-yellow-800">Pending Admin Approval</p>
                                            <p className="text-sm text-yellow-700">
                                                Your account is now awaiting approval from our administrators. 
                                                You'll receive an email notification once approved.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGoToLogin}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                                >
                                    Go to Login
                                </button>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
                                <p className="text-gray-600 mb-6">{message}</p>
                                
                                <div className="space-y-3">
                                    <button
                                        onClick={handleGoToLogin}
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                                    >
                                        Go to Login
                                    </button>
                                    <button
                                        onClick={() => navigate('/signup')}
                                        className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-200"
                                    >
                                        Sign Up Again
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="text-center mt-6">
                    <div className="flex items-center justify-center space-x-2 text-white/80">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">Lost & Found System - Email Verification</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;
