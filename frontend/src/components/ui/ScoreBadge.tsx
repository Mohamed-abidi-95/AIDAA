// ============================================================================
// SCORE BADGE — Badge de score coloré (vert/ambre/rouge)
// ============================================================================

import React from 'react';

export interface ScoreBadgeProps {
  score: number;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  const cls =
    score >= 70
      ? 'bg-emerald-100 text-emerald-700'
      : score >= 40
        ? 'bg-amber-100 text-amber-700'
        : 'bg-red-100 text-red-700';
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cls}`}>
      {score}%
    </span>
  );
};

export default ScoreBadge;

