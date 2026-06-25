import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────────
   THEME CONFIGURATION
───────────────────────────────────────── */
const THEME_COLORS = {
  dark: {
    bg: '#080f1e',
    cardBg: 'rgba(255,255,255,0.03)',
    cardBorder: 'rgba(255,255,255,0.08)',
    textMain: '#f1f5f9',
    textMuted: '#94a3b8',
    textFaint: '#475569',
    tooltipBg: 'rgba(15, 23, 42, 0.95)',
    tooltipBorder: 'rgba(255,255,255,0.1)',
    gridStroke: 'rgba(255,255,255,0.05)',
    shimmerStart: 'transparent',
    shimmerMid: 'rgba(255,255,255,0.04)',
    skeletonBase: 'rgba(255,255,255,0.08)',
    errorBg: 'rgba(239,68,68,0.08)',
    errorBorder: 'rgba(239,68,68,0.25)',
    errorText: '#ef4444',
    footerBg: 'rgba(255,255,255,0.03)',
    footerBorder: 'rgba(255,255,255,0.06)',
  },
  light: {
    bg: '#f1f5f9',
    cardBg: '#ffffff',
    cardBorder: 'rgba(0,0,0,0.06)',
    textMain: '#1e293b',
    textMuted: '#64748b',
    textFaint: '#94a3b8',
    tooltipBg: '#ffffff',
    tooltipBorder: 'rgba(0,0,0,0.1)',
    gridStroke: 'rgba(0,0,0,0.05)',
    shimmerStart: 'transparent',
    shimmerMid: 'rgba(0,0,0,0.05)',
    skeletonBase: 'rgba(0,0,0,0.06)',
    errorBg: 'rgba(254, 226, 226, 0.5)',
    errorBorder: 'rgba(254, 226, 226, 1)',
    errorText: '#b91c1c',
    footerBg: '#ffffff',
    footerBorder: 'rgba(0,0,0,0.06)',
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
        backdropFilter: 'blur(12px)',
        border: `1px solid ${colors.tooltipBorder}`,
        borderRadius: '16px',
        padding: '14px 18px',
        boxShadow: theme === 'dark' ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 25px rgba(0,0,0,0.1)',
      }}>
        <p style={{
          color: colors.textMuted, fontSize: '11px',
          fontWeight: 600, marginBottom: '8px',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          {label}
        </p>
        {payload.map((entry, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center',
            gap: '8px', marginBottom: i < payload.length - 1 ? '4px' : 0
          }}>
            <div style={{
              width: '8px', height: '8px',
              borderRadius: '50%', background: entry.color,
              boxShadow: `0 0 6px ${entry.color}`
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
      borderRadius: '24px',
      padding: '24px',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(90deg, ${colors.shimmerStart}, ${colors.shimmerMid}, ${colors.shimmerStart})`,
        animation: 'shimmer 1.5s infinite',
      }} />
      <div style={{ height: '14px', width: '60%', background: colors.skeletonBase, borderRadius: '8px', marginBottom: '16px' }} />
      <div style={{ height: '40px', width: '40%', background: colors.skeletonBase, borderRadius: '8px', marginBottom: '12px' }} />
      <div style={{ height: '10px', width: '80%', background: colors.skeletonBase, borderRadius: '8px' }} />
    </div>
  );
};

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
const StatCard = ({ title, value, icon, gradient, glowColor, trend, trendLabel, suffix = '', theme }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const colors = THEME_COLORS[theme] || THEME_COLORS.dark;
  const isNumber = typeof value === 'number';

  useEffect(() => {
    if (!isNumber) return;
    let start = 0;
    const duration = 1200;
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
        backdropFilter: theme === 'dark' ? 'blur(20px)' : 'none',
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '24px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: theme === 'dark'
          ? `0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)`
          : `0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = theme === 'dark'
          ? `0 16px 40px rgba(0,0,0,0.35), 0 0 30px ${glowColor}25`
          : `0 16px 32px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.06)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = theme === 'dark'
          ? `0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)`
          : `0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)`;
      }}
    >
      {/* Background orb */}
      <div style={{
        position: 'absolute', top: '-40px', right: '-40px',
        width: '140px', height: '140px', borderRadius: '50%',
        background: gradient, opacity: 0.12, filter: 'blur(28px)',
        pointerEvents: 'none',
      }} />

      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
        <span style={{
          fontSize: '11px', fontWeight: 700,
          color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.9px'
        }}>
          {title}
        </span>
        <div style={{
          width: '42px', height: '42px', borderRadius: '14px',
          background: gradient, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '19px', boxShadow: `0 6px 16px ${glowColor}45`,
        }}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div style={{ marginBottom: '14px' }}>
        <span style={{
          fontSize: '40px', fontWeight: 800,
          color: colors.textMain, letterSpacing: '-1.5px', lineHeight: 1,
        }}>
          {isNumber ? displayValue : value}
        </span>
        {suffix && (
          <span style={{ fontSize: '16px', color: colors.textMuted, marginLeft: '4px' }}>
            {suffix}
          </span>
        )}
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '11px', fontWeight: 700,
            color: trend >= 0 ? '#10b981' : '#ef4444',
            background: trend >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            padding: '3px 9px', borderRadius: '20px',
          }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span style={{ fontSize: '11px', color: colors.textFaint }}>{trendLabel}</span>
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
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse-dot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.5; transform: scale(1.4); }
      }
      @keyframes float-badge {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-2px); }
      }
      .dash-pro-container * { box-sizing: border-box; }
      .dash-pro-container {
        font-family: 'DM Sans', -apple-system, sans-serif;
        animation: fadeSlideUp 0.45s ease both;
        transition: background-color 0.3s ease;
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
        display: 'flex', flexDirection: 'column', gap: '20px', padding: '28px',
      }}>
        <div style={{
          height: '84px', background: colors.cardBg,
          borderRadius: '24px', border: `1px solid ${colors.cardBorder}`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(90deg, ${colors.shimmerStart}, ${colors.shimmerMid}, ${colors.shimmerStart})`,
            animation: 'shimmer 1.5s infinite',
          }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} theme={theme} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
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
      }}>
        <div style={{
          background: colors.errorBg,
          border: `1px solid ${colors.errorBorder}`,
          borderRadius: '28px',
          padding: '40px 48px',
          textAlign: 'center',
          maxWidth: '420px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ color: colors.errorText, marginBottom: '8px', fontSize: '18px' }}>Koneksi Gagal</h3>
          <p style={{ color: colors.textMuted, fontSize: '14px', lineHeight: 1.6 }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '24px', padding: '10px 28px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none', borderRadius: '14px',
              color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '14px',
            }}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const { stats, recent_users, telemetry } = data;

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: '👥',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      glowColor: '#6366f1',
      trend: 12,
      trendLabel: 'vs bulan lalu',
    },
    {
      title: 'Total Roles',
      value: stats?.total_roles || 0,
      icon: '🔑',
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      glowColor: '#f59e0b',
      trend: 0,
      trendLabel: 'tidak berubah',
    },
    {
      title: 'Permissions',
      value: stats?.total_permissions || 0,
      icon: '🛡️',
      gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
      glowColor: '#3b82f6',
      trend: 5,
      trendLabel: 'baru ditambahkan',
    },
    {
      title: 'Farm Status',
      value: stats?.farm_status || 'Optimal',
      icon: '🌱',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      glowColor: '#10b981',
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
      gap: '16px',
      minHeight: '100%',
    }}>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: colors.cardBg,
        backdropFilter: theme === 'dark' ? 'blur(20px)' : 'none',
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '24px',
        padding: '20px 28px',
        boxShadow: theme === 'dark'
          ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.2)'
          : '0 2px 12px rgba(0,0,0,0.05)',
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '50px', height: '50px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: 800, color: '#fff',
            boxShadow: '0 6px 18px rgba(16,185,129,0.4)',
            letterSpacing: '-0.5px',
          }}>
            {(user?.name || 'A')[0].toUpperCase()}
          </div>
          <div>
            <p style={{ color: colors.textMuted, fontSize: '11px', marginBottom: '3px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              Dashboard Overview
            </p>
            <h1 style={{
              fontSize: '20px', fontWeight: 800, color: colors.textMain,
              margin: 0, letterSpacing: '-0.5px',
            }}>
              Selamat Datang, {user?.name || 'Admin'} 👋
            </h1>
          </div>
        </div>

        {/* Right — clock */}
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)',
            padding: '5px 12px', borderRadius: '20px',
            animation: 'float-badge 3s ease-in-out infinite',
          }}>
            <div style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#10b981',
              animation: 'pulse-dot 2s ease-in-out infinite',
              boxShadow: '0 0 8px rgba(16,185,129,0.7)',
            }} />
            <span style={{
              fontSize: '10px', fontWeight: 800, color: '#10b981',
              textTransform: 'uppercase', letterSpacing: '0.9px',
            }}>
              System Online
            </span>
          </div>
          <span style={{
            fontFamily: 'monospace', fontSize: '24px',
            fontWeight: 800, color: colors.textMain, letterSpacing: '2px',
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
          <div key={i} style={{ animation: `fadeSlideUp 0.5s ease ${i * 0.08}s both` }}>
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
          backdropFilter: theme === 'dark' ? 'blur(20px)' : 'none',
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: '24px',
          padding: '26px',
          boxShadow: theme === 'dark'
            ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.2)'
            : '0 2px 12px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '24px',
          }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: colors.textMain, margin: '0 0 4px' }}>
                Live Telemetry Monitoring
              </h2>
              <p style={{ fontSize: '12px', color: colors.textFaint, margin: 0, fontWeight: 500 }}>
                Sensor IoT — Soil Moisture & Temperature
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {[{ color: '#10b981', label: 'Moisture' }, { color: '#f59e0b', label: 'Temp' }].map(({ color, label }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                  padding: '5px 11px', borderRadius: '20px',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
                  <span style={{ fontSize: '11px', color: colors.textMuted, fontWeight: 600 }}>{label}</span>
                </div>
              ))}
              <span style={{
                fontSize: '10px', fontWeight: 800,
                color: '#10b981', background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)',
                padding: '5px 11px', borderRadius: '20px',
                letterSpacing: '0.5px', textTransform: 'uppercase',
              }}>
                ● Live
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={telemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} vertical={false} />
                <XAxis dataKey="time" stroke={colors.gridStroke} tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke={colors.gridStroke} tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip theme={theme} />} />
                <Area name="Soil Moisture (%)" type="monotone" dataKey="soil_moisture"
                  stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMoisture)"
                  dot={false} activeDot={{ r: 6, fill: '#10b981', stroke: theme === 'dark' ? '#080f1e' : '#fff', strokeWidth: 2 }}
                />
                <Area name="Temperature (°C)" type="monotone" dataKey="temperature"
                  stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTemp)"
                  dot={false} activeDot={{ r: 6, fill: '#f59e0b', stroke: theme === 'dark' ? '#080f1e' : '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Users Card */}
        <div style={{
          background: colors.cardBg,
          backdropFilter: theme === 'dark' ? 'blur(20px)' : 'none',
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: '24px',
          padding: '26px',
          boxShadow: theme === 'dark'
            ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.2)'
            : '0 2px 12px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: colors.textMain, margin: '0 0 4px' }}>
                Recently Joined
              </h2>
              <p style={{ fontSize: '12px', color: colors.textFaint, margin: 0, fontWeight: 500 }}>
                {recent_users?.length || 0} pengguna baru
              </p>
            </div>
            <div style={{
              width: '36px', height: '36px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
            }}>
              👤
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
            {recent_users && recent_users.length > 0 ? (
              recent_users.map((ru, idx) => (
                <div
                  key={ru.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    border: `1px solid transparent`,
                    transition: 'background 0.2s ease, border-color 0.2s ease',
                    cursor: 'default',
                    animation: `fadeSlideUp 0.4s ease ${idx * 0.06}s both`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
                    e.currentTarget.style.borderColor = colors.cardBorder;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '13px',
                    background: `linear-gradient(135deg, hsl(${(idx * 60) % 360}, 70%, 50%), hsl(${(idx * 60 + 40) % 360}, 70%, 40%))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '15px', fontWeight: 700, color: '#fff', flexShrink: 0,
                    boxShadow: `0 4px 12px hsla(${(idx * 60) % 360}, 70%, 50%, 0.35)`,
                  }}>
                    {ru.name?.[0]?.toUpperCase() || '?'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontWeight: 700, fontSize: '13px', color: colors.textMain,
                      margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
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
                    background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    padding: '4px 9px', borderRadius: '10px',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {ru.joined}
                  </span>
                </div>
              ))
            ) : (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <span style={{ fontSize: '32px' }}>👤</span>
                <p style={{ color: colors.textFaint, fontSize: '13px', fontWeight: 500 }}>
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
        borderRadius: '20px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: theme === 'dark'
          ? 'inset 0 1px 0 rgba(255,255,255,0.04)'
          : '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Mini brand icon */}
          <div style={{
            width: '28px', height: '28px', borderRadius: '9px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px',
          }}>
            🌱
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: colors.textMuted }}>
            Smart Farm Management System
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{
            fontSize: '11px', color: colors.textFaint, fontWeight: 500,
          }}>
            © {new Date().getFullYear()} All rights reserved
          </span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.15)',
            padding: '4px 10px', borderRadius: '10px',
          }}>
            <div style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: '#10b981', boxShadow: '0 0 5px rgba(16,185,129,0.7)',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', letterSpacing: '0.5px' }}>
              v1.0.0
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;