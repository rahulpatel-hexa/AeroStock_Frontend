import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({
  currentPage,
  totalPages,
  showingFrom,
  showingTo,
  totalRecords = 0,
  pageNumbers = [],
  isLoading = false,
  onPageChange,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
}) {
  // Agar current pageSize options me nahi hai (jaise 5), to usko bhi list me jod do
  // taaki select blank na dikhe
  const options = pageSizeOptions.includes(pageSize)
    ? pageSizeOptions
    : [...pageSizeOptions, pageSize].sort((a, b) => a - b)

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      {/* Left: rows per page (sirf tab dikhega jab onPageSizeChange pass ho) */}
      <div className="flex items-center">
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-sm text-slate-500">
            <select
              value={pageSize}
              disabled={isLoading}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 disabled:opacity-60"
            >
              {options.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            Rows per page
          </label>
        )}
      </div>

      {/* Right: showing text + page buttons */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:justify-end">
        <p className="text-sm text-slate-500">
          Showing {showingFrom}–{showingTo} of {Number(totalRecords).toLocaleString()} items
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1 || isLoading}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>

          {pageNumbers.map((n) => (
            <button
              key={n}
              type="button"
              disabled={isLoading}
              onClick={() => onPageChange(n)}
              aria-label={`Page ${n}`}
              aria-current={currentPage === n ? 'page' : undefined}
              className={`min-w-8 rounded-lg px-2.5 py-1 text-sm font-medium ${
                currentPage === n
                  ? 'bg-[#6c5ce7] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}