
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole } from './types';
import { Analytics } from '@vercel/analytics/react';

// Pages
import { Home } from './pages/Home';
import { Pricing } from './pages/Pricing';
import { Contact } from './pages/Contact';
import { Instructors } from './pages/Instructors';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { StudentDashboard } from './pages/dashboards/StudentDashboard';
import { DriverDashboard } from './pages/dashboards/DriverDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <HashRouter>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/instructors" element={<Instructors />} />
              <Route path="/prices" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route path="/student-dashboard" element={
                <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />

              <Route path="/driver-dashboard" element={
                <ProtectedRoute allowedRoles={[UserRole.DRIVER, UserRole.ADMIN]}>
                  <DriverDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin-dashboard" element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
        </HashRouter>
      </DataProvider>
      <Analytics />
    </AuthProvider>
  );
}

export default App;
