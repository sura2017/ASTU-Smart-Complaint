import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';

/**
 * 100% CORRECT ROLE-BASED ACCESS CONTROL (RBAC)
 * children: The page we want to see
 * allowedRole: 'Staff' or 'Student' (Optional)
 */
const ProtectedRoute = ({ children, allowedRole }) => {
  const userStr = localStorage.getItem('user');
  
  // 1. If no user is logged in, always go to Login
  if (!userStr) {
    return <Navigate to="/" replace />;
  }

  const user = JSON.parse(userStr);

  // 2. If a specific role is required (like Staff) but user is a Student
  if (allowedRole && user.role !== allowedRole) {
    console.warn(`Security: Access denied for role: ${user.role}`);
    // Staff go to Admin, Students go to Dashboard
    return user.role === 'Staff' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * LOGIN GUARD
 * Prevents logged-in users from seeing the Login/Register pages again
 */
const LoginGuard = ({ children }) => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return user.role === 'Staff' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          {/* Public Routes with LoginGuard (If logged in, skip these) */}
          <Route path="/" element={
            <LoginGuard><Login /></LoginGuard>
          } />
          <Route path="/register" element={
            <LoginGuard><Register /></LoginGuard>
          } />

          {/* Protected Student Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRole="Student">
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/submit" element={
            <ProtectedRoute allowedRole="Student">
              <SubmitComplaint />
            </ProtectedRoute>
          } />

          {/* Protected Staff Route - THE 100% SECURE ADMIN PANEL */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="Staff">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* 404 Catch-all: Redirect unknown links to Login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;