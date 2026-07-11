import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, Search, AlertTriangle,
  CheckCircle, XCircle, X, Loader2, ClipboardList
} from 'lucide-react';
import api from '../services/api';

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

const ErrorText = ({ msg }) =>
  msg ? <span style={{ fontSize: '12px', color: 'var(--red-500)', fontWeight: 600 }}>{msg}</span> : null;

const JenisTernakList = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedJenis, setSelectedJenis] = useState(null);
  const [form, setForm] = useState({ nama_jenis: '', deskripsi: '' });
  const [formErrors, setFormErrors] = useState({});
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const fetchData = async () => {
    try {
      const res = await api.get('/jenis-ternak');
      if (res.data.status === 'success') setData(res.data.data);
    } catch (err) {
      setError('Gagal memuat data jenis ternak.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setModalType('create'); setSelectedJenis(null);
    setForm({ nama_jenis: '', deskripsi: '' });
    setFormErrors({}); setShowModal(true);
  };

  const openEdit = (jenis) => {
    setModalType('edit'); setSelectedJenis(jenis);
    setForm({ nama_jenis: jenis.nama_jenis || '', deskripsi: jenis.deskripsi || '' });
    setFormErrors({}); setShowModal(true);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errors = {};
    if (!form.nama_jenis.trim()) errors.nama_jenis = 'Nama jenis ternak wajib diisi.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (modalType === 'create') {
        const res = await api.post('/jenis-ternak', form);
        if (res.data.status === 'success') {
          addToast('Jenis ternak berhasil ditambahkan!');
          setShowModal(false);
          fetchData();
        }
      } else {
        const res = await api.put(`/jenis-ternak/${selectedJenis.id_jenis_ternak}`, form);
        if (res.data.status === 'success') {
          addToast('Jenis ternak berhasil diperbarui!');
          setShowModal(false);
          fetchData();
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Terjadi kesalahan sistem.';
      addToast(errMsg, 'error');
      if (err.response?.data?.errors) setFormErrors(err.response.data.errors);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus jenis ternak ini?')) return;
    try {
      const res = await api.delete(`/jenis-ternak/${id}`);
      if (res.data.status === 'success') {
        addToast('Jenis ternak berhasil dihapus!');
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menghapus jenis ternak.', 'error');
    }
  };

  const filteredData = data.filter(j =>
    !search || j.nama_jenis?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div className="content-card">
      <div className="table-actions-row">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-heading)' }}>
            Kelola Jenis Ternak
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', fontWeight: 500 }}>
            Master data jenis ternak yang tercatat di sistem.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div className="search-input-wrapper">
            <span className="search-icon"><Search size={14} strokeWidth={2} /></span>
            <input
              type="text" placeholder="Cari nama jenis ternak..."
              className="search-input" value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={openCreate} className="btn-action-primary">
            <Plus size={15} strokeWidth={2.5} /> Tambah Jenis Ternak
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-banner">
          <AlertTriangle size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Nama Jenis Ternak</th>
              <th>Deskripsi</th>
              <th style={{ width: '96px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? filteredData.map(j => (
              <tr key={j.id_jenis_ternak}>
                <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{j.nama_jenis}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{j.deskripsi || '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button onClick={() => openEdit(j)} className="btn-icon" title="Edit">
                      <Pencil size={14} strokeWidth={2} />
                    </button>
                    <button onClick={() => handleDelete(j.id_jenis_ternak)} className="btn-icon delete" title="Hapus">
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <ClipboardList size={32} strokeWidth={1.5} style={{ opacity: 0.4 }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      {search ? 'Tidak ada jenis ternak yang cocok.' : 'Belum ada data jenis ternak.'}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-content">
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
                  <h2>{modalType === 'create' ? 'Tambah Jenis Ternak Baru' : 'Edit Jenis Ternak'}</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
                    {modalType === 'create'
                      ? 'Isi detail di bawah untuk menambah jenis ternak baru.'
                      : `Mengubah data: ${selectedJenis?.nama_jenis}`}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="btn-icon" title="Tutup" style={{ flexShrink: 0 }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className="modal-body">
                <div className="input-group">
                  <label htmlFor="nama-jenis">Nama Jenis Ternak</label>
                  <input
                    type="text" id="nama-jenis" name="nama_jenis" placeholder="Contoh: Sapi Potong"
                    value={form.nama_jenis} onChange={handleFormChange}
                    className={formErrors.nama_jenis ? 'input-error' : ''}
                  />
                  <ErrorText msg={formErrors.nama_jenis} />
                </div>

                <div className="input-group">
                  <label htmlFor="deskripsi">Deskripsi</label>
                  <textarea
                    id="deskripsi" name="deskripsi" placeholder="Masukkan deskripsi atau informasi tambahan"
                    value={form.deskripsi} onChange={handleFormChange} rows={3}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '14px',
                      border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)', fontFamily: 'var(--font-body)',
                      fontSize: '13.5px', outline: 'none', resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-action-primary">
                  {modalType === 'create'
                    ? <><Plus size={14} strokeWidth={2.5} /> Simpan</>
                    : <><CheckCircle size={14} strokeWidth={2} /> Perbarui</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: '28px', right: '28px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 999 }}>
        {toasts.map(t => <Toast key={t.id} toast={t} />)}
      </div>
    </div>
  );
};

export default JenisTernakList;