/**
 * Money utilities in cents (integer arithmetic).
 */

export function toCents(dollars: number | string): number {
  const num = typeof dollars === 'string' ? parseFloat(dollars) : dollars;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

export function fromCents(cents: number): number {
  return (cents || 0) / 100;
}

export function sumCents(arr: number[]): number {
  return arr.reduce((acc, val) => acc + (val || 0), 0);
}

/**
 * Formats cents into Australian Dollars string.
 * Handles negative numbers with accounting parenthesis e.g. ($1,234.56).
 */
export function formatAUD(cents: number, useParensForNegative: boolean = true): string {
  const isNegative = cents < 0;
  const absDollars = Math.abs(cents || 0) / 100;

  const formatted = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absDollars);

  if (isNegative) {
    return useParensForNegative ? `(${formatted})` : `-${formatted}`;
  }
  return formatted;
}
