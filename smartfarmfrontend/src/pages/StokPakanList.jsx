import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Search, AlertTriangle,
  CheckCircle, XCircle, X, Loader2, Filter,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast,
  Package,
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

const StatusBadge = ({ jumlah, stokMinimum }) => {
  const jumlahValue = Number(jumlah ?? 0);
  const minimumValue = Number(stokMinimum ?? 0);
  const isLow = jumlahValue < minimumValue;

  const style = isLow
    ? { color: 'var(--red-500)', bg: 'var(--red-100)', border: 'rgba(239,68,68,0.3)' }
    : { color: 'var(--green-700)', bg: 'var(--green-100)', border: 'var(--green-200)' };
  
  return (
    <span style={{
      padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 800,
      textTransform: 'uppercase', letterSpacing: '0.07em', background: style.bg,
      color: style.color, border: `1px solid ${style.border}`,
    }}>
      {isLow ? 'Menipis' : 'Normal'}
    </span>
  );
};

const SkeletonRow = () => (
  <tr>
    {[...Array(8)].map((_, i) => (
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

const StokPakanList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterFarm, setFilterFarm] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [sortField, setSortField] = useState('id_stok');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [farms, setFarms] = useState([]);
  const [jenisList, setJenisList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStok, setEditingStok] = useState(null);
  const perPage = 10;

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const fetchData = async () => {
    try {
      const [stokRes, farmRes, jenisRes] = await Promise.all([
        api.get('/stok-pakan'),
        api.get('/peternakan'),
        api.get('/jenis-pakan'),
      ]);
      if (stokRes.data.status === 'success') setData(stokRes.data.data);
      if (farmRes.data.status === 'success') setFarms(farmRes.data.data);
      if (jenisRes.data.status === 'success') setJenisList(jenisRes.data.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data stok pakan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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

  const filtered = data.filter(s => {
    const q = search.toLowerCase();
    const matchSearch =
      !q || s.jenis_pakan?.nama_pakan?.toLowerCase().includes(q)
      || s.peternakan?.nama_peternakan?.toLowerCase().includes(q);
    const matchFarm = !filterFarm || s.id_peternakan == filterFarm;
    const matchJenis = !filterJenis || s.id_pakan == filterJenis;
    return matchSearch && matchFarm && matchJenis;
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

  useEffect(() => { setCurrentPage(1); }, [search, filterFarm, filterJenis]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete(`/stok-pakan/${deleteId}`);
      if (res.data.status === 'success') {
        addToast('Stok pakan berhasil dihapus.');
        setDeleteId(null);
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menghapus stok pakan.', 'error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="content-card">
      {/* Header */}
      <div className="table-actions-row">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-heading)' }}>
            Kelola Stok Pakan
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', fontWeight: 500 }}>
            Monitoring ketersediaan pakan di setiap peternakan.
          </p>
        </div>
        <button onClick={() => navigate('/admin/pakan/jenis')} className="btn-action-primary">
          <Package size={15} strokeWidth={2.5} /> Kelola Jenis Pakan
        </button>
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
            type="text" placeholder="Cari nama pakan atau peternakan..."
            className="search-input" value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select value={filterFarm} onChange={e => setFilterFarm(e.target.value)} className="search-input" style={{ flex: '0 1 180px' }}>
          <option value="">Semua Peternakan</option>
          {farms.map(f => <option key={f.id_peternakan} value={f.id_peternakan}>{f.nama_peternakan}</option>)}
        </select>
        <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)} className="search-input" style={{ flex: '0 1 180px' }}>
          <option value="">Semua Jenis Pakan</option>
          {jenisList.map(j => <option key={j.id_pakan} value={j.id_pakan}>{j.nama_pakan}</option>)}
        </select>
      </div>

      {/* Info bar */}
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600 }}>
        Menampilkan {paged.length} dari {sorted.length} stok pakan {filtered.length !== data.length && ` (difilter dari ${data.length} total)`}
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('jenis_pakan.nama_pakan')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Nama Pakan <SortIcon field="jenis_pakan.nama_pakan" /></div>
              </th>
              <th>Peternakan</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('jumlah')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Jumlah <SortIcon field="jumlah" /></div>
              </th>
              <th>Satuan</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('stok_minimum')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Minimum <SortIcon field="stok_minimum" /></div>
              </th>
              <th>Status</th>
              <th>Terakhir Update</th>
              <th style={{ width: '110px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : paged.length > 0 ? (
              paged.map(s => (
                <tr key={s.id_stok}>
                  <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{s.jenis_pakan?.nama_pakan || '-'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{s.peternakan?.nama_peternakan || '-'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{s.jumlah}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.jenis_pakan?.satuan || '-'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.stok_minimum}</td>
                  <td><StatusBadge jumlah={s.jumlah} stokMinimum={s.stok_minimum} /></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{s.terakhir_update || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button onClick={() => navigate('/admin/pakan/pemberian')} className="btn-icon" title="Catat Pemberian">
                        <Plus size={14} strokeWidth={2} />
                      </button>
                      <button onClick={() => setDeleteId(s.id_stok)} className="btn-icon delete" title="Hapus">
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <Filter size={32} strokeWidth={1.5} style={{ opacity: 0.4 }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      {search || filterFarm || filterJenis ? 'Tidak ada stok yang cocok dengan filter.' : 'Belum ada data stok pakan.'}
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
                Apakah Anda yakin ingin menghapus stok pakan ini? Tindakan ini tidak dapat dibatalkan.
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

export default StokPakanList;
