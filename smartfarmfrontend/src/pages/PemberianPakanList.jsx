import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Search, AlertTriangle,
  CheckCircle, XCircle, X, Loader2, Filter,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast,
  Calendar, Save
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

const SkeletonRow = () => (
  <tr>
    {[...Array(6)].map((_, i) => (
      <td key={i} style={{ padding: '15px 18px' }}>
        <div style={{
          height: '14px', borderRadius: '6px',
          background: 'var(--slate-100)', animation: 'shimmer 1.5s infinite',
          width: `${60 + Math.random() * 30}%`,
        }} />
      </td>
    ))}
  </tr>
);

const PemberianPakanList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterTernak, setFilterTernak] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [sortField, setSortField] = useState('id_pemberian');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [ternakList, setTernakList] = useState([]);
  const [jenisList, setJenisList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [selectedPemberian, setSelectedPemberian] = useState(null);
  const [form, setForm] = useState({
    id_ternak: '',
    id_pakan: '',
    jumlah: '',
    keterangan: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const perPage = 10;

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const fetchData = async () => {
    try {
      const [pemberianRes, ternakRes, jenisRes] = await Promise.all([
        api.get('/pemberian-pakan'),
        api.get('/ternak'),
        api.get('/jenis-pakan'),
      ]);
      if (pemberianRes.data.status === 'success') setData(pemberianRes.data.data);
      if (ternakRes.data.status === 'success') setTernakList(ternakRes.data.data);
      if (jenisRes.data.status === 'success') setJenisList(jenisRes.data.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data pemberian pakan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setModalType('create');
    setSelectedPemberian(null);
    setForm({
      id_ternak: '',
      id_pakan: '',
      jumlah: '',
      keterangan: '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (p) => {
    setModalType('edit');
    setSelectedPemberian(p);
    setForm({
      id_ternak: p.id_ternak || '',
      id_pakan: p.id_pakan || '',
      jumlah: p.jumlah || '',
      keterangan: p.keterangan || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};
    if (!form.id_ternak) errors.id_ternak = 'Ternak wajib dipilih.';
    if (!form.id_pakan) errors.id_pakan = 'Jenis pakan wajib dipilih.';
    if (!form.jumlah) {
      errors.jumlah = 'Jumlah pakan wajib diisi.';
    } else {
      const num = parseFloat(form.jumlah);
      if (isNaN(num) || num <= 0) {
        errors.jumlah = 'Jumlah pakan harus berupa angka lebih dari 0.';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (modalType === 'create') {
        const res = await api.post('/pemberian-pakan', form);
        if (res.data.status === 'success') {
          addToast('Pemberian pakan berhasil dicatat!');
          setShowModal(false);
          fetchData();
        }
      } else {
        const res = await api.put(`/pemberian-pakan/${selectedPemberian.id_pemberian}`, form);
        if (res.data.status === 'success') {
          addToast('Catatan pemberian pakan berhasil diperbarui!');
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
    const matchSearch =
      !q || p.ternak?.nama_ternak?.toLowerCase().includes(q)
      || p.ternak?.kode_ternak?.toLowerCase().includes(q)
      || p.jenis_pakan?.nama_pakan?.toLowerCase().includes(q)
      || p.keterangan?.toLowerCase().includes(q);
    const matchTernak = !filterTernak || p.id_ternak == filterTernak;
    const matchJenis = !filterJenis || p.id_pakan == filterJenis;
    return matchSearch && matchTernak && matchJenis;
  });

  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortField], bv = b[sortField];
    if (sortField.includes('.')) {
      const [k1, k2] = sortField.split('.');
      av = a[k1]?.[k2]; bv = b[k1]?.[k2];
    }
    if (av == null) return 1; if (bv == null) return -1;
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / perPage);
  const paged = sorted.slice((currentPage - 1) * perPage, currentPage * perPage);

  useEffect(() => { setCurrentPage(1); }, [search, filterTernak, filterJenis]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete(`/pemberian-pakan/${deleteId}`);
      if (res.data.status === 'success') {
        addToast('Catatan pemberian pakan berhasil dihapus. Stok telah dikembalikan.');
        setDeleteId(null);
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menghapus catatan pemberian pakan.', 'error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="content-card">
      {/* Header */}
      <div className="table-actions-row">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-heading)' }}>
            Riwayat Pemberian Pakan
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', fontWeight: 500 }}>
            Catatan pemberian pakan untuk setiap ternak.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/admin/pakan/stok')} className="btn-secondary">
            <Calendar size={15} strokeWidth={2} /> Lihat Stok
          </button>
          <button onClick={openCreate} className="btn-action-primary">
            <Plus size={15} strokeWidth={2.5} /> Catat Pemberian
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-banner">
          <AlertTriangle size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ flex: '1 1 280px' }}>
          <span className="search-icon"><Search size={14} strokeWidth={2} /></span>
          <input
            type="text" placeholder="Cari nama ternak, kode, atau pakan..."
            className="search-input" value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select value={filterTernak} onChange={e => setFilterTernak(e.target.value)} className="search-input" style={{ flex: '0 1 180px' }}>
          <option value="">Semua Ternak</option>
          {ternakList.map(t => <option key={t.id_ternak} value={t.id_ternak}>{t.kode_ternak} - {t.nama_ternak}</option>)}
        </select>
        <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)} className="search-input" style={{ flex: '0 1 180px' }}>
          <option value="">Semua Jenis Pakan</option>
          {jenisList.map(j => <option key={j.id_pakan} value={j.id_pakan}>{j.nama_pakan}</option>)}
        </select>
      </div>

      {/* Info bar */}
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600 }}>
        Menampilkan {paged.length} dari {sorted.length} catatan {filtered.length !== data.length && ` (difilter dari ${data.length} total)`}
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('tanggal')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Tanggal <SortIcon field="tanggal" /></div>
              </th>
              <th>Ternak</th>
              <th>Jenis Pakan</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('jumlah')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Jumlah <SortIcon field="jumlah" /></div>
              </th>
              <th>Keterangan</th>
              <th style={{ width: '110px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : paged.length > 0 ? (
              paged.map(p => (
                <tr key={p.id_pemberian}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{p.tanggal || '-'}</td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '13px' }}>{p.ternak?.nama_ternak || '-'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{p.ternak?.kode_ternak || '-'}</div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{p.jenis_pakan?.nama_pakan || '-'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.jumlah} {p.jenis_pakan?.satuan || 'kg'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{p.keterangan || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button onClick={() => openEdit(p)} className="btn-icon" title="Edit">
                        <Pencil size={14} strokeWidth={2} />
                      </button>
                      <button onClick={() => setDeleteId(p.id_pemberian)} className="btn-icon delete" title="Hapus">
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <Filter size={32} strokeWidth={1.5} style={{ opacity: 0.4 }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      {search || filterTernak || filterJenis ? 'Tidak ada catatan yang cocok dengan filter.' : 'Belum ada catatan pemberian pakan.'}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Halaman {currentPage} dari {totalPages}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="btn-icon" title="First">
              <ChevronFirst size={14} />
            </button>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-icon" title="Previous">
              <ChevronLeft size={14} />
            </button>
            {[...Array(totalPages)].map((_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1).map((p, idx, arr) => (
              <span key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>...</span>}
                <button onClick={() => setCurrentPage(p)} className="btn-icon" style={p === currentPage ? { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' } : {}}>
                  {p}
                </button>
              </span>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-icon" title="Next">
              <ChevronRight size={14} />
            </button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="btn-icon" title="Last">
              <ChevronLast size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
                Apakah Anda yakin ingin menghapus catatan pemberian pakan ini? Stok pakan akan dikembalikan ke inventory.
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
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
                  <h2>{modalType === 'create' ? 'Catat Pemberian Pakan' : 'Edit Catatan Pemberian Pakan'}</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
                    {modalType === 'create'
                      ? 'Isi detail pemberian pakan untuk ternak.'
                      : `Mengubah catatan: ${selectedPemberian?.ternak?.nama_ternak || 'Ternak'}`}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="btn-icon" title="Tutup" style={{ flexShrink: 0 }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'contents' }}>
              <div className="modal-body">
                <div className="input-group">
                  <label htmlFor="f-ternak">Pilih Ternak</label>
                  <select
                    id="f-ternak"
                    name="id_ternak"
                    value={form.id_ternak}
                    onChange={handleFormChange}
                    disabled={isSubmitting}
                    className={formErrors.id_ternak ? 'input-error' : ''}
                  >
                    <option value="">-- Pilih Ternak --</option>
                    {ternakList.map(t => (
                      <option key={t.id_ternak} value={t.id_ternak}>
                        {t.kode_ternak} - {t.nama_ternak}
                      </option>
                    ))}
                  </select>
                  {formErrors.id_ternak && (
                    <span style={{ fontSize: '12px', color: 'var(--red-500)', fontWeight: 600, marginTop: '4px', display: 'block' }}>
                      {formErrors.id_ternak}
                    </span>
                  )}
                </div>

                <div className="input-group">
                  <label htmlFor="f-pakan">Pilih Jenis Pakan</label>
                  <select
                    id="f-pakan"
                    name="id_pakan"
                    value={form.id_pakan}
                    onChange={handleFormChange}
                    disabled={isSubmitting}
                    className={formErrors.id_pakan ? 'input-error' : ''}
                  >
                    <option value="">-- Pilih Jenis Pakan --</option>
                    {jenisList.map(j => (
                      <option key={j.id_pakan} value={j.id_pakan}>
                        {j.nama_pakan} ({j.satuan})
                      </option>
                    ))}
                  </select>
                  {formErrors.id_pakan && (
                    <span style={{ fontSize: '12px', color: 'var(--red-500)', fontWeight: 600, marginTop: '4px', display: 'block' }}>
                      {formErrors.id_pakan}
                    </span>
                  )}
                </div>

                <div className="input-group">
                  <label htmlFor="f-jumlah">Jumlah</label>
                  <input
                    type="number"
                    id="f-jumlah"
                    name="jumlah"
                    placeholder="Contoh: 20"
                    value={form.jumlah}
                    onChange={handleFormChange}
                    disabled={isSubmitting}
                    step="any"
                    className={formErrors.jumlah ? 'input-error' : ''}
                  />
                  {formErrors.jumlah && (
                    <span style={{ fontSize: '12px', color: 'var(--red-500)', fontWeight: 600, marginTop: '4px', display: 'block' }}>
                      {formErrors.jumlah}
                    </span>
                  )}
                </div>

                <div className="input-group">
                  <label htmlFor="f-keterangan">Keterangan (Opsional)</label>
                  <textarea
                    id="f-keterangan"
                    name="keterangan"
                    placeholder="Contoh: Pemberian pakan pagi hari"
                    value={form.keterangan}
                    onChange={handleFormChange}
                    disabled={isSubmitting}
                    rows="3"
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
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" disabled={isSubmitting}>
                  Batal
                </button>
                <button type="submit" className="btn-action-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} strokeWidth={2.5} style={{ animation: 'spin 0.9s linear infinite' }} />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} strokeWidth={2.5} />
                      <span>{modalType === 'create' ? 'Simpan Catatan' : 'Perbarui Catatan'}</span>
                    </>
                  )}
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

export default PemberianPakanList;
