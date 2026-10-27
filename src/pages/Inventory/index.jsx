import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight, Eye, Pencil, PackagePlus, MoreHorizontal } from 'lucide-react'
import { useInventoryItems } from '../../hooks/useInventory'

const PAGE_SIZE = 10

const STATUS_FILTERS = [
  { key: 'All', label: 'All', activeClass: 'bg-[#6c5ce7] text-white', idleClass: 'bg-slate-100 text-slate-600' },
  { key: 'Available', label: 'Available', activeClass: 'bg-emerald-100 text-emerald-700', idleClass: 'bg-emerald-50 text-emerald-600' },
  { key: 'Reserved', label: 'Reserved', activeClass: 'bg-amber-100 text-amber-700', idleClass: 'bg-amber-50 text-amber-600' },
  { key: 'Sold', label: 'Sold', activeClass: 'bg-rose-100 text-rose-700', idleClass: 'bg-rose-50 text-rose-600' },
]

const STATUS_BADGE = {
  Available: 'bg-emerald-50 text-emerald-700',
  Reserved: 'bg-amber-50 text-amber-700',
  Sold: 'bg-rose-50 text-rose-700',
}

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
})

export default function Inventory() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)

  const listParams = useMemo(() => {
    const params = { page, limit: PAGE_SIZE }
    const q = search.trim()
    if (q) params.search = q
    return params
  }, [page, search])

  const { data, isLoading, isError, error } = useInventoryItems(listParams)

  const items = useMemo(() => (data?.items ?? []).map(mapItem), [data?.items])

  const filtered = useMemo(() => {
    if (statusFilter === 'All') return items
    return items.filter((item) => item.status === statusFilter)
  }, [items, statusFilter])

  const pagination = data?.pagination ?? {}
  const totalRecords = Number(pagination.total ?? filtered.length)
  const totalPages = Math.max(
    1,
    Number(pagination.totalPages ?? pagination.lastPage ?? Math.ceil(totalRecords / PAGE_SIZE) ?? 1)
  )
  const currentPage = Math.min(page, totalPages)
  const showingFrom = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const showingTo = filtered.length === 0 ? 0 : showingFrom + filtered.length - 1

  const handleSearch = (value) => {
    setSearch(value)
    setPage(1)
  }

  const handleStatus = (key) => {
    setStatusFilter(key)
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
          <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">Search and manage your aircraft parts.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
        >
          Admin
          <ChevronLeft className="size-4 rotate-[-90deg] text-slate-400" />
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search part number, serial number or description..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20"
          />
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => navigate('/inventory/new')}
            className="rounded-xl bg-[#6c5ce7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5b4bd6]"
          >
            + Add Item
          </button>
          {/* <button
            type="button"
            onClick={() => navigate('/inventory/log-stock')}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Log Stock
          </button> */}
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="w-14 pl-6 pr-2 py-3 font-semibold">SN</th>
                <th className="pl-2 pr-4 py-3 font-semibold">Inventory ID</th>
                <th className="px-6 py-3 font-semibold">Description</th>
                <th className="px-6 py-3 font-semibold">Part Number</th>
                <th className="px-6 py-3 font-semibold">Quantity</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    Loading inventory…
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-red-500">
                    {error?.message || 'Failed to load inventory'}
                  </td>
                </tr>
              )}
              {!isLoading && !isError && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    No inventory items found
                  </td>
                </tr>
              )}
              {!isLoading &&
                !isError &&
                filtered.map((item, index) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/inventory/${item.id}`)}
                    className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/80"
                  >
                    <td className="w-14 pl-6 pr-2 py-3.5 text-slate-600">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="pl-2 pr-4 py-3.5 font-semibold text-slate-800">
                      {item.inventoryCode || item.id}
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">{item.description}</td>
                    <td className="px-6 py-3.5 text-slate-600">{item.partNumber}</td>
                    <td className="px-6 py-3.5 text-slate-700">{item.quantity}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td
                      className="px-6 py-3.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-5">
                        <button
                          type="button"
                          onClick={() => navigate(`/inventory/${item.id}/edit`)}
                          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#6c5ce7]"
                        >
                          <Pencil size={15} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/inventory/${item.id}`)}
                          className="flex items-center gap-1.5 text-sm font-semibold text-[#6c5ce7] hover:text-[#5a4bd1]"
                        >
                          <Eye size={15} /> View
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/inventory/log-stock?itemId=${item.id}`)}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <PackagePlus size={14} /> Log Stock
                        </button>
                      </div>
                    </td>
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
                className={`min-w-8 rounded-lg px-2.5 py-1 text-sm font-medium ${currentPage === n
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
