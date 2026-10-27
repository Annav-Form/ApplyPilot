import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';

export default function RoundFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  companyName = '',
  loading = false,
}) {
  const [formData, setFormData] = useState({
    roundType: 'Online Assessment',
    name: '',
    scheduledAt: '',
    status: 'Upcoming',
    outcome: 'Pending',
    durationMinutes: 60,
    meetingLink: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      let formattedDate = '';
      if (initialData.scheduledAt) {
        const d = new Date(initialData.scheduledAt);
        // format to YYYY-MM-DDTHH:mm
        const tzOffset = d.getTimezoneOffset() * 60000;
        formattedDate = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      }

      setFormData({
        roundType: initialData.roundType || 'Online Assessment',
        name: initialData.name || '',
        scheduledAt: formattedDate,
        status: initialData.status || 'Upcoming',
        outcome: initialData.outcome || 'Pending',
        durationMinutes: initialData.durationMinutes || 60,
        meetingLink: initialData.meetingLink || '',
        notes: initialData.notes || '',
      });
    } else {
      // Default to tomorrow 10:00 AM
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      tomorrow.setHours(10, 0, 0, 0);
      const tzOffset = tomorrow.getTimezoneOffset() * 60000;
      const formattedDate = new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);

      setFormData({
        roundType: 'Online Assessment',
        name: '',
        scheduledAt: formattedDate,
        status: 'Upcoming',
        outcome: 'Pending',
        durationMinutes: 60,
        meetingLink: '',
        notes: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = {};
    if (!formData.roundType) {
      validationErrors.roundType = 'Round type is required';
    }
    if (!formData.scheduledAt) {
      validationErrors.scheduledAt = 'Scheduled date and time is required';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({
      ...formData,
      scheduledAt: new Date(formData.scheduledAt).toISOString(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Round: ${initialData.name || initialData.roundType}` : `Schedule OA / Interview for ${companyName}`}
      maxWidth={580}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Round Type *</label>
            <select
              name="roundType"
              className="form-select"
              value={formData.roundType}
              onChange={handleChange}
              required
            >
              <option value="Online Assessment">Online Assessment (OA)</option>
              <option value="Coding Round">Live Coding Round</option>
              <option value="Technical Interview">Technical Interview</option>
              <option value="HR Interview">HR / Culture Fit Interview</option>
              <option value="Managerial Interview">Managerial / Director Round</option>
              <option value="Other">Other Assessment</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Round Title / Identifier</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. Round 1: DSA + Aptitude"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Scheduled Date & Time *</label>
            <input
              type="datetime-local"
              name="scheduledAt"
              className="form-input"
              value={formData.scheduledAt}
              onChange={handleChange}
              required
            />
            {errors.scheduledAt && <span className="form-error">{errors.scheduledAt}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Duration (Minutes)</label>
            <input
              type="number"
              name="durationMinutes"
              className="form-input"
              min={15}
              max={300}
              step={15}
              value={formData.durationMinutes}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Round Status</label>
            <select
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Missed">Missed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Round Outcome / Result</label>
            <select
              name="outcome"
              className="form-select"
              value={formData.outcome}
              onChange={handleChange}
            >
              <option value="Pending">Pending Outcome</option>
              <option value="Cleared">Cleared ✅</option>
              <option value="Rejected">Rejected ❌</option>
              <option value="N/A">Not Applicable</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Meeting or Assessment Link</label>
          <input
            type="url"
            name="meetingLink"
            className="form-input"
            placeholder="e.g. https://meet.google.com/abc-xyz or HackerRank test link"
            value={formData.meetingLink}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes, Questions Asked & Feedback</label>
          <textarea
            name="notes"
            className="form-textarea"
            rows={3}
            placeholder="Key algorithms asked, questions you could improve, interviewer feedback..."
            value={formData.notes}
            onChange={handleChange}
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
            {loading ? 'Saving...' : initialData ? 'Update Round' : 'Schedule Round'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
