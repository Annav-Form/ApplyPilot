import React from 'react';
import { FolderSearch } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FolderSearch,
  title = 'No items found',
  description = 'There are no records matching your criteria yet.',
  actionText,
  onAction,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={26} />
      </div>
      <h4 className="empty-title">{title}</h4>
      <p className="empty-description">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onAction}
          style={{ marginTop: 8 }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
