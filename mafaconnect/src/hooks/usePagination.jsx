import { useState } from "react";

export function usePagination(config = {}) {
  const [currentPage, setCurrentPage] = useState(config.initialPage || 1);
  const [pageSize, setPageSize] = useState(config.initialPageSize || 20);

  const mode = config.mode || "pagination";

  const getRange = () => {
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;
    return { from, to };
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const previousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const resetPage = () => {
    setCurrentPage(1);
  };

  // For infinite scroll mode
  const loadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const hasMore = (totalCount) => {
    return currentPage * pageSize < totalCount;
  };

  return {
    currentPage,
    pageSize,
    mode,
    setPageSize,
    getRange,
    goToPage,
    nextPage,
    previousPage,
    resetPage,
    loadMore,
    hasMore,
  };
}
