import React from 'react';
import { cn } from '../../lib/cn';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

export const Table: React.FC<TableProps> = ({ className, children, ...props }) => {
  return (
    <div className="w-full overflow-x-auto rounded-none border border-[#deded9]">
      <table className={cn('w-full text-left text-sm text-[#252525] border-collapse', className)} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <thead className={cn('bg-[#f6f6f3] text-xs uppercase tracking-wider text-[#858580] border-b border-[#deded9] select-none font-semibold', className)} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <tbody className={cn('divide-y divide-slate-800/60 bg-[#f6f6f3]', className)} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <tr className={cn('hover:bg-[#f6f6f3] transition-colors duration-150', className)} {...props}>
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <th className={cn('px-4 py-3 font-semibold text-[#252525]', className)} {...props}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <td className={cn('px-4 py-3 whitespace-nowrap text-[#252525]', className)} {...props}>
      {children}
    </td>
  );
};
