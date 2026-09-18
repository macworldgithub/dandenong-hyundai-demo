import React from 'react';
import { cn } from '../../lib/cn';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}
export function Button({children,className,variant='primary',size='md',isLoading=false,disabled,...props}:ButtonProps) {
  const variants={primary:'bg-[#2936ff] border-[#2936ff] text-white',secondary:'bg-[#efefec] border-[#ccc] text-[#222]',outline:'bg-transparent border-[#555] text-[#333]',ghost:'border-transparent bg-transparent text-[#777]',danger:'bg-[#b92b24] border-[#b92b24] text-white',success:'bg-[#217454] border-[#217454] text-white'};
  const sizes={xs:'px-2 py-1 text-[9px]',sm:'px-3 py-2 text-[9px]',md:'px-4 py-2 text-[10px]',lg:'px-5 py-3 text-xs'};
  return <button className={cn('inline-flex items-center justify-center gap-2 border rounded-none uppercase tracking-wider font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-95',variants[variant],sizes[size],className)} disabled={disabled||isLoading} {...props}>{isLoading&&<span className="animate-spin" aria-hidden="true">◌</span>}{children}</button>;
}
