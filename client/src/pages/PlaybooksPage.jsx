import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpenCheck,
  Plus,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Edit2,
  Filter,
  Check,
  Layers,
  Info,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import PlaybookFormModal from '../components/PlaybookFormModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function PlaybooksPage() {
  const { addToast } = useToast();

  const [items, setItems] = useState([]);
  const [groupStats, setGroupStats] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Active Category Filter
  const [selectedGroup, setSelectedGroup] = useState(''); // '' means All Topics
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [seedingLoading, setSeedingLoading] = useState(false);

  const fetchPlaybooks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.playbooks.getAll({
        group: selectedGroup,
        priority: priorityFilter,
      });
      setItems(res.items || []);
      setGroupStats(res.groupStats || {});
      setTotalCount(res.totalCount || 0);
      setCompletedCount(res.completedCount || 0);
    } catch (err) {
      addToast(err.message || 'Failed to load preparation topics.', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedGroup, priorityFilter, addToast]);

  useEffect(() => {
    fetchPlaybooks();
  }, [fetchPlaybooks]);

  useEffect(() => {
    const handleRefresh = () => fetchPlaybooks();
    window.addEventListener('data:refresh', handleRefresh);
    return () => window.removeEventListener('data:refresh', handleRefresh);
  }, [fetchPlaybooks]);

  const handleToggle = async (itemId) => {
    try {
      const res = await api.playbooks.toggle(itemId);
      addToast(res.message || 'Progress updated!', 'success');
      // Update local state
      setItems((prev) =>
        prev.map((item) => (item._id === itemId ? res.item : item))
      );
      fetchPlaybooks();
    } catch (err) {
      addToast(err.message || 'Failed to update progress', 'error');
    }
  };

  const handleCreate = async (formData) => {
    try {
      setActionLoading(true);
      const res = await api.playbooks.create(formData);
      addToast(res.message || 'Topic added to study plan!', 'success');
      setIsAddOpen(false);
      fetchPlaybooks();
    } catch (err) {
      addToast(err.message || 'Failed to create item', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setActionLoading(true);
      const res = await api.playbooks.update(editingItem._id, formData);
      addToast(res.message || 'Topic updated!', 'success');
      setEditingItem(null);
      fetchPlaybooks();
    } catch (err) {
      addToast(err.message || 'Failed to update topic', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      setActionLoading(true);
      const res = await api.playbooks.delete(deletingItem._id);
      addToast(res.message || 'Topic removed', 'success');
      setDeletingItem(null);
      fetchPlaybooks();
    } catch (err) {
      addToast(err.message || 'Failed to delete item', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSeedStarter = async () => {
    try {
      setSeedingLoading(true);
      const res = await api.playbooks.seedStarter();
      addToast(res.message || 'Starter curriculum loaded!', 'success');
      fetchPlaybooks();
    } catch (err) {
      addToast(err.message || 'Could not load starter curriculum.', 'warning');
    } finally {
      setSeedingLoading(false);
    }
  };

  const categories = [
    { key: '', label: 'All Topics', desc: 'Comprehensive placement syllabus' },
    { key: 'Decent', label: 'Decent Companies', desc: 'Tier-2, mid-market & enterprise service firms' },
    { key: 'Excellent', label: 'Excellent Companies', desc: 'Tier-1, MAANG & hyper-growth tech unicorns' },
    { key: 'Easy to Crack', label: 'Easy to Crack', desc: 'Standard DSA, basic aptitude & core CS fundamentals' },
    { key: 'Hard to Crack', label: 'Hard to Crack', desc: 'Advanced DP, Graphs, Distributed Systems & Concurrency' },
  ];

  // Active Category Info
  const activeStat = selectedGroup
    ? groupStats[selectedGroup] || { total: 0, completed: 0, percentage: 0, hours: 0, completedHours: 0 }
    : {
        total: totalCount,
        completed: completedCount,
        percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        hours: items.reduce((acc, i) => acc + (i.estimatedHours || 0), 0),
        completedHours: items.filter((i) => i.isCompleted).reduce((acc, i) => acc + (i.estimatedHours || 0), 0),
      };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Preparation Playbooks</h1>
          <p className="page-subtitle">
            Curate targeted study plans to answer: <em>"What do I need to study for this type of company?"</em>
          </p>
        </div>

        <div className="header-actions">
          {totalCount === 0 && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleSeedStarter}
              disabled={seedingLoading}
            >
              <Sparkles size={16} color="#818cf8" />
              <span>{seedingLoading ? 'Loading...' : 'Load Curated Starter Plan'}</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus size={16} />
            <span>Add Study Topic</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="tabs-container">
        {categories.map((cat) => {
          const isActive = selectedGroup === cat.key;
          const stat = cat.key ? groupStats[cat.key] : null;
          return (
            <button
              key={cat.key}
              type="button"
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedGroup(cat.key)}
            >
              <span>{cat.label}</span>
              {stat && stat.total > 0 && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: '0.7rem',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-tertiary)',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {stat.completed}/{stat.total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Category Focus & Progress Banner */}
      <div
        className="card"
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(20, 29, 46, 0.9) 0%, rgba(17, 24, 39, 0.9) 100%)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <BookOpenCheck size={20} color="var(--accent-teal)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedGroup ? `${selectedGroup} Preparation Curriculum` : 'Overall Placement Preparation'}
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {selectedGroup === 'Excellent' && 'Focus on clean code, optimal time/space complexity, Graph algorithms (Dijkstra, Topological Sort), and basic system design architecture.'}
              {selectedGroup === 'Decent' && 'Master arrays, strings, basic trees, CS fundamentals (OS, DBMS SQL queries, Computer Networks), and behavioral project discussions.'}
              {selectedGroup === 'Easy to Crack' && 'Standard LeetCode Easy/Medium patterns, Aptitude/Logical Reasoning MCQs, and OOP concepts in Java/C++/Python.'}
              {selectedGroup === 'Hard to Crack' && 'Multi-dimensional Dynamic Programming, Advanced Trie/Segment Trees, Low-Level Object Oriented Design, and live whiteboard defense.'}
              {!selectedGroup && 'Track topic mastery across all company categories with estimated study hours and key resources.'}
            </p>
          </div>

          {/* Progress Widget */}
          <div style={{ minWidth: 240, flex: 1, maxWidth: 360 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Curriculum Completion</span>
              <span style={{ fontWeight: 800, color: '#34d399' }}>{activeStat.percentage}%</span>
            </div>
            <div className="progress-bar-bg" style={{ height: 8 }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${activeStat.percentage}%` }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
              <span>{activeStat.completed} of {activeStat.total} topics completed</span>
              <span>{activeStat.completedHours} / {activeStat.hours} hours studied</span>
            </div>
          </div>
        </div>
      </div>

      {/* Topic List */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 10, fontSize: '0.85rem' }}>Loading preparation playbook...</p>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={BookOpenCheck}
          title={selectedGroup ? `No topics in ${selectedGroup} yet` : 'Your preparation playbook is empty'}
          description="Build your structured study plan by adding specific topics or loading the starter curriculum."
          actionText={totalCount === 0 ? 'Load Starter Curriculum' : 'Add First Topic'}
          onAction={totalCount === 0 ? handleSeedStarter : () => setIsAddOpen(true)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item) => (
            <div
              key={item._id}
              style={{
                backgroundColor: item.isCompleted ? 'rgba(17, 24, 39, 0.4)' : 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                transition: 'all var(--transition-fast)',
                opacity: item.isCompleted ? 0.75 : 1,
              }}
            >
              {/* Completion Toggle Button */}
              <button
                type="button"
                onClick={() => handleToggle(item._id)}
                style={{
                  marginTop: 2,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: item.isCompleted ? '2px solid #10b981' : '2px solid var(--text-muted)',
                  backgroundColor: item.isCompleted ? '#10b981' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                title={item.isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
              >
                {item.isCompleted && <Check size={14} strokeWidth={3} />}
              </button>

              {/* Topic Information */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: item.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: item.isCompleted ? 'line-through' : 'none',
                    }}
                  >
                    {item.topic}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PriorityBadge priority={item.priority} />
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        background: 'var(--bg-tertiary)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      <Clock size={12} />
                      {item.estimatedHours} hr{item.estimatedHours === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                {/* Target Group Tags */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {item.targetGroups?.map((g) => {
                    let tagStyle = { bg: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: 'rgba(99, 102, 241, 0.3)' };
                    if (g === 'Decent') {
                      tagStyle = { bg: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.28)' };
                    } else if (g === 'Easy to Crack') {
                      tagStyle = { bg: 'rgba(20, 184, 166, 0.14)', color: '#2dd4bf', border: 'rgba(20, 184, 166, 0.3)' };
                    } else if (g === 'Hard to Crack') {
                      tagStyle = { bg: 'rgba(244, 63, 94, 0.14)', color: '#fb7185', border: 'rgba(244, 63, 94, 0.3)' };
                    }

                    return (
                      <span
                        key={g}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: tagStyle.bg,
                          color: tagStyle.color,
                          border: `1px solid ${tagStyle.border}`,
                        }}
                      >
                        {g}
                      </span>
                    );
                  })}
                </div>

                {/* Resources / Notes */}
                {item.notes && (
                  <p
                    style={{
                      fontSize: '0.825rem',
                      color: 'var(--text-secondary)',
                      marginTop: 8,
                      lineHeight: 1.5,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ padding: 6, borderRadius: 'var(--radius-sm)' }}
                  onClick={() => setEditingItem(item)}
                  title="Edit Topic"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ padding: 6, borderRadius: 'var(--radius-sm)', color: '#f87171' }}
                  onClick={() => setDeletingItem(item)}
                  title="Delete Topic"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Topic Modal */}
      <PlaybookFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleCreate}
        loading={actionLoading}
      />

      {/* Edit Topic Modal */}
      {editingItem && (
        <PlaybookFormModal
          isOpen={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          onSubmit={handleUpdate}
          initialData={editingItem}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title={`Delete preparation topic?`}
        message={`Are you sure you want to remove "${deletingItem?.topic}" from your playbook?`}
        confirmText="Delete Topic"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
