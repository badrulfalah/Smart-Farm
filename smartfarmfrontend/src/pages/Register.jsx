import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, MapPin, ArrowRight, Eye, EyeOff, AlertCircle, Leaf } from 'lucide-react';

const registerStyles = `
  .register-page {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 100vh;
    background-color: var(--bg-app);
  }

  .register-panel-left {
    position: relative;
    background: linear-gradient(145deg, hsl(162,60%,20%) 0%, hsl(162,84%,25%) 45%, hsl(180,70%,22%) 100%);
    padding: 60px 52px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
  }

  .register-panel-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 48px;
  }

  .register-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    color: rgba(255,255,255,0.92);
    font-family: var(--font-heading);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .register-tagline h1 {
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

  .register-tagline p {
    font-size: 15px;
    line-height: 1.7;
    color: rgba(255,255,255,0.65);
    max-width: 360px;
    font-weight: 400;
  }

  .register-features {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.12);
  }

  .register-feature { display: flex; flex-direction: column; gap: 3px; }

  .register-feature strong {
    font-family: var(--font-heading);
    font-size: 18px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.02em;
  }

  .register-feature span {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .register-orb {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 1;
  }

  .register-orb-1 {
    width: 380px; height: 380px;
    top: -120px; right: -100px;
    background: radial-gradient(circle, rgba(0,242,254,0.08) 0%, transparent 70%);
  }

  .register-orb-2 {
    width: 300px; height: 300px;
    bottom: -80px; left: -60px;
    background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%);
  }

  .register-panel-right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 48px;
    background-color: var(--bg-app);
    overflow-y: auto;
  }

  .register-form-wrapper {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .register-mobile-brand {
    display: none;
    align-items: center;
    gap: 10px;
    font-family: var(--font-heading);
    font-size: 17px;
    font-weight: 800;
    color: var(--text-heading);
    letter-spacing: -0.02em;
  }

  .register-mobile-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--primary-emerald), var(--accent-mint));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .register-form-header { display: flex; flex-direction: column; gap: 8px; }

  .register-form-header h2 {
    font-family: var(--font-heading);
    font-size: 28px;
    font-weight: 800;
    color: var(--text-heading);
    letter-spacing: -0.03em;
    line-height: 1.1;
    background: none;
    -webkit-text-fill-color: unset;
  }

  .register-form-header p {
    font-size: 14px;
    color: var(--text-muted);
    font-weight: 500;
    line-height: 1.5;
  }

  .register-alert { margin-bottom: 0; }

  .register-form { display: flex; flex-direction: column; gap: 20px; }

  .register-input-group { display: flex; flex-direction: column; gap: 8px; }

  .register-input-group label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
  }

  .register-input-wrapper { position: relative; display: flex; align-items: center; }

  .register-input-icon {
    position: absolute;
    left: 16px;
    color: var(--text-muted);
    pointer-events: none;
    z-index: 1;
  }

  .register-input-wrapper input {
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

  .register-input-wrapper input:focus {
    border-color: var(--primary-emerald);
    box-shadow: 0 0 0 4px rgba(16,233,129,0.15);
    background-color: var(--bg-secondary);
  }

  .register-input-wrapper input.input-error {
    border-color: #ef4444;
    box-shadow: 0 0 0 4px rgba(239,68,68,0.1);
  }

  .register-input-wrapper input::placeholder {
    color: var(--text-muted);
    font-weight: 400;
    opacity: 0.6;
  }

  .register-input-wrapper input:disabled { opacity: 0.6; cursor: not-allowed; }

  .register-toggle-password {
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

  .register-toggle-password:hover { color: var(--text-heading); }

  .register-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .register-submit-btn {
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

  .register-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none !important; }

  .register-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: registerSpinAnim 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes registerSpinAnim { to { transform: rotate(360deg); } }

  .register-footer-note {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.7;
    text-align: center;
  }

  .register-footer-note a {
    color: var(--primary-emerald);
    font-weight: 700;
    text-decoration: none;
    transition: opacity 0.2s ease;
  }

  .register-footer-note a:hover { opacity: 0.8; }

  @media (max-width: 900px) {
    .register-page { grid-template-columns: 1fr; }
    .register-panel-left { display: none; }
    .register-panel-right { padding: 60px 24px 40px; align-items: flex-start; }
    .register-form-wrapper { max-width: 100%; }
    .register-mobile-brand { display: flex; }
    .register-row { grid-template-columns: 1fr; }
  }

  @media (max-width: 480px) {
    .register-panel-right { padding: 36px 20px; }
    .register-form-header h2 { font-size: 24px; }
  }
`;

