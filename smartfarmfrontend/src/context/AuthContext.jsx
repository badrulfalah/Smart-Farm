import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate session on load
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // Verify token by fetching user profile
          const response = await api.get('/me');
          if (response.data && response.data.status === 'success') {
            setUser(response.data.data);
          } else {
            // Invalid response
            handleLogoutState();
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          handleLogoutState();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLogoutState = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/login', { email, password });
      if (response.data && response.data.status === 'success') {
        const { token: userToken, user: userData } = response.data.data;
        
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        setLoading(false);
        return { success: true };
      }
      throw new Error(response.data.message || 'Login gagal.');
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Kredensial salah atau terjadi kesalahan jaringan.';
      setError(errMsg);
      setLoading(false);
      return { success: false, error: errMsg };
    }
  };

  const register = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/register', data);
      if (response.data && response.data.status === 'success') {
        const { token: userToken, user: userData } = response.data.data;

        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        setLoading(false);
        return { success: true };
      }
      throw new Error(response.data.message || 'Registrasi gagal.');
    } catch (err) {
      console.error('Register error:', err);
      const errors = err.response?.data?.errors;
      const errMsg = errors
        ? Object.values(errors).flat().join(' ')
        : err.response?.data?.message || 'Terjadi kesalahan saat registrasi.';
      setError(errMsg);
      setLoading(false);
      return { success: false, error: errMsg };
    }
  };

  const updateProfile = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put('/profile', data);
      if (response.data && response.data.status === 'success') {
        setUser(response.data.data);
        setLoading(false);
        return { success: true };
      }
      throw new Error(response.data.message || 'Gagal memperbarui profil.');
    } catch (err) {
      console.error('Update profile error:', err);
      const errors = err.response?.data?.errors;
      const errMsg = errors
        ? Object.values(errors).flat().join(' ')
        : err.response?.data?.message || 'Terjadi kesalahan saat memperbarui profil.';
      setError(errMsg);
      setLoading(false);
      return { success: false, error: errMsg };
    }
  };

  const updatePhoto = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data && response.data.status === 'success') {
        setUser(response.data.data);
        setLoading(false);
        return { success: true };
      }
      throw new Error(response.data.message || 'Gagal memperbarui foto.');
    } catch (err) {
      console.error('Update photo error:', err);
      const errors = err.response?.data?.errors;
      const errMsg = errors
        ? Object.values(errors).flat().join(' ')
        : err.response?.data?.message || 'Terjadi kesalahan saat memperbarui foto profil.';
      setError(errMsg);
      setLoading(false);
      return { success: false, error: errMsg };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      handleLogoutState();
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, updateProfile, updatePhoto, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
