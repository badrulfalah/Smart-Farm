import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────────
   CUSTOM TOOLTIP
───────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      }}>
        <p style={{
          color: '#94a3b8', fontSize: '11px',
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
            <span style={{ color: '#cbd5e1', fontSize: '12px' }}>
              {entry.name}:
            </span>
            <span style={{
              color: '#fff', fontSize: '13px', fontWeight: 700
            }}>
              {entry.value}
              {entry.name.includes('Moisture') ? '%' : '°C'}
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
const SkeletonCard = () => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '20px',
    padding: '24px',
    overflow: 'hidden',
    position: 'relative',
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
      animation: 'shimmer 1.5s infinite',
    }} />
    <div style={{
      height: '14px', width: '60%',
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '8px', marginBottom: '16px'
    }} />
    <div style={{
      height: '40px', width: '40%',
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '8px', marginBottom: '12px'
    }} />
    <div style={{
      height: '10px', width: '80%',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '8px'
    }} />
  </div>
);

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
const StatCard = ({ title, value, icon, gradient, glowColor, trend, trendLabel, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);
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
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      boxShadow: `0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)`,
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow =
          `0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1), 0 0 30px ${glowColor}20`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow =
          `0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)`;
      }}
    >
      {/* Background gradient orb */}
      <div style={{
        position: 'absolute', top: '-30px', right: '-30px',
        width: '120px', height: '120px', borderRadius: '50%',
        background: gradient, opacity: 0.15, filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <span style={{
          fontSize: '12px', fontWeight: 600,
          color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px'
        }}>
          {title}
        </span>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: gradient, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', boxShadow: `0 4px 12px ${glowColor}40`,
        }}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div style={{ marginBottom: '12px' }}>
        <span style={{
          fontSize: '38px', fontWeight: 800,
          color: '#f1f5f9', letterSpacing: '-1px', lineHeight: 1,
        }}>
          {isNumber ? displayValue : value}
        </span>
        {suffix && (
          <span style={{ fontSize: '16px', color: '#64748b', marginLeft: '4px' }}>
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
            padding: '2px 8px', borderRadius: '20px',
          }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span style={{ fontSize: '11px', color: '#475569' }}>{trendLabel}</span>
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

  /* Live clock */
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* Fetch data */
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

  /* ── Styles injected once ── */
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'dashboard-pro-styles';
    style.textContent = `
      @keyframes shimmer {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse-dot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.5; transform: scale(1.3); }
      }
      @keyframes glow-pulse {
        0%, 100% { box-shadow: 0 0 8px rgba(16,185,129,0.4); }
        50%       { box-shadow: 0 0 20px rgba(16,185,129,0.8); }
      }
      .dash-pro-container * { box-sizing: border-box; }
      .dash-pro-container {
        min-height: 100vh;
        background: #080f1e;
        font-family: 'Inter', -apple-system, sans-serif;
        color: #f1f5f9;
        animation: fadeSlideUp 0.5s ease both;
      }
    `;
    if (!document.getElementById('dashboard-pro-styles')) {
      document.head.appendChild(style);
    }
    return () => document.getElementById('dashboard-pro-styles')?.remove();
  }, []);

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#080f1e',
        display: 'flex', flexDirection: 'column', gap: '24px', padding: '32px',
      }}>
        <div style={{
          height: '80px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.06)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
            animation: 'shimmer 1.5s infinite',
          }} />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
        }}>
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div style={{
        minHeight: '100vh', background: '#080f1e',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '20px',
          padding: '40px 48px',
          textAlign: 'center',
          maxWidth: '420px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ color: '#ef4444', marginBottom: '8px', fontSize: '18px' }}>
            Koneksi Gagal
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '24px',
              padding: '10px 28px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none', borderRadius: '12px',
              color: '#fff', fontWeight: 600, cursor: 'pointer',
              fontSize: '14px',
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

  /* ─────────────── RENDER ─────────────── */
  return (
    <div className="dash-pro-container" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px',
        padding: '20px 28px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Avatar */}
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: 700, color: '#fff',
            boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
          }}>
            {(user?.name || 'A')[0].toUpperCase()}
          </div>
          <div>
            <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '2px' }}>
              Dashboard Overview
            </p>
            <h1 style={{
              fontSize: '20px', fontWeight: 700, color: '#f1f5f9',
              margin: 0, letterSpacing: '-0.3px',
            }}>
              Selamat Datang, {user?.name || 'Admin'} 👋
            </h1>
          </div>
        </div>

        {/* Right — clock + live badge */}
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#10b981',
              animation: 'pulse-dot 2s ease-in-out infinite',
              boxShadow: '0 0 8px rgba(16,185,129,0.6)',
            }} />
            <span style={{
              fontSize: '11px', fontWeight: 700, color: '#10b981',
              textTransform: 'uppercase', letterSpacing: '0.8px',
            }}>
              System Online
            </span>
          </div>
          <span style={{
            fontFamily: 'monospace', fontSize: '22px',
            fontWeight: 700, color: '#f1f5f9', letterSpacing: '1px',
          }}>
            {formatTime(currentTime)}
          </span>
          <span style={{ fontSize: '11px', color: '#475569' }}>
            {formatDate(currentTime)}
          </span>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
      }}>
        {statCards.map((card, i) => (
          <div key={i} style={{ animation: `fadeSlideUp 0.5s ease ${i * 0.08}s both` }}>
            <StatCard {...card} />
          </div>
        ))}
      </div>

      {/* ── ANALYTICS ROW ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px',
      }}>

        {/* Chart */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          {/* Chart header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '24px',
          }}>
            <div>
              <h2 style={{
                fontSize: '16px', fontWeight: 700,
                color: '#f1f5f9', margin: '0 0 4px',
              }}>
                Live Telemetry Monitoring
              </h2>
              <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
                Sensor IoT — Soil Moisture & Temperature
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Legend pills */}
              {[
                { color: '#10b981', label: 'Moisture' },
                { color: '#f59e0b', label: 'Temp' },
              ].map(({ color, label }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '4px 10px', borderRadius: '20px',
                }}>
                  <div style={{
                    width: '6px', height: '6px',
                    borderRadius: '50%', background: color,
                    boxShadow: `0 0 6px ${color}`,
                  }} />
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                    {label}
                  </span>
                </div>
              ))}
              {/* Real-time badge */}
              <span style={{
                fontSize: '10px', fontWeight: 700,
                color: '#10b981', background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)',
                padding: '4px 10px', borderRadius: '20px',
                letterSpacing: '0.5px', textTransform: 'uppercase',
              }}>
                ● Live
              </span>
            </div>
          </div>

          {/* Recharts */}
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke="rgba(255,255,255,0.15)"
                  tick={{ fill: '#475569', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.15)"
                  tick={{ fill: '#475569', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  name="Soil Moisture (%)"
                  type="monotone"
                  dataKey="soil_moisture"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMoisture)"
                  dot={false}
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#080f1e', strokeWidth: 2 }}
                />
                <Area
                  name="Temperature (°C)"
                  type="monotone"
                  dataKey="temperature"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTemp)"
                  dot={false}
                  activeDot={{ r: 6, fill: '#f59e0b', stroke: '#080f1e', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Users */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' }}>
              Recently Joined
            </h2>
            <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
              {recent_users?.length || 0} pengguna baru
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
            {recent_users && recent_users.length > 0 ? (
              recent_users.map((ru, idx) => (
                <div
                  key={ru.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px',
                    borderRadius: '12px',
                    transition: 'background 0.2s ease',
                    cursor: 'default',
                    animation: `fadeSlideUp 0.4s ease ${idx * 0.06}s both`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: `linear-gradient(135deg,
                      hsl(${(idx * 60) % 360}, 70%, 50%),
                      hsl(${(idx * 60 + 40) % 360}, 70%, 40%))`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '14px',
                    fontWeight: 700, color: '#fff', flexShrink: 0,
                    boxShadow: `0 4px 10px hsla(${(idx * 60) % 360}, 70%, 50%, 0.3)`,
                  }}>
                    {ru.name?.[0]?.toUpperCase() || '?'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontWeight: 600, fontSize: '13px',
                      color: '#e2e8f0', margin: '0 0 2px',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {ru.name}
                    </p>
                    <p style={{
                      fontSize: '11px', color: '#475569', margin: 0,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {ru.email}
                    </p>
                  </div>

                  {/* Date */}
                  <span style={{
                    fontSize: '10px', color: '#334155',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '3px 8px', borderRadius: '8px',
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
                <p style={{ color: '#334155', fontSize: '13px' }}>
                  Belum ada pengguna baru
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        textAlign: 'center',
        padding: '12px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <span style={{ fontSize: '11px', color: '#1e293b' }}>
          Smart Farm Management System © {new Date().getFullYear()} — All rights reserved
        </span>
      </div>

    </div>
  );
};

export default Dashboard;