const Register = () => {
  const [form, setForm] = useState({
    nama_lengkap: '',
    email: '',
    no_hp: '',
    alamat: '',
    password: '',
    password_confirmation: '',
  });
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!form.nama_lengkap || !form.email || !form.password || !form.password_confirmation) {
      setLocalError('Nama lengkap, email, password, dan konfirmasi password wajib diisi.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setLocalError('Format email tidak valid.');
      return;
    }

    if (form.password.length < 8) {
      setLocalError('Password minimal 8 karakter.');
      return;
    }

    if (form.password !== form.password_confirmation) {
      setLocalError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(form);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setLocalError(result.error);
    }
  };

  return (
    <>
      <style>{registerStyles}</style>
      <div className="register-page">
        <div className="register-panel-left">
          <div className="register-panel-content">
            <div className="register-brand">
              <Leaf size={28} strokeWidth={1.8} />
              <span>Smart Farm</span>
            </div>
            <div className="register-tagline">
              <h1>Bergabung dengan Smart Farm.</h1>
              <p>Daftarkan akun Anda untuk mulai mengelola peternakan secara cerdas dan efisien.</p>
            </div>
            <div className="register-features">
              <div className="register-feature">
                <strong>Gratis</strong>
                <span>Pendaftaran akun</span>
              </div>
              <div className="register-feature">
                <strong>Real-time</strong>
                <span>Monitoring sensor</span>
              </div>
              <div className="register-feature">
                <strong>End-to-end</strong>
                <span>Enkripsi data</span>
              </div>
            </div>
          </div>
          <div className="register-orb register-orb-1" aria-hidden="true" />
          <div className="register-orb register-orb-2" aria-hidden="true" />
        </div>

        <div className="register-panel-right">
          <div className="register-form-wrapper">
            <div className="register-mobile-brand">
              <div className="register-mobile-icon">
                <Leaf size={20} strokeWidth={2} />
              </div>
              <span>Smart Farm</span>
            </div>

            <div className="register-form-header">
              <h2>Buat akun baru</h2>
              <p>Isi data berikut untuk mendaftar ke Smart Farm</p>
            </div>

            {localError && (
              <div className="alert-banner register-alert">
                <AlertCircle size={16} strokeWidth={2} />
                <span>{localError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form" noValidate>
              <div className="input-group register-input-group">
                <label htmlFor="nama_lengkap">Nama Lengkap</label>
                <div className="register-input-wrapper">
                  <User size={16} strokeWidth={2} className="register-input-icon" aria-hidden="true" />
                  <input
                    type="text"
                    id="nama_lengkap"
                    name="nama_lengkap"
                    placeholder="Masukkan nama lengkap"
                    value={form.nama_lengkap}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={localError ? 'input-error' : ''}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="input-group register-input-group">
                <label htmlFor="email">Alamat Email</label>
                <div className="register-input-wrapper">
                  <Mail size={16} strokeWidth={2} className="register-input-icon" aria-hidden="true" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="contoh@smartfarm.com"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={localError ? 'input-error' : ''}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="register-row">
                <div className="input-group register-input-group">
                  <label htmlFor="no_hp">No. HP <span style={{ opacity: 0.5, textTransform: 'none' }}>(opsional)</span></label>
                  <div className="register-input-wrapper">
                    <Phone size={16} strokeWidth={2} className="register-input-icon" aria-hidden="true" />
                    <input
                      type="tel"
                      id="no_hp"
                      name="no_hp"
                      placeholder="08xxxxxxxxxx"
                      value={form.no_hp}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="input-group register-input-group">
                  <label htmlFor="alamat">Alamat <span style={{ opacity: 0.5, textTransform: 'none' }}>(opsional)</span></label>
                  <div className="register-input-wrapper">
                    <MapPin size={16} strokeWidth={2} className="register-input-icon" aria-hidden="true" />
                    <input
                      type="text"
                      id="alamat"
                      name="alamat"
                      placeholder="Kota, Provinsi"
                      value={form.alamat}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      autoComplete="street-address"
                    />
                  </div>
                </div>
              </div>

              <div className="input-group register-input-group">
                <label htmlFor="password">Password</label>
                <div className="register-input-wrapper">
                  <Lock size={16} strokeWidth={2} className="register-input-icon" aria-hidden="true" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Minimal 8 karakter"
                    value={form.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={localError ? 'input-error' : ''}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="register-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                  </button>
                </div>
              </div>

              <div className="input-group register-input-group">
                <label htmlFor="password_confirmation">Konfirmasi Password</label>
                <div className="register-input-wrapper">
                  <Lock size={16} strokeWidth={2} className="register-input-icon" aria-hidden="true" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    id="password_confirmation"
                    name="password_confirmation"
                    placeholder="Ulangi password"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={localError ? 'input-error' : ''}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="register-toggle-password"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-action-primary register-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="register-spinner" />
                    <span>Mendaftarkan...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar Sekarang</span>
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>

            <p className="register-footer-note">
              Sudah punya akun? <Link to="/login">Masuk di sini</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
