import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import TrackComplaints from './pages/TrackComplaints';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function PrivateRoute({ element, requiredRole = null }) {
  const token = localStorage.getItem('accessToken');
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && requiredRole) {
      // Could fetch role from API, but for now check if it's stored
      const storedRole = localStorage.getItem('userRole');
      setUserRole(storedRole || 'user');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token, requiredRole]);

  if (!token) return <Navigate to="/login" />;
  if (requiredRole && loading) return <div>Loading...</div>;
  if (requiredRole && userRole !== requiredRole) return <Navigate to="/dashboard" />;
  
  return element;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
        <Route path="/submit" element={<PrivateRoute element={<SubmitComplaint />} requiredRole="user" />} />
        <Route path="/track" element={<PrivateRoute element={<TrackComplaints />} requiredRole="user" />} />
        <Route path="/admin" element={<PrivateRoute element={<AdminPanel />} requiredRole="admin" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
