import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
// import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Tickets from './pages/Tickets.jsx';
import CreateTicket from './pages/CreateTicket.jsx';
import TicketDetail from './pages/TicketDetail.jsx';
import Settings from "./pages/Settings.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import UserList from './pages/UserList.jsx';
import UserProfile from './pages/UserProfile.jsx';
import HardwareList from './pages/HardwareList.jsx';
import SoftwareList from './pages/SoftwareList.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';


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
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

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

              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

              {/* Change Password Route */}
              <Route
                path="/change-password"
                element={
                  <PrivateRoute>
                      <ChangePassword />
                  </PrivateRoute>
                }
              />

              <Route
                  path="/users"
                  element={
                      <PrivateRoute roles={['admin', 'super_admin']}>
                          <UserList />
                      </PrivateRoute>
                  }
              />
              <Route
                  path="/users/:id"
                  element={
                      <PrivateRoute roles={['admin', 'super_admin']}>
                          <UserProfile />
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

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 - Redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />

              <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
              <Route path="/users" element={<PrivateRoute roles={['admin', 'super_admin']}><UserList /></PrivateRoute>} />
              <Route path="/users/:id" element={<PrivateRoute roles={['admin', 'super_admin']}><UserProfile /></PrivateRoute>} />
              <Route path="/hardware" element={<PrivateRoute roles={['admin', 'super_admin']}><HardwareList /></PrivateRoute>} />
              <Route path="/software" element={<PrivateRoute roles={['admin', 'super_admin']}><SoftwareList /></PrivateRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
  );
}

export default App;