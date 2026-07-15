import { useState, useEffect } from 'react';
import {
  Pencil, Trash2, Search, AlertTriangle,
  CheckCircle, XCircle, X, Loader2, Bell, PlusCircle
} from 'lucide-react';
import api from '../services/api';

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <Loader2 size={32} strokeWidth={2} style={{ color: 'var(--primary)', animation: 'spin 0.9s linear infinite' }} />
  </div>
);

const Toast = ({ toast }) => (
  <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
    {toast.type === 'error' ? <XCircle size={16} strokeWidth={2} style={{ flexShrink: 0 }} /> : <CheckCircle size={16} strokeWidth={2} style={{ flexShrink: 0 }} />}
    <span>{toast.message}</span>
  </div>
);

const ErrorText = ({ msg }) => msg ? <span style={{ fontSize: '12px', color: 'var(--red-500)', fontWeight: 600, marginTop: '4px', display: 'block' }}>{msg}</span> : null;

const getTingkatBadge = (tingkat) => {
  const styles = {
    'Ringan': { bg: 'var(--green-100)', color: 'var(--green-700)', border: 'var(--green-200)' },
    'Sedang': { bg: 'var(--amber-100)', color: 'var(--amber-500)', border: 'var(--amber-100)' },
    'Berat': { bg: 'var(--red-100)', color: 'var(--red-500)', border: 'rgba(239,68,68,0.3)' },
  };
  const s = styles[tingkat] || { bg: 'var(--slate-100)', color: 'var(--slate-500)', border: 'var(--slate-200)' };
  return (
    <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {tingkat || '-'}
    </span>
  );
};

const STATUS_LABELS = { belum_ditangani: 'BELUM DITANGANI', sudah_ditangani: 'SUDAH DITANGANI' };

const getStatusBadge = (status) => {
  const isDone = status === 'sudah_ditangani';
  const s = isDone ? { bg: 'var(--green-100)', color: 'var(--green-700)', border: 'var(--green-200)' } : { bg: 'var(--amber-100)', color: 'var(--amber-500)', border: 'var(--amber-100)' };
  return (
    <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {STATUS_LABELS[status] || status || '-'}
    </span>
  );
};

// Badge kecil untuk menandai peringatan yang belum tercatat resmi di tabel `peringatan`
const AutoBadge = () => (
  <span style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--indigo-100, #e0e7ff)', color: 'var(--indigo-500, #6366f1)', border: '1px solid rgba(99,102,241,0.3)', marginLeft: '6px' }}>
    Otomatis
  </span>
);

/**
 * Menggabungkan data peringatan resmi (dari tabel `peringatan`) dengan
 * ternak yang berstatus "sakit" tapi belum punya record peringatan aktif.
 * Ini memastikan semua ternak sakit tetap muncul di daftar, walaupun
 * belum ada yang input peringatan secara manual / belum ada trigger backend.
 */
const gabungkanDenganTernakSakit = (peringatanData, ternakData) => {
  const idTernakDenganPeringatanAktif = new Set(
    peringatanData
      .filter(p => p.status !== 'sudah_ditangani')
      .map(p => p.id_ternak)
  );

  const peringatanOtomatis = ternakData
    .filter(t => t.status_kesehatan === 'sakit' && !idTernakDenganPeringatanAktif.has(t.id_ternak))
    .map(t => ({
      id_peringatan: `auto-${t.id_ternak}`,
      id_ternak: t.id_ternak,
      ternak: t,
      jenis_peringatan: 'Status Kesehatan',
      tingkat_peringatan: 'Berat',
      pesan: `Ternak ${t.nama_ternak} (${t.kode_ternak}) berstatus sakit, belum ada peringatan resmi.`,
      status: 'belum_ditangani',
      isAuto: true,
    }));

  return [...peringatanOtomatis, ...peringatanData];
};

