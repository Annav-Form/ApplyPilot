import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';

export default function PlaybookFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    topic: '',
    targetGroups: ['Decent'],
    priority: 'Medium',
    estimatedHours: 2,
    notes: '',
  });

  const [errors, setErrors] = useState({});

  const availableGroups = ['Decent', 'Excellent', 'Easy to Crack', 'Hard to Crack'];

  useEffect(() => {
    if (initialData) {
      setFormData({
        topic: initialData.topic || '',
        targetGroups: initialData.targetGroups || ['Decent'],
        priority: initialData.priority || 'Medium',
        estimatedHours: initialData.estimatedHours || 2,
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        topic: '',
        targetGroups: ['Decent'],
        priority: 'Medium',
        estimatedHours: 2,
        notes: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleGroupToggle = (group) => {
    setFormData((prev) => {
      const exists = prev.targetGroups.includes(group);
      const updated = exists
        ? prev.targetGroups.filter((g) => g !== group)
        : [...prev.targetGroups, group];
      return { ...prev, targetGroups: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = {};
    if (!formData.topic.trim()) {
      validationErrors.topic = 'Topic title is required';
    }
    if (!formData.targetGroups || formData.targetGroups.length === 0) {
      validationErrors.targetGroups = 'Select at least one company group tag';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Preparation Topic' : 'Add Preparation Topic'}
      maxWidth={540}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Topic / Subject Title *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Graph BFS/DFS & Dijkstra or System Design: Caching"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            required
          />
          {errors.topic && <span className="form-error">{errors.topic}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Target Company Group Tags (Select all that apply) *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {availableGroups.map((group) => {
              const selected = formData.targetGroups.includes(group);
              return (
                <button
                  type="button"
                  key={group}
                  onClick={() => handleGroupToggle(group)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    backgroundColor: selected ? 'var(--primary)' : 'var(--bg-input)',
                    color: selected ? '#ffffff' : 'var(--text-secondary)',
                    border: selected
                      ? '1px solid var(--primary)'
                      : '1px solid var(--border-subtle)',
                  }}
                >
                  {selected ? '✓ ' : '+ '}
                  {group}
                </button>
              );
            })}
          </div>
          {errors.targetGroups && <span className="form-error">{errors.targetGroups}</span>}
          <span className="form-hint">
            You can tag topics for both 'Excellent' and 'Hard to Crack' at the same time.
          </span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Hours</label>
            <input
              type="number"
              className="form-input"
              min={0.5}
              max={100}
              step={0.5}
              value={formData.estimatedHours}
              onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Key Resources, Problem Links & Formulas</label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="LeetCode problem numbers, Striver SDE sheet links, key theorems..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Add Topic'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
