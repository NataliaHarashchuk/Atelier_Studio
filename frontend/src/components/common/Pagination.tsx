import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const showPages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  let endPage = Math.min(totalPages, startPage + showPages - 1);

  if (endPage - startPage < showPages - 1) {
    startPage = Math.max(1, endPage - showPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="ghost"
        onClick={() => {
          onPageChange(currentPage - 1);
        }}
        disabled={currentPage === 1}
        className="p-2"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      {startPage > 1 && (
        <>
          <Button
            variant="ghost"
            onClick={() => {
              onPageChange(1);
            }}
            className="px-3 py-2"
          >
            1
          </Button>
          {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "primary" : "ghost"}
          onClick={() => {
            onPageChange(page);
          }}
          className="px-3 py-2"
        >
          {page}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-2 text-gray-500">...</span>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              onPageChange(totalPages);
            }}
            className="px-3 py-2"
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="ghost"
        onClick={() => {
          onPageChange(currentPage + 1);
        }}
        disabled={currentPage === totalPages}
        className="p-2"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
};
