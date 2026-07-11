import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Calendar, Lock, LogOut, 
  Camera, CheckCircle, XCircle, Loader2, Key, Save, AlertCircle,
  ShieldCheck, Pencil
} from 'lucide-react';
import api from '../services/api';

const Toast = ({ toast }) => (
  <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
    {toast.type === 'error'
      ? <XCircle size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
      : <CheckCircle size={16} strokeWidth={2} style={{ flexShrink: 0 }} />}
    <span>{toast.message}</span>
  </div>
);

const ErrorText = ({ msg }) =>
  msg ? <span style={{ fontSize: '12px', color: 'var(--red-500)', fontWeight: 600, marginTop: '4px', display: 'block' }}>{msg}</span> : null;

/* Baris info kontak — dipisah jadi komponen kecil murni presentasional,
   tidak menyentuh logika apa pun */
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="sf-info-row" style={{ display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left', padding: '8px 6px', borderRadius: '12px' }}>
    <div style={{
      width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={15} color="var(--green-600)" strokeWidth={2.2} />
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </p>
      <p style={{ fontSize: '13.5px', color: 'var(--text-main)', fontWeight: 500, margin: '3px 0 0 0', wordBreak: 'break-word' }}>
        {value || '-'}
      </p>
    </div>
  </div>
);

const Profile = () => {
  const { user, updateProfile, updatePhoto, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // States
  const [profileForm, setProfileForm] = useState({
    nama_lengkap: user?.nama_lengkap || '',
    email: user?.email || '',
    no_hp: user?.no_hp || '',
    alamat: user?.alamat || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [toasts, setToasts] = useState([]);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const validateProfile = () => {
    const errors = {};
    if (!profileForm.nama_lengkap.trim()) errors.nama_lengkap = 'Nama lengkap wajib diisi.';
    if (!profileForm.email.trim()) errors.email = 'Email wajib diisi.';
    else if (!/\S+@\S+\.\S+/.test(profileForm.email)) errors.email = 'Format email tidak valid.';
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setIsUpdatingProfile(true);
    const result = await updateProfile(profileForm);
    setIsUpdatingProfile(false);

    if (result.success) {
      addToast('Profil berhasil diperbarui!');
    } else {
      addToast(result.error, 'error');
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      addToast('Format file harus JPG, JPEG, atau PNG.', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      addToast('Ukuran file maksimal adalah 2MB.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    setIsUploadingPhoto(true);
    const result = await updatePhoto(formData);
    setIsUploadingPhoto(false);

    if (result.success) {
      addToast('Foto profil berhasil diperbarui!');
    } else {
      addToast(result.error, 'error');
    }
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.current_password) errors.current_password = 'Password lama wajib diisi.';
    if (!passwordForm.password) errors.password = 'Password baru wajib diisi.';
    else if (passwordForm.password.length < 8) errors.password = 'Password baru minimal 8 karakter.';
    if (passwordForm.password !== passwordForm.password_confirmation) {
      errors.password_confirmation = 'Konfirmasi password tidak cocok.';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setIsChangingPassword(true);
    try {
      const response = await api.put('/profile/password', passwordForm);
      setIsChangingPassword(false);
      if (response.data && response.data.status === 'success') {
        addToast('Password berhasil diubah!');
        setShowPasswordModal(false);
        setPasswordForm({
          current_password: '',
          password: '',
          password_confirmation: '',
        });
        setPasswordErrors({});
      }
    } catch (err) {
      setIsChangingPassword(false);
      const errors = err.response?.data?.errors;
      const errMsg = errors
        ? Object.values(errors).flat().join(' ')
        : err.response?.data?.message || 'Gagal mengubah password.';
      addToast(errMsg, 'error');
      if (errors) setPasswordErrors(errors);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) return;
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: '40px' }}>
      {/* Style presentasional murni — tidak ada logika di sini,
          hanya animasi hover untuk elemen foto profil */}
      <style>{`
        .sf-avatar-wrap { transition: transform 0.25s ease; }
        .sf-avatar-wrap:hover { transform: translateY(-2px); }
        .sf-avatar-wrap:hover .sf-avatar-cam { transform: scale(1.1); }
        .sf-avatar-cam { transition: transform 0.2s ease; }
        .sf-info-row { transition: background 0.15s ease; }
        .sf-info-row:hover { background: var(--bg-secondary); }
        @keyframes sfRingPulse {
          0%, 100% { box-shadow: 0 0 0 3px var(--green-500), 0 8px 20px rgba(16,185,129,0.22); }
          50% { box-shadow: 0 0 0 5px var(--green-500), 0 10px 24px rgba(16,185,129,0.28); }
        }
      `}</style>

      {/* Toast container */}
      <div className="toast-container">
        {toasts.map(t => <Toast key={t.id} toast={t} />)}
      </div>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: '28px' }}>
        <div className="header-text-group">
          <h1>Profil Saya</h1>
          <p>Kelola data akun, informasi kontak, dan keamanan kata sandi Anda.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '28px' }} className="profile-grid">
        {/* Left Column: Info Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>

            {/* Backdrop dekoratif di atas kartu — mengikuti aksen hijau tema */}
            <div style={{
              height: '76px', width: '100%',
              background: 'linear-gradient(135deg, var(--green-600), var(--green-500))',
              opacity: 0.9,
            }} />

            <div style={{ padding: '0 24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

              {/* Avatar upload wrapper — ditarik naik agar overlap backdrop */}
              <div
                className="sf-avatar-wrap"
                style={{ position: 'relative', width: '112px', height: '112px', marginTop: '-56px', marginBottom: '14px', cursor: 'pointer' }}
                onClick={handlePhotoClick}
                title="Ubah Foto Profil"
              >
                {user?.foto_profil ? (
                  <img
                    src={user.foto_profil}
                    alt={user.name}
                    style={{
                      width: '112px', height: '112px', borderRadius: '50%', objectFit: 'cover',
                      border: '4px solid var(--bg-card)',
                      animation: 'sfRingPulse 3.5s ease-in-out infinite',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '112px', height: '112px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--green-600), var(--green-500))',
                    color: '#fff', fontSize: '32px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '4px solid var(--bg-card)',
                    letterSpacing: '-0.02em',
                    animation: 'sfRingPulse 3.5s ease-in-out infinite',
                  }}>
                    {getInitials(user?.name)}
                  </div>
                )}

                {/* Overlay camera icon */}
                <div className="sf-avatar-cam" style={{
                  position: 'absolute', bottom: '-2px', right: '-2px', width: '34px', height: '34px',
                  borderRadius: '50%', background: 'var(--primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)', border: '2px solid var(--bg-card)',
                }}>
                  {isUploadingPhoto ? (
                    <Loader2 size={15} style={{ animation: 'spin 0.9s linear infinite' }} />
                  ) : (
                    <Camera size={14} strokeWidth={2.5} />
                  )}
                </div>
              </div>

              {/* Hidden Input file */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/jpeg,image/jpg,image/png"
                style={{ display: 'none' }}
              />

              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Pencil size={11} strokeWidth={2.5} />
                Klik foto untuk mengubah
              </span>

              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
                {user?.nama_lengkap}
              </h3>

              {/* Role Badge */}
              <span
                className={`badge ${user?.roles?.[0] === 'Super Admin' ? 'super-admin' : user?.roles?.[0] === 'Admin' ? 'admin' : 'user'}`}
                style={{ marginBottom: '22px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <ShieldCheck size={11} strokeWidth={2.5} />
                {user?.roles?.[0] || 'User'}
              </span>

              {/* Profile Info Details */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid var(--border-color)', paddingTop: '18px' }}>
                <InfoRow icon={Mail} label="Email" value={user?.email} />
                <InfoRow icon={Phone} label="No. Handphone" value={user?.no_hp} />
                <InfoRow icon={MapPin} label="Alamat" value={user?.alamat} />
                <InfoRow icon={Calendar} label="Tanggal Bergabung" value={formatDate(user?.created_at)} />
              </div>
            </div>
          </div>

          {/* Action Card: Password & Logout */}
          <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px', width: '100%', padding: '12px 14px' }}
            >
              <div style={{
                width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0,
                background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Key size={14} strokeWidth={2.5} color="var(--green-600)" />
              </div>
              <span>Ganti Kata Sandi</span>
            </button>

            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px', width: '100%', padding: '12px 14px', color: 'var(--red-500)', borderColor: 'var(--red-100)' }}
            >
              <div style={{
                width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0,
                background: 'var(--red-100)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <LogOut size={14} strokeWidth={2.5} color="var(--red-500)" />
              </div>
              <span>Keluar dari Sistem</span>
            </button>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="card" style={{ padding: '32px 36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--green-600), var(--green-500))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={17} strokeWidth={2.5} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>Edit Informasi Profil</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Pastikan data Anda selalu valid dan dapat dihubungi.
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group">
              <label htmlFor="p-nama">Nama Lengkap</label>
              <input 
                type="text" 
                id="p-nama" 
                name="nama_lengkap"
                placeholder="Masukkan nama lengkap" 
                value={profileForm.nama_lengkap} 
                onChange={handleProfileChange}
                className={profileErrors.nama_lengkap ? 'input-error' : ''}
              />
              <ErrorText msg={profileErrors.nama_lengkap} />
            </div>

            <div className="input-group">
              <label htmlFor="p-email">Alamat Email</label>
              <input 
                type="email" 
                id="p-email" 
                name="email"
                placeholder="contoh@smartfarm.com" 
                value={profileForm.email} 
                onChange={handleProfileChange}
                className={profileErrors.email ? 'input-error' : ''}
              />
              <ErrorText msg={profileErrors.email} />
            </div>

            <div className="input-group">
              <label htmlFor="p-hp">No. Handphone</label>
              <input 
                type="text" 
                id="p-hp" 
                name="no_hp"
                placeholder="08xxxxxxxxxx" 
                value={profileForm.no_hp} 
                onChange={handleProfileChange}
              />
            </div>

            <div className="input-group">
              <label htmlFor="p-alamat">Alamat</label>
              <textarea 
                id="p-alamat" 
                name="alamat"
                placeholder="Masukkan alamat lengkap" 
                value={profileForm.alamat} 
                onChange={handleProfileChange}
                rows="4"
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  borderRadius: '14px', 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--bg-secondary)', 
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13.5px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <button 
                type="submit" 
                className="btn-action-primary" 
                disabled={isUpdatingProfile}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 size={14} style={{ animation: 'spin 0.9s linear infinite' }} />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} strokeWidth={2.5} />
                    <span>Perbarui Profil</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowPasswordModal(false); }}>
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '38px', height: '38px', borderRadius: '12px', 
                  background: 'linear-gradient(135deg, var(--indigo-500), #818cf8)', 
                  boxShadow: 'var(--shadow-indigo)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                }}>
                  <Lock size={16} strokeWidth={2.5} color="#fff" />
                </div>
                <div>
                  <h2 style={{ margin: 0 }}>Ganti Kata Sandi</h2>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, margin: '2px 0 0 0' }}>
                    Kata sandi harus minimal 8 karakter dan cocok dengan konfirmasi.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ display: 'contents' }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="input-group">
                  <label htmlFor="pw-old">Kata Sandi Lama</label>
                  <input 
                    type="password" 
                    id="pw-old" 
                    name="current_password"
                    placeholder="Masukkan kata sandi saat ini"
                    value={passwordForm.current_password} 
                    onChange={handlePasswordChange}
                    className={passwordErrors.current_password ? 'input-error' : ''}
                  />
                  <ErrorText msg={passwordErrors.current_password} />
                </div>

                <div className="input-group">
                  <label htmlFor="pw-new">Kata Sandi Baru</label>
                  <input 
                    type="password" 
                    id="pw-new" 
                    name="password"
                    placeholder="Kata sandi baru (min 8 karakter)"
                    value={passwordForm.password} 
                    onChange={handlePasswordChange}
                    className={passwordErrors.password ? 'input-error' : ''}
                  />
                  <ErrorText msg={passwordErrors.password} />
                </div>

                <div className="input-group">
                  <label htmlFor="pw-confirm">Konfirmasi Kata Sandi Baru</label>
                  <input 
                    type="password" 
                    id="pw-confirm" 
                    name="password_confirmation"
                    placeholder="Ulangi kata sandi baru"
                    value={passwordForm.password_confirmation} 
                    onChange={handlePasswordChange}
                    className={passwordErrors.password_confirmation ? 'input-error' : ''}
                  />
                  <ErrorText msg={passwordErrors.password_confirmation} />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowPasswordModal(false)}>Batal</button>
                <button 
                  type="submit" 
                  className="btn-action-primary" 
                  disabled={isChangingPassword}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 size={14} style={{ animation: 'spin 0.9s linear infinite' }} />
                      <span>Mengubah...</span>
                    </>
                  ) : (
                    <span>Ubah Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;