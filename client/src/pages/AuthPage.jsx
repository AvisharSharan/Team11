import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import ssLogo from '../assets/SS_logo.png';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    login,
    register,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    loading,
    error,
    success,
    user,
    clearError,
    needsVerification,
    verificationEmail,
    cancelVerification,
  } = useAuthStore();

  const isLogin = location.pathname !== '/register';
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData, setRegData] = useState({ name: '', email: '', password: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [resetStep, setResetStep] = useState(null);
  const [resetData, setResetData] = useState({ email: '', code: '', password: '' });

  useEffect(() => {
    if (user) navigate('/chat');
  }, [user, navigate]);

  useEffect(() => {
    clearError();
  }, [location.pathname, clearError]);

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(loginData.email, loginData.password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    await register(regData.name, regData.email, regData.password);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    await verifyEmail(verificationEmail, verificationCode);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    await requestPasswordReset(resetData.email);
    setResetStep('code');
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    await resetPassword(resetData.email, resetData.code, resetData.password);
    setResetStep(null);
    setLoginData({ email: resetData.email, password: '' });
    setResetData({ email: '', code: '', password: '' });
  };

  const navigateTo = (path) => {
    cancelVerification();
    clearError();
    setResetStep(null);
    setResetData({ email: '', code: '', password: '' });
    navigate(path);
  };

  const startForgotPassword = () => {
    clearError();
    setResetData((current) => ({ ...current, email: loginData.email }));
    setResetStep('email');
  };

  const cancelReset = () => {
    clearError();
    setResetStep(null);
    setResetData({ email: '', code: '', password: '' });
  };

  const authSubtitle = needsVerification
    ? 'Verify your email'
    : resetStep === 'email'
      ? 'Reset your password'
      : resetStep === 'code'
        ? 'Enter reset code'
        : isLogin
          ? 'Welcome back'
          : 'Create your account';

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <aside className="auth-hero" aria-hidden="true" />

        <section className="auth-panel">
          <div className="auth-card">
            <div className="auth-logo">
              <img src={ssLogo} alt="SyncSphere logo" className="auth-panel-logo" />
              <h1 className="auth-panel-title">SyncSphere</h1>
              <p className="auth-subtitle">{authSubtitle}</p>
            </div>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            {needsVerification ? (
              <form onSubmit={handleVerifySubmit} className="auth-form">
                <p className="auth-help-text">
                  We've sent a 6-digit code to <strong>{verificationEmail}</strong>. 
                  Please enter it below to verify your account.
                </p>
                <div className="auth-field">
                  <label>Verification Code</label>
                  <input
                    type="text"
                    className="auth-input otp-input"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    maxLength={6}
                    pattern="\d{6}"
                  />
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Verifying…' : 'Verify Email'}
                </button>
                <button type="button" className="auth-link-btn" onClick={cancelVerification}>
                  Back
                </button>
              </form>
            ) : resetStep === 'email' ? (
              <form onSubmit={handleForgotSubmit} className="auth-form">
                <p className="auth-help-text">
                  Enter your account email and we'll send a 6-digit reset code.
                </p>
                <div className="auth-field">
                  <label>Email</label>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={resetData.email}
                    onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Sending code...' : 'Send Reset Code'}
                </button>
                <button type="button" className="auth-link-btn" onClick={cancelReset}>
                  Back to login
                </button>
              </form>
            ) : resetStep === 'code' ? (
              <form onSubmit={handleResetSubmit} className="auth-form">
                <p className="auth-help-text">
                  Enter the reset code sent to <strong>{resetData.email}</strong> and choose a new password.
                </p>
                <div className="auth-field">
                  <label>Reset Code</label>
                  <input
                    type="text"
                    className="auth-input otp-input"
                    placeholder="123456"
                    value={resetData.code}
                    onChange={(e) => setResetData({ ...resetData, code: e.target.value })}
                    required
                    maxLength={6}
                    pattern="\d{6}"
                  />
                </div>
                <div className="auth-field">
                  <label>New Password</label>
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="At least 6 characters"
                    value={resetData.password}
                    onChange={(e) => setResetData({ ...resetData, password: e.target.value })}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button type="button" className="auth-link-btn" onClick={() => setResetStep('email')}>
                  Send code again
                </button>
              </form>
            ) : isLogin ? (
              <form onSubmit={handleLogin} className="auth-form">
                <div className="auth-field">
                  <label>Email</label>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="auth-field">
                  <label>Password</label>
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="Enter password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Signing in…' : 'Login'}
                </button>
                <button type="button" className="auth-link-btn auth-forgot-link" onClick={startForgotPassword}>
                  Forgot password?
                </button>
                <p className="auth-switch">
                  Don't have an account?
                  <button type="button" className="auth-link-btn bold" onClick={() => navigateTo('/register')}>
                    Sign up
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="auth-form">
                <div className="auth-field">
                  <label>Full name</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Your name"
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="auth-field">
                  <label>Email</label>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="auth-field">
                  <label>Password</label>
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="At least 6 characters"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
                <p className="auth-switch">
                  Already have an account?
                  <button type="button" className="auth-link-btn bold" onClick={() => navigateTo('/login')}>
                    Login
                  </button>
                </p>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthPage;
