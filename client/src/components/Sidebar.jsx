import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  BookOpenCheck,
  BellRing,
  Sparkles,
  LogOut,
  GraduationCap,
  ChevronRight,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import ConfirmModal from './ConfirmModal.jsx';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [showDemoModal, setShowDemoModal] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      const res = await api.demo.seed(false);
      addToast(res.message || 'Demo data loaded successfully!', 'success');
      setShowDemoModal(false);
      // Reload page or trigger global event to refresh all data views
      window.dispatchEvent(new CustomEvent('data:refresh'));
      navigate('/');
    } catch (err) {
      if (err.data && err.data.hasExistingData) {
        addToast(err.message, 'warning');
      } else {
        addToast(err.message || 'Failed to seed demo data.', 'error');
      }
    } finally {
      setSeeding(false);
    }
  };

  const handleLogout = () => {
    logout();
    addToast('You have been logged out.', 'info');
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/applications', label: 'Applications', icon: Briefcase },
    { to: '/playbooks', label: 'Prep Playbooks', icon: BookOpenCheck },
    { to: '/reminders', label: 'Reminders & Deadlines', icon: BellRing },
  ];

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="brand-title">ApplyPilot</span>
              <span className="brand-tag">PRO</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-heading">Main Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="nav-heading" style={{ marginTop: 12 }}>
            Demo & Utilities
          </div>
          <button
            type="button"
            className="nav-link"
            style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none' }}
            onClick={() => setShowDemoModal(true)}
          >
            <Sparkles size={18} color="var(--primary)" />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Load Demo Data</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#fff',
                  boxShadow: '0 2px 6px rgba(197, 155, 39, 0.3)',
                  flexShrink: 0,
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.name}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.college || user.email}
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={handleLogout}
                title="Log out"
                style={{ padding: 6, color: 'var(--text-muted)' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Demo Seeding Confirmation Modal */}
      <ConfirmModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        onConfirm={handleSeedDemo}
        title="Load Example Placement Dataset?"
        message="This will add a realistic set of 6 applications (Google, Microsoft, Atlassian, Zomato, Razorpay, Deloitte), upcoming and completed interview rounds, and preparation playbook topics to your account. You can edit or delete them anytime."
        confirmText="Load Demo Data"
        confirmVariant="primary"
        loading={seeding}
      />
    </>
  );
}
