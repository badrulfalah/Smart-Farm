import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, Search, AlertTriangle,
  CheckCircle, XCircle, X, Loader2, UserRound, ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <Loader2 size={32} strokeWidth={2} style={{ color: 'var(--primary)', animation: 'spin 0.9s linear infinite' }} />
  </div>
);

const Toast = ({ toast }) => (
  <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
    {toast.type === 'error'
      ? <XCircle size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
      : <CheckCircle size={16} strokeWidth={2} style={{ flexShrink: 0 }} />}
    <span>{toast.message}</span>
  </div>
);

const getRoleBadgeClass = (role) => {
  if (role === 'Super Admin') return 'badge super-admin';
  if (role === 'Admin') return 'badge admin';
  return 'badge user';
};

const ErrorText = ({ msg }) =>
  msg ? <span style={{ fontSize: '12px', color: 'var(--red-500)', fontWeight: 600 }}>{msg}</span> : null;

// MODIFIKASI: Avatar sekarang menggunakan ikon UserRound alih-alih inisial huruf
const Avatar = ({ name, size = 34 }) => {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '10px',
      background: 'linear-gradient(135deg, var(--green-600), var(--green-500))',
      color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <UserRound size={size * 0.55} color="#fff" strokeWidth={1.5} />
    </div>
  );
};

