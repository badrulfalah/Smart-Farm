import { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Droplets, Thermometer, Wind, Clock,
  ArrowRight, ChevronRight, Shield, Zap, BarChart2,
  Wifi, CheckCircle, AlertCircle, Leaf, Users, Settings,
  TrendingUp, TrendingDown, Eye
} from 'lucide-react';
import api from '../services/api';
import heroImage from '../assets/hero.JPG';
import '../user.css';

/* ── Fallback data ── */
const fallbackOverview = {
  metrics: [
    { label: 'Soil Moisture', value: 64, unit: '%', status: 'Ideal' },
    { label: 'Temperature', value: 27, unit: 'C', status: 'Stable' },
    { label: 'Humidity', value: 82, unit: '%', status: 'Healthy' },
    { label: 'Irrigation', value: 18, unit: 'min', status: 'Scheduled' },
  ],
  features: [
    {
      title: 'Realtime Monitoring',
      description: 'Pantau kelembapan tanah, suhu, dan kondisi lahan dari satu dashboard yang mudah dibaca.',
    },
    {
      title: 'Smart Irrigation',
      description: 'Bantu keputusan penyiraman berdasarkan kondisi sensor dan kebutuhan tanaman.',
    },
    {
      title: 'Operational Insights',
      description: 'Ringkas data kebun menjadi status praktis untuk petani, operator, dan admin.',
    },
  ],
  telemetry: [
    { time: '06:00', soil_moisture: 68, temperature: 24 },
    { time: '09:00', soil_moisture: 63, temperature: 27 },
    { time: '12:00', soil_moisture: 56, temperature: 31 },
    { time: '15:00', soil_moisture: 59, temperature: 29 },
    { time: '18:00', soil_moisture: 65, temperature: 26 },
  ],
};

const metricIconMap = {
  'Soil Moisture': Droplets,
  'Temperature': Thermometer,
  'Humidity': Wind,
  'Irrigation': Clock,
};

const featureIconMap = [Activity, Zap, BarChart2];

