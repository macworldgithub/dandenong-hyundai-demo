import React from 'react';
import { cn } from '../../lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'metric';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[#f6f6f3] border border-[#deded9] shadow-xl rounded-none backdrop-blur-sm',
    glass: 'bg-[#f6f6f3] border border-[#deded9] shadow-2xl rounded-none backdrop-blur-md',
    metric: 'bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-[#deded9] shadow-lg rounded-none hover:border-[#deded9] transition-all duration-200',
  };

  return (
    <div className={cn(variantStyles[variant], 'p-5', className)} {...props}>
      {children}
    </div>
  );
};
