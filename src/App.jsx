// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './homepage/HomePage';
import Login from './user/Login';
import Signup from './user/Signup';
import ForgotPassword from './user/ForgotPassword';
import UserDashboard from './components/Dashboard/UserDashboard';
import AdminDashboard from './admin/AdminDashboard';
import AdminLogin from './admin/AdminLogin';
import EmailVerification from './user/EmailVerification';
import NotificationSystem from './components/NotificationSystem';
import './index.css';

function App() {
  return (
    <Router>
      <NotificationSystem />
      <Routes>
        {/* Homepage */}
        <Route path="/" element={<HomePage />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<EmailVerification />} />

        {/* Dashboards */}
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        
        {/* Catch-all route - redirect to homepage */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
