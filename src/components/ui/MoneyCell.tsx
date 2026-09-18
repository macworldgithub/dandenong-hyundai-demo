import React from 'react';
import { formatAUD } from '../../lib/money';
import { cn } from '../../lib/cn';

interface MoneyCellProps extends React.HTMLAttributes<HTMLSpanElement> {
  cents: number | undefined | null;
  colored?: boolean; // if true, positives green, negatives red
  bold?: boolean;
}

export const MoneyCell: React.FC<MoneyCellProps> = ({
  cents = 0,
  colored = false,
  bold = false,
  className,
  ...props
}) => {
  const value = cents || 0;
  const isNegative = value < 0;
  const isZero = value === 0;

  let colorStyle = 'text-[#252525]';

  if (isNegative) {
    colorStyle = 'text-[#b92b24]';
  } else if (colored && !isZero) {
    colorStyle = 'text-[#217454]';
  }

  return (
    <span
      className={cn(
        'font-mono tabular-nums text-right block',
        bold && 'font-semibold',
        colorStyle,
        className
      )}
      {...props}
    >
      {formatAUD(value)}
    </span>
  );
};
