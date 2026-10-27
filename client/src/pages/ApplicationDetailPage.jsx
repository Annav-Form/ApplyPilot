import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  MapPin,
  Send,
  Video,
  FileText,
  AlertCircle,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import TierBadge from '../components/TierBadge.jsx';
import DifficultyBadge from '../components/DifficultyBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import ApplicationFormModal from '../components/ApplicationFormModal.jsx';
import RoundFormModal from '../components/RoundFormModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isEditAppOpen, setIsEditAppOpen] = useState(false);
  const [isDeleteAppOpen, setIsDeleteAppOpen] = useState(false);
  const [isAddRoundOpen, setIsAddRoundOpen] = useState(false);
  const [editingRound, setEditingRound] = useState(null);
  const [deletingRound, setDeletingRound] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.applications.getById(id);
      setApplication(res.application);
    } catch (err) {
      setError(err.message || 'Application not found.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleUpdateApp = async (formData) => {
    try {
      setActionLoading(true);
      const res = await api.applications.update(id, formData);
      addToast(res.message || 'Application updated!', 'success');
      setApplication(res.application);
      setIsEditAppOpen(false);
    } catch (err) {
      addToast(err.message || 'Update failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickStatusChange = async (newStatus) => {
    try {
      const res = await api.applications.updateStatus(id, newStatus);
      addToast(res.message || 'Status updated!', 'success');
      setApplication(res.application);
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteApp = async () => {
    try {
      setActionLoading(true);
      await api.applications.delete(id);
      addToast('Application deleted successfully', 'success');
      navigate('/applications');
    } catch (err) {
      addToast(err.message || 'Delete failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddRound = async (roundData) => {
    try {
      setActionLoading(true);
      const res = await api.rounds.add(id, roundData);
      addToast(res.message || 'Round scheduled!', 'success');
      setIsAddRoundOpen(false);
      fetchApplication();
    } catch (err) {
      addToast(err.message || 'Failed to add round', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRound = async (roundData) => {
    try {
      setActionLoading(true);
      const res = await api.rounds.update(id, editingRound._id, roundData);
      addToast(res.message || 'Round updated!', 'success');
      setEditingRound(null);
      fetchApplication();
    } catch (err) {
      addToast(err.message || 'Failed to update round', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRound = async () => {
    if (!deletingRound) return;
    try {
      setActionLoading(true);
      const res = await api.rounds.delete(id, deletingRound._id);
      addToast(res.message || 'Round removed', 'success');
      setDeletingRound(null);
      fetchApplication();
    } catch (err) {
      addToast(err.message || 'Failed to delete round', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'inline-block', width: 30, height: 30, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 12, fontSize: '0.85rem' }}>Loading application details...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <EmptyState
          icon={AlertCircle}
          title="Application Not Found"
          description={error || 'The requested application does not exist or you do not have permission to view it.'}
          actionText="Back to Applications"
          onAction={() => navigate('/applications')}
        />
      </div>
    );
  }

  // Identify next upcoming round and overdue rounds
  const now = new Date();
  const sortedRounds = [...(application.rounds || [])].sort(
    (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)
  );

  let nextUpcomingRoundId = null;
  for (const r of sortedRounds) {
    if (r.status === 'Upcoming' && new Date(r.scheduledAt) >= now) {
      nextUpcomingRoundId = r._id;
      break;
    }
  }

  const deadlineDate = application.deadline ? new Date(application.deadline) : null;
  const isDeadlineOverdue = deadlineDate && deadlineDate < now && ['Wishlist', 'Applied'].includes(application.status);

  return (
    <div>
      {/* Back button */}
      <div style={{ marginBottom: 16 }}>
        <Link
          to="/applications"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Applications</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="card" style={{ marginBottom: 24, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                {application.company}
              </h1>
              <TierBadge tier={application.tier} />
              <DifficultyBadge difficulty={application.difficulty} />
              <PriorityBadge priority={application.priority} />
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {application.role}
            </div>
          </div>

          {/* Quick status dropdown & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
              <select
                className="form-select"
                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                value={application.status}
                onChange={(e) => handleQuickStatusChange(e.target.value)}
              >
                <option value="Wishlist">Wishlist</option>
                <option value="Applied">Applied</option>
                <option value="Online Assessment">Online Assessment</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditAppOpen(true)}
            >
              <Edit2 size={14} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => setIsDeleteAppOpen(true)}
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Location
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={14} color="var(--accent-teal)" />
              {application.location || 'Remote / Hybrid'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Source
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Send size={14} color="#818cf8" />
              {application.source || 'On-Campus'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Application Deadline
            </div>
            <div style={{ fontSize: '0.875rem', color: isDeadlineOverdue ? '#f87171' : 'var(--text-primary)', marginTop: 2, fontWeight: isDeadlineOverdue ? 700 : 500 }}>
              {deadlineDate ? deadlineDate.toLocaleDateString() : 'Not specified'}
              {isDeadlineOverdue && ' (Overdue)'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Stipend / CTC
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: 2 }}>
              {application.salary || 'Not specified'}
            </div>
          </div>

          {application.jobUrl && (
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Job Posting
              </div>
              <div style={{ marginTop: 2 }}>
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    color: '#818cf8',
                    fontSize: '0.85rem',
                    textDecoration: 'underline',
                  }}
                >
                  <span>Open Job URL</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Description & Notes */}
        {(application.description || application.additionalNotes) && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {application.description && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Job Requirements / Description
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                  {application.description}
                </div>
              </div>
            )}
            {application.additionalNotes && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Personal Progress Notes
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                  {application.additionalNotes}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rounds Section */}
      <div className="card" style={{ padding: 24 }}>
        <div className="card-header" style={{ marginBottom: 20 }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '1.2rem' }}>
              <Layers size={20} color="#818cf8" />
              <span>Assessment & Interview Rounds ({sortedRounds.length})</span>
            </h2>
            <p className="card-subtitle">
              Chronological schedule of Online Assessments, Coding Tests, and Technical/HR Rounds
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsAddRoundOpen(true)}
          >
            <Plus size={16} />
            <span>Schedule Round</span>
          </button>
        </div>

        {sortedRounds.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No rounds scheduled yet"
            description="Add your first Online Assessment test or technical interview round."
            actionText="Schedule First Round"
            onAction={() => setIsAddRoundOpen(true)}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sortedRounds.map((round) => {
              const roundDate = new Date(round.scheduledAt);
              const isNextUpcoming = round._id === nextUpcomingRoundId;
              const isOverdue = round.status === 'Upcoming' && roundDate < now;

              let outcomeBadgeStyle = { bg: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8' };
              if (round.outcome === 'Cleared') {
                outcomeBadgeStyle = { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399' };
              } else if (round.outcome === 'Rejected') {
                outcomeBadgeStyle = { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171' };
              } else if (round.outcome === 'Pending') {
                outcomeBadgeStyle = { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' };
              }

              return (
                <div
                  key={round._id}
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-lg)',
                    border: isNextUpcoming
                      ? '2px solid #6366f1'
                      : isOverdue
                      ? '2px solid #ef4444'
                      : '1px solid var(--border-subtle)',
                    padding: 20,
                    position: 'relative',
                    boxShadow: isNextUpcoming ? '0 0 15px rgba(99, 102, 241, 0.25)' : 'none',
                  }}
                >
                  {/* Highlights banner */}
                  {isNextUpcoming && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -11,
                        left: 20,
                        backgroundColor: '#6366f1',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 10px',
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Next Upcoming Round ⏰
                    </div>
                  )}

                  {isOverdue && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -11,
                        left: 20,
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 10px',
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Pending Outcome Update ⚠️
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {round.name || round.roundType}
                        </h4>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(99, 102, 241, 0.15)',
                            color: '#818cf8',
                            fontWeight: 600,
                          }}
                        >
                          {round.roundType}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 8, fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Calendar size={14} color="#818cf8" />
                          <span style={{ fontWeight: 600, color: isOverdue ? '#f87171' : 'var(--text-primary)' }}>
                            {roundDate.toLocaleString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {round.durationMinutes && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={14} color="var(--text-muted)" />
                            <span>{round.durationMinutes} mins</span>
                          </div>
                        )}

                        {round.meetingLink && (
                          <a
                            href={round.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              color: 'var(--accent-teal)',
                              fontWeight: 600,
                            }}
                          >
                            <Video size={14} />
                            <span>Join Meeting</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Status & Outcome Badges + Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Round Status */}
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 9px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor:
                            round.status === 'Completed'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : round.status === 'Upcoming'
                              ? 'rgba(99, 102, 241, 0.15)'
                              : 'rgba(245, 158, 11, 0.15)',
                          color:
                            round.status === 'Completed'
                              ? '#34d399'
                              : round.status === 'Upcoming'
                              ? '#818cf8'
                              : '#fbbf24',
                        }}
                      >
                        {round.status}
                      </span>

                      {/* Outcome Badge */}
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 9px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: outcomeBadgeStyle.bg,
                          color: outcomeBadgeStyle.color,
                        }}
                      >
                        {round.outcome === 'Cleared' && 'Cleared ✅'}
                        {round.outcome === 'Rejected' && 'Rejected ❌'}
                        {round.outcome === 'Pending' && 'Pending Outcome'}
                        {round.outcome === 'N/A' && 'N/A'}
                      </span>

                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: 6, borderRadius: 'var(--radius-sm)' }}
                        onClick={() => setEditingRound(round)}
                        title="Edit Round"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: 6, borderRadius: 'var(--radius-sm)', color: '#f87171' }}
                        onClick={() => setDeletingRound(round)}
                        title="Delete Round"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {round.notes && (
                    <div
                      style={{
                        marginTop: 14,
                        paddingTop: 10,
                        borderTop: '1px solid var(--border-subtle)',
                        fontSize: '0.825rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        Round Notes & Feedback:
                      </strong>
                      <p style={{ marginTop: 2, whiteSpace: 'pre-line' }}>{round.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Application Modal */}
      {isEditAppOpen && (
        <ApplicationFormModal
          isOpen={isEditAppOpen}
          onClose={() => setIsEditAppOpen(false)}
          onSubmit={handleUpdateApp}
          initialData={application}
          loading={actionLoading}
        />
      )}

      {/* Delete Application Modal */}
      <ConfirmModal
        isOpen={isDeleteAppOpen}
        onClose={() => setIsDeleteAppOpen(false)}
        onConfirm={handleDeleteApp}
        title={`Delete application for ${application.company}?`}
        message="This action cannot be undone. All notes and rounds for this application will be permanently removed."
        confirmText="Delete Application"
        confirmVariant="danger"
        loading={actionLoading}
      />

      {/* Add Round Modal */}
      <RoundFormModal
        isOpen={isAddRoundOpen}
        onClose={() => setIsAddRoundOpen(false)}
        onSubmit={handleAddRound}
        companyName={application.company}
        loading={actionLoading}
      />

      {/* Edit Round Modal */}
      {editingRound && (
        <RoundFormModal
          isOpen={Boolean(editingRound)}
          onClose={() => setEditingRound(null)}
          onSubmit={handleUpdateRound}
          initialData={editingRound}
          companyName={application.company}
          loading={actionLoading}
        />
      )}

      {/* Delete Round Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingRound)}
        onClose={() => setDeletingRound(null)}
        onConfirm={handleDeleteRound}
        title={`Delete ${deletingRound?.name || deletingRound?.roundType}?`}
        message="Are you sure you want to remove this round from your application history?"
        confirmText="Delete Round"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
