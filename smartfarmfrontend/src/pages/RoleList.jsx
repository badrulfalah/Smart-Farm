import React, { useState, useEffect } from 'react';
import api from '../services/api';

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedRole, setSelectedRole] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
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
      const [rolesRes, permissionsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions')
      ]);

      if (rolesRes.data.status === 'success') {
        setRoles(rolesRes.data.data);
      }
      if (permissionsRes.data.status === 'success') {
        setPermissions(permissionsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load role management data:', err);
      setError('Gagal memuat data peran & hak akses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setModalType('create');
    setSelectedRole(null);
    setName('');
    setSelectedPermissions([]);
    setFormErrors({});
    setShowModal(true);
  };

  const handleOpenEdit = (role) => {
    setModalType('edit');
    setSelectedRole(role);
    setName(role.name);
    setSelectedPermissions([...role.permissions]);
    setFormErrors({});
    setShowModal(true);
  };

  const handlePermissionToggle = (permName) => {
    if (selectedPermissions.includes(permName)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permName));
    } else {
      setSelectedPermissions([...selectedPermissions, permName]);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Nama role wajib diisi.';
    if (selectedPermissions.length === 0) {
      errors.permissions = 'Pilih minimal 1 permission untuk ditautkan.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name,
      permissions: selectedPermissions,
    };

    try {
      if (modalType === 'create') {
        const response = await api.post('/roles', payload);
        if (response.data.status === 'success') {
          addToast('Role baru berhasil dibuat!');
          setShowModal(false);
          fetchData();
        }
      } else {
        const response = await api.put(`/roles/${selectedRole.id}`, payload);
        if (response.data.status === 'success') {
          addToast('Role berhasil diperbarui!');
          setShowModal(false);
          fetchData();
        }
      }
    } catch (err) {
      console.error('Submit role error:', err);
      const backendMsg = err.response?.data?.message || 'Terjadi kesalahan sistem.';
      addToast(backendMsg, 'error');
    }
  };

  const handleDelete = async (role) => {
    const protectedRoles = ['Super Admin', 'Admin', 'User'];
    if (protectedRoles.includes(role.name)) {
      addToast(`Role bawaan '${role.name}' dilindungi dan tidak dapat dihapus!`, 'error');
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus role '${role.name}'?`)) {
      try {
        const response = await api.delete(`/roles/${role.id}`);
        if (response.data.status === 'success') {
          addToast('Role berhasil dihapus!');
          fetchData();
        }
      } catch (err) {
        console.error('Delete role error:', err);
        const backendMsg = err.response?.data?.message || 'Gagal menghapus role.';
        addToast(backendMsg, 'error');
      }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="table-actions-row">
        <div>
          <h2>Manajemen Role & Hak Akses</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Tetapkan tingkatan hak akses (roles) serta daftar kemampuan (permissions) di dalamnya.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn-action-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>➕</span> Buat Role Baru
        </button>
      </div>

      {error && (
        <div className="alert-banner">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Roles */}
      <div className="roles-grid">
        {roles.map((role) => (
          <div key={role.id} className="role-item-card">
            <div>
              <div className="role-card-header">
                <h3>{role.name}</h3>
                <span className="role-user-count">{role.users_count} Users</span>
              </div>

              <div className="role-card-permissions">
                <p>Tautan Hak Akses ({role.permissions.length})</p>
                <div className="pill-list">
                  {role.permissions.map((p) => (
                    <span key={p} className="pill">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px', gap: '8px' }}>
              <button onClick={() => handleOpenEdit(role)} className="btn-icon" title="Edit Role">
                ✏️
              </button>
              <button 
                onClick={() => handleDelete(role)} 
                className="btn-icon delete" 
                title="Hapus Role"
                disabled={['Super Admin', 'Admin', 'User'].includes(role.name)}
                style={['Super Admin', 'Admin', 'User'].includes(role.name) ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal overlay */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{modalType === 'create' ? 'Buat Role Baru' : `Edit Hak Akses: ${selectedRole?.name}`}</h2>
              <button onClick={() => setShowModal(false)} className="btn-close">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="input-group">
                  <label htmlFor="role-name">Nama Role</label>
                  <input
                    type="text"
                    id="role-name"
                    placeholder="Contoh: Operator Kebun"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={formErrors.name ? 'input-error' : ''}
                    disabled={selectedRole?.name === 'Super Admin'} // Super Admin name is protected
                  />
                  {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                </div>

                <div className="input-group">
                  <label>Pilih Asosiasi Permissions</label>
                  <div className="permission-checkbox-grid">
                    {permissions.map((perm) => (
                      <label key={perm.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.name)}
                          onChange={() => handlePermissionToggle(perm.name)}
                        />
                        <span>{perm.name}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.permissions && <span className="error-text">{formErrors.permissions}</span>}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-action-primary">
                  {modalType === 'create' ? 'Simpan Role' : 'Perbarui Role'}
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

export default RoleList;
