import React, { memo } from 'react';
import { Pagination } from 'react-bootstrap';

// Pagination Component
const PaginationComponent = memo(({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  if (totalPages <= 1) return null;

  const handlePageChange = (pageNumber) => {
    onPageChange(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderItems = () => {
    let items = [];
    const maxVisiblePages = 5;

    // Always show first page
    if (totalPages > 1) {
      items.push(
        <Pagination.Item
          key={1}
          active={1 === currentPage}
          onClick={() => handlePageChange(1)}
        >
          1
        </Pagination.Item>
      );
    }

    let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);

    if (endPage === totalPages - 1 && startPage > 2) {
      startPage = Math.max(2, endPage - (maxVisiblePages - 3) + 1);
    }

    if (startPage > 2) {
      items.push(<Pagination.Ellipsis key="start-ellipsis" />);
    }

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages - 1) {
      items.push(<Pagination.Ellipsis key="end-ellipsis" />);
    }

    if (totalPages > 1) {
      items.push(
        <Pagination.Item
          key={totalPages}
          active={totalPages === currentPage}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    return items;
  };

  return (
    <div className="d-flex justify-content-center mt-4">
      <Pagination size="md">
        <Pagination.Prev
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        />
        {renderItems()}
        <Pagination.Next
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        />
      </Pagination>
    </div>
  );
});

PaginationComponent.displayName = "PaginationComponent";

export default PaginationComponent;