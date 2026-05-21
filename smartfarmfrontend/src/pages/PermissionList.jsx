import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  ShieldOff,
} from 'lucide-react';
import api from '../services/api';

const PROTECTED = ['view dashboard', 'manage users', 'manage roles', 'manage permissions'];

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

const PermissionList = () => {
  const [permissions, setPermissions] = useState([]);
  const [search, setSearch]           = useState('');
  const [name, setName]               = useState('');
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [formError, setFormError]     = useState('');
  const [toasts, setToasts]           = useState([]);

  /* ── helpers ── */
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const fetchData = async () => {
    try {
      const res = await api.get('/permissions');
      if (res.data.status === 'success') setPermissions(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat daftar permission.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) { setFormError('Nama permission tidak boleh kosong.'); return; }
    try {
      const res = await api.post('/permissions', { name });
      if (res.data.status === 'success') {
        addToast('Permission baru berhasil dibuat!');
        setName('');
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  const handleDelete = async (perm) => {
    if (PROTECTED.includes(perm.name)) {
      addToast(`Permission inti '${perm.name}' dilindungi dan tidak dapat dihapus.`, 'error');
      return;
    }
    if (!window.confirm(`Hapus permission '${perm.name}'?`)) return;
    try {
      const res = await api.delete(`/permissions/${perm.id}`);
      if (res.data.status === 'success') { addToast('Permission berhasil dihapus!'); fetchData(); }
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menghapus permission.', 'error');
    }
  };

  const filteredPermissions = permissions.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div className="content-card">

      {/* ── Header ── */}
      <div className="table-actions-row">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-heading)' }}>
            Manajemen Permissions
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', fontWeight: 500 }}>
            Lihat dan kelola daftar kemampuan spesifik sistem.
          </p>
        </div>

        <div className="search-input-wrapper">
          <span className="search-icon">
            <Search size={14} strokeWidth={2} />
          </span>
          <input
            type="text"
            placeholder="Cari permission..."
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="alert-banner">
          <AlertTriangle size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Quick Add Form ── */}
      <div style={{
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 20px',
        marginBottom: '8px',
        background: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        <p style={{
          fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.09em', color: 'var(--text-muted)',
        }}>
          Tambah Permission Baru
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <input
              type="text"
              placeholder="Contoh: edit device, view log..."
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${formError ? 'var(--red-500)' : 'var(--border-color)'}`,
                background: 'var(--bg-secondary)',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 500,
                outline: 'none',
                transition: 'border-color var(--transition), box-shadow var(--transition)',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
              onBlur={e => { e.target.style.borderColor = formError ? 'var(--red-500)' : 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
            />
            {formError && (
              <span style={{ fontSize: '12px', color: 'var(--red-500)', fontWeight: 600 }}>
                {formError}
              </span>
            )}
          </div>

          <button type="submit" className="btn-action-primary" style={{ whiteSpace: 'nowrap' }}>
            <Plus size={15} strokeWidth={2.5} />
            Tambah
          </button>
        </form>
      </div>

      {/* ── Table ── */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Nama Permission</th>
              <th style={{ width: '130px' }}>Guard</th>
              <th style={{ width: '140px' }}>Terhubung ke</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPermissions.length > 0 ? (
              filteredPermissions.map(perm => {
                const isProtected = PROTECTED.includes(perm.name);
                return (
                  <tr key={perm.id}>
                    <td>
                      <span style={{
                        fontWeight: 600,
                        color: 'var(--text-heading)',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        background: 'var(--bg-app)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                      }}>
                        {perm.name}
                      </span>
                    </td>

                    <td>
                      <span style={{
                        fontSize: '11px', fontWeight: 700,
                        color: 'var(--text-muted)',
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-color)',
                        padding: '3px 9px', borderRadius: '6px',
                      }}>
                        web
                      </span>
                    </td>

                    <td>
                      <span style={{
                        fontSize: '11px', fontWeight: 700,
                        color: 'var(--primary)',
                        background: 'var(--primary-light)',
                        padding: '3px 9px', borderRadius: '6px',
                      }}>
                        {perm.roles_count} Role{perm.roles_count !== 1 ? 's' : ''}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleDelete(perm)}
                          className="btn-icon delete"
                          title={isProtected ? 'Permission dilindungi' : 'Hapus Permission'}
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
                    <ShieldOff size={32} strokeWidth={1.5} style={{ opacity: 0.4 }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      {search ? 'Tidak ada permission yang cocok.' : 'Belum ada permission.'}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

export default PermissionList;