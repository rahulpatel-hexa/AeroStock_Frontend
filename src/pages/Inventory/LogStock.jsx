import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useCreateStockMovement, useInventoryItems } from '../../hooks/useInventory'
import { inputClass } from '../../utils/helpers'
import { ArrowLeft } from 'lucide-react'

const todayIso = () => new Date().toISOString().slice(0, 10)

const MOVEMENT_TYPES = [
  { value: 'RECEIVED', label: '+ Received', activeClass: 'border-emerald-500 text-emerald-600' },
  { value: 'SOLD', label: '− Sold', activeClass: 'border-rose-500 text-rose-600' },
  // { value: 'INTERNAL_USE', label: '− Internal Use', activeClass: 'border-rose-500 text-rose-600' },
  { value: 'RESERVED', label: '− Reserved', activeClass: 'border-amber-500 text-amber-600' },
  { value: 'RELEASED', label: '↩ Released', activeClass: 'border-blue-500 text-blue-600' },
]

const emptyToNull = (value) => {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export default function LogStock() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const itemId = searchParams.get('itemId') ?? ''
  const createMovement = useCreateStockMovement()
  const { data } = useInventoryItems({ page: 1, limit: 100 })
  const items = data?.items ?? []

  const [movementType, setMovementType] = useState('RECEIVED')
  const [quantity, setQuantity] = useState('')
  const [fromReserved, setFromReserved] = useState(false)
  const [transactionDate, setTransactionDate] = useState(todayIso)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const selected = useMemo(
    () => items.find((item) => String(item.id) === itemId),
    [items, itemId]
  )

  const currentStock = Number(selected?.quantityOnHand ?? 0)
  const currentReserved = Number(selected?.quantityReserved ?? 0)
  const qty = /^\d+$/.test(quantity.trim()) ? Number(quantity) : 0
  const stockAfterAvailable = {
    RECEIVED: currentStock + qty,
    RESERVED: currentStock - qty,
    RELEASED: currentStock + qty,
    SOLD: fromReserved ? currentStock : currentStock - qty,
  }[movementType]
  const stockAfterReserved = {
    RECEIVED: currentReserved,
    RESERVED: currentReserved + qty,
    RELEASED: currentReserved - qty,
    SOLD: fromReserved ? currentReserved - qty : currentReserved,
  }[movementType]
  const availableAfterClass = stockAfterAvailable >= currentStock ? 'text-emerald-600' : 'text-rose-600'
  const reservedAfterClass = stockAfterReserved >= currentReserved ? 'text-emerald-600' : 'text-rose-600'

  const onConfirm = async (event) => {
    event.preventDefault()
    if (!itemId || !selected) {
      setError('Inventory item is required')
      return
    }
    if (!/^\d+$/.test(quantity.trim()) || Number(quantity) < 1) {
      setError('Enter a whole number greater than 0')
      return
    }
    if (movementType === 'RELEASED' && selected.trackingType?.toUpperCase() === 'SERIALIZED' && Number(quantity) !== 1) {
      setError('Serialized items can only release one item at a time')
      return
    }
    if (movementType === 'RELEASED' && Number(quantity) > currentReserved) {
      setError('Quantity cannot exceed reserved stock')
      return
    }
    if (movementType === 'SOLD' && fromReserved && Number(quantity) > currentReserved) {
      setError('Quantity cannot exceed reserved stock')
      return
    }
    if (
      (movementType === 'RESERVED' || (movementType === 'SOLD' && !fromReserved)) &&
      Number(quantity) > currentStock
    ) {
      setError('Quantity cannot exceed available stock')
      return
    }

    setError('')
    const payload = {
      movementType,
      quantity: Number(quantity),
      transactionDate,
      notes: emptyToNull(notes),
      ...(movementType === 'SOLD' && fromReserved ? { fromReserved: true } : {}),
    }

    try {
      await createMovement.mutateAsync({ id: itemId, payload })
      navigate('/inventory')
    } catch {
      // Error toast handled by useCreateStockMovement
    }
  }

  return (
    <div>
      <Link
        to="/inventory"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#6c5ce7]"
      >
        <ArrowLeft size={16} /> Back to Inventory
      </Link>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Log Stock</h1>
          <p className="mt-1 text-sm text-slate-500">Record stock received, sold, reserved or released</p>
        </div>
        {/* <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
        >
          Admin
          <ChevronLeft className="size-4 rotate-[-90deg] text-slate-400" />
        </button> */}
      </div>

      <form
        onSubmit={onConfirm}
        noValidate
        className="rounded-2xl border border-slate-200 bg-white p-6"
      >
        <h2 className="mb-4 text-lg font-bold text-slate-800">Log Stock Transaction</h2>
        {selected && (
          <p className="mt-1 text-sm text-slate-500">
            {selected.description} · {selected.inventoryCode || selected.id}
          </p>
        )}

        <div className="mt-5 rounded-xl bg-[#f3f0ff] px-4 py-3">
          <p className="text-xs font-semibold text-slate-500">Current Stock</p>
          <div className="mt-2 flex flex-wrap gap-x-8 gap-y-2">
            <p className="text-sm font-semibold text-slate-700">
              Available <span className="ml-1 text-lg font-bold text-slate-900">{selected ? currentStock : 0}</span>
            </p>
            <p className="text-sm font-semibold text-slate-700">
              Reserved <span className="ml-1 text-lg font-bold text-slate-900">{selected ? currentReserved : 0}</span>
            </p>
          </div>
        </div>

        <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Transaction Type
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MOVEMENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => {
                setMovementType(type.value)
                setError('')
              }}
              disabled={type.value === 'RELEASED' && currentReserved === 0}
              title={type.value === 'RELEASED' && currentReserved === 0 ? 'No reserved stock to release' : undefined}
              className={`rounded-lg border px-4 py-3 text-sm font-semibold ${movementType === type.value ? type.activeClass : 'border-slate-200 text-slate-700'
                } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {movementType === 'SOLD' && (
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={fromReserved}
              onChange={(event) => {
                setFromReserved(event.target.checked)
                setError('')
              }}
              disabled={currentReserved === 0}
              className="size-4 rounded border-slate-300 text-[#6c5ce7] focus:ring-[#6c5ce7]"
            />
            <span className={currentReserved === 0 ? 'text-slate-400' : ''}>
              Sell from reserved stock
            </span>
          </label>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-500">
            Number of items *
            <input
              inputMode="numeric"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value)
                setError('')
              }}
              placeholder="5"
              className={`${inputClass(Boolean(error))} mt-2`}
            />
          </label>
          <label className="block text-xs font-semibold text-slate-500">
            Transaction Date
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className={`${inputClass(false)} mt-2`}
            />
          </label>
        </div>

        <label className="mt-5 block text-xs font-semibold text-slate-500">
          Notes (optional)
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Supplier delivery, sale or reservation"
            className={`${inputClass(false)} mt-2`}
          />
        </label>

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

        <p className="mt-6 text-sm text-slate-500">
          Stock after transaction{' '}
          <span className={`ml-2 text-base font-bold ${selected && qty ? availableAfterClass : 'text-slate-800'}`}>
            Available: {selected ? stockAfterAvailable : 0}
          </span>
          <span className={`ml-3 text-base font-bold ${selected && qty ? reservedAfterClass : 'text-slate-800'}`}>
            Reserved: {selected ? stockAfterReserved : 0}
          </span>
        </p>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMovement.isPending}
            className="rounded-lg bg-[#6c5ce7] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5b4bd6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createMovement.isPending ? 'Saving...' : 'Confirm Transaction'}
          </button>
        </div>
      </form>
    </div>
  )
}
