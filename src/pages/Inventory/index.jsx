import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Upload } from 'lucide-react'
import { useInventoryItems, useUpdateInventoryItemStatus } from '../../hooks/useInventory'
import DataTable from '../../components/common/DataTable'
import Pagination from '../../components/common/Pagination'
import { getInventoryColumns } from './inventoryColumns'

const STATUS_FILTERS = [
  { key: 'All', label: 'All', activeClass: 'bg-[#6c5ce7] text-white', idleClass: 'bg-slate-100 text-slate-600' },
  { key: 'Available', label: 'Available', activeClass: 'bg-emerald-100 text-emerald-700', idleClass: 'bg-emerald-50 text-emerald-600' },
  { key: 'Reserved', label: 'Reserved', activeClass: 'bg-amber-100 text-amber-700', idleClass: 'bg-amber-50 text-amber-600' },
  { key: 'Sold', label: 'Sold', activeClass: 'bg-rose-100 text-rose-700', idleClass: 'bg-rose-50 text-rose-600' },
]

const deriveStatus = (item) => {
  const onHand = Number(item.quantityOnHand ?? 0)
  const reserved = Number(item.quantityReserved ?? 0)
  if (onHand <= 0 && reserved <= 0) return 'Sold'
  if (reserved > 0) return 'Reserved'
  return 'Available'
}

const mapItem = (item) => ({
  id: item.id,
  inventoryCode: item.inventoryCode,
  description: item.description,
  partNumber: item.partNumber ?? '—',
  quantity: Number(item.quantityOnHand ?? 0),
  status: deriveStatus(item),
  isActive: item.isActive ?? true,
})

export default function Inventory() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const listParams = useMemo(() => {
    const params = { page, limit: pageSize }
    const q = search.trim()
    if (q) params.search = q
    return params
  }, [page, pageSize, search])

  const { data, isLoading, isError, error } = useInventoryItems(listParams)
  const { mutate: updateStatus, isPending: isStatusPending, variables: statusVariables } =
    useUpdateInventoryItemStatus()

  const items = useMemo(() => (data?.items ?? []).map(mapItem), [data?.items])

  const filtered = useMemo(() => {
    if (statusFilter === 'All') return items
    return items.filter((item) => item.status === statusFilter)
  }, [items, statusFilter])

  const pagination = data?.pagination ?? {}
  const totalRecords = Number(pagination.total ?? filtered.length)
  const totalPages = Math.max(
    1,
    Number(pagination.totalPages ?? pagination.lastPage ?? Math.ceil(totalRecords / pageSize) ?? 1)
  )
  const currentPage = Math.min(page, totalPages)
  const showingFrom = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const showingTo = filtered.length === 0 ? 0 : showingFrom + filtered.length - 1

  const handleSearch = (value) => {
    setSearch(value)
    setPage(1)
  }

  const handleStatus = (key) => {
    setStatusFilter(key)
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
    () =>
      getInventoryColumns({
        currentPage,
        pageSize,
        navigate,
        updateStatus,
        isStatusPending,
        statusVariables,
      }),
    [currentPage, pageSize, navigate, updateStatus, isStatusPending, statusVariables]
  )

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">Search and manage your aircraft parts.</p>
        </div>
        {/* <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
        >
          Admin
          <ChevronLeft className="size-4 rotate-[-90deg] text-slate-400" />
        </button> */}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search part number, serial number or item name..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20"
          />
        </div>
        <div className="flex shrink-0 gap-2">
          {/* <button
            type="button"
            onClick={() => navigate('/inventory/log-stock')}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Log Stock
          </button> */}
          <button
            type="button"
            onClick={() => navigate('/inventory/upload-csv')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Upload className="size-4" /> Upload CSV
          </button>
          <button
            type="button"
            onClick={() => navigate('/inventory/new')}
            className="rounded-xl bg-[#6c5ce7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5b4bd6]"
          >
            + Add Item
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.key
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => handleStatus(f.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${active ? f.activeClass : f.idleClass
                }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-800">Inventory Items</h2>
          <span className="text-sm text-slate-500">{totalRecords.toLocaleString()} records</span>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.message}
          emptyText="No inventory items found"
          minWidth={720}
          onRowClick={(item) => navigate(`/inventory/${item.id}`)}
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
