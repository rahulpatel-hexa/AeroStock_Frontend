import { Eye, Pencil, PackagePlus } from 'lucide-react'

const STATUS_BADGE = {
  Available: 'bg-emerald-50 text-emerald-700',
  Reserved: 'bg-amber-50 text-amber-700',
  Sold: 'bg-rose-50 text-rose-700',
}

export function getInventoryColumns({
  currentPage,
  pageSize,
  navigate,
  updateStatus,
  isStatusPending,
  statusVariables,
}) {
  return [
    {
      header: 'SN',
      size: 60,
      cell: ({ row }) => (
        <span className="text-slate-600">
          {(currentPage - 1) * pageSize + row.index + 1}
        </span>
      ),
    },
    {
      header: 'Inventory ID',
      cell: ({ row }) => (
        <span className="font-semibold text-slate-800">
          {row.original.inventoryCode || row.original.id}
        </span>
      ),
    },
    {
      header: 'Item Name',
      accessorKey: 'description',
      cell: ({ getValue }) => <span className="text-slate-700">{getValue()}</span>,
    },
    {
      header: 'Part Number',
      accessorKey: 'partNumber',
      cell: ({ getValue }) => <span className="text-slate-600">{getValue()}</span>,
    },
    {
      header: 'Quantity',
      accessorKey: 'quantity',
      size: 100,
      cell: ({ getValue }) => <span className="text-slate-700">{getValue()}</span>,
    },
    {
      header: 'Stock Status',
      size: 120,
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[row.original.status]}`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      header: 'Status',
      size: 80,
      meta: { align: 'right', stopRowClick: true, noTruncate: true },
      cell: ({ row }) => {
        const item = row.original
        const updating = isStatusPending && statusVariables?.id === item.id
        return (
          <label
            className={`inline-flex items-center ${
              updating ? 'cursor-wait opacity-60' : 'cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              className="peer sr-only"
              checked={!!item.isActive}
              disabled={updating}
              onChange={(e) => updateStatus({ id: item.id, isActive: e.target.checked })}
            />
            <span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
          </label>
        )
      },
    },
    {
      header: 'Actions',
      size: 290,
      meta: { align: 'right', stopRowClick: true, noTruncate: true, isActions: true },
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-5">
          <button
            type="button"
            onClick={() => navigate(`/inventory/${row.original.id}/edit`)}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#6c5ce7]"
          >
            <Pencil size={15} /> Edit
          </button>
          <button
            type="button"
            onClick={() => navigate(`/inventory/${row.original.id}`)}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#6c5ce7] hover:text-[#5a4bd1]"
          >
            <Eye size={15} /> View
          </button>
          <button
            type="button"
            onClick={() => navigate(`/inventory/log-stock?itemId=${row.original.id}`)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <PackagePlus size={14} /> Log Stock
          </button>
        </div>
      ),
    },
  ]
}
