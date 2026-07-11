import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import UserList from './pages/UserList';
import RoleList from './pages/RoleList';
import PermissionList from './pages/PermissionList';
import TernakList from './pages/TernakList';
import TernakDetail from './pages/TernakDetail';
import TernakForm from './pages/TernakForm';
import KondisiForm from './pages/KondisiForm';
import StokPakanList from './pages/StokPakanList';
import PemberianPakanList from './pages/PemberianPakanList';
import JenisPakanList from './pages/JenisPakanList';
import PeternakanList from './pages/PeternakanList';
import JenisTernakList from './pages/JenisTernakList';
import PeringatanList from './pages/PeringatanList';

// Import custom premium admin CSS
import './admin.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public User-Facing Route */}
          <Route path="/" element={<Home />} />

          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              
              {/* Main Menu - Monitoring */}
              <Route path="peringatan" element={<PeringatanList />} />

              {/* Manajemen Ternak */}
              <Route path="ternak" element={<TernakList />} />
              <Route path="ternak/create" element={<TernakForm />} />
              <Route path="ternak/:id" element={<TernakDetail />} />
              <Route path="ternak/:id/edit" element={<TernakForm />} />
              <Route path="ternak/:id/kondisi" element={<KondisiForm />} />

              {/* Kelola Pakan */}
              <Route path="pakan/stok" element={<StokPakanList />} />
              <Route path="pakan/pemberian" element={<PemberianPakanList />} />
              <Route path="pakan/jenis" element={<JenisPakanList />} />

              {/* Master Data */}
              <Route path="peternakan" element={<PeternakanList />} />
              <Route path="jenis-ternak" element={<JenisTernakList />} />
              
              {/* User Management - Super Admin Only */}
              <Route element={<ProtectedRoute allowedRoles={['Super Admin']} />}>
                <Route path="users" element={<UserList />} />
                <Route path="roles" element={<RoleList />} />
                <Route path="permissions" element={<PermissionList />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
