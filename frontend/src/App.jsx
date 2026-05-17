import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

function App() {
  return (
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes - All authenticated users */}
            <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
            />

            {/* Protected routes - Admin and Super Admin only */}
            <Route
                path="/admin"
                element={
                  <PrivateRoute roles={['admin', 'super_admin']}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
            />

            {/* Protected routes - Super Admin only */}
            <Route
                path="/super-admin"
                element={
                  <PrivateRoute roles={['super_admin']}>
                    <SuperAdminDashboard />
                  </PrivateRoute>
                }
            />

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 - Redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
  );
}

export default App;