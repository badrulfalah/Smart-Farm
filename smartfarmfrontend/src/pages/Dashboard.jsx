import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────────
   THEME CONFIGURATION
   (spacing & radii dibuat konsisten, shadow
   dibuat lebih tenang/profesional)
───────────────────────────────────────── */
const THEME_COLORS = {
  dark: {
    bg: '#0b1220',
    cardBg: '#111a2c',
    cardBorder: 'rgba(255,255,255,0.06)',
    textMain: '#f1f5f9',
    textMuted: '#94a3b8',
    textFaint: '#5b6b85',
    tooltipBg: '#0f172a',
    tooltipBorder: 'rgba(255,255,255,0.08)',
    gridStroke: 'rgba(255,255,255,0.06)',
    shimmerStart: 'transparent',
    shimmerMid: 'rgba(255,255,255,0.03)',
    skeletonBase: 'rgba(255,255,255,0.06)',
    errorBg: 'rgba(239,68,68,0.06)',
    errorBorder: 'rgba(239,68,68,0.2)',
    errorText: '#f87171',
    footerBg: '#111a2c',
    footerBorder: 'rgba(255,255,255,0.06)',
    shadowCard: '0 1px 2px rgba(0,0,0,0.4)',
    shadowCardHover: '0 8px 20px rgba(0,0,0,0.35)',
    divider: 'rgba(255,255,255,0.06)',
  },
  light: {
    bg: '#f6f7f9',
    cardBg: '#ffffff',
    cardBorder: '#e6e9ee',
    textMain: '#0f172a',
    textMuted: '#64748b',
    textFaint: '#94a3b8',
    tooltipBg: '#ffffff',
    tooltipBorder: '#e6e9ee',
    gridStroke: '#eef1f5',
    shimmerStart: 'transparent',
    shimmerMid: 'rgba(0,0,0,0.04)',
    skeletonBase: '#eef1f5',
    errorBg: '#fef2f2',
    errorBorder: '#fecaca',
    errorText: '#b91c1c',
    footerBg: '#ffffff',
    footerBorder: '#e6e9ee',
    shadowCard: '0 1px 2px rgba(15,23,42,0.04)',
    shadowCardHover: '0 8px 20px rgba(15,23,42,0.08)',
    divider: '#eef1f5',
  }
};

