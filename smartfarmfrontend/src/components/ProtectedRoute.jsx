import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="leaf-loader">
          <div className="pulse-leaf">🍃</div>
          <div className="spinner"></div>
        </div>
        <p className="loading-text">Menghubungkan ke SmartFarm...</p>
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
