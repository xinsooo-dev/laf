// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './homepage/HomePage';
import AdminDashboard from './admin/AdminDashboard';
import AdminLogin from './admin/AdminLogin';
import NotificationSystem from './components/NotificationSystem';
import './index.css';

function App() {
  return (
    <Router>
      <NotificationSystem />
      <Routes>
        {/* Public Homepage - View Only */}
        <Route path="/" element={<HomePage />} />
        <Route path="/homepage" element={<HomePage />} />

        {/* Admin Only Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
        
        {/* Catch-all route - redirect to homepage */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
