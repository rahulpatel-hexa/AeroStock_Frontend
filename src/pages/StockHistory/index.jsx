import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useStockMovements } from '../../hooks/useInventory'
import DataTable from '../../components/common/DataTable'
import Pagination from '../../components/common/Pagination'
import { getStockHistoryColumns } from './stockHistoryColumns'

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

const movementLabel = (type) => MOVEMENT_LABELS[type] || type || '—'

const mapRow = (item) => ({
  id: item.id,
  date: item.date,
  itemName: item.inventoryName || '—',
  movementType: item.movementType,
  movement: movementLabel(item.movementType),
  quantity: Number(item.quantity ?? 0),
  // notes: item.notes || '—',
  user: item.userName || '—',
})

export default function StockHistory() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const listParams = useMemo(() => {
    const params = { page, limit: pageSize }
    const q = search.trim()
    if (q) params.search = q
    return params
  }, [page, pageSize, search])

  const { data, isLoading, isError, error } = useStockMovements(listParams)

  const rows = useMemo(() => (data?.items ?? []).map(mapRow), [data?.items])

  const pagination = data?.pagination ?? {}
  const totalRecords = Number(pagination.total ?? rows.length)
  const totalPages = Math.max(
    1,
    Number(pagination.totalPages ?? pagination.lastPage ?? Math.ceil(totalRecords / pageSize) ?? 1)
  )
  const currentPage = Math.min(page, totalPages)
  const showingFrom = rows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const showingTo = rows.length === 0 ? 0 : showingFrom + rows.length - 1

  const handleSearch = (value) => {
    setSearch(value)
    setPage(1)
  }

  const handlePageSizeChange = (size) => {
    setPageSize(size)
    setPage(1)
  }

  const pageNumbers = Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
    if (totalPages <= 3) return i + 1
    if (currentPage <= 2) return i + 1
    if (currentPage >= totalPages - 1) return totalPages - 2 + i
    return currentPage - 1 + i
  })

  const columns = useMemo(
    () => getStockHistoryColumns({ currentPage, pageSize }),
    [currentPage, pageSize]
  )

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stock History</h1>
          <p className="mt-1 text-sm text-slate-500">A clear record of every stock movement</p>
        </div>
        {/* <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
        >
          Admin
          <ChevronLeft className="size-4 rotate-[-90deg] text-slate-400" />
        </button> */}
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
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.message}
          emptyText="No stock movements found"
          minWidth={720}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          showingFrom={showingFrom}
          showingTo={showingTo}
          totalRecords={totalRecords}
          pageNumbers={pageNumbers}
          isLoading={isLoading}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  )
}
