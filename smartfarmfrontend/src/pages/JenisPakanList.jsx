import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, Search, AlertTriangle,
  CheckCircle, XCircle, X, Loader2, Package, Filter,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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

const JenisPakanList = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedJenis, setSelectedJenis] = useState(null);
  const [namaPakan, setNamaPakan] = useState('');
  const [kandunganNutrisi, setKandunganNutrisi] = useState('');
  const [satuan, setSatuan] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const fetchData = async () => {
    try {
      const res = await api.get('/jenis-pakan');
      if (res.data.status === 'success') setData(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data jenis pakan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setModalType('create'); setSelectedJenis(null);
    setNamaPakan(''); setKandunganNutrisi(''); setSatuan('');
    setFormErrors({}); setShowModal(true);
  };

  const openEdit = (jenis) => {
    setModalType('edit'); setSelectedJenis(jenis);
    setNamaPakan(jenis.nama_pakan); 
    setKandunganNutrisi(jenis.kandungan_nutrisi || ''); 
    setSatuan(jenis.satuan);
    setFormErrors({}); setShowModal(true);
  };

  const validate = () => {
    const errors = {};
    if (!namaPakan.trim()) errors.nama_pakan = 'Nama pakan wajib diisi.';
    if (!satuan.trim()) errors.satuan = 'Satuan wajib diisi.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { nama_pakan: namaPakan, kandungan_nutrisi: kandunganNutrisi, satuan };
    try {
      if (modalType === 'create') {
        const res = await api.post('/jenis-pakan', payload);
        if (res.data.status === 'success') {
          addToast('Jenis pakan baru berhasil ditambahkan!');
          setShowModal(false);
          fetchData();
        }
      } else {
        const res = await api.put(`/jenis-pakan/${selectedJenis.id_pakan}`, payload);
        if (res.data.status === 'success') {
          addToast('Jenis pakan berhasil diperbarui!');
          setShowModal(false);
          fetchData();
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus jenis pakan ini? Data stok yang terkait juga akan terhapus.')) return;
    try {
      const res = await api.delete(`/jenis-pakan/${id}`);
      if (res.data.status === 'success') {
        addToast('Jenis pakan berhasil dihapus!');
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menghapus jenis pakan.', 'error');
    }
  };

  const filteredData = data.filter(j =>
    j.nama_pakan.toLowerCase().includes(search.toLowerCase()) ||
    j.satuan.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div className="content-card">
      {/* Header */}
      <div className="table-actions-row">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-heading)' }}>
            Kelola Jenis Pakan
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', fontWeight: 500 }}>
            Master data jenis pakan yang tersedia di sistem.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div className="search-input-wrapper">
            <span className="search-icon"><Search size={14} strokeWidth={2} /></span>
            <input
              type="text" placeholder="Cari nama pakan atau satuan..."
              className="search-input" value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={openCreate} className="btn-action-primary">
            <Plus size={15} strokeWidth={2.5} /> Tambah Jenis Pakan
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-banner">
          <AlertTriangle size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Nama Pakan</th>
              <th>Kandungan Nutrisi</th>
              <th>Satuan</th>
              <th style={{ width: '96px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? filteredData.map(j => (
              <tr key={j.id_pakan}>
                <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{j.nama_pakan}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{j.kandungan_nutrisi || '-'}</td>
                <td>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: 'rgba(99,102,241,0.1)',
                    color: 'var(--indigo-500)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    whiteSpace: 'nowrap',
                  }}>
                    {j.satuan}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button onClick={() => openEdit(j)} className="btn-icon" title="Edit">
                      <Pencil size={14} strokeWidth={2} />
                    </button>
                    <button onClick={() => handleDelete(j.id_pakan)} className="btn-icon delete" title="Hapus">
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <Package size={32} strokeWidth={1.5} style={{ opacity: 0.4 }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      {search ? 'Tidak ada jenis pakan yang cocok.' : 'Belum ada jenis pakan.'}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
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
                  <h2>{modalType === 'create' ? 'Tambah Jenis Pakan Baru' : 'Edit Jenis Pakan'}</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
                    {modalType === 'create'
                      ? 'Isi detail di bawah untuk menambah jenis pakan baru.'
                      : `Mengubah data: ${selectedJenis?.nama_pakan}`}
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
                  <label htmlFor="nama-pakan">Nama Pakan</label>
                  <input
                    type="text" id="nama-pakan" placeholder="Contoh: Konsentrat Sapi"
                    value={namaPakan} onChange={e => setNamaPakan(e.target.value)} autoComplete="off"
                    style={formErrors.nama_pakan ? { borderColor: 'var(--red-500)' } : {}}
                  />
                  <ErrorText msg={formErrors.nama_pakan} />
                </div>

                <div className="input-group">
                  <label htmlFor="kandungan">Kandungan Nutrisi</label>
                  <textarea
                    id="kandungan" placeholder="Contoh: Protein 16%, Serat Kasar 12%, Lemak 4%"
                    value={kandunganNutrisi} onChange={e => setKandunganNutrisi(e.target.value)}
                    rows={3}
                    style={formErrors.kandungan_nutrisi ? { borderColor: 'var(--red-500)' } : {}}
                  />
                  <ErrorText msg={formErrors.kandungan_nutrisi} />
                </div>

                <div className="input-group">
                  <label htmlFor="satuan">Satuan</label>
                  <input
                    type="text" id="satuan" placeholder="Contoh: kg, liter, karung"
                    value={satuan} onChange={e => setSatuan(e.target.value)} autoComplete="off"
                    style={formErrors.satuan ? { borderColor: 'var(--red-500)' } : {}}
                  />
                  <ErrorText msg={formErrors.satuan} />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-action-primary">
                  {modalType === 'create'
                    ? <><Plus size={14} strokeWidth={2.5} /> Simpan Jenis Pakan</>
                    : <><CheckCircle size={14} strokeWidth={2} /> Perbarui Jenis Pakan</>}
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

export default JenisPakanList;