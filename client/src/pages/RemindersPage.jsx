import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BellRing,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function RemindersPage() {
  const { addToast } = useToast();

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'overdue', 'deadlines', 'rounds'

  // Browser Notification State
  const [browserPermission, setBrowserPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported'
  );

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.getStats();
      setReminders(res.reminders || []);
    } catch (err) {
      addToast(err.message || 'Failed to load reminders.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const requestBrowserPermission = async () => {
    if (!('Notification' in window)) {
      addToast('This browser does not support desktop notifications.', 'warning');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      if (permission === 'granted') {
        addToast('Browser notifications enabled!', 'success');
        new Notification('ApplyPilot Reminders Active', {
          body: 'You will receive reminders for scheduled interview rounds and application deadlines.',
          icon: '/favicon.ico',
        });
      } else {
        addToast('Browser notifications permission was not granted.', 'info');
      }
    } catch (err) {
      addToast('Could not request notification permission.', 'error');
    }
  };

  const triggerTestNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('ApplyPilot Reminder Demo', {
        body: 'Example: Your Google Technical Round is scheduled for tomorrow at 10:00 AM.',
      });
      addToast('Test browser notification sent!', 'success');
    } else {
      requestBrowserPermission();
    }
  };

  const filteredReminders = reminders.filter((rem) => {
    if (filter === 'overdue') return rem.level === 'danger';
    if (filter === 'deadlines') return rem.category.includes('Deadline');
    if (filter === 'rounds') return rem.category.includes('Round');
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reminders & Deadline Center</h1>
          <p className="page-subtitle">
            Synchronized deadline alerts, interview preparations, and outcome follow-ups
          </p>
        </div>
      </div>

      {/* Honest Browser Notifications Transparency Box */}
      <div
        className="card"
        style={{
          marginBottom: 24,
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          padding: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ maxWidth: 620 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <BellRing size={18} color="#818cf8" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Browser & In-App Notification Engine
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              ApplyPilot in-app reminders are always synchronized directly with your real MongoDB database. You can also enable browser push notifications to alert you during active study sessions.
            </p>
            <div
              style={{
                marginTop: 8,
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Info size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
              <span>
                <strong>System Note:</strong> Browser notifications only fire while ApplyPilot is open in an active tab; offline reminders require dedicated background email/SMS infrastructure.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {browserPermission === 'granted' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-offer" style={{ padding: '6px 12px' }}>
                  <CheckCircle2 size={13} />
                  <span>Browser Notifications Active</span>
                </span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={triggerTestNotification}
                >
                  Test Notification
                </button>
              </div>
            ) : browserPermission === 'denied' ? (
              <span className="badge badge-rejected" style={{ padding: '6px 12px' }}>
                <ShieldAlert size={13} />
                <span>Blocked in Browser Settings</span>
              </span>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={requestBrowserPermission}
              >
                <BellRing size={14} />
                <span>Enable Browser Alerts</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs-container">
        {[
          { key: 'all', label: `All Alerts (${reminders.length})` },
          { key: 'overdue', label: `Urgent / Overdue (${reminders.filter((r) => r.level === 'danger').length})` },
          { key: 'deadlines', label: `Application Deadlines (${reminders.filter((r) => r.category.includes('Deadline')).length})` },
          { key: 'rounds', label: `OA & Interview Rounds (${reminders.filter((r) => r.category.includes('Round')).length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-btn ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 10, fontSize: '0.85rem' }}>Loading reminders...</p>
        </div>
      ) : filteredReminders.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All caught up!"
          description="You have no overdue deadlines or scheduled rounds pending action for this filter."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredReminders.map((rem) => {
            const isDanger = rem.level === 'danger';
            const isWarning = rem.level === 'warning';

            return (
              <div
                key={rem.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: isDanger
                    ? '1px solid rgba(239, 68, 68, 0.35)'
                    : isWarning
                    ? '1px solid rgba(245, 158, 11, 0.35)'
                    : '1px solid var(--border-subtle)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                  borderLeft: isDanger
                    ? '4px solid #ef4444'
                    : isWarning
                    ? '4px solid #f59e0b'
                    : '4px solid #3b82f6',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isDanger
                        ? 'var(--danger-bg)'
                        : isWarning
                        ? 'var(--warning-bg)'
                        : 'var(--info-bg)',
                      color: isDanger ? '#f87171' : isWarning ? '#fbbf24' : '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {isDanger ? (
                      <AlertTriangle size={18} />
                    ) : rem.category.includes('Round') ? (
                      <Clock size={18} />
                    ) : (
                      <Calendar size={18} />
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {rem.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                          fontWeight: 600,
                        }}
                      >
                        {rem.category}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      {rem.message}
                    </p>
                  </div>
                </div>

                <Link
                  to={rem.link}
                  className={`btn ${isDanger ? 'btn-danger' : isWarning ? 'btn-primary' : 'btn-outline'} btn-sm`}
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                >
                  <span>{rem.actionText || 'Take Action'}</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
