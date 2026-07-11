import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Activity, Heart, Clock, AlertTriangle,
  CheckCircle, XCircle, X, Loader2, Thermometer, Scale, Calendar,
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

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>{value || '-'}</span>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    Sehat: { color: 'var(--green-700)', bg: 'var(--green-100)', border: 'var(--green-200)' },
    Sakit: { color: 'var(--red-500)', bg: 'var(--red-100)', border: 'rgba(239,68,68,0.3)' },
  };
  const s = map[status] || { color: 'var(--slate-500)', bg: 'var(--slate-100)', border: 'var(--slate-200)' };
  return (
    <span style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status || 'Unknown'}
    </span>
  );
};

const TernakDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ternak, setTernak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('kondisi');
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const t = Date.now();
    setToasts(prev => [...prev, { id: t, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t)), 3500);
  };

  const fetchData = async () => {
    try {
      const res = await api.get(`/ternak/${id}`);
      if (res.data.status === 'success') {
        setTernak(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data ternak.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const fotoUrl = (foto) => {
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    return `${baseUrl}/storage/${foto}`;
  };

  const tabs = [
    { key: 'kondisi', label: 'Riwayat Kondisi', icon: <Activity size={14} /> },
    { key: 'pakan', label: 'Riwayat Pakan', icon: <Scale size={14} /> },
    { key: 'peringatan', label: 'Peringatan', icon: <AlertTriangle size={14} /> },
  ];

  if (loading) return <Spinner />;
  if (error) return (
    <div className="content-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <AlertTriangle size={40} color="var(--red-500)" style={{ marginBottom: '16px' }} />
      <h3 style={{ color: 'var(--text-heading)', marginBottom: '8px' }}>Terjadi Kesalahan</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{error}</p>
      <button onClick={() => navigate('/admin/ternak')} className="btn-action-primary">
        <ArrowLeft size={14} /> Kembali
      </button>
    </div>
  );

  if (!ternak) return null;

  const kondisiList = ternak.kondisi_ternak || ternak.kondisiTernak || [];
  const pakanList = ternak.pemberian_pakan || ternak.pemberianPakan || [];
  const peringatanList = ternak.peringatan || [];

  return (
    <div className="content-card">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/admin/ternak')} className="btn-icon" title="Kembali">
            <ArrowLeft size={16} strokeWidth={2} />
          </button>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.03em' }}>
              {ternak.nama_ternak}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
              {ternak.kode_ternak} &middot; {ternak.jenis_ternak?.nama_jenis || 'N/A'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => navigate(`/admin/ternak/${id}/kondisi`)} className="btn-action-primary">
            <Activity size={14} strokeWidth={2.5} /> Catat Kondisi
          </button>
          <button onClick={() => navigate(`/admin/ternak/${id}/edit`)} className="btn-secondary">
            <Pencil size={14} strokeWidth={2} /> Edit
          </button>
        </div>
      </div>

      {/* Foto + Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Foto */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', aspectRatio: '1', background: 'var(--slate-100)' }}>
          {ternak.foto ? (
            <img src={fotoUrl(ternak.foto)} alt={ternak.nama_ternak} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>
              Tidak ada foto
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)' }}>Informasi Lengkap</h3>
            <StatusBadge status={ternak.status_kesehatan} />
          </div>
          <InfoRow label="Kode Ternak" value={ternak.kode_ternak} />
          <InfoRow label="Nama Ternak" value={ternak.nama_ternak} />
          <InfoRow label="Jenis" value={ternak.jenis_ternak?.nama_jenis} />
          <InfoRow label="Peternakan" value={ternak.peternakan?.nama_peternakan} />
          <InfoRow label="Jenis Kelamin" value={ternak.jenis_kelamin} />
          <InfoRow label="Umur" value={`${ternak.umur} bulan`} />
          <InfoRow label="Berat" value={`${ternak.berat} kg`} />
          <InfoRow label="Status Kesehatan" value={ternak.status_kesehatan} />
          <InfoRow label="Tanggal Masuk" value={ternak.tanggal_masuk} />
        </div>
      </div>      {/* Tabs */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '4px' }}>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px',
                borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer', fontSize: '13px',
                fontWeight: 700, transition: 'var(--transition)',
                background: activeTab === tab.key ? 'var(--primary-light)' : 'transparent',
                color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Kondisi */}
        {activeTab === 'kondisi' && (
          <div>
            {kondisiList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {kondisiList.map((k, i) => (
                  <div key={k.id_kondisi || i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-app)' }}>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Suhu Tubuh</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Thermometer size={14} color="var(--amber-500)" />
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)' }}>{k.suhu_tubuh} &deg;C</span>
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Berat</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Scale size={14} color="var(--green-600)" />
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)' }}>{k.berat} kg</span>
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Tanggal</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="var(--indigo-500)" />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{k.tanggal_pencatatan || k.created_at || '-'}</span>
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Nafsu Makan</p>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{k.nafsu_makan}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Kondisi Fisik</p>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{k.kondisi_fisik}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Catatan</p>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', fontStyle: 'italic' }}>{k.catatan || '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Heart size={32} strokeWidth={1.5} style={{ opacity: 0.4, marginBottom: '10px' }} />
                <p style={{ fontSize: '13px', fontWeight: 600 }}>Belum ada catatan kondisi.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Pemberian Pakan */}
        {activeTab === 'pakan' && (
          <div>
            {pakanList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pakanList.map((p, i) => (
                  <div key={p.id_pemberian || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-app)' }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)' }}>{p.jenis_pakan?.nama_pakan || 'Pakan'}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{p.keterangan || '-'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>{p.jumlah} {p.jenis_pakan?.satuan || 'kg'}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.tanggal || p.created_at || '-'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Scale size={32} strokeWidth={1.5} style={{ opacity: 0.4, marginBottom: '10px' }} />
                <p style={{ fontSize: '13px', fontWeight: 600 }}>Belum ada catatan pemberian pakan.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Peringatan */}
        {activeTab === 'peringatan' && (
          <div>
            {peringatanList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {peringatanList.map((pr, i) => (
                  <div key={pr.id_peringatan || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${pr.tingkat_peringatan === 'Tinggi' ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}`, background: pr.tingkat_peringatan === 'Tinggi' ? 'var(--red-100)' : 'var(--bg-app)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlertTriangle size={16} color={pr.tingkat_peringatan === 'Tinggi' ? 'var(--red-500)' : 'var(--amber-500)'} />
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)' }}>{pr.jenis_peringatan}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{pr.pesan}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', background: pr.status === 'sudah_ditangani' ? 'var(--green-100)' : 'var(--amber-100)', color: pr.status === 'sudah_ditangani' ? 'var(--green-700)' : 'var(--amber-500)' }}>
                        {pr.status === 'sudah_ditangani' ? 'SUDAH DITANGANI' : 'BELUM DITANGANI'}
                      </span>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{pr.tanggal || '-'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <CheckCircle size={32} strokeWidth={1.5} style={{ opacity: 0.4, marginBottom: '10px', color: 'var(--green-500)' }} />
                <p style={{ fontSize: '13px', fontWeight: 600 }}>Tidak ada peringatan aktif.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: '28px', right: '28px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 999 }}>
        {toasts.map(t => <Toast key={t.id} toast={t} />)}
      </div>
    </div>
  );
};

export default TernakDetail;
