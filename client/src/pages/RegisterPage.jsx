import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const { register, verifyEmail, loading, error, user, clearError, needsVerification, verificationEmail, cancelVerification } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/chat');
  }, [user, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleVerifyChange = (e) => setVerificationCode(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(formData.name, formData.email, formData.password);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    await verifyEmail(verificationEmail, verificationCode);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">💬</span>
          <h1>SyncSphere</h1>
          <p>{needsVerification ? 'Verify your email' : 'Create your account'}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {needsVerification ? (
          <form onSubmit={handleVerifySubmit} className="auth-form">
            <p className="auth-help-text">
              We've sent a 6-digit code to <strong>{verificationEmail}</strong>. 
              Please enter it below to verify your account.
            </p>
            <div className="form-group">
              <label htmlFor="code">Verification Code</label>
              <input
                id="code"
                type="text"
                name="code"
                placeholder="123456"
                value={verificationCode}
                onChange={handleVerifyChange}
                required
                maxLength={6}
                pattern="\d{6}"
                className="otp-input"
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify Email'}
            </button>
            <button type="button" className="auth-link-btn" onClick={cancelVerification}>
              Back to Registration
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
