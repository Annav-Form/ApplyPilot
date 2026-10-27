import React from 'react';
import { Building2, Sparkles } from 'lucide-react';

export default function TierBadge({ tier }) {
  const isExcellent = tier === 'Excellent';

  return (
    <span
      className={`badge ${isExcellent ? 'badge-tier-excellent' : 'badge-tier-decent'}`}
      title={`Company Tier: ${tier}`}
    >
      {isExcellent ? (
        <Sparkles size={12} color="#b45309" style={{ flexShrink: 0 }} />
      ) : (
        <Building2 size={12} color="#0284c7" style={{ flexShrink: 0 }} />
      )}
      <span>{tier || 'Decent'}</span>
    </span>
  );
}
