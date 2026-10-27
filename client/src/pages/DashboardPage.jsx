import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trophy,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Plus,
  BookOpen,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import TierBadge from '../components/TierBadge.jsx';
import DifficultyBadge from '../components/DifficultyBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ApplicationFormModal from '../components/ApplicationFormModal.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [submittingApp, setSubmittingApp] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.dashboard.getStats();
      setData(res);
    } catch (err) {
      setError(err.message || 'Could not load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    const handleRefresh = () => fetchDashboardData();
    window.addEventListener('data:refresh', handleRefresh);
    return () => window.removeEventListener('data:refresh', handleRefresh);
  }, [fetchDashboardData]);

  const handleCreateApp = async (formData) => {
    try {
      setSubmittingApp(true);
      const res = await api.applications.create(formData);
      addToast(res.message || 'Application tracked successfully!', 'success');
      setIsAppModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      addToast(err.message || 'Failed to create application.', 'error');
    } finally {
      setSubmittingApp(false);
    }
  };

  if (loading && !data) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 12, fontSize: '0.9rem' }}>Gathering your placement analytics...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    totalApplications: 0,
    activeApplications: 0,
    totalScheduledRounds: 0,
    offersReceived: 0,
    overdueCount: 0,
    upcomingCount: 0,
    statusCounts: {},
    tierCounts: { Decent: 0, Excellent: 0 },
    difficultyCounts: { 'Easy to Crack': 0, 'Hard to Crack': 0 },
    playbook: { totalTopics: 0, completedTopics: 0, progressPercentage: 0, totalStudyHours: 0, completedStudyHours: 0 },
  };

  const upcomingEvents = data?.upcomingEvents || [];
  const overdueEvents = data?.overdueEvents || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p className="page-subtitle">
            {user?.targetRole || 'Software Development Engineer'} • {user?.college || 'Placement Drive 2026–2027'}
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAppModalOpen(true)}
          >
            <Plus size={16} />
            <span>Track Application</span>
          </button>
        </div>
      </div>

      {/* Overdue Urgent Alert Card */}
      {overdueEvents.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={22} color="#f87171" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.95rem' }}>
                Action Required: {overdueEvents.length} Overdue Item{overdueEvents.length === 1 ? '' : 's'}
              </div>
              <div style={{ fontSize: '0.825rem', color: '#fca5a5', marginTop: 2 }}>
                You have past application deadlines or completed OA/interview rounds awaiting outcome recording.
              </div>
            </div>
          </div>
          <Link to="/reminders" className="btn btn-danger btn-sm">
            <span>View Reminder Center</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Top 6 KPI Metric Cards */}
      <div className="stats-grid">
        {/* Total Apps */}
        <div
          className="stat-card"
          onClick={() => navigate('/applications')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon-wrapper" style={{ background: 'rgba(197, 155, 39, 0.12)', color: 'var(--primary)' }}>
            <Briefcase size={20} />
          </div>
          <div className="stat-value">{stats.totalApplications}</div>
          <div className="stat-label">Total Applications</div>
          <div className="stat-meta">Lifetime submissions</div>
        </div>

        {/* Active Apps */}
        <div
          className="stat-card"
          onClick={() => navigate('/applications?status=Applied')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon-wrapper" style={{ background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}>
            <TrendingUp size={20} />
          </div>
          <div className="stat-value">{stats.activeApplications}</div>
          <div className="stat-label">In-Progress</div>
          <div className="stat-meta">Active candidate pipeline</div>
        </div>

        {/* Scheduled Rounds */}
        <div
          className="stat-card"
          onClick={() => navigate('/reminders')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon-wrapper" style={{ background: 'rgba(126, 34, 206, 0.1)', color: '#7e22ce' }}>
            <Calendar size={20} />
          </div>
          <div className="stat-value">{stats.totalScheduledRounds}</div>
          <div className="stat-label">OAs & Interviews</div>
          <div className="stat-meta">Scheduled rounds</div>
        </div>

        {/* Offers */}
        <div
          className="stat-card"
          onClick={() => navigate('/applications?status=Offer')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon-wrapper" style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#15803d' }}>
            <Trophy size={20} />
          </div>
          <div className="stat-value" style={{ color: '#15803d' }}>{stats.offersReceived}</div>
          <div className="stat-label">Offers Received</div>
          <div className="stat-meta">Placement conversions 🎉</div>
        </div>

        {/* Overdue */}
        <div
          className="stat-card"
          onClick={() => navigate('/reminders')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon-wrapper" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#b91c1c' }}>
            <AlertTriangle size={20} />
          </div>
          <div className="stat-value" style={{ color: stats.overdueCount > 0 ? '#b91c1c' : 'var(--text-primary)' }}>
            {stats.overdueCount}
          </div>
          <div className="stat-label">Overdue Events</div>
          <div className="stat-meta">Require your attention</div>
        </div>

        {/* Upcoming in 14 Days */}
        <div
          className="stat-card"
          onClick={() => navigate('/reminders')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon-wrapper" style={{ background: 'rgba(197, 155, 39, 0.12)', color: 'var(--primary)' }}>
            <Clock size={20} />
          </div>
          <div className="stat-value">{stats.upcomingCount}</div>
          <div className="stat-label">Next 14 Days</div>
          <div className="stat-meta">Upcoming events</div>
        </div>
      </div>

      {/* Middle Grid: Status Breakdown & Category Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Status Pipeline Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <TrendingUp size={18} color="var(--primary)" />
                <span>Application Pipeline Breakdown</span>
              </h3>
              <p className="card-subtitle">Real-time status counts across all tracked jobs</p>
            </div>
            <Link to="/applications" className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>
              View all
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Wishlist', key: 'Wishlist', color: '#94a3b8' },
              { label: 'Applied', key: 'Applied', color: '#60a5fa' },
              { label: 'Online Assessment (OA)', key: 'Online Assessment', color: '#fbbf24' },
              { label: 'Interview Round', key: 'Interview', color: '#c084fc' },
              { label: 'Offer Received', key: 'Offer', color: '#34d399' },
              { label: 'Rejected', key: 'Rejected', color: '#f87171' },
              { label: 'Withdrawn', key: 'Withdrawn', color: '#64748b' },
            ].map((item) => {
              const count = stats.statusCounts[item.key] || 0;
              const pct = stats.totalApplications > 0 ? Math.round((count / stats.totalApplications) * 100) : 0;
              return (
                <div key={item.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="progress-bar-bg" style={{ height: 6 }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: item.color,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 400ms ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dual Classification: Company Tier & Difficulty */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Sparkles size={18} color="var(--primary)" />
                <span>Company Classification Matrix</span>
              </h3>
              <p className="card-subtitle">Independent Tier and Difficulty metrics</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Tier Group */}
            <div
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.05em' }}>
                Company Tier Distribution
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <TierBadge tier="Decent" />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Mid-market & startups</div>
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stats.tierCounts.Decent || 0}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <TierBadge tier="Excellent" />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Tier-1 & MAANG</div>
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stats.tierCounts.Excellent || 0}</span>
                </div>
              </div>
            </div>

            {/* Difficulty Group */}
            <div
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.05em' }}>
                Interview Difficulty Level
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <DifficultyBadge difficulty="Easy to Crack" />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Core standard topics</div>
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stats.difficultyCounts['Easy to Crack'] || 0}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <DifficultyBadge difficulty="Hard to Crack" />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Rigorous rounds</div>
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stats.difficultyCounts['Hard to Crack'] || 0}</span>
                </div>
              </div>
            </div>

            {/* Playbook Progress Widget */}
            <div
              style={{
                backgroundColor: 'rgba(197, 155, 39, 0.08)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(197, 155, 39, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Preparation Playbook Progress
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  {stats.playbook.completedTopics} of {stats.playbook.totalTopics} topics mastered ({stats.playbook.completedStudyHours} hrs)
                </div>
              </div>
              <Link to="/playbooks" className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
                <BookOpen size={13} />
                <span>Playbook</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Upcoming Deadlines/Rounds & Recent Applications */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Upcoming Timeline */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Clock size={18} color="var(--primary)" />
                <span>Upcoming Deadlines & Scheduled Rounds</span>
              </h3>
              <p className="card-subtitle">Next events requiring your preparation</p>
            </div>
            <Link to="/reminders" className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>
              All reminders
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming events"
              description="No applications due or rounds scheduled in the next 14 days."
              actionText="Add an application or round"
              onAction={() => setIsAppModalOpen(true)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcomingEvents.slice(0, 5).map((ev, index) => {
                const dateObj = new Date(ev.date);
                const isDeadline = ev.type === 'Application Deadline';
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 'var(--radius-md)',
                          background: isDeadline ? 'rgba(59, 130, 246, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                          color: isDeadline ? '#60a5fa' : '#c084fc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isDeadline ? <Calendar size={18} /> : <Clock size={18} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {ev.company} • <span style={{ color: 'var(--text-secondary)' }}>{ev.roundName || ev.role}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {isDeadline ? 'Application Deadline' : ev.roundType} •{' '}
                          {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/applications/${ev.applicationId}`}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      View
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Applications Activity */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Briefcase size={18} color="var(--primary)" />
                <span>Recent Applications</span>
              </h3>
              <p className="card-subtitle">Latest tracked companies & status updates</p>
            </div>
            <Link to="/applications" className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>
              View all
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No applications tracked yet"
              description="Start tracking your campus and off-campus placements today."
              actionText="Track Your First Application"
              onAction={() => setIsAppModalOpen(true)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentActivity.map((app) => (
                <div
                  key={app._id}
                  onClick={() => navigate(`/applications/${app._id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-medium)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {app.company}
                      </span>
                      <TierBadge tier={app.tier} />
                      <DifficultyBadge difficulty={app.difficulty} />
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {app.role} • {app.roundsCount} round{app.roundsCount === 1 ? '' : 's'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <StatusBadge status={app.status} />
                    <ArrowRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Application Modal */}
      <ApplicationFormModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        onSubmit={handleCreateApp}
        loading={submittingApp}
      />
    </div>
  );
}
