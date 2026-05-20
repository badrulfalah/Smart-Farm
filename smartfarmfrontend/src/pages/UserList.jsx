import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserList = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles')
      ]);
      
      if (usersRes.data.status === 'success') {
        setUsers(usersRes.data.data);
      }
      if (rolesRes.data.status === 'success') {
        setRoles(rolesRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load user management data:', err);
      setError('Gagal memuat data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setModalType('create');
    setSelectedUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setSelectedRoles([]);
    setFormErrors({});
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setModalType('edit');
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setSelectedRoles([...user.roles]);
    setFormErrors({});
    setShowModal(true);
  };

  const handleRoleToggle = (roleName) => {
    if (selectedRoles.includes(roleName)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== roleName));
    } else {
      setSelectedRoles([...selectedRoles, roleName]);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Nama lengkap wajib diisi.';
    if (!email.trim()) {
      errors.email = 'Email wajib diisi.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Format email tidak valid.';
    }
    if (modalType === 'create' && !password) {
      errors.password = 'Password wajib diisi.';
    } else if (password && password.length < 8) {
      errors.password = 'Password minimal terdiri dari 8 karakter.';
    }
    if (selectedRoles.length === 0) {
      errors.roles = 'Wajib memilih minimal 1 Role.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name,
      email,
      roles: selectedRoles,
    };
    if (password) payload.password = password;

    try {
      if (modalType === 'create') {
        const response = await api.post('/users', payload);
        if (response.data.status === 'success') {
          addToast('Pengguna baru berhasil ditambahkan!');
          setShowModal(false);
          fetchData();
        }
      } else {
        const response = await api.put(`/users/${selectedUser.id}`, payload);
        if (response.data.status === 'success') {
          addToast('Data pengguna berhasil diperbarui!');
          setShowModal(false);
          fetchData();
        }
      }
    } catch (err) {
      console.error('Submit user error:', err);
      const backendMsg = err.response?.data?.message || 'Terjadi kesalahan sistem.';
      addToast(backendMsg, 'error');
    }
  };

  const handleDelete = async (userId) => {
    if (currentUser.id === userId) {
      addToast('Anda tidak dapat menghapus akun Anda sendiri!', 'error');
      return;
    }

    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.')) {
      try {
        const response = await api.delete(`/users/${userId}`);
        if (response.data.status === 'success') {
          addToast('Pengguna berhasil dihapus!');
          fetchData();
        }
      } catch (err) {
        console.error('Delete user error:', err);
        const backendMsg = err.response?.data?.message || 'Gagal menghapus pengguna.';
        addToast(backendMsg, 'error');
      }
    }
  };

  // Filter users by search input
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Super Admin':
        return 'badge super-admin';
      case 'Admin':
        return 'badge admin';
      default:
        return 'badge user';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
      </div>
    );
  }

  return (
    <div className="content-card">
      <div className="table-actions-row">
        <div>
          <h2>Manajemen Pengguna</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Kelola data akun pengguna Smart Farm dan tetapkan perannya.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari user berdasarkan nama atau email..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button onClick={handleOpenCreate} className="btn-action-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>➕</span> Tambah User
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-banner">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Datatable */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Nama Pengguna</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Tanggal Ditambahkan</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: '600', color: 'var(--text-heading)' }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <div className="pill-list">
                      {u.roles.map((role) => (
                        <span key={role} className={getRoleBadgeClass(role)}>
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.created_at}</td>
                  <td>
                    <div className="btn-group" style={{ justifyContent: 'center' }}>
                      <button onClick={() => handleOpenEdit(u)} className="btn-icon" title="Edit User">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="btn-icon delete" title="Hapus User">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                  Tidak ada pengguna ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal overlay */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{modalType === 'create' ? 'Tambah Pengguna Baru' : 'Edit Kredensial Pengguna'}</h2>
              <button onClick={() => setShowModal(false)} className="btn-close">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="input-group">
                  <label htmlFor="name">Nama Lengkap</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Nama Lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={formErrors.name ? 'input-error' : ''}
                  />
                  {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="nama@smartfarm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={formErrors.email ? 'input-error' : ''}
                  />
                  {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="password">
                    Password {modalType === 'edit' && <span style={{ textTransform: 'none', color: 'var(--text-muted)' }}>(Kosongkan jika tidak diubah)</span>}
                  </label>
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={formErrors.password ? 'input-error' : ''}
                  />
                  {formErrors.password && <span className="error-text">{formErrors.password}</span>}
                </div>

                <div className="input-group">
                  <label>Pilih Roles</label>
                  <div className="permission-checkbox-grid" style={{ maxHeight: '120px' }}>
                    {roles.map((role) => (
                      <label key={role.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role.name)}
                          onChange={() => handleRoleToggle(role.name)}
                        />
                        <span>{role.name}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.roles && <span className="error-text">{formErrors.roles}</span>}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-action-primary">
                  {modalType === 'create' ? 'Simpan Pengguna' : 'Perbarui Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast notifications rendering */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type === 'error' ? 'error' : ''}`}>
            <span className="toast-icon">{t.type === 'error' ? '❌' : '✅'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
