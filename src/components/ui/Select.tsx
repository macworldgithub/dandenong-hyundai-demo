import React from 'react';
import { cn } from '../../lib/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, options, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-[#252525]">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2 text-sm bg-[#f6f6f3] border border-[#deded9] rounded-none text-[#252525] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-150 disabled:opacity-50 disabled:bg-[#f6f6f3]',
            error && 'border-rose-500 focus:ring-rose-500 focus:border-rose-500',
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#f6f6f3] text-[#252525]">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-xs text-[#b92b24] mt-1">{error}</p>}
        {hint && !error && <p className="text-xs text-[#858580] mt-1">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
