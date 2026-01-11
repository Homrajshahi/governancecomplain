import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import './Auth.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Identifier, 2: OTP, 3: New Password
  const [usePhone, setUsePhone] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (usePhone) {
        await api.post('auth/forgot-password-phone/', { phone });
        setSuccess('OTP sent to your phone!');
      } else {
        await api.post('auth/forgot-password/', { email });
        setSuccess('OTP sent to your email!');
      }
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (usePhone) {
        const { data } = await api.post('auth/verify-otp-phone/', { phone, otp });
        setResetToken(data.reset_token);
      } else {
        const { data } = await api.post('auth/verify-otp/', { email, otp });
        setResetToken(data.reset_token);
      }
      setSuccess('OTP verified!');
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (usePhone) {
        await api.post('auth/reset-password-phone/', {
          phone,
          reset_token: resetToken,
          new_password: newPassword
        });
      } else {
        await api.post('auth/reset-password/', {
          email,
          reset_token: resetToken,
          new_password: newPassword
        });
      }
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🔐</div>
          <h1>Digital Complaint Management System</h1>
        </div>

        <form onSubmit={
          step === 1 ? handleRequestOTP : 
          step === 2 ? handleVerifyOTP : 
          handleResetPassword
        } className="auth-form">
          <h2>Reset Password</h2>
          <p className="auth-subtitle">
            {step === 1 && (usePhone ? 'Enter your phone to receive an OTP' : 'Enter your email to receive an OTP')}
            {step === 2 && (usePhone ? 'Enter the OTP sent to your phone' : 'Enter the OTP sent to your email')}
            {step === 3 && 'Create your new password'}
          </p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {step === 1 && (
            <>
              <div className="toggle-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={usePhone}
                    onChange={(e) => setUsePhone(e.target.checked)}
                  />
                  <span>Use phone instead of email</span>
                </label>
              </div>
              {usePhone ? (
                <label>
                  <span>Phone</span>
                  <input
                    type="tel"
                    placeholder="e.g., +9779812345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={loading}
                  />
                </label>
              ) : (
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </label>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <label>
                <span>{usePhone ? 'Phone' : 'Email'}</span>
                <input
                  type={usePhone ? 'tel' : 'email'}
                  value={usePhone ? phone : email}
                  disabled
                  style={{ backgroundColor: '#f0f0f0' }}
                />
              </label>
              <label>
                <span>OTP (6 digits)</span>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength="6"
                  required
                  disabled={loading}
                />
              </label>
              <p className="form-note">Check your {usePhone ? 'phone' : 'email'} for the 6-digit OTP. It will expire in 10 minutes.</p>
            </>
          )}

          {step === 3 && (
            <>
              <label>
                <span>New Password</span>
                <div className="password-input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
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
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
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
            </>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Processing...' : 
              step === 1 ? 'Send OTP' : 
              step === 2 ? 'Verify OTP' : 
              'Reset Password'
            }
          </button>
        </form>

        {step > 1 && (
          <button
            type="button"
            className="btn-back"
            onClick={() => {
              setError('');
              setSuccess('');
              setStep(step - 1);
              if (step === 2) setOtp('');
              if (step === 3) {
                setNewPassword('');
                setConfirmPassword('');
              }
            }}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '10px',
              background: 'transparent',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#2c5aa0'
            }}
          >
            Back
          </button>
        )}

        <div className="auth-footer">
          <p>Remember your password? <Link to="/login">Login here</Link></p>
          <Link to="/">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
