import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, CheckCircle, XCircle, AlertTriangle,
  Loader2, Thermometer, Scale, Info, Beef, Bird, Rabbit,
} from 'lucide-react';
import api from '../services/api';

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

/* ─────────────────────────────────────────
   DATA REFERENSI SUHU TUBUH TERNAK
   Murni data statis untuk keperluan informasi —
   tidak digunakan dalam validasi/logika form.
───────────────────────────────────────── */
const TEMP_REFERENCE = [
  {
    key: 'sapi',
    label: 'Sapi',
    icon: Beef,
    normal: { min: 38.0, max: 39.3 },
    waspada: 39.5,
    color: '#059669',
  },
  {
    key: 'kambing',
    label: 'Kambing / Domba',
    icon: Rabbit,
    normal: { min: 38.5, max: 39.7 },
    waspada: 40.0,
    color: '#0891b2',
  },
  {
    key: 'ayam',
    label: 'Ayam',
    icon: Bird,
    normal: { min: 40.6, max: 41.7 },
    waspada: 42.0,
    color: '#d97706',
  },
];

/* Kartu referensi suhu per jenis ternak — presentasional saja */
const TempReferenceCard = ({ item }) => {
  const Icon = item.icon;
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    }}>
      {/* Header kartu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
          background: `${item.color}1a`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} strokeWidth={2.2} color={item.color} />
        </div>
        <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-heading)' }}>
          {item.label}
        </span>
      </div>

      {/* Rentang normal */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Normal
        </span>
        <span style={{
          fontSize: '12.5px', fontWeight: 700, color: item.color,
          background: `${item.color}14`, border: `1px solid ${item.color}30`,
          padding: '3px 10px', borderRadius: '20px',
        }}>
          {item.normal.min.toFixed(1)}&deg;C &ndash; {item.normal.max.toFixed(1)}&deg;C
        </span>
      </div>

      {/* Visual bar rentang suhu */}
      <div style={{ position: 'relative', height: '6px', borderRadius: '999px', background: 'var(--border-color)', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: '20%', width: '45%', height: '100%',
          background: item.color, borderRadius: '999px',
        }} />
        <div style={{
          position: 'absolute', left: '65%', width: '35%', height: '100%',
          background: 'var(--red-500)', opacity: 0.55, borderRadius: '999px',
        }} />
      </div>

      {/* Ambang waspada */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Waspada / Sakit
        </span>
        <span style={{
          fontSize: '12.5px', fontWeight: 700, color: 'var(--red-500)',
          background: 'var(--red-100)', border: '1px solid rgba(239,68,68,0.25)',
          padding: '3px 10px', borderRadius: '20px',
        }}>
          &gt; {item.waspada.toFixed(1)}&deg;C
        </span>
      </div>
    </div>
  );
};

const KondisiForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ternak, setTernak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [toasts, setToasts] = useState([]);
  const [abnormalWarning, setAbnormalWarning] = useState(null);

  const [form, setForm] = useState({
    suhu_tubuh: '', berat: '', nafsu_makan: 'Baik',
    kondisi_fisik: '', produksi: '', catatan: '',
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
    setAbnormalWarning(null);
  };

  useEffect(() => {
    const fetchTernak = async () => {
      try {
        const res = await api.get(`/ternak/${id}`);
        if (res.data.status === 'success') {
          setTernak(res.data.data);
          setForm(prev => ({ ...prev, berat: res.data.data.berat || '' }));
        }
      } catch (err) {
        console.error(err);
        addToast('Gagal memuat data ternak.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchTernak();
  }, [id]);

  const validate = () => {
    const errors = {};
    if (!form.suhu_tubuh || form.suhu_tubuh < 30 || form.suhu_tubuh > 45)
      errors.suhu_tubuh = 'Suhu tubuh harus antara 30-45 derajat.';
    if (!form.berat || form.berat <= 0) errors.berat = 'Berat wajib diisi.';
    if (!form.nafsu_makan) errors.nafsu_makan = 'Nafsu makan wajib dipilih.';
    if (!form.kondisi_fisik.trim()) errors.kondisi_fisik = 'Kondisi fisik wajib diisi.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const checkAbnormality = (suhu, nafsu, kondisi) => {
    if (suhu > 39.5 || nafsu === 'Sangat Kurang' || kondisi.toLowerCase().includes('sakit')) {
      return 'Peringatan: Kondisi ternak terdeteksi abnormal! Status kesehatan akan otomatis diubah menjadi Sakit.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        id_ternak: id,
        suhu_tubuh: parseFloat(form.suhu_tubuh),
        berat: parseFloat(form.berat),
        nafsu_makan: form.nafsu_makan,
        kondisi_fisik: form.kondisi_fisik,
        produksi: form.produksi ? parseFloat(form.produksi) : null,
        catatan: form.catatan || null,
      };

      const res = await api.post('/kondisi-ternak', payload);

      if (res.data.status === 'success') {
        const warning = checkAbnormality(form.suhu_tubuh, form.nafsu_makan, form.kondisi_fisik);
        if (warning) {
          setAbnormalWarning(warning);
          addToast('Kondisi tercatat, namun terdeteksi abnormal! Periksa ternak segera.', 'error');
        } else {
          addToast('Kondisi ternak berhasil dicatat!');
          setTimeout(() => navigate(`/admin/ternak/${id}`), 1200);
        }
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const errs = {};
        Object.keys(err.response.data.errors).forEach(k => {
          errs[k] = err.response.data.errors[k][0];
        });
        setFormErrors(errs);
      }
      addToast(err.response?.data?.message || 'Gagal mencatat kondisi ternak.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (field) => formErrors[field] ? { borderColor: 'var(--red-500)' } : {};

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Loader2 size={32} strokeWidth={2} style={{ color: 'var(--primary)', animation: 'spin 0.9s linear infinite' }} />
    </div>
  );

  if (!ternak) return null;

  return (
    <div className="content-card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate(`/admin/ternak/${id}`)} className="btn-icon" title="Kembali">
          <ArrowLeft size={16} strokeWidth={2} />
        </button>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.03em' }}>
            Pencatatan Kondisi
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
            {ternak.nama_ternak} ({ternak.kode_ternak})
          </p>
        </div>
      </div>

      {/* Abnormal Warning */}
      {abnormalWarning && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', borderRadius: '12px', background: 'var(--red-100)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '20px' }}>
          <AlertTriangle size={18} color="var(--red-500)" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--red-500)' }}>{abnormalWarning}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Suhu & Berat */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Thermometer size={11} /> Suhu Tubuh (&deg;C) *
            </label>
            <input type="number" name="suhu_tubuh" placeholder="36.5" min="30" max="45" step="0.1"
              value={form.suhu_tubuh} onChange={handleChange} style={inputStyle('suhu_tubuh')} />
            <ErrorText msg={formErrors.suhu_tubuh} />
          </div>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Scale size={11} /> Berat (kg) *
            </label>
            <input type="number" name="berat" placeholder="0.00" min="0" step="0.01"
              value={form.berat} onChange={handleChange} style={inputStyle('berat')} />
            <ErrorText msg={formErrors.berat} />
          </div>
        </div>

        {/* Nafsu Makan & Kondisi Fisik */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="input-group">
            <label>Nafsu Makan *</label>
            <select name="nafsu_makan" value={form.nafsu_makan} onChange={handleChange} style={inputStyle('nafsu_makan')}>
              <option value="Baik">Baik</option>
              <option value="Kurang">Kurang</option>
              <option value="Sangat Kurang">Sangat Kurang</option>
              <option value="Tidak Ada">Tidak Ada</option>
            </select>
            <ErrorText msg={formErrors.nafsu_makan} />
          </div>
          <div className="input-group">
            <label>Kondisi Fisik *</label>
            <input type="text" name="kondisi_fisik" placeholder="Contoh: Sehat, lesu, pucat..."
              value={form.kondisi_fisik} onChange={handleChange} style={inputStyle('kondisi_fisik')} />
            <ErrorText msg={formErrors.kondisi_fisik} />
          </div>
        </div>

        {/* Produksi & Catatan */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div className="input-group">
            <label>Produksi</label>
            <input type="number" name="produksi" placeholder="0.00" min="0" step="0.01"
              value={form.produksi} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Catatan Tambahan</label>
            <input type="text" name="catatan" placeholder="Observasi tambahan..."
              value={form.catatan} onChange={handleChange} />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={() => navigate(`/admin/ternak/${id}`)} className="btn-secondary">Batal</button>
          <button type="submit" className="btn-action-primary" disabled={submitting}>
            {submitting ? (
              <><Loader2 size={14} strokeWidth={2.5} style={{ animation: 'spin 0.9s linear infinite' }} /> Menyimpan...</>
            ) : (
              <><Save size={14} strokeWidth={2.5} /> Simpan Kondisi</>
            )}
          </button>
        </div>
      </form>

      {/* ─────────────────────────────────────────
          PANEL INFORMASI RENTANG SUHU TUBUH TERNAK
          Murni informasi edukatif, tidak terhubung
          ke validasi maupun logika form di atas.
      ───────────────────────────────────────── */}
      <div style={{
        marginTop: '32px',
        paddingTop: '28px',
        borderTop: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '18px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
            background: 'rgba(99,102,241,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Info size={16} strokeWidth={2.2} color="var(--indigo-500)" />
          </div>
          <div>
            <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
              Panduan Suhu Tubuh Normal Ternak
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0 0', lineHeight: 1.6 }}>
              Gunakan rentang berikut sebagai referensi umum saat menginput suhu tubuh &mdash; setiap jenis ternak memiliki suhu normal yang berbeda.
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
        }}>
          {TEMP_REFERENCE.map((item) => (
            <TempReferenceCard key={item.key} item={item} />
          ))}
        </div>

        {/* Catatan sistem */}
        <div style={{
          marginTop: '16px',
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', borderRadius: '12px',
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
        }}>
          <AlertTriangle size={14} strokeWidth={2.2} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            Sistem akan otomatis menandai status ternak sebagai <strong style={{ color: 'var(--text-main)' }}>Sakit</strong> apabila suhu tubuh tercatat di atas <strong style={{ color: 'var(--red-500)' }}>39.5&deg;C</strong>, terlepas dari jenis ternaknya. Rentang per jenis di atas hanya sebagai panduan observasi tambahan.
          </p>
        </div>
      </div>

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: '28px', right: '28px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 999 }}>
        {toasts.map(t => <Toast key={t.id} toast={t} />)}
      </div>
    </div>
  );
};

export default KondisiForm;