import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Plus, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ onToggleSidebar, onOpenNewAppModal, upcomingEventsCount = 0 }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: '0.825rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>Placement Session 2026–2027</span>
            <span style={{ color: 'var(--border-medium)' }}>•</span>
            <span style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>Active</span>
          </span>
        </div>
      </div>

      <div className="navbar-right">
        <Link
          to="/reminders"
          className="btn-ghost"
          style={{
            position: 'relative',
            padding: 8,
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
          }}
          title="Reminder Center"
        >
          <Bell size={19} />
          {upcomingEventsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                boxShadow: '0 0 6px #ef4444',
              }}
            />
          )}
        </Link>

        {onOpenNewAppModal && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onOpenNewAppModal}
          >
            <Plus size={16} />
            <span>New Application</span>
          </button>
        )}
      </div>
    </header>
  );
}
