import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useCreateStockMovement, useInventoryItems } from '../../hooks/useInventory'
import { inputClass } from '../../utils/helpers'
import { ArrowLeft } from 'lucide-react'

const todayIso = () => new Date().toISOString().slice(0, 10)

const MOVEMENT_TYPES = [
  { value: 'RECEIVED', label: '+ Received', activeClass: 'border-emerald-500 text-emerald-600' },
  { value: 'SOLD', label: '− Sold', activeClass: 'border-rose-500 text-rose-600' },
  // { value: 'INTERNAL_USE', label: '− Internal Use', activeClass: 'border-rose-500 text-rose-600' },
  { value: 'RESERVED', label: '− Reserved', activeClass: 'border-amber-500 text-amber-600' },
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
  const [transactionDate, setTransactionDate] = useState(todayIso)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const selected = useMemo(
    () => items.find((item) => String(item.id) === itemId),
    [items, itemId]
  )

  const currentStock = Number(selected?.quantityOnHand ?? 0)
  const qty = /^\d+$/.test(quantity.trim()) ? Number(quantity) : 0
  const decreasesStock = movementType !== 'RECEIVED'
  const stockAfter = decreasesStock ? currentStock - qty : currentStock + qty
  const stockAfterClass = stockAfter >= currentStock ? 'text-emerald-600' : 'text-rose-600'

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
    if (decreasesStock && stockAfter < 0) {
      setError('Quantity cannot exceed current stock')
      return
    }

    setError('')
    const payload = {
      movementType,
      quantity: Number(quantity),
      transactionDate,
      notes: emptyToNull(notes),
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
          <p className="mt-1 text-sm text-slate-500">Record stock received, sold or reserved</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
        >
          Admin
          <ChevronLeft className="size-4 rotate-[-90deg] text-slate-400" />
        </button>
      </div>

      <form
        onSubmit={onConfirm}
        noValidate
        className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6"
      >
        <h2 className="text-lg font-bold text-slate-800">Log Stock Transaction</h2>
        {selected && (
          <p className="mt-1 text-sm text-slate-500">
            {selected.description} · {selected.inventoryCode || selected.id}
          </p>
        )}

        <div className="mt-5 rounded-xl bg-[#f3f0ff] px-4 py-3">
          <p className="text-xs font-semibold text-slate-500">Current Stock</p>
          <p className="text-2xl font-bold text-slate-900">{selected ? currentStock : 0} units</p>
        </div>

        <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Transaction Type
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {MOVEMENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setMovementType(type.value)}
              className={`rounded-lg border px-4 py-3 text-sm font-semibold ${movementType === type.value ? type.activeClass : 'border-slate-200 text-slate-700'
                }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Stock after transaction{' '}
            <span className={`ml-2 text-base font-bold ${selected && qty ? stockAfterClass : 'text-slate-800'}`}>
              {selected ? stockAfter : 0} units
            </span>
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMovement.isPending}
              className="rounded-lg bg-[#6c5ce7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5b4bd6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMovement.isPending ? 'Saving...' : 'Confirm Transaction'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
