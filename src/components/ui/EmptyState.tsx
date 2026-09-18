import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-none border border-dashed border-[#deded9] bg-[#f6f6f3]',
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-[#f6f6f3] flex items-center justify-center mb-4 text-[#858580]">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-[#252525]">{title}</h3>
      <p className="text-xs text-[#858580] max-w-sm mt-1 mb-5">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
