import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowLeft  } from 'lucide-react'
import { useInventoryItem, useItemStockMovements } from '../../hooks/useInventory'

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

const dash = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

const formatMoney = (value, currency) => {
  if (value === null || value === undefined || value === '') return '—'
  const amount = Number(value)
  if (Number.isNaN(amount)) return dash(value)
  return `${currency || 'USD'} ${amount.toFixed(2)}`
}

const formatDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return dash(value)
  return d.toLocaleDateString()
}

const formatMovementDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const movementLabel = (type) => MOVEMENT_LABELS[type] || type || '—'

const labelName = (entity, id) => {
  if (entity?.name) return entity.name
  return dash(id)
}

function DetailField({ label, children }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800">{children}</p>
    </div>
  )
}

export default function ViewItem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { data: item, isLoading, isError, error } = useInventoryItem(id)
  const {
    data: movementsData,
    isLoading: movementsLoading,
    isError: movementsError,
    error: movementsErr,
  } = useItemStockMovements(id, { page, limit: PAGE_SIZE })

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading item…</p>
  }

  if (isError) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-red-500">{error?.message || 'Failed to load item'}</p>
        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="mt-4 text-sm font-semibold text-[#6c5ce7] hover:underline"
        >
          Back to Inventory
        </button>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-slate-500">Item not found</p>
        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="mt-4 text-sm font-semibold text-[#6c5ce7] hover:underline"
        >
          Back to Inventory
        </button>
      </div>
    )
  }

  const attachments = item.attachments ?? []
  const itemName = item.inventoryCode || item.description || `Item #${item.id}`
  const movements = movementsData?.items ?? []
  const pagination = movementsData?.pagination ?? {}
  const totalRecords = Number(pagination.total ?? movements.length)
  const totalPages = Math.max(
    1,
    Number(pagination.totalPages ?? pagination.lastPage ?? Math.ceil(totalRecords / PAGE_SIZE) ?? 1)
  )
  const currentPage = Math.min(page, totalPages)
  const showingFrom = movements.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const showingTo = movements.length === 0 ? 0 : showingFrom + movements.length - 1

  const pageNumbers = Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
    if (totalPages <= 3) return i + 1
    if (currentPage <= 2) return i + 1
    if (currentPage >= totalPages - 1) return totalPages - 2 + i
    return currentPage - 1 + i
  })

  return (
    <div>
        <Link
        to="/inventory"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#6c5ce7]"
      >
        <ArrowLeft size={16} /> Back to Inventory
      </Link>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {item.inventoryCode || `Item #${item.id}`}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{dash(item.description)}</p>
        </div>
        {/* <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Back
        </button> */}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Item Details</h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3">
          <DetailField label="Tracking Type">{dash(item.trackingType)}</DetailField>
          <DetailField label="Category">
            {labelName(item.category, item.categoryId)}
          </DetailField>
          <DetailField label="Subcategory">
            {labelName(item.subcategory ?? item.subCategory, item.subcategoryId)}
          </DetailField>
          <DetailField label="Manufacturer">
            {labelName(item.manufacturer, item.manufacturerId)}
          </DetailField>
          <DetailField label="Storage Location">
            {labelName(item.location, item.locationId)}
          </DetailField>
          <DetailField label="Part Number">{dash(item.partNumber)}</DetailField>
          <DetailField label="Serial Number">{dash(item.serialNumber)}</DetailField>
          <DetailField label="Condition">{dash(item.conditionValue)}</DetailField>
          <DetailField label="Quantity On Hand">{dash(item.quantityOnHand)}</DetailField>
          <DetailField label="Quantity Reserved">{dash(item.quantityReserved)}</DetailField>
          <DetailField label="Currency">{dash(item.currency)}</DetailField>
          <DetailField label="Purchase Price">
            {formatMoney(item.purchasePrice, item.currency)}
          </DetailField>
          <DetailField label="Asking Price">
            {formatMoney(item.askingPrice, item.currency)}
          </DetailField>
          <DetailField label="Purchase Date">{formatDate(item.purchaseDate)}</DetailField>
          <DetailField label="Notes">{dash(item.notes ?? item.note)}</DetailField>
        </div>

        {attachments.length > 0 && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Attachments</h3>
            <ul className="space-y-2">
              {attachments.map((file, index) => {
                const key = file.id ?? file.storageKey ?? index
                const name = file.fileName ?? file.name ?? `Attachment ${index + 1}`
                const href = file.url ?? file.storageKey
                return (
                  <li key={key} className="text-sm text-slate-700">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-[#6c5ce7] hover:underline"
                      >
                        {name}
                      </a>
                    ) : (
                      name
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {/* <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">Stock History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="w-14 pl-6 pr-2 py-3 font-semibold">SN</th>
                <th className="pl-2 pr-4 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Inventory Item</th>
                <th className="px-6 py-3 font-semibold">Movement</th>
              </tr>
            </thead>
            <tbody>
              {movementsLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    Loading stock history…
                  </td>
                </tr>
              )}
              {movementsError && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-red-500">
                    {movementsErr?.message || 'Failed to load stock history'}
                  </td>
                </tr>
              )}
              {!movementsLoading && !movementsError && movements.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    No stock movements found
                  </td>
                </tr>
              )}
              {!movementsLoading &&
                !movementsError &&
                movements.map((row, index) => (
                  <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80">
                    <td className="w-14 pl-6 pr-2 py-3.5 text-slate-600">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="pl-2 pr-4 py-3.5 text-slate-600">
                      {formatMovementDate(row.transactionDate)}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800">{itemName}</td>
                    <td className="px-6 py-3.5 text-slate-700">
                      {movementLabel(row.movementType)}
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
              disabled={currentPage <= 1 || movementsLoading}
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
              disabled={currentPage >= totalPages || movementsLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div> */}
    </div>
  )
}
