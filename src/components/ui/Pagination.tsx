import React from 'react';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
  showEdges?: boolean;
}

/**
 * Returns an array of page numbers and ellipsis ('...') for professional pagination.
 * e.g. [1, '...', 4, 5, 6, '...', 20]
 */
function getPaginationRange(current: number, total: number, siblingCount = 1): (number | string)[] {
  // If total pages is small, show all pages directly
  const totalNumbers = siblingCount * 2 + 5; // e.g. 1 + siblings + current + siblings + total + 2 dots = 7
  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(current - siblingCount, 1);
  const rightSiblingIndex = Math.min(current + siblingCount, total);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < total - 1;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, '...', total];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => total - rightItemCount + 1 + i
    );
    return [1, '...', ...rightRange];
  }

  // shouldShowLeftDots && shouldShowRightDots
  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [1, '...', ...middleRange, '...', total];
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = getPaginationRange(page, totalPages, 1);

  return (
    <nav className={`desk-pagination-bar ${className}`} aria-label="Pagination">
      <button
        type="button"
        className="desk-page-btn desk-page-nav"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <span aria-hidden="true">&larr;</span> Previous
      </button>

      <div className="desk-page-numbers">
        {items.map((item, idx) => {
          if (item === '...') {
            return (
              <span key={`dots-${idx}`} className="desk-page-ellipsis" aria-hidden="true">
                &hellip;
              </span>
            );
          }

          const pageNum = item as number;
          const isActive = pageNum === page;

          return (
            <button
              key={pageNum}
              type="button"
              className={`desk-page-btn desk-page-num ${isActive ? 'is-active' : ''}`}
              disabled={disabled}
              onClick={() => onPageChange(pageNum)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Page ${pageNum}`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="desk-page-btn desk-page-nav"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        Next <span aria-hidden="true">&rarr;</span>
      </button>
    </nav>
  );
}
