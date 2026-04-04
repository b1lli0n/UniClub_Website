import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  loading = false 
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 'dots', totalPages];
    if (currentPage >= totalPages - 2) {
      return [1, 'dots', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, 'dots', currentPage - 1, currentPage, currentPage + 1, 'dots-2', totalPages];
  };

  return (
    <nav className="loc-pagination" aria-label="Pagination">
      <button
        type="button"
        className="loc-page-btn"
        disabled={currentPage === 1 || loading}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        aria-label="Trang trước"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="loc-page-numbers">
        {getVisiblePages().map((item, index) =>
          typeof item === 'number' ? (
            <button
              key={`${item}-${index}`}
              type="button"
              className={`loc-page-btn ${currentPage === item ? 'is-active' : ''}`}
              disabled={loading}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ) : (
            <span key={`dots-${index}`} className="loc-page-dots" aria-hidden>
              ...
            </span>
          )
        )}
      </div>

      <button
        type="button"
        className="loc-page-btn"
        disabled={currentPage === totalPages || loading}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        aria-label="Trang sau"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
};

export default Pagination;
