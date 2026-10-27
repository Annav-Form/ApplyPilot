import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';

export default function ApplicationFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    tier: 'Decent',
    difficulty: 'Easy to Crack',
    status: 'Applied',
    priority: 'Medium',
    deadline: '',
    appliedDate: new Date().toISOString().split('T')[0],
    salary: '',
    location: 'Remote / Hybrid',
    source: 'On-Campus',
    jobUrl: '',
    description: '',
    additionalNotes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        company: initialData.company || '',
        role: initialData.role || '',
        tier: initialData.tier || 'Decent',
        difficulty: initialData.difficulty || 'Easy to Crack',
        status: initialData.status || 'Applied',
        priority: initialData.priority || 'Medium',
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
        appliedDate: initialData.appliedDate
          ? new Date(initialData.appliedDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        salary: initialData.salary || '',
        location: initialData.location || 'Remote / Hybrid',
        source: initialData.source || 'On-Campus',
        jobUrl: initialData.jobUrl || '',
        description: initialData.description || '',
        additionalNotes: initialData.additionalNotes || '',
      });
    } else {
      setFormData({
        company: '',
        role: '',
        tier: 'Decent',
        difficulty: 'Easy to Crack',
        status: 'Applied',
        priority: 'Medium',
        deadline: '',
        appliedDate: new Date().toISOString().split('T')[0],
        salary: '',
        location: 'Remote / Hybrid',
        source: 'On-Campus',
        jobUrl: '',
        description: '',
        additionalNotes: '',
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
    if (!formData.company.trim()) {
      validationErrors.company = 'Company name is required';
    }
    if (!formData.role.trim()) {
      validationErrors.role = 'Job role / title is required';
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
      title={initialData ? `Edit Application: ${initialData.company}` : 'Track New Application'}
      maxWidth={680}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input
              type="text"
              name="company"
              className="form-input"
              placeholder="e.g. Google, Microsoft, Atlassian"
              value={formData.company}
              onChange={handleChange}
              required
            />
            {errors.company && <span className="form-error">{errors.company}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Job Title / Role *</label>
            <input
              type="text"
              name="role"
              className="form-input"
              placeholder="e.g. Software Engineer Intern"
              value={formData.role}
              onChange={handleChange}
              required
            />
            {errors.role && <span className="form-error">{errors.role}</span>}
          </div>
        </div>

        {/* Company Classification Dual Badges */}
        <div
          style={{
            background: 'var(--bg-tertiary)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Company Classification (Independent Dimensions)
          </div>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Company Tier</label>
              <select
                name="tier"
                className="form-select"
                value={formData.tier}
                onChange={handleChange}
              >
                <option value="Decent">Decent (Tier-2 / Mid-market / Growing Startups)</option>
                <option value="Excellent">Excellent (Tier-1 / MAANG / Unicorns)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Difficulty Level</label>
              <select
                name="difficulty"
                className="form-select"
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value="Easy to Crack">Easy to Crack (Standard DSA / Campus Pool)</option>
                <option value="Hard to Crack">Hard to Crack (Advanced Algorithms / Multiple Bars)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Current Status</label>
            <select
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
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

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              name="priority"
              className="form-select"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Application Deadline</label>
            <input
              type="date"
              name="deadline"
              className="form-input"
              value={formData.deadline}
              onChange={handleChange}
            />
            <span className="form-hint">Used to generate upcoming & overdue deadline reminders</span>
          </div>

          <div className="form-group">
            <label className="form-label">Date Applied</label>
            <input
              type="date"
              name="appliedDate"
              className="form-input"
              value={formData.appliedDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Application Source</label>
            <select
              name="source"
              className="form-select"
              value={formData.source}
              onChange={handleChange}
            >
              <option value="On-Campus">On-Campus Placement Cell</option>
              <option value="Referral">Employee Referral</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Career Portal">Company Career Portal</option>
              <option value="Unstop">Unstop / Hackathon</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              name="location"
              className="form-input"
              placeholder="e.g. Bangalore, Hyderabad, Remote"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Stipend / CTC Note (Optional)</label>
            <input
              type="text"
              name="salary"
              className="form-input"
              placeholder="e.g. ₹1,00,000/mo or ₹22 LPA"
              value={formData.salary}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Job Post / Portal URL</label>
            <input
              type="url"
              name="jobUrl"
              className="form-input"
              placeholder="https://company.com/jobs/..."
              value={formData.jobUrl}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Job Description / Requirements</label>
          <textarea
            name="description"
            className="form-textarea"
            rows={2}
            placeholder="Key skills, tech stack, minimum CGPA, or role requirements..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Personal Preparation & Progress Notes</label>
          <textarea
            name="additionalNotes"
            className="form-textarea"
            rows={2}
            placeholder="Referral contact details, resume version sent, topics to revise..."
            value={formData.additionalNotes}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
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
            {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
