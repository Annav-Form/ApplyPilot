import React from 'react';
import {
  Bookmark,
  Send,
  Code2,
  Users2,
  Trophy,
  XCircle,
  CornerDownLeft,
} from 'lucide-react';

export default function StatusBadge({ status }) {
  const configs = {
    Wishlist: {
      className: 'badge-wishlist',
      icon: Bookmark,
      label: 'Wishlist',
    },
    Applied: {
      className: 'badge-applied',
      icon: Send,
      label: 'Applied',
    },
    'Online Assessment': {
      className: 'badge-oa',
      icon: Code2,
      label: 'Online Assessment',
    },
    Interview: {
      className: 'badge-interview',
      icon: Users2,
      label: 'Interview',
    },
    Offer: {
      className: 'badge-offer',
      icon: Trophy,
      label: 'Offer Received',
    },
    Rejected: {
      className: 'badge-rejected',
      icon: XCircle,
      label: 'Rejected',
    },
    Withdrawn: {
      className: 'badge-withdrawn',
      icon: CornerDownLeft,
      label: 'Withdrawn',
    },
  };

  const config = configs[status] || {
    className: 'badge-wishlist',
    icon: Bookmark,
    label: status || 'Unknown',
  };

  const Icon = config.icon;

  return (
    <span className={`badge ${config.className}`}>
      <Icon size={12} style={{ flexShrink: 0 }} />
      <span>{config.label}</span>
    </span>
  );
}
