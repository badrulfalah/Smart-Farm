import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Search, AlertTriangle,
  CheckCircle, XCircle, X, Loader2, Eye, Filter,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast,
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

const HealthBadge = ({ status }) => {
  const styles = {
    Sehat: { color: 'var(--green-700)', bg: 'var(--green-100)', border: 'var(--green-200)' },
    Sakit: { color: 'var(--red-500)', bg: 'var(--red-100)', border: 'rgba(239,68,68,0.3)' },
    default: { color: 'var(--slate-500)', bg: 'var(--slate-100)', border: 'var(--slate-200)' },
  };
  const s = styles[status] || styles.default;
  return (
    <span style={{
      padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 800,
      textTransform: 'uppercase', letterSpacing: '0.07em', background: s.bg,
      color: s.color, border: `1px solid ${s.border}`,
    }}>
      {status || 'Unknown'}
    </span>
  );
};

const SkeletonRow = () => (
  <tr>
    {[...Array(9)].map((_, i) => (
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

const TernakList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterFarm, setFilterFarm] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState('id_ternak');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [farms, setFarms] = useState([]);
  const [jenisList, setJenisList] = useState([]);
  const perPage = 10;

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const fetchData = async () => {
    try {
      const [ternakRes, farmRes, jenisRes] = await Promise.all([
        api.get('/ternak'),
        api.get('/peternakan'),
        api.get('/jenis-ternak'),
      ]);
      if (ternakRes.data.status === 'success') setData(ternakRes.data.data);
      if (farmRes.data.status === 'success') setFarms(farmRes.data.data);
      if (jenisRes.data.status === 'success') setJenisList(jenisRes.data.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data ternak.');
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

  const filtered = data.filter(t => {
    const q = search.toLowerCase();
    const matchSearch =
      !q || t.kode_ternak?.toLowerCase().includes(q)
      || t.nama_ternak?.toLowerCase().includes(q)
      || t.jenis_ternak?.nama_jenis?.toLowerCase().includes(q)
      || t.peternakan?.nama_peternakan?.toLowerCase().includes(q);
    const matchFarm = !filterFarm || t.id_peternakan == filterFarm;
    const matchJenis = !filterJenis || t.id_jenis == filterJenis;
    const matchStatus = !filterStatus || t.status_kesehatan === filterStatus;
    return matchSearch && matchFarm && matchJenis && matchStatus;
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

  useEffect(() => { setCurrentPage(1); }, [search, filterFarm, filterJenis, filterStatus]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete(`/ternak/${deleteId}`);
      if (res.data.status === 'success') {
        addToast('Ternak berhasil dihapus.');
        setDeleteId(null);
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menghapus ternak.', 'error');
    }
  };

  const fotoUrl = (foto) => {
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    // Hapus trailing /api dari base URL
    const base = import.meta.env.VITE_API_URL.replace(/\/api$/, '');
    return `${base}/storage/${foto}`;
  };
  if (loading) return <Spinner />;

  return (
    <div className="content-card">
      {/* Header */}
      <div className="table-actions-row">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-heading)' }}>
            Manajemen Ternak
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', fontWeight: 500 }}>
            Kelola data ternak dan monitoring kesehatan hewan.
          </p>
        </div>
        <button onClick={() => navigate('/admin/ternak/create')} className="btn-action-primary">
          <Plus size={15} strokeWidth={2.5} /> Tambah Ternak
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
            type="text" placeholder="Cari kode atau nama ternak..."
            className="search-input" value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select value={filterFarm} onChange={e => setFilterFarm(e.target.value)} className="search-input" style={{ flex: '0 1 180px' }}>
          <option value="">Semua Peternakan</option>
          {farms.map(f => <option key={f.id_peternakan} value={f.id_peternakan}>{f.nama_peternakan}</option>)}
        </select>
        <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)} className="search-input" style={{ flex: '0 1 180px' }}>
          <option value="">Semua Jenis</option>
          {jenisList.map(j => <option key={j.id_jenis} value={j.id_jenis}>{j.nama_jenis}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="search-input" style={{ flex: '0 1 150px' }}>
          <option value="">Semua Status</option>
          <option value="Sehat">Sehat</option>
          <option value="Sakit">Sakit</option>
        </select>
      </div>

      {/* Info bar */}
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600 }}>
        Menampilkan {paged.length} dari {sorted.length} ternak {filtered.length !== data.length && ` (difilter dari ${data.length} total)`}
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '70px' }}>Foto</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('kode_ternak')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Kode <SortIcon field="kode_ternak" /></div>
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('nama_ternak')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Nama <SortIcon field="nama_ternak" /></div>
              </th>
              <th>Jenis</th>
              <th>Peternakan</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('umur')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Umur <SortIcon field="umur" /></div>
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('berat')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Berat (kg) <SortIcon field="berat" /></div>
              </th>
              <th>Status</th>
              <th style={{ width: '110px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : paged.length > 0 ? (
              paged.map(t => (
                <tr key={t.id_ternak}>
                  <td>
                    {t.foto ? (
                      <img src={fotoUrl(t.foto)} alt={t.nama_ternak} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        No Photo
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-heading)', fontFamily: 'monospace', fontSize: '12px' }}>{t.kode_ternak}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{t.nama_ternak}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{t.jenis_ternak?.nama_jenis || '-'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{t.peternakan?.nama_peternakan || '-'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{t.umur} bulan</td>
                  <td style={{ color: 'var(--text-muted)' }}>{t.berat}</td>
                  <td><HealthBadge status={t.status_kesehatan} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button onClick={() => navigate(`/admin/ternak/${t.id_ternak}`)} className="btn-icon" title="Detail">
                        <Eye size={14} strokeWidth={2} />
                      </button>
                      <button onClick={() => navigate(`/admin/ternak/${t.id_ternak}/edit`)} className="btn-icon" title="Edit">
                        <Pencil size={14} strokeWidth={2} />
                      </button>
                      <button onClick={() => setDeleteId(t.id_ternak)} className="btn-icon delete" title="Hapus">
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <Filter size={32} strokeWidth={1.5} style={{ opacity: 0.4 }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      {search || filterFarm || filterJenis || filterStatus ? 'Tidak ada ternak yang cocok dengan filter.' : 'Belum ada data ternak.'}
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
                Apakah Anda yakin ingin menghapus ternak ini? Tindakan ini tidak dapat dibatalkan.
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

export default TernakList;