const PeringatanList = () => {
  const [data, setData] = useState([]);
  const [ternakList, setTernakList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterTingkat, setFilterTingkat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ id_ternak: '', jenis_peringatan: '', tingkat_peringatan: '', pesan: '', status: 'belum_ditangani' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const fetchData = async () => {
    try {
      const [pRes, tRes] = await Promise.all([api.get('/peringatan'), api.get('/ternak')]);
      const peringatanData = pRes.data.status === 'success' ? pRes.data.data : [];
      const ternakData = tRes.data.status === 'success' ? tRes.data.data : [];
      setTernakList(ternakData);
      setData(gabungkanDenganTernakSakit(peringatanData, ternakData));
    } catch (err) {
      setError('Gagal memuat data peringatan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (item) => {
    setSelectedItem(item);
    setForm({ id_ternak: item.id_ternak || '', jenis_peringatan: item.jenis_peringatan || '', tingkat_peringatan: item.tingkat_peringatan || '', pesan: item.pesan || '', status: item.status || 'belum_ditangani' });
    setFormErrors({}); setShowModal(true);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};
    if (!form.id_ternak) errors.id_ternak = 'Ternak wajib dipilih.';
    if (!form.jenis_peringatan.trim()) errors.jenis_peringatan = 'Jenis peringatan wajib diisi.';
    if (!form.tingkat_peringatan) errors.tingkat_peringatan = 'Tingkat wajib dipilih.';
    if (!form.pesan.trim()) errors.pesan = 'Pesan wajib diisi.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      // Kalau item ini "Otomatis" (belum ada di tabel peringatan), buat record baru (POST).
      // Kalau sudah ada record resminya, update seperti biasa (PUT).
      const res = selectedItem?.isAuto
        ? await api.post('/peringatan', form)
        : await api.put(`/peringatan/${selectedItem.id_peringatan}`, form);

      if (res.data.status === 'success') {
        addToast(selectedItem?.isAuto ? 'Peringatan resmi berhasil dibuat!' : 'Peringatan berhasil diperbarui!');
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Terjadi kesalahan sistem.';
      addToast(errMsg, 'error');
      if (err.response?.data?.errors) setFormErrors(err.response.data.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete(`/peringatan/${deleteId}`);
      if (res.data.status === 'success') { addToast('Peringatan berhasil dihapus.'); setDeleteId(null); fetchData(); }
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menghapus peringatan.', 'error');
    }
  };

  const filtered = data.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.jenis_peringatan?.toLowerCase().includes(q) || p.pesan?.toLowerCase().includes(q) || p.ternak?.nama_ternak?.toLowerCase().includes(q);
    const matchTingkat = !filterTingkat || p.tingkat_peringatan === filterTingkat;
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchTingkat && matchStatus;
  });

  if (loading) return <Spinner />;

  return (
    <div className="content-card">
      <div className="table-actions-row">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-heading)' }}>Monitoring Peringatan</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', fontWeight: 500 }}>Kelola peringatan dan notifikasi kesehatan ternak. Ternak berstatus sakit otomatis tampil di sini.</p>
        </div>
      </div>

      {error && <div className="alert-banner"><AlertTriangle size={15} strokeWidth={2} style={{ flexShrink: 0 }} /><span>{error}</span></div>}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ flex: '1 1 240px' }}>
          <span className="search-icon"><Search size={14} strokeWidth={2} /></span>
          <input type="text" placeholder="Cari peringatan..." className="search-input" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={filterTingkat} onChange={e => setFilterTingkat(e.target.value)} className="search-input" style={{ flex: '0 1 160px' }}>
          <option value="">Semua Tingkat</option>
          <option value="Ringan">Ringan</option>
          <option value="Sedang">Sedang</option>
          <option value="Berat">Berat</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="search-input" style={{ flex: '0 1 140px' }}>
          <option value="">Semua Status</option>
          <option value="belum_ditangani">Belum Ditangani</option>
          <option value="sudah_ditangani">Sudah Ditangani</option>
        </select>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600 }}>
        Menampilkan {filtered.length} peringatan
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Ternak</th>
              <th>Jenis Peringatan</th>
              <th>Tingkat</th>
              <th>Pesan</th>
              <th>Status</th>
              <th style={{ width: '110px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(p => (
              <tr key={p.id_peringatan}>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '13px' }}>{p.ternak?.nama_ternak || '-'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{p.ternak?.kode_ternak || '-'}</div>
                </td>
                <td style={{ color: 'var(--text-heading)', fontWeight: 600 }}>
                  {p.jenis_peringatan}
                  {p.isAuto && <AutoBadge />}
                </td>
                <td>{getTingkatBadge(p.tingkat_peringatan)}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.pesan}</td>
                <td>{getStatusBadge(p.status)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    {p.isAuto ? (
                      <button onClick={() => openEdit(p)} className="btn-icon" title="Buat peringatan resmi">
                        <PlusCircle size={14} strokeWidth={2} />
                      </button>
                    ) : (
                      <>
                        <button onClick={() => openEdit(p)} className="btn-icon" title="Edit"><Pencil size={14} strokeWidth={2} /></button>
                        <button onClick={() => setDeleteId(p.id_peringatan)} className="btn-icon delete" title="Hapus"><Trash2 size={14} strokeWidth={2} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <Bell size={32} strokeWidth={1.5} style={{ opacity: 0.4 }} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{search || filterTingkat || filterStatus ? 'Tidak ada peringatan yang cocok.' : 'Belum ada data peringatan.'}</span>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 38, height: 38, borderRadius: '12px', flexShrink: 0, background: 'linear-gradient(135deg, var(--indigo-500), #818cf8)', boxShadow: 'var(--shadow-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pencil size={16} strokeWidth={2} color="#fff" />
                </div>
                <div>
                  <h2>{selectedItem?.isAuto ? 'Buat Peringatan Resmi' : 'Edit Peringatan'}</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>{`Untuk ternak: ${selectedItem?.ternak?.nama_ternak || ''}`}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="btn-icon" title="Tutup"><X size={16} strokeWidth={2} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className="modal-body">
                <div className="input-group">
                  <label htmlFor="f-ternak">Ternak</label>
                  <select id="f-ternak" name="id_ternak" value={form.id_ternak} onChange={handleFormChange} disabled={isSubmitting} className={formErrors.id_ternak ? 'input-error' : ''}>
                    <option value="">-- Pilih Ternak --</option>
                    {ternakList.map(t => <option key={t.id_ternak} value={t.id_ternak}>{t.kode_ternak} - {t.nama_ternak}</option>)}
                  </select>
                  <ErrorText msg={formErrors.id_ternak} />
                </div>
                <div className="input-group">
                  <label htmlFor="f-jenis">Jenis Peringatan</label>
                  <input type="text" id="f-jenis" name="jenis_peringatan" placeholder="Contoh: Demam, Nafsu Makan Menurun" value={form.jenis_peringatan} onChange={handleFormChange} disabled={isSubmitting} className={formErrors.jenis_peringatan ? 'input-error' : ''} />
                  <ErrorText msg={formErrors.jenis_peringatan} />
                </div>
                <div className="input-group">
                  <label htmlFor="f-tingkat">Tingkat Peringatan</label>
                  <select id="f-tingkat" name="tingkat_peringatan" value={form.tingkat_peringatan} onChange={handleFormChange} disabled={isSubmitting} className={formErrors.tingkat_peringatan ? 'input-error' : ''}>
                    <option value="">-- Pilih Tingkat --</option>
                    <option value="Ringan">Ringan</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Berat">Berat</option>
                  </select>
                  <ErrorText msg={formErrors.tingkat_peringatan} />
                </div>
                <div className="input-group">
                  <label htmlFor="f-status">Status</label>
                  <select id="f-status" name="status" value={form.status} onChange={handleFormChange} disabled={isSubmitting}>
                    <option value="belum_ditangani">Belum Ditangani</option>
                    <option value="sudah_ditangani">Sudah Ditangani</option>
                  </select>
                </div>
                <div className="input-group">
                  <label htmlFor="f-pesan">Pesan / Keterangan</label>
                  <textarea id="f-pesan" name="pesan" placeholder="Masukkan detail peringatan..." value={form.pesan} onChange={handleFormChange} disabled={isSubmitting} rows={3} className={formErrors.pesan ? 'input-error' : ''}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', fontFamily: 'var(--font-body)', fontSize: '13.5px', outline: 'none', resize: 'vertical' }} />
                  <ErrorText msg={formErrors.pesan} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" disabled={isSubmitting}>Batal</button>
                <button type="submit" className="btn-action-primary" disabled={isSubmitting}>
                  {isSubmitting
                    ? <><Loader2 size={14} style={{ animation: 'spin 0.9s linear infinite' }} /> Menyimpan...</>
                    : <><CheckCircle size={14} strokeWidth={2} /> {selectedItem?.isAuto ? 'Simpan sebagai Peringatan' : 'Perbarui'}</>
                  }
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
              <button onClick={() => setDeleteId(null)} className="btn-icon"><X size={16} strokeWidth={2} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-main)', fontSize: '14px', lineHeight: 1.6 }}>Apakah Anda yakin ingin menghapus peringatan ini? Tindakan tidak dapat dibatalkan.</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeleteId(null)} className="btn-secondary">Batal</button>
              <button onClick={confirmDelete} className="btn-icon delete" style={{ padding: '10px 20px', width: 'auto' }}><Trash2 size={14} strokeWidth={2} /> Hapus</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: '28px', right: '28px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 999 }}>
        {toasts.map(t => <Toast key={t.id} toast={t} />)}
      </div>
    </div>
  );
};

export default PeringatanList;