const UserList = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([api.get('/users'), api.get('/roles')]);
      if (usersRes.data.status === 'success') setUsers(usersRes.data.data);
      if (rolesRes.data.status === 'success') setRoles(rolesRes.data.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setModalType('create'); setSelectedUser(null);
    setName(''); setEmail(''); setPassword(''); setSelectedRoles([]);
    setFormErrors({}); setShowModal(true);
  };

  const openEdit = (user) => {
    setModalType('edit'); setSelectedUser(user);
    setName(user.name); setEmail(user.email);
    setPassword(''); setSelectedRoles([...user.roles]);
    setFormErrors({}); setShowModal(true);
  };

  const toggleRole = (roleName) =>
    setSelectedRoles(prev =>
      prev.includes(roleName) ? prev.filter(r => r !== roleName) : [...prev, roleName]
    );

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Nama lengkap wajib diisi.';
    if (!email.trim()) errors.email = 'Email wajib diisi.';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Format email tidak valid.';
    if (modalType === 'create' && !password) errors.password = 'Password wajib diisi.';
    else if (password && password.length < 8) errors.password = 'Password minimal 8 karakter.';
    if (selectedRoles.length === 0) errors.roles = 'Wajib memilih minimal 1 role.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { name, email, roles: selectedRoles };
    if (password) payload.password = password;
    try {
      if (modalType === 'create') {
        const res = await api.post('/users', payload);
        if (res.data.status === 'success') { addToast('Pengguna baru berhasil ditambahkan!'); setShowModal(false); fetchData(); }
      } else {
        const res = await api.put(`/users/${selectedUser.id}`, payload);
        if (res.data.status === 'success') { addToast('Data pengguna berhasil diperbarui!'); setShowModal(false); fetchData(); }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  const handleDelete = async (userId) => {
    if (currentUser.id === userId) { addToast('Anda tidak dapat menghapus akun Anda sendiri.', 'error'); return; }
    if (!window.confirm('Hapus pengguna ini? Tindakan tidak dapat dibatalkan.')) return;
    try {
      const res = await api.delete(`/users/${userId}`);
      if (res.data.status === 'success') { addToast('Pengguna berhasil dihapus!'); fetchData(); }
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menghapus pengguna.', 'error');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div className="content-card">

      {/* Header */}
      <div className="table-actions-row">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-heading)' }}>
            Manajemen Pengguna
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', fontWeight: 500 }}>
            Kelola akun pengguna Smart Farm dan tetapkan perannya.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div className="search-input-wrapper">
            <span className="search-icon"><Search size={14} strokeWidth={2} /></span>
            <input
              type="text" placeholder="Cari nama atau email..."
              className="search-input" value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={openCreate} className="btn-action-primary">
            <Plus size={15} strokeWidth={2.5} /> Tambah User
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-banner">
          <AlertTriangle size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Pengguna</th>
              <th>Email</th>
              <th>Role</th>
              <th>Ditambahkan</th>
              <th style={{ width: '96px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar name={u.name} size={34} />
                    <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '13px' }}>
                      {u.name}
                      {currentUser.id === u.id && (
                        <span style={{ marginLeft: '6px', fontSize: '10px', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 7px', borderRadius: '5px' }}>
                          Anda
                        </span>
                      )}
                    </span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{u.email}</td>
                <td>
                  <div className="pill-list">
                    {u.roles.map(role => <span key={role} className={getRoleBadgeClass(role)}>{role}</span>)}
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>{u.created_at}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button onClick={() => openEdit(u)} className="btn-icon" title="Edit">
                      <Pencil size={14} strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="btn-icon delete" title="Hapus"
                      disabled={currentUser.id === u.id}
                      style={currentUser.id === u.id ? { opacity: 0.35, cursor: 'not-allowed' } : {}}
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <UserRound size={32} strokeWidth={1.5} style={{ opacity: 0.4 }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      {search ? 'Tidak ada pengguna yang cocok.' : 'Belum ada pengguna.'}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-content">

            {/* Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '12px', flexShrink: 0,
                  background: modalType === 'create'
                    ? 'linear-gradient(135deg, var(--green-500), var(--green-700))'
                    : 'linear-gradient(135deg, var(--indigo-500), #818cf8)',
                  boxShadow: modalType === 'create' ? 'var(--shadow-green)' : 'var(--shadow-indigo)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {modalType === 'create'
                    ? <Plus size={18} strokeWidth={2.5} color="#fff" />
                    : <Pencil size={16} strokeWidth={2} color="#fff" />
                  }
                </div>
                <div>
                  <h2>{modalType === 'create' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
                    {modalType === 'create'
                      ? 'Isi detail di bawah untuk membuat akun baru.'
                      : `Mengubah data: ${selectedUser?.name}`}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="btn-icon" title="Tutup" style={{ flexShrink: 0 }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Form — body scroll di sini */}
            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className="modal-body">

                {/* Nama */}
                <div className="input-group">
                  <label htmlFor="u-name">Nama Lengkap</label>
                  <input
                    type="text" id="u-name" placeholder="Contoh: Budi Santoso"
                    value={name} onChange={e => setName(e.target.value)} autoComplete="off"
                    style={formErrors.name ? { borderColor: 'var(--red-500)' } : {}}
                  />
                  <ErrorText msg={formErrors.name} />
                </div>

                {/* Email */}
                <div className="input-group">
                  <label htmlFor="u-email">Email</label>
                  <input
                    type="email" id="u-email" placeholder="nama@smartfarm.com"
                    value={email} onChange={e => setEmail(e.target.value)} autoComplete="off"
                    style={formErrors.email ? { borderColor: 'var(--red-500)' } : {}}
                  />
                  <ErrorText msg={formErrors.email} />
                </div>

                {/* Password */}
                <div className="input-group">
                  <label htmlFor="u-pass">
                    Password
                    {modalType === 'edit' && (
                      <span style={{ textTransform: 'none', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>
                        — kosongkan jika tidak diubah
                      </span>
                    )}
                  </label>
                  <input
                    type="password" id="u-pass" placeholder="Minimal 8 karakter"
                    value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password"
                    style={formErrors.password ? { borderColor: 'var(--red-500)' } : {}}
                  />
                  <ErrorText msg={formErrors.password} />
                </div>

                {/* Roles — tanpa wrapper box */}
                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ShieldCheck size={11} strokeWidth={2} /> Pilih Role
                  </label>
                  <div className="permission-checkbox-grid">
                    {roles.map(role => (
                      <label
                        key={role.id}
                        className="checkbox-item"
                        style={selectedRoles.includes(role.name) ? {
                          background: 'var(--primary-light)',
                          borderColor: 'var(--green-200)',
                          color: 'var(--primary)',
                        } : {}}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role.name)}
                          onChange={() => toggleRole(role.name)}
                        />
                        <span style={{ fontWeight: selectedRoles.includes(role.name) ? 700 : 600 }}>
                          {role.name}
                        </span>
                      </label>
                    ))}
                  </div>
                  <ErrorText msg={formErrors.roles} />
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-action-primary">
                  {modalType === 'create'
                    ? <><Plus size={14} strokeWidth={2.5} /> Simpan Pengguna</>
                    : <><CheckCircle size={14} strokeWidth={2} /> Perbarui Pengguna</>}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: '28px', right: '28px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 999 }}>
        {toasts.map(t => <Toast key={t.id} toast={t} />)}
      </div>
    </div>
  );
};

export default UserList;