const statusColorMap = {
  Ideal: { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  Stable: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  Healthy: { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  Scheduled: { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  Good: { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  Warning: { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  Critical: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

/* ── Animated Counter ── */
const AnimatedNumber = ({ value, duration = 1200 }) => {
  const [display, setDisplay] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let start;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setDisplay(Math.round(eased * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
};

/* ── Health Ring ── */
const HealthRing = ({ score }) => {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626';
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
      <circle
        cx="55" cy="55" r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 55 55)"
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
      <text x="55" y="50" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="600" fontFamily="inherit">
        {score}%
      </text>
      <text x="55" y="66" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="inherit">
        Farm Health
      </text>
    </svg>
  );
};

/* ── Telemetry Bar Chart ── */
const TelemetryChart = ({ data }) => {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  const maxMoisture = Math.max(...data.map(d => d.soil_moisture));
  const maxTemp = Math.max(...data.map(d => d.temperature));

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
      {data.map((pt, i) => (
        <div key={i} style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '4px', height: '100%',
          transitionDelay: `${i * 80}ms`,
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '3px', width: '100%' }}>
            <div style={{
              flex: 1, borderRadius: '3px 3px 2px 2px',
              height: animated ? `${(pt.soil_moisture / maxMoisture) * 100}%` : '0%',
              background: 'linear-gradient(180deg, #34d399, #059669)',
              minHeight: '4px',
              transition: `height 0.9s cubic-bezier(0.34,1.2,0.64,1) ${i * 80}ms`,
            }} />
            <div style={{
              flex: 1, borderRadius: '3px 3px 2px 2px',
              height: animated ? `${(pt.temperature / maxTemp) * 100}%` : '0%',
              background: 'linear-gradient(180deg, #fbbf24, #d97706)',
              minHeight: '4px',
              transition: `height 0.9s cubic-bezier(0.34,1.2,0.64,1) ${i * 80 + 40}ms`,
            }} />
          </div>
          <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {pt.time}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── Live Badge ── */
const LiveBadge = ({ state }) => {
  const map = {
    connected: { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', label: 'API Live', Icon: Wifi },
    loading: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Syncing…', Icon: Activity },
    fallback: { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', label: 'Demo Mode', Icon: AlertCircle },
  };
  const { color, bg, border, label, Icon } = map[state] || map.fallback;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 10px', borderRadius: '20px',
      background: bg, border: `1px solid ${border}`,
      fontSize: '11px', fontWeight: 600, color,
    }}>
      <Icon size={10} strokeWidth={2.5} />
      {label}
    </span>
  );
};

/* ── useInView hook ── */
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

/* ════════════════════════════════
   MAIN HOME COMPONENT
════════════════════════════════ */
const Home = () => {
  const [overview, setOverview] = useState(fallbackOverview);
  const [apiState, setApiState] = useState('loading');
  const [scrolled, setScrolled] = useState(false);

  const [heroRef, heroInView] = useInView(0.05);
  const [statsRef, statsInView] = useInView(0.2);
  const [featRef, featInView] = useInView(0.1);
  const [insightRef, insightInView] = useInView(0.15);
  const [ctaRef, ctaInView] = useInView(0.2);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await api.get('/public/overview');
        if (response.data?.status === 'success') {
          setOverview(response.data.data);
          setApiState('connected');
          return;
        }
        setApiState('fallback');
      } catch {
        setApiState('fallback');
      }
    };
    fetchOverview();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const healthScore = useMemo(() => {
    const m = overview.metrics.find(x => x.label === 'Soil Moisture')?.value || 0;
    const h = overview.metrics.find(x => x.label === 'Humidity')?.value || 0;
    return Math.round((m + h) / 2);
  }, [overview.metrics]);

  /* ── Inject styles ── */
  useEffect(() => {
    const id = 'sf-home-v2-styles';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

      .sfv2 * { box-sizing: border-box; }
      .sfv2 { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

      /* ── Enter animations ── */
      @keyframes sfv2-up {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes sfv2-fade {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes sfv2-scale {
        from { opacity: 0; transform: scale(0.95); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes sfv2-slide-right {
        from { opacity: 0; transform: translateX(-20px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes sfv2-slide-left {
        from { opacity: 0; transform: translateX(20px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes sfv2-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes sfv2-dot-ring {
        0%   { transform: scale(1); opacity: 0.6; }
        70%  { transform: scale(2.2); opacity: 0; }
        100% { transform: scale(2.2); opacity: 0; }
      }
      @keyframes sfv2-float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
      }
      @keyframes sfv2-bar-grow {
        from { transform: scaleY(0); }
        to   { transform: scaleY(1); }
      }
      @keyframes sfv2-number-count {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes sfv2-shimmer {
        0%   { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      /* ── Stagger helpers ── */
      .sfv2-enter { opacity: 0; }
      .sfv2-enter.visible { animation: sfv2-up 0.65s cubic-bezier(0.22,1,0.36,1) both; }
      .sfv2-enter.d1 { animation-delay: 0.05s; }
      .sfv2-enter.d2 { animation-delay: 0.15s; }
      .sfv2-enter.d3 { animation-delay: 0.25s; }
      .sfv2-enter.d4 { animation-delay: 0.35s; }
      .sfv2-enter.d5 { animation-delay: 0.45s; }
      .sfv2-enter.d6 { animation-delay: 0.55s; }

      .sfv2-enter-right { opacity: 0; }
      .sfv2-enter-right.visible { animation: sfv2-slide-right 0.65s cubic-bezier(0.22,1,0.36,1) both; }

      .sfv2-enter-left { opacity: 0; }
      .sfv2-enter-left.visible { animation: sfv2-slide-left 0.65s cubic-bezier(0.22,1,0.36,1) both; }

      .sfv2-enter-scale { opacity: 0; }
      .sfv2-enter-scale.visible { animation: sfv2-scale 0.65s cubic-bezier(0.22,1,0.36,1) both; }

      /* ── Interactive ── */
      .sfv2-metric-card {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .sfv2-metric-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 28px rgba(0,0,0,0.07);
      }
      .sfv2-feature-card {
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
      }
      .sfv2-feature-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 16px 36px rgba(0,0,0,0.07);
        border-color: rgba(5,150,105,0.25) !important;
      }
      .sfv2-btn-primary {
        transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
      }
      .sfv2-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 28px rgba(5,150,105,0.28);
        background: linear-gradient(135deg, #059669, #047857) !important;
      }
      .sfv2-btn-secondary {
        transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
      }
      .sfv2-btn-secondary:hover {
        background: #f8fafc !important;
        border-color: #059669 !important;
        color: #047857 !important;
      }
      .sfv2-nav-link {
        transition: color 0.15s ease, background 0.15s ease;
      }
      .sfv2-nav-link:hover {
        color: #047857 !important;
        background: rgba(5,150,105,0.06);
      }
      .sfv2-header-bg {
        transition: box-shadow 0.3s ease, backdrop-filter 0.3s ease;
      }

      /* ── Float animation for console ── */
      .sfv2-console-float {
        animation: sfv2-float 5s ease-in-out infinite;
      }

      /* ── Live dot ── */
      .sfv2-live-dot-wrapper {
        position: relative;
        width: 8px; height: 8px;
      }
      .sfv2-live-dot {
        position: absolute; inset: 0;
        border-radius: 50%; background: #10b981;
      }
      .sfv2-live-dot::after {
        content: '';
        position: absolute; inset: 0;
        border-radius: 50%; background: #10b981;
        animation: sfv2-dot-ring 2.2s ease-out infinite;
      }

      /* ── Stats counter animate ── */
      .sfv2-stat-val {
        transition: color 0.3s ease;
      }
      .sfv2-stat-val.counting {
        animation: sfv2-number-count 0.5s ease both;
      }

      /* ── Responsive ── */
      @media (max-width: 900px) {
        .sfv2-hero-grid { grid-template-columns: 1fr !important; }
        .sfv2-features-grid { grid-template-columns: 1fr 1fr !important; }
        .sfv2-insight-grid { flex-direction: column !important; }
        .sfv2-nav-links { display: none !important; }
        .sfv2-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
      }
      @media (max-width: 600px) {
        .sfv2-hero-title { font-size: 30px !important; }
        .sfv2-hero-actions { flex-direction: column !important; }
        .sfv2-metrics-grid { grid-template-columns: 1fr 1fr !important; }
        .sfv2-features-grid { grid-template-columns: 1fr !important; }
        .sfv2-stats-grid { grid-template-columns: 1fr 1fr !important; }
      }
    `;
    document.head.appendChild(s);
    return () => document.getElementById(id)?.remove();
  }, []);

  /* ── Apply visibility to elements ── */
  useEffect(() => {
    if (!heroInView) return;
    const els = document.querySelectorAll('.sfv2-hero-animate');
    els.forEach(el => el.classList.add('visible'));
  }, [heroInView]);

  useEffect(() => {
    if (!statsInView) return;
    const els = document.querySelectorAll('.sfv2-stats-animate');
    els.forEach(el => el.classList.add('visible'));
  }, [statsInView]);

  useEffect(() => {
    if (!featInView) return;
    const els = document.querySelectorAll('.sfv2-feat-animate');
    els.forEach(el => el.classList.add('visible'));
  }, [featInView]);

  useEffect(() => {
    if (!insightInView) return;
    const els = document.querySelectorAll('.sfv2-insight-animate');
    els.forEach(el => el.classList.add('visible'));
  }, [insightInView]);

  useEffect(() => {
    if (!ctaInView) return;
    const els = document.querySelectorAll('.sfv2-cta-animate');
    els.forEach(el => el.classList.add('visible'));
  }, [ctaInView]);

  /* ────────────────────────────────
     RENDER
  ──────────────────────────────── */
  return (
    <div className="sfv2" style={{
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#0f172a',
      overflowX: 'hidden',
    }}>

      {/* ──── HEADER ──── */}
      <header
        className="sfv2-header-bg"
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: scrolled ? 'rgba(248,250,252,0.92)' : 'rgba(248,250,252,0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: scrolled ? '0 1px 0 rgba(15,23,42,0.08)' : 'none',
        }}
      >
        <div style={{
          width: 'min(1200px, calc(100% - 32px))',
          margin: '0 auto',
          padding: '14px 0',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          gap: '24px',
        }}>

          {/* Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
            }}>
              <Leaf size={17} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
              Smart Farm
            </span>
          </Link>

          {/* Nav */}
          <nav className="sfv2-nav-links" style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
            {['Monitoring', 'Features', 'Insights'].map(n => (
              <a key={n} href={`#${n.toLowerCase()}`} className="sfv2-nav-link" style={{
                padding: '7px 13px', borderRadius: '9px',
                color: '#475569', fontSize: '13.5px', fontWeight: 500, textDecoration: 'none',
              }}>
                {n}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <Link to="/login" className="sfv2-btn-secondary" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '10px',
            border: '1px solid rgba(15,118,110,0.25)',
            background: 'rgba(255,255,255,0.8)',
            color: '#047857', fontSize: '13px', fontWeight: 600,
            textDecoration: 'none',
          }}>
            <Shield size={13} strokeWidth={2.5} />
            Admin Login
          </Link>
        </div>
      </header>

      {/* ──── HERO ──── */}
      <section ref={heroRef} style={{
        width: 'min(1200px, calc(100% - 32px))',
        margin: '0 auto',
        padding: '68px 0 56px',
      }}>
        <div className="sfv2-hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px', alignItems: 'center',
        }}>

          {/* Left */}
          <div>
            <div className="sfv2-hero-animate sfv2-enter d1" style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '5px 12px', borderRadius: '20px',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.18)',
              marginBottom: '20px',
            }}>
              <span className="sfv2-live-dot-wrapper">
                <span className="sfv2-live-dot" />
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Smart Agriculture Platform
              </span>
            </div>

            <h1 className="sfv2-hero-animate sfv2-enter d2 sfv2-hero-title" style={{
              fontSize: '48px', fontWeight: 700, lineHeight: 1.08,
              letterSpacing: '-0.03em', color: '#0f172a', margin: '0 0 18px',
            }}>
              Kelola Peternakan<br />
              <span style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Berbasis Data
              </span>
            </h1>

            <p className="sfv2-hero-animate sfv2-enter d3" style={{
              fontSize: '15.5px', lineHeight: 1.75, color: '#64748b',
              margin: '0 0 32px', maxWidth: '460px',
            }}>
              Sistem terintegrasi untuk monitoring sensor IoT, deteksi dini penyakit ternak,
              pencatatan digital, dan perencanaan produksi — semua dalam satu platform.
            </p>

            <div className="sfv2-hero-animate sfv2-enter sfv2-hero-actions d4" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '36px' }}>
              <a href="#monitoring" className="sfv2-btn-primary" style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '12px 22px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', fontSize: '14px', fontWeight: 600,
                textDecoration: 'none', boxShadow: '0 8px 20px rgba(5,150,105,0.25)',
              }}>
                <Activity size={15} strokeWidth={2.5} />
                Lihat Monitoring
              </a>
              <Link to="/login" className="sfv2-btn-secondary" style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '12px 22px', borderRadius: '12px',
                border: '1px solid rgba(15,118,110,0.2)',
                background: 'rgba(255,255,255,0.85)',
                color: '#0f766e', fontSize: '14px', fontWeight: 600,
                textDecoration: 'none',
              }}>
                Masuk Admin
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </div>

            <div className="sfv2-hero-animate sfv2-enter d5" style={{
              display: 'flex', gap: '20px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(226,232,240,0.9)',
            }}>
              {[
                { icon: CheckCircle, label: 'Real-time Sensor', color: '#10b981' },
                { icon: Shield, label: 'Data Aman', color: '#6366f1' },
                { icon: TrendingUp, label: 'Analitik Akurat', color: '#f59e0b' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon size={13} strokeWidth={2.5} color={color} />
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Console */}
          <div
            id="monitoring"
            className="sfv2-hero-animate sfv2-enter-left visible sfv2-console-float"
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '22px',
              boxShadow: '0 24px 64px rgba(15,23,42,0.1), 0 0 0 1px rgba(15,23,42,0.05)',
              animationDelay: '0.2s',
            }}
          >
            {/* Console header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <HealthRing score={healthScore} />
              <div style={{ textAlign: 'right' }}>
                <LiveBadge state={apiState} />
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                  Terakhir diperbarui: baru saja
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="sfv2-metrics-grid" style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px',
            }}>
              {overview.metrics.map((m, i) => {
                const Icon = metricIconMap[m.label] || Activity;
                const sc = statusColorMap[m.status] || { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
                return (
                  <div key={m.label} className="sfv2-metric-card" style={{
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    borderRadius: '12px', padding: '14px',
                    cursor: 'default',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{m.label}</span>
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '7px',
                        background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${sc.border}`,
                      }}>
                        <Icon size={12} color={sc.color} strokeWidth={2.5} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginBottom: '5px' }}>
                      <span style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.02em' }}>
                        <AnimatedNumber value={m.value} duration={1000 + i * 200} />
                      </span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{m.unit === 'C' ? '°C' : m.unit}</span>
                    </div>
                    <span style={{
                      display: 'inline-flex', padding: '2px 7px',
                      borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                      letterSpacing: '0.03em', textTransform: 'uppercase',
                      background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                    }}>
                      {m.status}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Telemetry chart */}
            <div style={{
              background: '#f8fafc', border: '1px solid #f1f5f9',
              borderRadius: '12px', padding: '14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Daily Sensor Trend</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[{ color: '#10b981', label: 'Moisture' }, { color: '#f59e0b', label: 'Temp' }].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '3px', borderRadius: '2px', background: color, display: 'block' }} />
                      <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <TelemetryChart data={overview.telemetry} />
            </div>
          </div>
        </div>
      </section>

      {/* ──── STATS STRIP ──── */}
      <div ref={statsRef} style={{
        borderTop: '1px solid #f1f5f9',
        borderBottom: '1px solid #f1f5f9',
        padding: '32px 0',
        margin: '0 0 80px',
        background: '#fff',
      }}>
        <div style={{
          width: 'min(1200px, calc(100% - 32px))',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0',
        }} className="sfv2-stats-grid">
          {[
            { icon: Users, value: '500+', label: 'Peternak Aktif' },
            { icon: Activity, value: '99.9%', label: 'Uptime Sensor' },
            { icon: TrendingDown, value: '40%', label: 'Reduksi Risiko' },
            { icon: BarChart2, value: '3×', label: 'Efisiensi Operasional' },
          ].map(({ icon: Icon, value, label }, i) => (
            <div key={i}
              className={`sfv2-stats-animate sfv2-enter d${i + 1}`}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '12px 20px', gap: '6px',
                borderRight: i < 3 ? '1px solid #f1f5f9' : 'none',
              }}>
              <Icon size={18} color="#34d399" strokeWidth={2} />
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.025em' }}>
                {value}
              </span>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, textAlign: 'center' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ──── FEATURES ──── */}
      <section id="features" ref={featRef} style={{
        width: 'min(1200px, calc(100% - 32px))',
        margin: '0 auto',
        paddingBottom: '80px',
      }}>
        <div style={{ marginBottom: '44px', maxWidth: '580px' }}>
          <div className="sfv2-feat-animate sfv2-enter d1" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '20px',
            background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)',
            marginBottom: '14px',
          }}>
            <Zap size={11} color="#059669" strokeWidth={2.5} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Fitur Unggulan
            </span>
          </div>
          <h2 className="sfv2-feat-animate sfv2-enter d2" style={{
            fontSize: '36px', fontWeight: 700, letterSpacing: '-0.025em',
            color: '#0f172a', margin: '0 0 12px', lineHeight: 1.15,
          }}>
            Dibangun untuk operasional<br />peternakan sehari-hari
          </h2>
          <p className="sfv2-feat-animate sfv2-enter d3" style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.7, margin: 0 }}>
            Dari monitoring lahan hingga manajemen akses tim — semua tersambung ke fondasi data yang sudah ada.
          </p>
        </div>

        <div className="sfv2-features-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px',
        }}>
          {overview.features.map((f, i) => {
            const Icon = featureIconMap[i] || Activity;
            const palettes = [
              { iconBg: '#ecfdf5', iconColor: '#059669', border: 'rgba(16,185,129,0.15)', accent: '#10b981' },
              { iconBg: '#eff6ff', iconColor: '#2563eb', border: 'rgba(59,130,246,0.15)', accent: '#3b82f6' },
              { iconBg: '#fffbeb', iconColor: '#d97706', border: 'rgba(245,158,11,0.15)', accent: '#f59e0b' },
            ];
            const p = palettes[i];
            return (
              <div key={f.title}
                className={`sfv2-feature-card sfv2-feat-animate sfv2-enter d${i + 4}`}
                style={{
                  background: '#fff',
                  border: `1px solid ${p.border}`,
                  borderRadius: '16px', padding: '26px',
                  cursor: 'default',
                }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  background: p.iconBg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: '16px',
                  border: `1px solid ${p.border}`,
                }}>
                  <Icon size={19} color={p.iconColor} strokeWidth={2} />
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: p.accent, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                  0{i + 1}
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '6px 0 10px', letterSpacing: '-0.01em' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7, margin: 0 }}>
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ──── INSIGHT ──── */}
      <section id="insights" ref={insightRef} style={{
        width: 'min(1200px, calc(100% - 32px))',
        margin: '0 auto',
        marginBottom: '80px',
      }}>
        <div className="sfv2-insight-grid sfv2-insight-animate sfv2-enter-scale" style={{
          display: 'flex', gap: '48px', alignItems: 'center',
          background: '#fff',
          borderRadius: '20px',
          border: '1px solid rgba(226,232,240,0.9)',
          padding: '40px 44px',
          boxShadow: '0 4px 24px rgba(15,23,42,0.05)',
        }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{
            width: '200px', height: '200px', borderRadius: '18px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
            border: '1px solid rgba(16,185,129,0.15)',
          }}>
            <img
              src={heroImage}
              alt="Smart Farm illustration"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        </div>

          <div style={{ flex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px', borderRadius: '20px',
              background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)',
              marginBottom: '14px',
            }}>
              <Eye size={11} color="#6366f1" strokeWidth={2.5} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#6366f1', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Scalable Foundation
              </span>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: '#0f172a', margin: '0 0 12px', lineHeight: 1.2 }}>
              Siap dikembangkan menjadi aplikasi pengguna lengkap.
            </h2>
            <p style={{ fontSize: '14.5px', color: '#64748b', lineHeight: 1.75, margin: '0 0 20px' }}>
              Halaman ini sudah memisahkan data publik dari admin API. Ketika model sensor, perangkat, tanaman, atau jadwal irigasi ditambahkan di backend, komponen user app dapat langsung mengambil data melalui service API existing.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'Arsitektur modular — tambah fitur tanpa merombak sistem',
                'Role-based access untuk petani, operator, dan admin',
                'Sensor IoT terhubung langsung ke dashboard real-time',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                  <CheckCircle size={14} color="#10b981" strokeWidth={2.5} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
            <a href="#monitoring" style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              marginTop: '22px', color: '#059669', fontSize: '13px', fontWeight: 600,
              textDecoration: 'none',
            }}>
              Lihat monitoring langsung
              <ChevronRight size={14} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </section>

      {/* ──── CTA ──── */}
      <div ref={ctaRef} style={{
        background: '#0f172a',
        padding: '60px 0',
      }}>
        <div className="sfv2-cta-animate sfv2-enter d1" style={{
          width: 'min(760px, calc(100% - 32px))',
          margin: '0 auto', textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 13px', borderRadius: '20px',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
            marginBottom: '20px',
          }}>
            <Settings size={12} color="#10b981" strokeWidth={2.5} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Panel Admin
            </span>
          </div>
          <h2 className="sfv2-cta-animate sfv2-enter d2" style={{
            fontSize: '34px', fontWeight: 700, color: '#f1f5f9',
            margin: '0 0 14px', letterSpacing: '-0.02em', lineHeight: 1.2,
          }}>
            Kelola pengguna, roles &amp; permissions
          </h2>
          <p className="sfv2-cta-animate sfv2-enter d3" style={{ fontSize: '15px', color: '#64748b', margin: '0 0 32px', lineHeight: 1.7 }}>
            Masuk ke panel admin untuk mengelola akses tim, memantau aktivitas sistem,
            dan mengkonfigurasi hak akses peternakan Anda.
          </p>
          <Link to="/login" className="sfv2-btn-primary sfv2-cta-animate sfv2-enter d4" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '13px 26px', borderRadius: '13px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff', fontSize: '14px', fontWeight: 600,
            textDecoration: 'none', boxShadow: '0 10px 24px rgba(16,185,129,0.25)',
          }}>
            <Shield size={14} strokeWidth={2.5} />
            Masuk ke Admin Panel
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      {/* ──── FOOTER ──── */}
      <footer style={{
        background: '#0f172a',
        padding: '22px 0',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          width: 'min(1200px, calc(100% - 32px))',
          margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '27px', height: '27px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Leaf size={13} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>Smart Farm</span>
          </div>
          <span style={{ fontSize: '12px', color: '#334155' }}>
            © {new Date().getFullYear()} Smart Farm Management System. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['Monitoring', 'Features', 'Admin'].map(l => (
              <a key={l} href={l === 'Admin' ? '/login' : `#${l.toLowerCase()}`}
                style={{ fontSize: '12px', color: '#475569', textDecoration: 'none', fontWeight: 500 }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;