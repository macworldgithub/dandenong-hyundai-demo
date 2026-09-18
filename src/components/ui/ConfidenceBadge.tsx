import React from 'react';
import { Badge } from './Badge';

interface ConfidenceBadgeProps {
  confidence?: number;
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence, className }) => {
  if (confidence === undefined || confidence === null) return null;

  const pct = Math.round(confidence * 100);
  let variant: 'green' | 'amber' | 'red' = 'green';

  if (confidence < 0.7) {
    variant = 'red';
  } else if (confidence < 0.9) {
    variant = 'amber';
  }

  return (
    <Badge variant={variant} size="sm" className={className}>
      <span className="font-mono font-semibold">{pct}%</span>
      <span className="text-[10px] opacity-75">confidence</span>
    </Badge>
  );
};
