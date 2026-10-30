import { Pencil, Plus } from 'lucide-react'

export function getCategoryColumns({
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
      header: 'Category',
      accessorKey: 'name',
      // akela auto column: bacha hua space isko milega
      cell: ({ getValue }) => (
        <span className="font-semibold text-slate-800">{getValue()}</span>
      ),
    },
    {
      header: 'Subcategories',
      size: 150,
      cell: ({ row }) => {
        const count = row.original.subCount
        return <span className="text-slate-600">{count == null ? '—' : count}</span>
      },
    },
    {
      header: 'Status',
      size: 80,
      meta: { align: 'right', stopRowClick: true, noTruncate: true },
      cell: ({ row }) => {
        const cat = row.original
        const updating = isStatusPending && statusVariables?.id === cat.id
        return (
          <label
            className={`inline-flex items-center ${
              updating ? 'cursor-wait opacity-60' : 'cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              className="peer sr-only"
              checked={!!cat.isActive}
              disabled={updating}
              onChange={(e) => updateStatus({ id: cat.id, isActive: e.target.checked })}
            />
            <span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
          </label>
        )
      },
    },
    {
      header: 'Actions',
      size: 290, // Add subcategory button + Edit + gap + padding
      meta: { align: 'right', stopRowClick: true, noTruncate: true, isActions: true },
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2">
          <button
            type="button"
            onClick={() => navigate(`/categories/${row.original.id}/subcategories/new`)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plus size={14} /> Add subcategory
          </button>
          <button
            type="button"
            onClick={() => navigate(`/categories/${row.original.id}/edit`)}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#6c5ce7]"
          >
            <Pencil size={15} /> Edit
          </button>
        </div>
      ),
    },
  ]
}