import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('auth/login/', { username: email, password });
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('user', email);
      
      // Fetch user profile to get role
      try {
        const profileRes = await api.get('me/', {
          headers: { Authorization: `Bearer ${data.access}` }
        });
        localStorage.setItem('userRole', profileRes.data.role || 'user');
      } catch (err) {
        localStorage.setItem('userRole', 'user');
      }
      
      navigate('/dashboard');
    } catch (err) {
      // Log full error for debugging
      console.error('Login error:', err?.response?.data || err?.message);
      
      let errorMsg = 'Login failed. Please check your credentials.';
      const data = err?.response?.data;
      
      if (data?.detail) {
        errorMsg = data.detail;
      } else if (typeof data === 'string') {
        errorMsg = data;
      } else if (err?.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">📋</div>
          <h1>Digital Complaint Management System</h1>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <h2>Login</h2>
          <p className="auth-subtitle">Enter your credentials to access your account</p>

          {error && <div className="error-message">{error}</div>}

          <label>
            <span>Username or Email</span>
            <input
              type="text"
              placeholder="Enter username or email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            <span>Password</span>
            <div className="password-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </label>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="forgot-password-link" style={{ textAlign: 'center', marginTop: '15px' }}>
            <Link to="/forgot-password" style={{ color: '#2c5aa0', fontSize: '14px', textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </div>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
          <Link to="/">Back to home</Link>
        </div>

        <div className="demo-box">
          <h4>Demo Credentials:</h4>
          <p><strong>Regular User:</strong> user@example.com</p>
          <p><strong>Admin (Bhaktapur - Electricity):</strong> bhaktapur_electric_admin</p>
          <p><strong>Password (All):</strong> Admin@123</p>
        </div>
      </div>
    </div>
  );
}
