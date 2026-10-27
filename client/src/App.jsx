import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { useToast } from './context/ToastContext.jsx';
import { api } from './services/api.js';

// Layout & Components
import DbStatusBanner from './components/DbStatusBanner.jsx';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import ApplicationFormModal from './components/ApplicationFormModal.jsx';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ApplicationsPage from './pages/ApplicationsPage.jsx';
import ApplicationDetailPage from './pages/ApplicationDetailPage.jsx';
import PlaybooksPage from './pages/PlaybooksPage.jsx';
import RemindersPage from './pages/RemindersPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: '3px solid var(--border-subtle)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 12px',
            }}
          />
          <p style={{ fontSize: '0.875rem' }}>Loading ApplyPilot...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// App Layout with Sidebar and Navbar
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNewAppOpen, setIsNewAppOpen] = useState(false);
  const [submittingApp, setSubmittingApp] = useState(false);
  const { addToast } = useToast();

  const handleCreateApp = async (formData) => {
    try {
      setSubmittingApp(true);
      const res = await api.applications.create(formData);
      addToast(res.message || 'Application created successfully!', 'success');
      setIsNewAppOpen(false);
      window.dispatchEvent(new CustomEvent('data:refresh'));
    } catch (err) {
      addToast(err.message || 'Failed to create application.', 'error');
    } finally {
      setSubmittingApp(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content">
        <DbStatusBanner />

        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenNewAppModal={() => setIsNewAppOpen(true)}
        />

        <main className="page-body">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/applications/:id" element={<ApplicationDetailPage />} />
            <Route path="/playbooks" element={<PlaybooksPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      <ApplicationFormModal
        isOpen={isNewAppOpen}
        onClose={() => setIsNewAppOpen(false)}
        onSubmit={handleCreateApp}
        loading={submittingApp}
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
