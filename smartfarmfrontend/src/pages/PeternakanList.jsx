import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, Search, AlertTriangle,
  CheckCircle, XCircle, X, Loader2, Filter, MapPin,
  ChevronUp, ChevronDown, Save
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
  msg ? <span style={{ fontSize: '12px', color: 'var(--red-500)', fontWeight: 600, marginTop: '4px', display: 'block' }}>{msg}</span> : null;

const PeternakanList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('id_peternakan');
  const [sortDir, setSortDir] = useState('desc');
  const [toasts, setToasts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({
    nama_peternakan: '',
    alamat: '',
    kota: '',
    provinsi: '',
    luas_lahan: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const fetchData = async () => {
    try {
      const res = await api.get('/peternakan');
      if (res.data.status === 'success') setData(res.data.data);
    } catch (err) {
      setError('Gagal memuat data peternakan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setModalType('create');
    setSelectedItem(null);
    setForm({ nama_peternakan: '', alamat: '', kota: '', provinsi: '', luas_lahan: '' });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (item) => {
    setModalType('edit');
    setSelectedItem(item);
    setForm({
      nama_peternakan: item.nama_peternakan || '',
      alamat: item.alamat || '',
      kota: item.kota || '',
      provinsi: item.provinsi || '',
      luas_lahan: item.luas_lahan || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};
    if (!form.nama_peternakan.trim()) errors.nama_peternakan = 'Nama peternakan wajib diisi.';
    if (form.luas_lahan && (isNaN(form.luas_lahan) || Number(form.luas_lahan) < 0)) {
      errors.luas_lahan = 'Luas lahan harus berupa angka positif.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (modalType === 'create') {
        const res = await api.post('/peternakan', form);
        if (res.data.status === 'success') {
          addToast('Peternakan berhasil ditambahkan!');
          setShowModal(false);
          fetchData();
        }
      } else {
        const res = await api.put(`/peternakan/${selectedItem.id_peternakan}`, form);
        if (res.data.status === 'success') {
          addToast('Peternakan berhasil diperbarui!');
          setShowModal(false);
          fetchData();
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Terjadi kesalahan sistem.';
      addToast(errMsg, 'error');
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete(`/peternakan/${deleteId}`);
      if (res.data.status === 'success') {
        addToast('Peternakan berhasil dihapus.');
        setDeleteId(null);
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menghapus peternakan.', 'error');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={12} style={{ opacity: 0.3 }} />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} style={{ color: 'var(--primary)' }} />
      : <ChevronDown size={12} style={{ color: 'var(--primary)' }} />;
  };

  const filtered = data.filter(p => {
    const q = search.toLowerCase();
    return !q || p.nama_peternakan?.toLowerCase().includes(q)
      || p.kota?.toLowerCase().includes(q)
      || p.provinsi?.toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortField], bv = b[sortField];
    if (av == null) return 1; if (bv == null) return -1;
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) return <Spinner />;

  return (
    <div className="content-card">
      <div className="table-actions-row">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-heading)' }}>
            Data Peternakan
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', fontWeight: 500 }}>
            Kelola data lokasi peternakan dan informasi lahan.
          </p>
        </div>
        <button onClick={openCreate} className="btn-action-primary">
          <Plus size={15} strokeWidth={2.5} /> Tambah Peternakan
        </button>
      </div>

      {error && (
        <div className="alert-banner">
          <AlertTriangle size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <div className="search-input-wrapper" style={{ marginBottom: '16px' }}>
        <span className="search-icon"><Search size={14} strokeWidth={2} /></span>
        <input
          type="text" placeholder="Cari nama peternakan, kota, atau provinsi..."
          className="search-input" value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600 }}>
        Menampilkan {sorted.length} peternakan {filtered.length !== data.length && ` (difilter dari ${data.length} total)`}
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('nama_peternakan')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Nama Peternakan <SortIcon field="nama_peternakan" /></div>
              </th>
              <th>Lokasi</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('luas_lahan')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Luas Lahan <SortIcon field="luas_lahan" /></div>
              </th>
              <th style={{ width: '110px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length > 0 ? sorted.map(p => (
              <tr key={p.id_peternakan}>
                <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{p.nama_peternakan}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  {p.kota && p.provinsi ? `${p.kota}, ${p.provinsi}` : p.kota || p.provinsi || '-'}
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{p.luas_lahan ? `${p.luas_lahan} ha` : '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button onClick={() => openEdit(p)} className="btn-icon" title="Edit">
                      <Pencil size={14} strokeWidth={2} />
                    </button>
                    <button onClick={() => setDeleteId(p.id_peternakan)} className="btn-icon delete" title="Hapus">
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <MapPin size={32} strokeWidth={1.5} style={{ opacity: 0.4 }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      {search ? 'Tidak ada peternakan yang cocok.' : 'Belum ada data peternakan.'}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '12px', flexShrink: 0,
                  background: modalType === 'create' ? 'linear-gradient(135deg, var(--green-500), var(--green-700))' : 'linear-gradient(135deg, var(--indigo-500), #818cf8)',
                  boxShadow: modalType === 'create' ? 'var(--shadow-green)' : 'var(--shadow-indigo)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {modalType === 'create' ? <Plus size={18} strokeWidth={2.5} color="#fff" /> : <Pencil size={16} strokeWidth={2} color="#fff" />}
                </div>
                <div>
                  <h2>{modalType === 'create' ? 'Tambah Peternakan' : 'Edit Peternakan'}</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
                    {modalType === 'create' ? 'Isi data peternakan baru.' : `Mengubah: ${selectedItem?.nama_peternakan}`}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="btn-icon" title="Tutup">
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className="modal-body">
                <div className="input-group">
                  <label htmlFor="f-nama">Nama Peternakan</label>
                  <input
                    type="text" id="f-nama" name="nama_peternakan"
                    placeholder="Contoh: Peternakan Jaya Makmur"
                    value={form.nama_peternakan} onChange={handleFormChange}
                    disabled={isSubmitting}
                    className={formErrors.nama_peternakan ? 'input-error' : ''}
                  />
                  <ErrorText msg={formErrors.nama_peternakan} />
                </div>

                <div className="input-group">
                  <label htmlFor="f-kota">Kota</label>
                  <input
                    type="text" id="f-kota" name="kota"
                    placeholder="Contoh: Sleman"
                    value={form.kota} onChange={handleFormChange}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="f-provinsi">Provinsi</label>
                  <input
                    type="text" id="f-provinsi" name="provinsi"
                    placeholder="Contoh: Yogyakarta"
                    value={form.provinsi} onChange={handleFormChange}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="f-luas">Luas Lahan (hektar)</label>
                  <input
                    type="number" id="f-luas" name="luas_lahan"
                    placeholder="Contoh: 1500.5"
                    value={form.luas_lahan} onChange={handleFormChange}
                    disabled={isSubmitting} step="any"
                    className={formErrors.luas_lahan ? 'input-error' : ''}
                  />
                  <ErrorText msg={formErrors.luas_lahan} />
                </div>

                <div className="input-group">
                  <label htmlFor="f-alamat">Alamat Lengkap</label>
                  <textarea
                    id="f-alamat" name="alamat"
                    placeholder="Masukkan alamat lengkap peternakan"
                    value={form.alamat} onChange={handleFormChange}
                    disabled={isSubmitting} rows="3"
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
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" disabled={isSubmitting}>
                  Batal
                </button>
                <button type="submit" className="btn-action-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 size={14} style={{ animation: 'spin 0.9s linear infinite' }} /> Menyimpan...</>
                  ) : (
                    <><Save size={14} strokeWidth={2.5} /> {modalType === 'create' ? 'Simpan' : 'Perbarui'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Konfirmasi Hapus</h2>
              <button onClick={() => setDeleteId(null)} className="btn-icon" title="Tutup">
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-main)', fontSize: '14px', lineHeight: 1.6 }}>
                Apakah Anda yakin ingin menghapus peternakan ini? Tindakan tidak dapat dibatalkan.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeleteId(null)} className="btn-secondary">Batal</button>
              <button onClick={confirmDelete} className="btn-icon delete" style={{ padding: '10px 20px', width: 'auto' }}>
                <Trash2 size={14} strokeWidth={2} /> Hapus
              </button>
            </div>
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

export default PeternakanList;