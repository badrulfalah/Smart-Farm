import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PermissionList = () => {
  const [permissions, setPermissions] = useState([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form errors
  const [formError, setFormError] = useState('');

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
      const response = await api.get('/permissions');
      if (response.data.status === 'success') {
        setPermissions(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load permissions:', err);
      setError('Gagal memuat daftar permission.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Nama permission tidak boleh kosong.');
      return;
    }

    try {
      const response = await api.post('/permissions', { name });
      if (response.data.status === 'success') {
        addToast('Permission baru berhasil dibuat!');
        setName('');
        fetchData();
      }
    } catch (err) {
      console.error('Create permission error:', err);
      const backendMsg = err.response?.data?.message || 'Terjadi kesalahan sistem.';
      addToast(backendMsg, 'error');
    }
  };

  const handleDelete = async (perm) => {
    const protectedPermissions = ['view dashboard', 'manage users', 'manage roles', 'manage permissions'];
    if (protectedPermissions.includes(perm.name)) {
      addToast(`Permission inti '${perm.name}' dilindungi dan tidak dapat dihapus!`, 'error');
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus permission '${perm.name}'?`)) {
      try {
        const response = await api.delete(`/permissions/${perm.id}`);
        if (response.data.status === 'success') {
          addToast('Permission berhasil dihapus!');
          fetchData();
        }
      } catch (err) {
        console.error('Delete permission error:', err);
        const backendMsg = err.response?.data?.message || 'Gagal menghapus permission.';
        addToast(backendMsg, 'error');
      }
    }
  };

  // Filter permissions based on search
  const filteredPermissions = permissions.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

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
          <h2>Manajemen Permissions (Kemampuan Hak Akses)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Lihat daftar kemampuan spesifik sistem atau tambahkan kemampuan kustom baru secara cepat.
          </p>
        </div>

        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Cari permission..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="alert-banner">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Inline Form to Add Permission Quick */}
      <div 
        style={{ 
          backgroundColor: 'var(--bg-primary)', 
          border: '1px solid var(--border-color)', 
          padding: '20px', 
          borderRadius: '14px', 
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
          Tambah Permission Baru Secara Instan
        </h3>
        
        <form onSubmit={handleSubmit} className="inline-form">
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <input
              type="text"
              placeholder="Contoh: edit device, view log..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={formError ? 'input-error' : ''}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-main)'
              }}
            />
            {formError && <span className="error-text" style={{ fontSize: '11px', marginTop: '2px' }}>{formError}</span>}
          </div>
          
          <button type="submit" className="btn-action-primary" style={{ padding: '10px 16px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
            ➕ Tambah
          </button>
        </form>
      </div>

      {/* Permission Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Nama Kemampuan (Permission)</th>
              <th style={{ width: '150px' }}>Guard</th>
              <th style={{ width: '150px' }}>Tautan Roles</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPermissions.length > 0 ? (
              filteredPermissions.map((perm) => (
                <tr key={perm.id}>
                  <td style={{ fontWeight: '600', color: 'var(--text-heading)', fontFamily: 'monospace' }}>
                    {perm.name}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>web</td>
                  <td>
                    <span 
                      style={{ 
                        backgroundColor: 'var(--primary-light-emerald)', 
                        color: 'var(--primary-dark-emerald)', 
                        padding: '2px 8px', 
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}
                    >
                      {perm.roles_count} Roles
                    </span>
                  </td>
                  <td>
                    <div className="btn-group" style={{ justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleDelete(perm)} 
                        className="btn-icon delete" 
                        title="Hapus Permission"
                        disabled={['view dashboard', 'manage users', 'manage roles', 'manage permissions'].includes(perm.name)}
                        style={['view dashboard', 'manage users', 'manage roles', 'manage permissions'].includes(perm.name) ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                  Tidak ada permission ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

export default PermissionList;
