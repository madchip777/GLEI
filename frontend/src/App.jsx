import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Tickets from './pages/Tickets.jsx';
import CreateTicket from './pages/CreateTicket.jsx';
import TicketDetail from './pages/TicketDetail.jsx';

/**
 * Main App Component
 *
 * Application router configuration.
 * Provides authentication context to all components.
 *
 * Routes:
 * - /login - Public login page
 * - /dashboard - User dashboard (all authenticated)
 * - /admin - Admin dashboard (admin, super_admin)
 * - /super-admin - Super admin dashboard (super_admin)
 * - /tickets - Ticket list (all authenticated)
 * - /tickets/new - Create new ticket (all authenticated)
 * - /tickets/:id - Ticket detail (all authenticated)
 */
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
              {/* Ticket Routes */}
              <Route
                  path="/tickets"
                  element={
                      <PrivateRoute>
                          <Tickets />
                      </PrivateRoute>
                  }
              />

              <Route
                  path="/tickets/new"
                  element={
                      <PrivateRoute>
                          <CreateTicket />
                      </PrivateRoute>
                  }
              />

              <Route
                  path="/tickets/:id"
                  element={
                      <PrivateRoute>
                          <TicketDetail />
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