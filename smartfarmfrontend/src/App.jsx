import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import UserList from './pages/UserList';
import RoleList from './pages/RoleList';
import PermissionList from './pages/PermissionList';

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

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UserList />} />
              <Route path="roles" element={<RoleList />} />
              
              {/* Extra Security: Only Super Admin can view/edit specific raw permissions */}
              <Route element={<ProtectedRoute allowedRoles={['Super Admin']} />}>
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
