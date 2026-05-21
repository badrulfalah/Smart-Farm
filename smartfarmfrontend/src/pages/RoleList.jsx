import { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  ShieldCheck,
  Loader2,
  KeyRound,
} from 'lucide-react';
import api from '../services/api';

const PROTECTED_ROLES = ['Super Admin', 'Admin', 'User'];

/* ── Spinner ── */
const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <Loader2
      size={32}
      strokeWidth={2}
      style={{ color: 'var(--primary)', animation: 'spin 0.9s linear infinite' }}
    />
  </div>
);

/* ── Toast ── */
const Toast = ({ toast }) => (
  <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
    {toast.type === 'error'
      ? <XCircle size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
      : <CheckCircle size={16} strokeWidth={2} style={{ flexShrink: 0 }} />}
    <span>{toast.message}</span>
  </div>
);

const RoleList = () => {
  const [roles, setRoles]             = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const [showModal, setShowModal]           = useState(false);
  const [modalType, setModalType]           = useState('create');
  const [selectedRole, setSelectedRole]     = useState(null);

  const [name, setName]                                   = useState('');
  const [selectedPermissions, setSelectedPermissions]     = useState([]);
  const [formErrors, setFormErrors]                       = useState({});

  const [toasts, setToasts] = useState([]);

  /* ── helpers ── */
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const fetchData = async () => {
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions'),
      ]);
      if (rolesRes.data.status === 'success')       setRoles(rolesRes.data.data);
      if (permissionsRes.data.status === 'success') setPermissions(permissionsRes.data.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data peran & hak akses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setModalType('create'); setSelectedRole(null);
    setName(''); setSelectedPermissions([]); setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (role) => {
    setModalType('edit'); setSelectedRole(role);
    setName(role.name); setSelectedPermissions([...role.permissions]);
    setFormErrors({});
    setShowModal(true);
  };

  const togglePermission = (permName) =>
    setSelectedPermissions(prev =>
      prev.includes(permName) ? prev.filter(p => p !== permName) : [...prev, permName]
    );

  const validate = () => {
    const errors = {};
    if (!name.trim())                     errors.name = 'Nama role wajib diisi.';
    if (selectedPermissions.length === 0) errors.permissions = 'Pilih minimal 1 permission.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { name, permissions: selectedPermissions };
    try {
      if (modalType === 'create') {
        const res = await api.post('/roles', payload);
        if (res.data.status === 'success') { addToast('Role baru berhasil dibuat!'); setShowModal(false); fetchData(); }
      } else {
        const res = await api.put(`/roles/${selectedRole.id}`, payload);
        if (res.data.status === 'success') { addToast('Role berhasil diperbarui!'); setShowModal(false); fetchData(); }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  const handleDelete = async (role) => {
    if (PROTECTED_ROLES.includes(role.name)) {
      addToast(`Role bawaan '${role.name}' dilindungi dan tidak dapat dihapus.`, 'error');
      return;
    }
    if (!window.confirm(`Hapus role '${role.name}'?`)) return;
    try {
      const res = await api.delete(`/roles/${role.id}`);
      if (res.data.status === 'success') { addToast('Role berhasil dihapus!'); fetchData(); }
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menghapus role.', 'error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="content-card">

      {/* ── Header ── */}
      <div className="table-actions-row">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-heading)' }}>
            Manajemen Role
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', fontWeight: 500 }}>
            Atur tingkatan hak akses dan kemampuan masing-masing role.
          </p>
        </div>
        <button onClick={openCreate} className="btn-action-primary">
          <Plus size={15} strokeWidth={2.5} />
          Buat Role Baru
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="alert-banner">
          <AlertTriangle size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Table ── */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Nama Role</th>
              <th style={{ width: '120px' }}>Pengguna</th>
              <th>Permissions</th>
              <th style={{ width: '96px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {roles.length > 0 ? (
              roles.map(role => {
                const isProtected = PROTECTED_ROLES.includes(role.name);
                return (
                  <tr key={role.id}>
                    {/* Role name */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '13px' }}>
                          {role.name}
                        </span>
                        {isProtected && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.07em', color: 'var(--text-muted)',
                          }}>
                            <ShieldCheck size={10} strokeWidth={2} />
                            Protected
                          </span>
                        )}
                      </div>
                    </td>

                    {/* User count */}
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        fontSize: '12px', fontWeight: 700,
                        color: 'var(--slate-500)',
                      }}>
                        {role.users_count} user{role.users_count !== 1 ? 's' : ''}
                      </span>
                    </td>

                    {/* Permissions pills */}
                    <td>
                      <div className="pill-list">
                        {role.permissions.length > 0
                          ? role.permissions.map(p => <span key={p} className="pill">{p}</span>)
                          : <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>
                        }
                      </div>
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button onClick={() => openEdit(role)} className="btn-icon" title="Edit Role">
                          <Pencil size={14} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => handleDelete(role)}
                          className="btn-icon delete"
                          title="Hapus Role"
                          disabled={isProtected}
                          style={isProtected ? { opacity: 0.35, cursor: 'not-allowed' } : {}}
                        >
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '10px', padding: '40px 20px', color: 'var(--text-muted)',
                  }}>
                    <KeyRound size={32} strokeWidth={1.5} style={{ opacity: 0.4 }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Belum ada role.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {modalType === 'create' ? 'Buat Role Baru' : `Edit Role: ${selectedRole?.name}`}
              </h2>
              <button onClick={() => setShowModal(false)} className="btn-icon" title="Tutup">
                <X size={16} strokeWidth={2} />
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
                    onChange={e => setName(e.target.value)}
                    style={formErrors.name ? { borderColor: 'var(--red-500)' } : {}}
                    disabled={selectedRole?.name === 'Super Admin'}
                  />
                  {formErrors.name && (
                    <span style={{ fontSize: '12px', color: 'var(--red-500)', fontWeight: 600 }}>
                      {formErrors.name}
                    </span>
                  )}
                </div>

                <div className="input-group">
                  <label>Pilih Permissions</label>
                  <div className="permission-checkbox-grid">
                    {permissions.map(perm => (
                      <label key={perm.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.name)}
                          onChange={() => togglePermission(perm.name)}
                        />
                        <span>{perm.name}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.permissions && (
                    <span style={{ fontSize: '12px', color: 'var(--red-500)', fontWeight: 600 }}>
                      {formErrors.permissions}
                    </span>
                  )}
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

      {/* ── Toasts ── */}
      <div style={{
        position: 'fixed', bottom: '28px', right: '28px',
        display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 999,
      }}>
        {toasts.map(t => <Toast key={t.id} toast={t} />)}
      </div>
    </div>
  );
};

export default RoleList;