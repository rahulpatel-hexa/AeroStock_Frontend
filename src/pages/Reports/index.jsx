import { useMemo } from 'react'
import { ArrowUpRight, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useInventoryItems, useStockMovements } from '../../hooks/useInventory'

const deriveStatus = (item) => {
  const onHand = Number(item.quantityOnHand ?? 0)
  const reserved = Number(item.quantityReserved ?? 0)
  if (onHand <= 0 && reserved <= 0) return 'Sold'
  if (reserved > 0) return 'Reserved'
  return 'Available'
}

const availableQty = (item) => {
  const onHand = Number(item.quantityOnHand ?? 0)
  const reserved = Number(item.quantityReserved ?? 0)
  return Math.max(0, onHand - reserved)
}

const itemValue = (item) => {
  const purchase = Number(item.purchasePrice)
  const asking = Number(item.askingPrice)
  if (Number.isFinite(purchase) && purchase > 0) return purchase
  if (Number.isFinite(asking) && asking > 0) return asking
  return 0
}

const escapeCsv = (value) => {
  const str = value == null ? '' : String(value)
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

const downloadCsv = (filename, headers, rows) => {
  const lines = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

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

export default function Reports() {
  const { data: inventoryData, isLoading: inventoryLoading } = useInventoryItems({
    page: 1,
    limit: 500,
  })
  const { data: movementsData, isLoading: movementsLoading } = useStockMovements({
    page: 1,
    limit: 500,
  })

  const items = inventoryData?.items ?? []
  const movements = movementsData?.items ?? []

  const stats = useMemo(() => {
    let availableItems = 0
    let reservedItems = 0
    let soldRecords = 0
    let valuation = 0

    items.forEach((item) => {
      const status = deriveStatus(item)
      const qty = availableQty(item)
      const reserved = Number(item.quantityReserved ?? 0)

      if (status === 'Available') availableItems += qty || 1
      if (status === 'Reserved' || reserved > 0) reservedItems += reserved || 1
      if (status === 'Sold') soldRecords += 1

      const unitValue = itemValue(item)
      const qtyForValue = Math.max(Number(item.quantityOnHand ?? 0), 0)
      valuation += unitValue * (qtyForValue || (status === 'Sold' ? 1 : 0))
    })

    return { availableItems, reservedItems, soldRecords, valuation }
  }, [items])

  const summaryCards = [
    {
      title: 'Available Inventory',
      value: `${stats.availableItems.toLocaleString()} items`,
      description: 'Current stock available for sale',
      iconClass: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Reserved Inventory',
      value: `${stats.reservedItems.toLocaleString()} items`,
      description: 'Stock reserved for customers',
      iconClass: 'bg-amber-100 text-amber-600',
    },
    {
      title: 'Sold Inventory',
      value: `${stats.soldRecords.toLocaleString()} records`,
      description: 'Previously sold items retained',
      iconClass: 'bg-rose-100 text-rose-500',
    },
    {
      title: 'Inventory Valuation',
      value: `$${Math.round(stats.valuation).toLocaleString()}`,
      description: 'Based on purchase or asking price',
      iconClass: 'bg-violet-100 text-[#6c5ce7]',
    },
  ]

  const exportAvailable = () => {
    const rows = items
      .filter((item) => deriveStatus(item) === 'Available')
      .map((item) => [
        item.inventoryCode ?? item.id,
        item.description ?? '',
        item.partNumber ?? '',
        availableQty(item),
        item.conditionValue ?? '',
        item.currency ?? 'USD',
        item.purchasePrice ?? '',
        item.askingPrice ?? '',
      ])

    downloadCsv(
      'available-stock.csv',
      [
        'Inventory Code',
        'Description',
        'Part Number',
        'Available Qty',
        'Condition',
        'Currency',
        'Purchase Price',
        'Asking Price',
      ],
      rows
    )
    toast.success('Available stock exported')
  }

  const exportSold = () => {
    const rows = items
      .filter((item) => deriveStatus(item) === 'Sold')
      .map((item) => [
        item.inventoryCode ?? item.id,
        item.description ?? '',
        item.partNumber ?? '',
        item.quantityOnHand ?? 0,
        item.currency ?? 'USD',
        item.purchasePrice ?? '',
        item.askingPrice ?? '',
      ])

    downloadCsv(
      'sold-items.csv',
      [
        'Inventory Code',
        'Description',
        'Part Number',
        'Quantity',
        'Currency',
        'Purchase Price',
        'Asking Price',
      ],
      rows
    )
    toast.success('Sold items exported')
  }

  const exportValuation = () => {
    const rows = items.map((item) => {
      const unit = itemValue(item)
      const qty = Math.max(Number(item.quantityOnHand ?? 0), 0)
      return [
        item.inventoryCode ?? item.id,
        item.description ?? '',
        item.partNumber ?? '',
        qty,
        item.currency ?? 'USD',
        item.purchasePrice ?? '',
        item.askingPrice ?? '',
        unit,
        unit * qty,
        deriveStatus(item),
      ]
    })

    downloadCsv(
      'inventory-valuation.csv',
      [
        'Inventory Code',
        'Description',
        'Part Number',
        'Quantity',
        'Currency',
        'Purchase Price',
        'Asking Price',
        'Unit Value',
        'Line Value',
        'Status',
      ],
      rows
    )
    toast.success('Inventory valuation exported')
  }

  const exportMovements = () => {
    const rows = movements.map((row) => [
      row.date ?? '',
      row.inventoryCode ?? row.inventoryId ?? '',
      row.inventoryName ?? '',
      MOVEMENT_LABELS[row.movementType] || row.movementType || '',
      row.quantity ?? 0,
      row.userName ?? '',
    ])

    downloadCsv(
      'stock-movements.csv',
      ['Date', 'Inventory Code', 'Item', 'Movement', 'Quantity', 'User'],
      rows
    )
    toast.success('Stock movements exported')
  }

  const exportRows = [
    {
      title: 'Available Stock',
      description: 'All currently available items',
      onExport: exportAvailable,
      disabled: inventoryLoading,
    },
    {
      title: 'Sold Items',
      description: 'Historical sold inventory',
      onExport: exportSold,
      disabled: inventoryLoading,
    },
    {
      title: 'Inventory Valuation',
      description: 'Purchase and asking price totals',
      onExport: exportValuation,
      disabled: inventoryLoading,
    },
    {
      title: 'Stock Movements',
      description: 'Received, sold, used and adjusted stock',
      onExport: exportMovements,
      disabled: movementsLoading,
    },
  ]

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">Simple reports for stock and valuation</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
        >
          Admin
          <ChevronLeft className="size-4 rotate-[-90deg] text-slate-400" />
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {inventoryLoading ? '—' : card.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{card.description}</p>
              </div>
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}
              >
                <ArrowUpRight size={16} strokeWidth={2.25} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-800">Export Reports</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose a report and export your data for accounting or offline review.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {exportRows.map((row) => (
            <div
              key={row.title}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 sm:flex sm:flex-1 sm:items-center sm:gap-10">
                <p className="w-44 shrink-0 text-sm font-semibold text-slate-800">{row.title}</p>
                <p className="text-sm text-slate-500">{row.description}</p>
              </div>
              <button
                type="button"
                disabled={row.disabled}
                onClick={row.onExport}
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export CSV
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
