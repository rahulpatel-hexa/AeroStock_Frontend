import { useMemo, useState } from 'react'
import { Search, ChevronLeft } from 'lucide-react'
import { useStockMovements } from '../../hooks/useInventory'

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
  reference: item.invoiceNumber || '—',
})

export default function StockHistory() {
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, error } = useStockMovements({ page: 1, limit: 100 })

  const rows = useMemo(() => (data?.items ?? []).map(mapRow), [data?.items])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (row) =>
        String(row.itemName).toLowerCase().includes(q) ||
        String(row.reference).toLowerCase().includes(q) ||
        String(row.user).toLowerCase().includes(q) ||
        String(row.movement).toLowerCase().includes(q)
    )
  }, [rows, search])

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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search item, invoice or user..."
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
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Inventory Item</th>
                <th className="px-6 py-3 font-semibold">Movement</th>
                <th className="px-6 py-3 font-semibold">Quantity</th>
                <th className="px-6 py-3 font-semibold">User</th>
                <th className="px-6 py-3 font-semibold">Reference</th>
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
              {!isLoading && !isError && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    No stock movements found
                  </td>
                </tr>
              )}
              {!isLoading &&
                !isError &&
                filtered.map((row) => (
                  <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80">
                    <td className="px-6 py-3.5 text-slate-600">{formatDate(row.date)}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800">{row.itemName}</td>
                    <td className="px-6 py-3.5 text-slate-700">{row.movement}</td>
                    <td className={`px-6 py-3.5 ${quantityClass(row.quantity, row.movement)}`}>
                      {formatQuantity(row.quantity, row.movement)}
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">{row.user}</td>
                    <td className="px-6 py-3.5 text-slate-600">{row.reference}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
