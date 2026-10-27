import React from 'react';

export default function PriorityBadge({ priority }) {
  let badgeClass = 'badge-priority-med';
  if (priority === 'High') {
    badgeClass = 'badge-priority-high';
  } else if (priority === 'Low') {
    badgeClass = 'badge-priority-low';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span>{priority || 'Medium'}</span>
    </span>
  );
}
