import React from 'react';
import { Badge } from './Badge';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const normalized = (status || '').toLowerCase().replace(/_/g, ' ');

  let variant: 'slate' | 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan' = 'slate';

  switch (status?.toLowerCase()) {
    // Green / Approved / Completed / Matched
    case 'matched':
    case 'approved':
    case 'paid':
    case 'delivered':
    case 'completed':
    case 'healthy':
    case 'received':
    case 'open': // for periods
      variant = 'green';
      break;

    // Blue / Suggested / Allocated / In-progress
    case 'suggested':
    case 'coded':
    case 'in_stock':
    case 'in_progress':
    case 'draft':
      variant = 'blue';
      break;

    // Amber / Warning / Parked / Captured / In transit
    case 'parked':
    case 'captured':
    case 'in_transit':
    case 'warning':
    case 'split':
    case 'partially_received':
      variant = 'amber';
      break;

    // Red / Critical / Exception / Cancelled
    case 'exception':
    case 'unmatched':
    case 'critical':
    case 'cancelled':
      variant = 'red';
      break;

    // Closed / Neutral
    case 'closed':
    case 'allocated':
      variant = 'slate';
      break;

    default:
      variant = 'slate';
  }

  const dotColors: Record<string, string> = {
    green: 'bg-emerald-400',
    blue: 'bg-sky-400',
    amber: 'bg-amber-400',
    red: 'bg-rose-400',
    slate: 'bg-slate-400',
    cyan: 'bg-cyan-400',
    purple: 'bg-purple-400',
  };

  return (
    <Badge variant={variant} className={className}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant] || 'bg-slate-400')} />
      <span className="capitalize">{normalized}</span>
    </Badge>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
