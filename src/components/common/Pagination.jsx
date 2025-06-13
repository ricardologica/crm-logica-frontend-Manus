import React from 'react';
import { Pagination as BSPagination } from 'react-bootstrap';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  
  // Determinar quais números de página mostrar
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);
  
  // Ajustar para mostrar sempre 5 páginas se possível
  if (endPage - startPage < 4) {
    if (startPage === 1) {
      endPage = Math.min(5, totalPages);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - 4);
    }
  }
  
  // Adicionar números de página
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <BSPagination>
      <BSPagination.First 
        onClick={() => onPageChange(1)} 
        disabled={currentPage === 1}
      />
      <BSPagination.Prev 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
      />
      
      {startPage > 1 && (
        <>
          <BSPagination.Item onClick={() => onPageChange(1)}>1</BSPagination.Item>
          {startPage > 2 && <BSPagination.Ellipsis disabled />}
        </>
      )}
      
      {pageNumbers.map(number => (
        <BSPagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => onPageChange(number)}
        >
          {number}
        </BSPagination.Item>
      ))}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <BSPagination.Ellipsis disabled />}
          <BSPagination.Item onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </BSPagination.Item>
        </>
      )}
      
      <BSPagination.Next
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
      <BSPagination.Last
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      />
    </BSPagination>
  );
};

export default Pagination;
