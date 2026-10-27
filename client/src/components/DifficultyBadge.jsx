import React from 'react';
import { ShieldCheck, Flame } from 'lucide-react';

export default function DifficultyBadge({ difficulty }) {
  const isHard = difficulty === 'Hard to Crack';

  return (
    <span
      className={`badge ${isHard ? 'badge-diff-hard' : 'badge-diff-easy'}`}
      title={`Difficulty: ${difficulty}`}
    >
      {isHard ? (
        <Flame size={12} color="#fb7185" style={{ flexShrink: 0 }} />
      ) : (
        <ShieldCheck size={12} color="#2dd4bf" style={{ flexShrink: 0 }} />
      )}
      <span>{difficulty || 'Easy to Crack'}</span>
    </span>
  );
}
