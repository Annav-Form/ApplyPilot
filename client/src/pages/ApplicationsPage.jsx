import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  Trash2,
  Edit2,
  ExternalLink,
  Calendar,
  Building2,
  Layers,
  Clock,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import TierBadge from '../components/TierBadge.jsx';
import DifficultyBadge from '../components/DifficultyBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ApplicationFormModal from '../components/ApplicationFormModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

export default function ApplicationsPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [diffFilter, setDiffFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('appliedDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [deletingApp, setDeletingApp] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.applications.getAll({
        search,
        status: statusFilter,
        tier: tierFilter,
        difficulty: diffFilter,
        priority: priorityFilter,
        sortBy,
        sortOrder,
      });
      setApplications(res.applications || []);
    } catch (err) {
      addToast(err.message || 'Failed to load applications.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, tierFilter, diffFilter, priorityFilter, sortBy, sortOrder, addToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchApplications]);

  useEffect(() => {
    const handleRefresh = () => fetchApplications();
    window.addEventListener('data:refresh', handleRefresh);
    return () => window.removeEventListener('data:refresh', handleRefresh);
  }, [fetchApplications]);

  const handleCreate = async (formData) => {
    try {
      setActionLoading(true);
      const res = await api.applications.create(formData);
      addToast(res.message || 'Application created!', 'success');
      setIsCreateOpen(false);
      fetchApplications();
    } catch (err) {
      addToast(err.message || 'Error creating application', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setActionLoading(true);
      const res = await api.applications.update(editingApp._id, formData);
      addToast(res.message || 'Application updated!', 'success');
      setEditingApp(null);
      fetchApplications();
    } catch (err) {
      addToast(err.message || 'Error updating application', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickStatusChange = async (appId, newStatus) => {
    try {
      const res = await api.applications.updateStatus(appId, newStatus);
      addToast(res.message || 'Status updated!', 'success');
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingApp) return;
    try {
      setActionLoading(true);
      const res = await api.applications.delete(deletingApp._id);
      addToast(res.message || 'Application deleted successfully', 'success');
      setDeletingApp(null);
      setApplications((prev) => prev.filter((a) => a._id !== deletingApp._id));
    } catch (err) {
      addToast(err.message || 'Failed to delete application', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTierFilter('');
    setDiffFilter('');
    setPriorityFilter('');
    setSortBy('appliedDate');
  };

  const hasActiveFilters = search || statusFilter || tierFilter || diffFilter || priorityFilter;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Application Tracker</h1>
          <p className="page-subtitle">
            Manage your placement applications, interview pipelines, and company classifications
          </p>
        </div>

        <div className="header-actions">
          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 2, border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              className="btn-ghost"
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: viewMode === 'table' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <TableIcon size={16} />
            </button>
            <button
              type="button"
              className="btn-ghost"
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: viewMode === 'grid' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={16} />
            <span>New Application</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by company, role, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Wishlist">Wishlist</option>
          <option value="Applied">Applied</option>
          <option value="Online Assessment">Online Assessment</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
          <option value="Withdrawn">Withdrawn</option>
        </select>

        {/* Tier Filter */}
        <select
          className="filter-select"
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
        >
          <option value="">All Tiers</option>
          <option value="Decent">Tier: Decent</option>
          <option value="Excellent">Tier: Excellent</option>
        </select>

        {/* Difficulty Filter */}
        <select
          className="filter-select"
          value={diffFilter}
          onChange={(e) => setDiffFilter(e.target.value)}
        >
          <option value="">All Difficulties</option>
          <option value="Easy to Crack">Easy to Crack</option>
          <option value="Hard to Crack">Hard to Crack</option>
        </select>

        {/* Priority Filter */}
        <select
          className="filter-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>

        {/* Sort Options */}
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="appliedDate">Sort by: Date Applied</option>
          <option value="deadline">Sort by: Deadline</option>
          <option value="company">Sort by: Company Name</option>
          <option value="priority">Sort by: Priority</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleClearFilters}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Content View */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 10, fontSize: '0.85rem' }}>Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={hasActiveFilters ? 'No applications match your filters' : 'No applications tracked yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting your search keywords or clearing some filters.'
              : 'Add your first placement application or click "Load Demo Data" from the sidebar.'
          }
          actionText={hasActiveFilters ? 'Clear Filters' : 'Add First Application'}
          onAction={hasActiveFilters ? handleClearFilters : () => setIsCreateOpen(true)}
        />
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company & Role</th>
                <th>Classification</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Rounds</th>
                <th>Priority</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const now = new Date();
                const deadlineDate = app.deadline ? new Date(app.deadline) : null;
                const isOverdue = deadlineDate && deadlineDate < now && ['Wishlist', 'Applied'].includes(app.status);
                const isUpcomingSoon =
                  deadlineDate &&
                  deadlineDate >= now &&
                  deadlineDate <= new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) &&
                  ['Wishlist', 'Applied'].includes(app.status);

                return (
                  <tr key={app._id}>
                    <td>
                      <div>
                        <div
                          className="table-title-cell"
                          style={{ cursor: 'pointer', color: '#c7d2fe' }}
                          onClick={() => navigate(`/applications/${app._id}`)}
                        >
                          {app.company}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {app.role} • <span style={{ color: 'var(--text-muted)' }}>{app.location}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                        <TierBadge tier={app.tier} />
                        <DifficultyBadge difficulty={app.difficulty} />
                      </div>
                    </td>

                    <td>
                      <select
                        className="form-select"
                        style={{
                          fontSize: '0.78rem',
                          padding: '4px 8px',
                          background: 'var(--bg-input)',
                          width: 'auto',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        value={app.status}
                        onChange={(e) => handleQuickStatusChange(app._id, e.target.value)}
                      >
                        <option value="Wishlist">Wishlist</option>
                        <option value="Applied">Applied</option>
                        <option value="Online Assessment">Online Assessment</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Withdrawn">Withdrawn</option>
                      </select>
                    </td>

                    <td>
                      {deadlineDate ? (
                        <div style={{ fontSize: '0.8rem' }}>
                          <span
                            style={{
                              color: isOverdue ? '#f87171' : isUpcomingSoon ? '#f59e0b' : 'var(--text-secondary)',
                              fontWeight: isOverdue || isUpcomingSoon ? 700 : 500,
                            }}
                          >
                            {deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {isOverdue && <span style={{ display: 'block', fontSize: '0.7rem', color: '#f87171' }}>Overdue</span>}
                          {isUpcomingSoon && <span style={{ display: 'block', fontSize: '0.7rem', color: '#f59e0b' }}>Due soon</span>}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No deadline</span>
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                        onClick={() => navigate(`/applications/${app._id}`)}
                      >
                        {app.rounds?.length || 0} round{(app.rounds?.length || 0) === 1 ? '' : 's'}
                      </button>
                    </td>

                    <td>
                      <PriorityBadge priority={app.priority} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          className="btn-ghost"
                          title="View Details"
                          style={{ padding: 6, borderRadius: 'var(--radius-sm)' }}
                          onClick={() => navigate(`/applications/${app._id}`)}
                        >
                          <ExternalLink size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-ghost"
                          title="Edit Application"
                          style={{ padding: 6, borderRadius: 'var(--radius-sm)' }}
                          onClick={() => setEditingApp(app)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-ghost"
                          title="Delete Application"
                          style={{ padding: 6, borderRadius: 'var(--radius-sm)', color: '#f87171' }}
                          onClick={() => setDeletingApp(app)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {applications.map((app) => (
            <div
              key={app._id}
              className="card"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <h3
                      style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', cursor: 'pointer' }}
                      onClick={() => navigate(`/applications/${app._id}`)}
                    >
                      {app.company}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {app.role}
                    </div>
                  </div>
                  <PriorityBadge priority={app.priority} />
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  <TierBadge tier={app.tier} />
                  <DifficultyBadge difficulty={app.difficulty} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  <div>📍 {app.location || 'Remote / Hybrid'} • {app.source}</div>
                  {app.salary && <div>💰 {app.salary}</div>}
                  {app.deadline && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={13} />
                      <span>Deadline: {new Date(app.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Layers size={13} />
                    <span>{app.rounds?.length || 0} OA / Interview round{(app.rounds?.length || 0) === 1 ? '' : 's'}</span>
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <StatusBadge status={app.status} />

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate(`/applications/${app._id}`)}
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '6px 8px' }}
                    onClick={() => setEditingApp(app)}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '6px 8px', color: '#f87171' }}
                    onClick={() => setDeletingApp(app)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Application Modal */}
      <ApplicationFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        loading={actionLoading}
      />

      {/* Edit Application Modal */}
      {editingApp && (
        <ApplicationFormModal
          isOpen={Boolean(editingApp)}
          onClose={() => setEditingApp(null)}
          onSubmit={handleUpdate}
          initialData={editingApp}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingApp)}
        onClose={() => setDeletingApp(null)}
        onConfirm={handleDelete}
        title={`Delete application for ${deletingApp?.company}?`}
        message="This will permanently delete this application record and all of its scheduled OA/interview rounds. This action cannot be reversed."
        confirmText="Permanently Delete"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
