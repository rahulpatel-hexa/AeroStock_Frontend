import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useInventoryItems, useStockMovements } from '../../hooks/useInventory'

const deriveStatus = (item) => {
  const onHand = Number(item.quantityOnHand ?? 0)
  const reserved = Number(item.quantityReserved ?? 0)
  if (onHand <= 0 && reserved <= 0) return 'Sold'
  if (reserved > 0) return 'Reserved'
  return 'Available'
}

const ACTIVITY_META = {
  RECEIVED: { label: 'Stock received', tone: 'positive' },
  OPENING: { label: 'Opening stock', tone: 'positive' },
  RETURN: { label: 'Stock returned', tone: 'positive' },
  ADJUSTMENT: { label: 'Stock adjusted', tone: 'neutral' },
  SOLD: { label: 'Stock sold / used', tone: 'negative' },
  INTERNAL_USE: { label: 'Stock sold / used', tone: 'negative' },
  RESERVED: { label: 'Reserved', tone: 'reserved' },
  RELEASED: { label: 'Reservation released', tone: 'positive' },
}

const formatActivityValue = (movementType, qty) => {
  const abs = Math.abs(Number(qty) || 0)
  if (movementType === 'RESERVED') return `${abs} item${abs === 1 ? '' : 's'}`
  if (qty > 0) return `+${qty}`
  return String(qty)
}

const activityValueClass = (tone) => {
  if (tone === 'positive') return 'text-emerald-600'
  if (tone === 'negative') return 'text-rose-600'
  if (tone === 'reserved') return 'text-amber-600'
  return 'text-slate-700'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: inventoryData, isLoading: inventoryLoading } = useInventoryItems({ page: 1, limit: 100 })
  const { data: movementsData, isLoading: movementsLoading } = useStockMovements({ page: 1, limit: 5 })

  const stats = useMemo(() => {
    const items = inventoryData?.items ?? []
    const totalFromApi = Number(inventoryData?.pagination?.total)
    const totalItems = Number.isFinite(totalFromApi) && totalFromApi > 0 ? totalFromApi : items.length

    let availableQty = 0
    let reservedQty = 0
    let availableCount = 0
    let reservedCount = 0
    let soldCount = 0

    items.forEach((item) => {
      const onHand = Number(item.quantityOnHand ?? 0)
      const reserved = Number(item.quantityReserved ?? 0)
      const available = Math.max(0, onHand - reserved)
      availableQty += available
      reservedQty += reserved

      const status = deriveStatus(item)
      if (status === 'Available') availableCount += 1
      else if (status === 'Reserved') reservedCount += 1
      else soldCount += 1
    })

    const statusTotal = availableCount + reservedCount + soldCount
    const pct = (n) => (statusTotal > 0 ? Math.round((n / statusTotal) * 100) : 0)

    return {
      totalItems,
      availableQty,
      reservedQty,
      soldCount,
      availablePct: pct(availableCount),
      reservedPct: pct(reservedCount),
      soldPct: pct(soldCount),
    }
  }, [inventoryData])

  const recentActivity = useMemo(() => {
    return (movementsData?.items ?? []).slice(0, 4).map((row) => {
      const meta = ACTIVITY_META[row.movementType] || {
        label: row.movementType || 'Stock update',
        tone: 'neutral',
      }
      const code = row.inventoryCode || row.inventoryId || '—'
      return {
        id: row.id,
        title: row.inventoryName || 'Inventory item',
        subtitle: `${meta.label} · ${code}`,
        value: formatActivityValue(row.movementType, row.quantity),
        tone: meta.tone,
      }
    })
  }, [movementsData])

  const metricCards = [
    {
      label: 'Total Items',
      value: stats.totalItems,
      dotClass: 'bg-[#6c5ce7]',
    },
    {
      label: 'Available',
      value: stats.availableQty,
      dotClass: 'bg-emerald-500',
    },
    {
      label: 'Reserved',
      value: stats.reservedQty,
      dotClass: 'bg-amber-400',
    },
    {
      label: 'Sold',
      value: stats.soldCount,
      dotClass: 'bg-rose-500',
    },
  ]

  const overviewBars = [
    { label: 'Available', pct: stats.availablePct, barClass: 'bg-emerald-500' },
    { label: 'Reserved', pct: stats.reservedPct, barClass: 'bg-amber-400' },
    { label: 'Sold', pct: stats.soldPct, barClass: 'bg-rose-500' },
  ]

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your inventory and recent activity.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
        >
          Admin
          <ChevronLeft className="size-4 rotate-[-90deg] text-slate-400" />
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <span className={`mt-1 size-2.5 rounded-full ${card.dotClass}`} />
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {inventoryLoading ? '—' : card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-bold text-slate-800">Recent Activity</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {movementsLoading && (
              <p className="px-5 py-8 text-center text-sm text-slate-500">Loading activity…</p>
            )}
            {!movementsLoading && recentActivity.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-slate-500">No recent stock activity</p>
            )}
            {!movementsLoading &&
              recentActivity.map((row) => (
                <div key={row.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{row.title}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{row.subtitle}</p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-semibold ${activityValueClass(row.tone)}`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-bold text-slate-800">Quick Actions</h2>
          </div>
          <div className="flex flex-col gap-3 p-5">
            <button
              type="button"
              onClick={() => navigate('/inventory/new')}
              className="w-full rounded-xl bg-[#6c5ce7] px-4 py-3 text-sm font-semibold text-white hover:bg-[#5b4bd6]"
            >
              + Add Inventory Item
            </button>
            <button
              type="button"
              onClick={() => navigate('/inventory/log-stock')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Log Stock
            </button>
            <button
              type="button"
              onClick={() => navigate('/stock-history')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              View Stock History
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-800">Inventory Overview</h2>
          <p className="mt-0.5 text-sm text-slate-500">Inventory status</p>
        </div>
        <div className="space-y-5 px-5 py-5">
          {overviewBars.map((bar) => (
            <div key={bar.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{bar.label}</span>
                <span className="font-semibold text-slate-800">
                  {inventoryLoading ? '—' : `${bar.pct}%`}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${bar.barClass}`}
                  style={{ width: inventoryLoading ? '0%' : `${bar.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
