import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, Leaf } from 'lucide-react';

const loginStyles = `
  .login-page {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 100vh;
    background-color: var(--bg-app);
  }

  .login-panel-left {
    position: relative;
    background: linear-gradient(145deg, hsl(162,60%,20%) 0%, hsl(162,84%,25%) 45%, hsl(180,70%,22%) 100%);
    padding: 60px 52px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
  }

  .login-panel-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 48px;
  }

  .panel-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    color: rgba(255,255,255,0.92);
    font-family: var(--font-heading);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .panel-tagline h1 {
    font-family: var(--font-heading);
    font-size: clamp(26px, 3vw, 38px);
    font-weight: 800;
    color: #ffffff;
    line-height: 1.15;
    letter-spacing: -0.03em;
    margin-bottom: 18px;
    background: none;
    -webkit-text-fill-color: unset;
  }

  .panel-tagline p {
    font-size: 15px;
    line-height: 1.7;
    color: rgba(255,255,255,0.65);
    max-width: 360px;
    font-weight: 400;
  }

  .panel-stats {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.12);
  }

  .panel-stat { display: flex; flex-direction: column; gap: 3px; }

  .panel-stat strong {
    font-family: var(--font-heading);
    font-size: 18px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.02em;
  }

  .panel-stat span {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .login-orb {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 1;
  }

  .login-orb-1 {
    width: 380px; height: 380px;
    top: -120px; right: -100px;
    background: radial-gradient(circle, rgba(0,242,254,0.08) 0%, transparent 70%);
  }

  .login-orb-2 {
    width: 300px; height: 300px;
    bottom: -80px; left: -60px;
    background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%);
  }

  .login-panel-right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 48px;
    background-color: var(--bg-app);
  }

  .login-form-wrapper {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .login-mobile-brand {
    display: none;
    align-items: center;
    gap: 10px;
    font-family: var(--font-heading);
    font-size: 17px;
    font-weight: 800;
    color: var(--text-heading);
    letter-spacing: -0.02em;
  }

  .login-mobile-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--primary-emerald), var(--accent-mint));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .login-form-header { display: flex; flex-direction: column; gap: 8px; }

  .login-form-header h2 {
    font-family: var(--font-heading);
    font-size: 28px;
    font-weight: 800;
    color: var(--text-heading);
    letter-spacing: -0.03em;
    line-height: 1.1;
    background: none;
    -webkit-text-fill-color: unset;
  }

  .login-form-header p {
    font-size: 14px;
    color: var(--text-muted);
    font-weight: 500;
    line-height: 1.5;
  }

  .login-alert { margin-bottom: 0; }

  .login-form { display: flex; flex-direction: column; gap: 20px; }

  .login-input-group { display: flex; flex-direction: column; gap: 8px; }

  .login-input-group label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
  }

  .login-input-wrapper { position: relative; display: flex; align-items: center; }

  .login-input-icon {
    position: absolute;
    left: 16px;
    color: var(--text-muted);
    pointer-events: none;
    z-index: 1;
  }

  .login-input-wrapper input {
    width: 100%;
    padding: 14px 16px 14px 44px;
    border-radius: 16px;
    border: 1px solid var(--border-subtle);
    background-color: var(--bg-card);
    color: var(--text-main);
    font-family: var(--font-family);
    font-size: 14px;
    font-weight: 500;
    outline: none;
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .login-input-wrapper input:focus {
    border-color: var(--primary-emerald);
    box-shadow: 0 0 0 4px rgba(16,233,129,0.15);
    background-color: var(--bg-secondary);
  }

  .login-input-wrapper input.input-error {
    border-color: #ef4444;
    box-shadow: 0 0 0 4px rgba(239,68,68,0.1);
  }

  .login-input-wrapper input::placeholder {
    color: var(--text-muted);
    font-weight: 400;
    opacity: 0.6;
  }

  .login-input-wrapper input:disabled { opacity: 0.6; cursor: not-allowed; }

  .login-toggle-password {
    position: absolute;
    right: 14px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 6px;
    transition: color 0.2s ease;
  }

  .login-toggle-password:hover { color: var(--text-heading); }

  .login-submit-btn {
    width: 100%;
    margin-top: 4px;
    padding: 15px 24px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.01em;
    transition: all 0.3s cubic-bezier(0.25,0.8,0.25,1);
  }

  .login-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none !important; }

  .login-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: loginSpinAnim 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes loginSpinAnim { to { transform: rotate(360deg); } }

  .login-footer-note {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.7;
    text-align: center;
  }

  .login-footer-note a {
    color: var(--primary-emerald);
    font-weight: 700;
    text-decoration: none;
    transition: opacity 0.2s ease;
  }

  .login-footer-note a:hover { opacity: 0.8; }

  @media (max-width: 900px) {
    .login-page { grid-template-columns: 1fr; }
    .login-panel-left { display: none; }
    .login-panel-right { padding: 60px 24px 40px; align-items: flex-start; }
    .login-form-wrapper { max-width: 100%; }
    .login-mobile-brand { display: flex; }
  }

  @media (max-width: 480px) {
    .login-panel-right { padding: 36px 20px; }
    .login-form-header h2 { font-size: 24px; }
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Email dan password wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setLocalError(result.error);
    }
  };

  return (
    <>
      <style>{loginStyles}</style>
      <div className="login-page">
        {/* Left decorative panel */}
        <div className="login-panel-left">
          <div className="login-panel-content">
            <div className="panel-brand">
              <Leaf size={28} strokeWidth={1.8} />
              <span>Smart Farm</span>
            </div>
            <div className="panel-tagline">
              <h1>Pertenak cerdas dimulai dari sini.</h1>
              <p>Kelola pengguna, atur hak akses, dan pantau sistem farm Anda dari satu dasbor terpusat.</p>
            </div>
            <div className="panel-stats">
              <div className="panel-stat">
                <strong>99.9%</strong>
                <span>Uptime sistem</span>
              </div>
              <div className="panel-stat">
                <strong>Real-time</strong>
                <span>Monitoring sensor</span>
              </div>
              <div className="panel-stat">
                <strong>End-to-end</strong>
                <span>Enkripsi data</span>
              </div>
            </div>
          </div>
          <div className="login-orb login-orb-1" aria-hidden="true" />
          <div className="login-orb login-orb-2" aria-hidden="true" />
        </div>

        {/* Right form panel */}
        <div className="login-panel-right">
          <div className="login-form-wrapper">
            {/* Mobile brand */}
            <div className="login-mobile-brand">
              <div className="login-mobile-icon">
                <Leaf size={20} strokeWidth={2} />
              </div>
              <span>Smart Farm</span>
            </div>

            <div className="login-form-header">
              <h2>Selamat datang kembali</h2>
              <p>Masuk untuk melanjutkan ke dasbor admin</p>
            </div>

            {localError && (
              <div className="alert-banner login-alert">
                <AlertCircle size={16} strokeWidth={2} />
                <span>{localError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              <div className="input-group login-input-group">
                <label htmlFor="email">Alamat Email</label>
                <div className="login-input-wrapper">
                  <Mail size={16} strokeWidth={2} className="login-input-icon" aria-hidden="true" />
                  <input
                    type="email"
                    id="email"
                    placeholder="admin@smartfarm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className={localError ? 'input-error' : ''}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="input-group login-input-group">
                <label htmlFor="password">Password</label>
                <div className="login-input-wrapper">
                  <Lock size={16} strokeWidth={2} className="login-input-icon" aria-hidden="true" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className={localError ? 'input-error' : ''}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    tabIndex={-1}
                  >
                    {showPassword
                      ? <EyeOff size={16} strokeWidth={2} />
                      : <Eye size={16} strokeWidth={2} />
                    }
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-action-primary login-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="login-spinner" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dasbor</span>
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>

            <p className="login-footer-note">
              Belum punya akun? <Link to="/register">Daftar di sini</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;