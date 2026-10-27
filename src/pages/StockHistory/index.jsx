import { useMemo, useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStockMovements } from '../../hooks/useInventory'

const PAGE_SIZE = 10

const MOVEMENT_LABELS = {
  RECEIVED: 'Received',
  SOLD: 'Sold',
  INTERNAL_USE: 'Internal Use',
  ADJUSTMENT: 'Stock Adjustment',
  RESERVED: 'Reserved',
  OPENING: 'Opening',
  RETURN: 'Return',
  RELEASED: 'Released',
}

const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const movementLabel = (type) => MOVEMENT_LABELS[type] || type || '—'

const quantityClass = (qty, movement) => {
  if (movement === 'Reserved') return 'text-slate-800'
  if (qty > 0) return 'font-semibold text-emerald-600'
  if (qty < 0) return 'font-semibold text-rose-600'
  return 'text-slate-800'
}

const formatQuantity = (qty, movement) => {
  if (movement === 'Reserved') return String(Math.abs(qty))
  if (qty > 0) return `+${qty}`
  return String(qty)
}

const mapRow = (item) => ({
  id: item.id,
  date: item.date,
  itemName: item.inventoryName || '—',
  movement: movementLabel(item.movementType),
  quantity: Number(item.quantity ?? 0),
  user: item.userName || '—',
})

export default function StockHistory() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const listParams = useMemo(() => {
    const params = { page, limit: PAGE_SIZE }
    const q = search.trim()
    if (q) params.search = q
    return params
  }, [page, search])

  const { data, isLoading, isError, error } = useStockMovements(listParams)

  const rows = useMemo(() => (data?.items ?? []).map(mapRow), [data?.items])

  const pagination = data?.pagination ?? {}
  const totalRecords = Number(pagination.total ?? rows.length)
  const totalPages = Math.max(
    1,
    Number(pagination.totalPages ?? pagination.lastPage ?? Math.ceil(totalRecords / PAGE_SIZE) ?? 1)
  )
  const currentPage = Math.min(page, totalPages)
  const showingFrom = rows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const showingTo = rows.length === 0 ? 0 : showingFrom + rows.length - 1

  const handleSearch = (value) => {
    setSearch(value)
    setPage(1)
  }

  const pageNumbers = Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
    if (totalPages <= 3) return i + 1
    if (currentPage <= 2) return i + 1
    if (currentPage >= totalPages - 1) return totalPages - 2 + i
    return currentPage - 1 + i
  })

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stock History</h1>
          <p className="mt-1 text-sm text-slate-500">A clear record of every stock movement</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
        >
          Admin
          <ChevronLeft className="size-4 rotate-[-90deg] text-slate-400" />
        </button>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search item or user..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20"
          />
        </div>
        <button
          type="button"
          className="shrink-0 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Export History
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="w-14 pl-6 pr-2 py-3 font-semibold">SN</th>
                <th className="pl-2 pr-4 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Inventory Item</th>
                <th className="px-6 py-3 font-semibold">Movement</th>
                <th className="px-6 py-3 font-semibold">Quantity</th>
                <th className="px-6 py-3 font-semibold">User</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    Loading stock history…
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-red-500">
                    {error?.message || 'Failed to load stock history'}
                  </td>
                </tr>
              )}
              {!isLoading && !isError && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    No stock movements found
                  </td>
                </tr>
              )}
              {!isLoading &&
                !isError &&
                rows.map((row, index) => (
                  <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80">
                    <td className="w-14 pl-6 pr-2 py-3.5 text-slate-600">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="pl-2 pr-4 py-3.5 text-slate-600">{formatDate(row.date)}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800">{row.itemName}</td>
                    <td className="px-6 py-3.5 text-slate-700">{row.movement}</td>
                    <td className={`px-6 py-3.5 ${quantityClass(row.quantity, row.movement)}`}>
                      {formatQuantity(row.quantity, row.movement)}
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">{row.user}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing {showingFrom}–{showingTo} of {totalRecords.toLocaleString()} items
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </button>
            {pageNumbers.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
