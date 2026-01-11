import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await api.post('auth/register/', {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });
      navigate('/login');
    } catch (err) {
      // Log full error for debugging
      console.error('Registration error:', err?.response?.data || err?.message);
      
      // Extract error message from various possible response formats
      let errorMsg = 'Registration failed';
      const data = err?.response?.data;
      
      if (data?.detail) {
        errorMsg = data.detail;
      } else if (data?.email) {
        errorMsg = Array.isArray(data.email) ? data.email[0] : data.email;
      } else if (data?.password) {
        errorMsg = Array.isArray(data.password) ? data.password[0] : data.password;
      } else if (data?.non_field_errors) {
        errorMsg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
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

        <form onSubmit={handleRegister} className="auth-form">
          <h2>Register</h2>
          <p className="auth-subtitle">Create an account to submit and track complaints</p>

          {error && <div className="error-message">{error}</div>}

          <label>
            <span>Full Name</span>
            <input
              type="text"
              name="full_name"
              placeholder="John Doe"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Password</span>
            <div className="password-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
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

          <label>
            <span>Confirm Password</span>
            <div className="password-input-group">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </label>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
          <Link to="/">Back to home</Link>
        </div>

        <div className="benefits-box">
          <h4>By registering, you can:</h4>
          <ul>
            <li>Submit complaints online</li>
            <li>Track complaint status in real-time</li>
            <li>View resolution history</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
