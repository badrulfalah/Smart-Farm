import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, CheckCircle, XCircle, X, Loader2, Upload, Image,
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

const TernakForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [farms, setFarms] = useState([]);
  const [jenisList, setJenisList] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [previewFoto, setPreviewFoto] = useState(null);

  const [form, setForm] = useState({
    id_peternakan: '', id_jenis: '', kode_ternak: '', nama_ternak: '',
    jenis_kelamin: 'Jantan', umur: '', berat: '', status_kesehatan: 'Sehat',
    tanggal_masuk: '', foto: null,
  });

  const addToast = (message, type = 'success') => {
    const t = Date.now();
    setToasts(prev => [...prev, { id: t, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t)), 3500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(prev => ({ ...prev, foto: file }));
    setPreviewFoto(URL.createObjectURL(file));
    if (formErrors.foto) setFormErrors(prev => ({ ...prev, foto: null }));
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [farmRes, jenisRes] = await Promise.all([
          api.get('/peternakan'),
          api.get('/jenis-ternak'),
        ]);
        if (farmRes.data.status === 'success') setFarms(farmRes.data.data);
        if (jenisRes.data.status === 'success') setJenisList(jenisRes.data.data);
        if (isEdit) {
          const ternakRes = await api.get(`/ternak/${id}`);
          if (ternakRes.data.status === 'success') {
            const t = ternakRes.data.data;
            setForm({
              id_peternakan: t.id_peternakan || '',
              id_jenis: t.id_jenis || '',
              kode_ternak: t.kode_ternak || '',
              nama_ternak: t.nama_ternak || '',
              jenis_kelamin: t.jenis_kelamin || 'Jantan',
              umur: t.umur || '',
              berat: t.berat || '',
              status_kesehatan: t.status_kesehatan || 'Sehat',
              tanggal_masuk: t.tanggal_masuk || '',
              foto: null,
            });
            if (t.foto) {
              const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
              const url = t.foto.startsWith('http') ? t.foto : `${baseUrl}/storage/${t.foto}`;
              setPreviewFoto(url);
            }
          }
        }
      } catch (err) {
        console.error(err);
        addToast('Gagal memuat data formulir.', 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEdit]);

  const validate = () => {
    const errors = {};
    if (!form.id_peternakan) errors.id_peternakan = 'Peternakan wajib dipilih.';
    if (!form.id_jenis) errors.id_jenis = 'Jenis ternak wajib dipilih.';
    if (!form.kode_ternak.trim()) errors.kode_ternak = 'Kode ternak wajib diisi.';
    if (!form.nama_ternak.trim()) errors.nama_ternak = 'Nama ternak wajib diisi.';
    if (!form.jenis_kelamin) errors.jenis_kelamin = 'Jenis kelamin wajib dipilih.';
    if (!form.umur || form.umur < 0) errors.umur = 'Umur wajib diisi dengan angka valid.';
    if (!form.berat || form.berat <= 0) errors.berat = 'Berat wajib diisi.';
    if (!form.status_kesehatan) errors.status_kesehatan = 'Status kesehatan wajib dipilih.';
    if (!form.tanggal_masuk) errors.tanggal_masuk = 'Tanggal masuk wajib diisi.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'foto' && form.foto) {
          formData.append('foto', form.foto);
        } else if (key === 'foto') {
          // Skip null foto on create
          if (isEdit) formData.append('foto', '');
        } else {
          formData.append(key, form[key]);
        }
      });

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (isEdit) {
        formData.append('_method', 'PUT');
        await api.post(`/ternak/${id}`, formData, config);
      } else {
        await api.post('/ternak', formData, config);
      }
      addToast(isEdit ? 'Data ternak berhasil diperbarui!' : 'Ternak baru berhasil ditambahkan!');
      setTimeout(() => navigate('/admin/ternak'), 1000);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const errs = {};
        Object.keys(err.response.data.errors).forEach(k => {
          errs[k] = err.response.data.errors[k][0];
        });
        setFormErrors(errs);
      }
      addToast(err.response?.data?.message || 'Gagal menyimpan data ternak.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (field) => formErrors[field] ? { borderColor: 'var(--red-500)' } : {};

  if (loading) return <Spinner />;

  return (
    <div className="content-card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/admin/ternak')} className="btn-icon" title="Kembali">
          <ArrowLeft size={16} strokeWidth={2} />
        </button>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.03em' }}>
            {isEdit ? 'Edit Ternak' : 'Tambah Ternak Baru'}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
            {isEdit ? 'Perbarui data ternak yang sudah ada.' : 'Isi form berikut untuk menambahkan ternak baru.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Row 1: Peternakan & Jenis */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="input-group">
            <label>Peternakan *</label>
            <select name="id_peternakan" value={form.id_peternakan} onChange={handleChange} style={inputStyle('id_peternakan')}>
              <option value="">Pilih Peternakan</option>
              {farms.map(f => <option key={f.id_peternakan} value={f.id_peternakan}>{f.nama_peternakan}</option>)}
            </select>
            <ErrorText msg={formErrors.id_peternakan} />
          </div>
          <div className="input-group">
            <label>Jenis Ternak *</label>
            <select name="id_jenis" value={form.id_jenis} onChange={handleChange} style={inputStyle('id_jenis')}>
              <option value="">Pilih Jenis</option>
              {jenisList.map(j => <option key={j.id_jenis} value={j.id_jenis}>{j.nama_jenis}</option>)}
            </select>
            <ErrorText msg={formErrors.id_jenis} />
          </div>
        </div>

        {/* Row 2: Kode & Nama */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="input-group">
            <label>Kode Ternak *</label>
            <input type="text" name="kode_ternak" placeholder="Contoh: SW-001" value={form.kode_ternak} onChange={handleChange} style={inputStyle('kode_ternak')} />
            <ErrorText msg={formErrors.kode_ternak} />
          </div>
          <div className="input-group">
            <label>Nama Ternak *</label>
            <input type="text" name="nama_ternak" placeholder="Contoh: Sapi Limousin Jantan" value={form.nama_ternak} onChange={handleChange} style={inputStyle('nama_ternak')} />
            <ErrorText msg={formErrors.nama_ternak} />
          </div>
        </div>

        {/* Row 3: Kelamin & Umur & Berat */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="input-group">
            <label>Jenis Kelamin *</label>
            <select name="jenis_kelamin" value={form.jenis_kelamin} onChange={handleChange} style={inputStyle('jenis_kelamin')}>
              <option value="Jantan">Jantan</option>
              <option value="Betina">Betina</option>
            </select>
            <ErrorText msg={formErrors.jenis_kelamin} />
          </div>
          <div className="input-group">
            <label>Umur (bulan) *</label>
            <input type="number" name="umur" placeholder="0" min="0" value={form.umur} onChange={handleChange} style={inputStyle('umur')} />
            <ErrorText msg={formErrors.umur} />
          </div>
          <div className="input-group">
            <label>Berat (kg) *</label>
            <input type="number" name="berat" placeholder="0.00" min="0" step="0.01" value={form.berat} onChange={handleChange} style={inputStyle('berat')} />
            <ErrorText msg={formErrors.berat} />
          </div>
        </div>

        {/* Row 4: Status & Tanggal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="input-group">
            <label>Status Kesehatan *</label>
            <select name="status_kesehatan" value={form.status_kesehatan} onChange={handleChange} style={inputStyle('status_kesehatan')}>
              <option value="Sehat">Sehat</option>
              <option value="Sakit">Sakit</option>
            </select>
            <ErrorText msg={formErrors.status_kesehatan} />
          </div>
          <div className="input-group">
            <label>Tanggal Masuk *</label>
            <input type="date" name="tanggal_masuk" value={form.tanggal_masuk} onChange={handleChange} style={inputStyle('tanggal_masuk')} />
            <ErrorText msg={formErrors.tanggal_masuk} />
          </div>
        </div>

        {/* Foto Upload */}
        <div className="input-group" style={{ marginBottom: '20px' }}>
          <label>Foto Ternak</label>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', borderRadius: '12px', border: '2px dashed var(--border-color)', background: 'var(--bg-app)', cursor: 'pointer', transition: 'var(--transition)', flex: 1 }}>
              <Upload size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {form.foto ? form.foto.name : 'Klik untuk upload foto (opsional)'}
              </span>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            {previewFoto && (
              <img src={previewFoto} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
            )}
          </div>
          <ErrorText msg={formErrors.foto} />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <button type="button" onClick={() => navigate('/admin/ternak')} className="btn-secondary">Batal</button>
          <button type="submit" className="btn-action-primary" disabled={submitting}>
            {submitting ? (
              <><Loader2 size={14} strokeWidth={2.5} style={{ animation: 'spin 0.9s linear infinite' }} /> Menyimpan...</>
            ) : (
              <><Save size={14} strokeWidth={2.5} /> {isEdit ? 'Perbarui Ternak' : 'Simpan Ternak'}</>
            )}
          </button>
        </div>
      </form>

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: '28px', right: '28px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 999 }}>
        {toasts.map(t => <Toast key={t.id} toast={t} />)}
      </div>
    </div>
  );
};

export default TernakForm;
