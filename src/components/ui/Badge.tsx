import React from 'react';
import { cn } from '../../lib/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'slate' | 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'slate',
  size = 'md',
  ...props
}) => {
  const variantStyles = {
    slate: 'bg-[#f6f6f3] text-[#252525] border-[#deded9]',
    blue: 'bg-blue-50 text-[#2936ff] border-sky-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    green: 'bg-emerald-50 text-[#217454] border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-rose-50 text-[#b92b24] border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-none border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