/* ─────────────────────────────────────────
   CUSTOM TOOLTIP
───────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, theme }) => {
  const colors = THEME_COLORS[theme] || THEME_COLORS.dark;
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: colors.tooltipBg,
        border: `1px solid ${colors.tooltipBorder}`,
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: colors.shadowCardHover,
      }}>
        <p style={{
          color: colors.textMuted, fontSize: '11px',
          fontWeight: 600, marginBottom: '8px',
          textTransform: 'uppercase', letterSpacing: '0.06em'
        }}>
          {label}
        </p>
        {payload.map((entry, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center',
            gap: '8px', marginBottom: i < payload.length - 1 ? '6px' : 0
          }}>
            <div style={{
              width: '7px', height: '7px',
              borderRadius: '50%', background: entry.color,
            }} />
            <span style={{ color: colors.textMuted, fontSize: '12px' }}>
              {entry.name}:
            </span>
            <span style={{ color: colors.textMain, fontSize: '13px', fontWeight: 700 }}>
              {entry.value}{entry.name.includes('Moisture') ? '%' : '°C'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/* ─────────────────────────────────────────
   SKELETON LOADER
───────────────────────────────────────── */
const SkeletonCard = ({ theme }) => {
  const colors = THEME_COLORS[theme] || THEME_COLORS.dark;
  return (
    <div style={{
      background: colors.cardBg,
      border: `1px solid ${colors.cardBorder}`,
      borderRadius: '16px',
      padding: '22px',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: colors.shadowCard,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(90deg, ${colors.shimmerStart}, ${colors.shimmerMid}, ${colors.shimmerStart})`,
        animation: 'shimmer 1.5s infinite',
      }} />
      <div style={{ height: '12px', width: '55%', background: colors.skeletonBase, borderRadius: '6px', marginBottom: '16px' }} />
      <div style={{ height: '32px', width: '35%', background: colors.skeletonBase, borderRadius: '6px', marginBottom: '12px' }} />
      <div style={{ height: '9px', width: '70%', background: colors.skeletonBase, borderRadius: '6px' }} />
    </div>
  );
};

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
const StatCard = ({ title, value, icon, accent, trend, trendLabel, suffix = '', theme }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const colors = THEME_COLORS[theme] || THEME_COLORS.dark;
  const isNumber = typeof value === 'number';

  useEffect(() => {
    if (!isNumber) return;
    let start = 0;
    const duration = 1000;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, isNumber]);

  return (
    <div
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '16px',
        padding: '22px',
        position: 'relative',
        cursor: 'default',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        boxShadow: colors.shadowCard,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = colors.shadowCardHover;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = colors.shadowCard;
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <span style={{
          fontSize: '11px', fontWeight: 700,
          color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em'
        }}>
          {title}
        </span>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: accent.bg, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', border: `1px solid ${accent.border}`,
        }}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div style={{ marginBottom: '10px' }}>
        <span style={{
          fontSize: '32px', fontWeight: 700,
          color: colors.textMain, letterSpacing: '-0.02em', lineHeight: 1,
        }}>
          {isNumber ? displayValue : value}
        </span>
        {suffix && (
          <span style={{ fontSize: '14px', color: colors.textMuted, marginLeft: '4px' }}>
            {suffix}
          </span>
        )}
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '11px', fontWeight: 700,
            color: trend >= 0 ? '#059669' : '#dc2626',
          }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span style={{ fontSize: '11px', color: colors.textFaint }}>{trendLabel}</span>
        </div>
      )}

      {/* Trend label only (no percentage available yet) */}
      {trend === undefined && trendLabel && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: colors.textFaint, fontWeight: 500 }}>{trendLabel}</span>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [theme, setTheme] = useState(() => {
    const domTheme = document.documentElement.getAttribute('data-theme');
    return domTheme || localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme') || 'light';
          setTheme(newTheme);
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.data?.status === 'success') {
          setData(response.data.data);
        } else {
          setError('Format data tidak valid.');
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Gagal memuat data dashboard. Silakan periksa koneksi API.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'dashboard-pro-styles-v3';
    style.textContent = `
      @keyframes shimmer {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse-dot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.45; transform: scale(1.25); }
      }
      .dash-pro-container * { box-sizing: border-box; }
      .dash-pro-container {
        font-family: 'DM Sans', -apple-system, sans-serif;
        animation: fadeSlideUp 0.35s ease both;
      }
    `;
    if (!document.getElementById('dashboard-pro-styles-v3')) {
      document.head.appendChild(style);
    }
    return () => document.getElementById('dashboard-pro-styles-v3')?.remove();
  }, []);

  const colors = THEME_COLORS[theme] || THEME_COLORS.dark;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="dash-pro-container" style={{
        minHeight: '100vh', background: colors.bg,
        display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px',
      }}>
        <div style={{
          height: '72px', background: colors.cardBg,
          borderRadius: '16px', border: `1px solid ${colors.cardBorder}`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(90deg, ${colors.shimmerStart}, ${colors.shimmerMid}, ${colors.shimmerStart})`,
            animation: 'shimmer 1.5s infinite',
          }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} theme={theme} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
          <SkeletonCard theme={theme} />
          <SkeletonCard theme={theme} />
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div style={{
        minHeight: '100vh', background: colors.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{
          background: colors.errorBg,
          border: `1px solid ${colors.errorBorder}`,
          borderRadius: '16px',
          padding: '36px 40px',
          textAlign: 'center',
          maxWidth: '400px',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '14px' }}>⚠️</div>
          <h3 style={{ color: colors.errorText, marginBottom: '8px', fontSize: '16px', fontWeight: 700 }}>
            Koneksi Gagal
          </h3>
          <p style={{ color: colors.textMuted, fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px', padding: '9px 22px',
              background: '#059669',
              border: 'none', borderRadius: '10px',
              color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px',
            }}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const { stats, recent_users, telemetry } = data;

  /* ── STAT CARDS ──────────────────────────────
     Total Hewan Ternak, Total Kandang, Stok Pakan
     Menipis, dan Hewan Sakit — diambil dari field
     `stats` hasil endpoint GET /dashboard/stats
  ───────────────────────────────────────────── */
  const statCards = [
    {
      title: 'Total Hewan Ternak',
      value: stats?.total_ternak || 0,
      icon: '🐄',
      accent: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
      trendLabel: 'seluruh peternakan',
    },
    {
      title: 'Total Kandang',
      value: stats?.total_kandang || 0,
      icon: '🏠',
      accent: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
      trendLabel: 'unit peternakan aktif',
    },
    {
      title: 'Stok Pakan Menipis',
      value: stats?.stok_pakan_warning || 0,
      icon: '⚠️',
      accent: { bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.2)' },
      trendLabel: 'di bawah batas minimum',
    },
    {
      title: 'Hewan Sakit',
      value: stats?.ternak_sakit || 0,
      icon: '🚨',
      accent: { bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.2)' },
      trendLabel: 'perlu penanganan',
    },
  ];

  const formatTime = (date) => date.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  const formatDate = (date) => date.toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  /* ── RENDER ── */
  return (
    <div className="dash-pro-container" style={{
      background: colors.bg,
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      minHeight: '100%',
    }}>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '16px',
        padding: '18px 24px',
        boxShadow: colors.shadowCard,
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: '#059669',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '17px', fontWeight: 700, color: '#fff',
            letterSpacing: '-0.02em',
          }}>
            {(user?.name || 'A')[0].toUpperCase()}
          </div>
          <div>
            <p style={{ color: colors.textMuted, fontSize: '11px', margin: '0 0 2px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Dashboard Overview
            </p>
            <h1 style={{
              fontSize: '18px', fontWeight: 700, color: colors.textMain,
              margin: 0, letterSpacing: '-0.01em',
            }}>
              Selamat Datang, {user?.name || 'Admin'} 👋
            </h1>
          </div>
        </div>

        {/* Right — clock */}
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.18)',
            padding: '4px 10px', borderRadius: '20px',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#10b981',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }} />
            <span style={{
              fontSize: '10px', fontWeight: 700, color: '#059669',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              System Online
            </span>
          </div>
          <span style={{
            fontFamily: 'monospace', fontSize: '20px',
            fontWeight: 700, color: colors.textMain, letterSpacing: '0.5px',
          }}>
            {formatTime(currentTime)}
          </span>
          <span style={{ fontSize: '11px', color: colors.textFaint, fontWeight: 500 }}>
            {formatDate(currentTime)}
          </span>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
      }}>
        {statCards.map((card, i) => (
          <div key={i} style={{ animation: `fadeSlideUp 0.4s ease ${i * 0.06}s both` }}>
            <StatCard {...card} theme={theme} />
          </div>
        ))}
      </div>

      {/* ── ANALYTICS ROW ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '14px',
      }}>

        {/* Chart Card */}
        <div style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: '16px',
          padding: '24px',
          boxShadow: colors.shadowCard,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
          }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.textMain, margin: '0 0 3px' }}>
                Live Telemetry Monitoring
              </h2>
              <p style={{ fontSize: '12px', color: colors.textFaint, margin: 0, fontWeight: 500 }}>
                Sensor IoT — Soil Moisture & Temperature
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {[{ color: '#10b981', label: 'Moisture' }, { color: '#d97706', label: 'Temp' }].map(({ color, label }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  border: `1px solid ${colors.cardBorder}`,
                  padding: '4px 10px', borderRadius: '20px',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: '11px', color: colors.textMuted, fontWeight: 600 }}>{label}</span>
                </div>
              ))}
              <span style={{
                fontSize: '10px', fontWeight: 700,
                color: '#059669', background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.18)',
                padding: '4px 10px', borderRadius: '20px',
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
                ● Live
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: 270 }}>
            <ResponsiveContainer>
              <AreaChart data={telemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#d97706" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} vertical={false} />
                <XAxis dataKey="time" stroke={colors.gridStroke} tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke={colors.gridStroke} tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip theme={theme} />} />
                <Area name="Soil Moisture (%)" type="monotone" dataKey="soil_moisture"
                  stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMoisture)"
                  dot={false} activeDot={{ r: 5, fill: '#10b981', stroke: colors.cardBg, strokeWidth: 2 }}
                />
                <Area name="Temperature (°C)" type="monotone" dataKey="temperature"
                  stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)"
                  dot={false} activeDot={{ r: 5, fill: '#d97706', stroke: colors.cardBg, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Users Card */}
        <div style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: '16px',
          padding: '24px',
          boxShadow: colors.shadowCard,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.textMain, margin: '0 0 3px' }}>
                Recently Joined
              </h2>
              <p style={{ fontSize: '12px', color: colors.textFaint, margin: 0, fontWeight: 500 }}>
                {recent_users?.length || 0} pengguna baru
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflowY: 'auto' }}>
            {recent_users && recent_users.length > 0 ? (
              recent_users.map((ru, idx) => (
                <div key={ru.id}>
                  {idx > 0 && <div style={{ height: '1px', background: colors.divider, margin: '0 2px' }} />}
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 2px',
                      borderRadius: '10px',
                      transition: 'opacity 0.15s ease',
                      cursor: 'default',
                      animation: `fadeSlideUp 0.35s ease ${idx * 0.05}s both`,
                    }}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: '#eef2ff',
                      border: '1px solid #e0e7ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, color: '#4f46e5', flexShrink: 0,
                    }}>
                      {ru.name?.[0]?.toUpperCase() || '?'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontWeight: 600, fontSize: '13px', color: colors.textMain,
                        margin: '0 0 1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {ru.name}
                      </p>
                      <p style={{
                        fontSize: '11px', color: colors.textFaint, margin: 0, fontWeight: 500,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {ru.email}
                      </p>
                    </div>

                    <span style={{
                      fontSize: '10px', color: colors.textFaint, fontWeight: 600,
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {ru.joined}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <span style={{ fontSize: '28px' }}>👤</span>
                <p style={{ color: colors.textFaint, fontSize: '13px', fontWeight: 500, margin: 0 }}>
                  Belum ada pengguna baru
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        background: colors.footerBg,
        border: `1px solid ${colors.footerBorder}`,
        borderRadius: '14px',
        padding: '14px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '7px',
            background: '#059669',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px',
          }}>
            🌱
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted }}>
            Smart Farm Management System
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '11px', color: colors.textFaint, fontWeight: 500 }}>
            © {new Date().getFullYear()} All rights reserved
          </span>
          <span style={{
            fontSize: '10px', fontWeight: 700, color: '#059669',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.18)',
            padding: '3px 9px', borderRadius: '8px',
            letterSpacing: '0.03em',
          }}>
            v1.0.0
          </span>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;