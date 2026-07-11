import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, loading } = useAuth();

  /* Keyframes animasi — satu-satunya bagian yang perlu lewat <style>,
     karena inline style React tidak mendukung @keyframes.
     Mengikuti pola yang sama seperti di Dashboard.jsx. */
  useEffect(() => {
    if (!loading) return;

    const style = document.createElement('style');
    style.id = 'protected-route-loading-styles';
    style.textContent = `
      @keyframes sfLoaderSpin {
        to { transform: rotate(360deg); }
      }
      @keyframes sfLeafPulse {
        0%, 100% { transform: scale(1); }
        50%      { transform: scale(1.14) rotate(-4deg); }
      }
      @keyframes sfDotBounce {
        0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
        40%           { opacity: 1;   transform: translateY(-4px); }
      }
      @keyframes sfCardIn {
        from { opacity: 0; transform: translateY(12px) scale(0.98); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
    `;
    if (!document.getElementById('protected-route-loading-styles')) {
      document.head.appendChild(style);
    }
    return () => document.getElementById('protected-route-loading-styles')?.remove();
  }, [loading]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app, #f1f5f9)',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          padding: '48px 56px',
          borderRadius: '28px',
          background: 'var(--bg-card, rgba(255,255,255,0.75))',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid var(--border-glass, rgba(255,255,255,0.6))',
          boxShadow: 'var(--shadow-float, 0 20px 50px -15px rgba(15,23,42,0.15))',
          animation: 'sfCardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>

          {/* Leaf loader: ring ganda + daun berdenyut */}
          <div style={{
            position: 'relative',
            width: '96px',
            height: '96px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: 'var(--primary-emerald, #10b981)',
              borderRightColor: 'var(--primary-emerald, #10b981)',
              animation: 'sfLoaderSpin 1.1s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite',
            }} />
            <div style={{
              position: 'absolute',
              inset: '10px',
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: 'rgba(99, 102, 241, 0.55)',
              animation: 'sfLoaderSpin 1.6s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite reverse',
            }} />
            <span style={{
              fontSize: '34px',
              filter: 'drop-shadow(0 4px 10px rgba(16, 185, 129, 0.35))',
              animation: 'sfLeafPulse 1.8s ease-in-out infinite',
            }}>
              🍃
            </span>
          </div>

          <p style={{
            fontFamily: 'var(--font-heading, "Space Grotesk", system-ui, sans-serif)',
            fontSize: '17px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, var(--primary-emerald, #10b981) 0%, var(--accent-mint, #00f2fe) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 6px',
          }}>
            Smart Farm
          </p>

          <p style={{
            fontSize: '13.5px',
            fontWeight: 500,
            color: 'var(--text-muted, #64748b)',
            margin: '0 0 18px',
            letterSpacing: '0.01em',
          }}>
            Menghubungkan ke SmartFarm...
          </p>

          {/* Tiga titik menunggu */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--primary-emerald, #10b981)',
                opacity: 0.35,
                animation: `sfDotBounce 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
              }} />
            ))}
          </div>

        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = user.roles?.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      return (
        <div className="denied-container">
          <div className="denied-card">
            <div className="denied-icon">🚫</div>
            <h2>Akses Ditolak</h2>
            <p>Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.</p>
            <p className="denied-hint">Butuh role: {allowedRoles.join(', ')}</p>
            <button onClick={() => window.history.back()} className="btn-back">
              Kembali
            </button>
          </div>
        </div>
      );
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;