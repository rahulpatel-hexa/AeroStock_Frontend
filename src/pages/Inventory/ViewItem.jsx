import { useNavigate, useParams } from 'react-router-dom'
import { useInventoryItem } from '../../hooks/useInventory'

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
  const { data: item, isLoading, isError, error } = useInventoryItem(id)

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

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {item.inventoryCode || `Item #${item.id}`}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{dash(item.description)}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Back
        </button>
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
    </div>
  )
}
