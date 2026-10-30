import { Eye, Pencil } from 'lucide-react'

export function getUserColumns({
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
      header: 'Name',
      accessorKey: 'name',
      // auto
      cell: ({ getValue }) => (
        <span className="font-semibold text-slate-800">{getValue()}</span>
      ),
    },
    {
      header: 'Email',
      accessorKey: 'email',
      // auto
      cell: ({ getValue }) => <span className="text-slate-600">{getValue()}</span>,
    },
    {
      header: 'Status',
      // size nahi: right-aligned hai, to Actions column ke bilkul paas rahega
      size: 80,
      meta: { align: 'right', stopRowClick: true, noTruncate: true },
      cell: ({ row }) => {
        const user = row.original
        const updating = isStatusPending && statusVariables?.id === user.id
        return (
          <label
            className={`inline-flex items-center ${
              updating ? 'cursor-wait opacity-60' : 'cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              className="peer sr-only"
              checked={!!user.isActive}
              disabled={updating}
              onChange={(e) => updateStatus({ id: user.id, isActive: e.target.checked })}
            />
            <span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
          </label>
        )
      },
    },
    {
      header: 'Actions',
      size: 150, // Edit + View + gap + padding (3 actions ho to ~250)
      meta: { align: 'right', stopRowClick: true, noTruncate: true, isActions: true },
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(`/users/${row.original.id}/edit`)}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#6c5ce7]"
          >
            <Pencil size={15} /> Edit
          </button>
          <button
            type="button"
            onClick={() => navigate(`/users/${row.original.id}`)}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#6c5ce7] hover:text-[#5a4bd1]"
          >
            <Eye size={15} /> View
          </button>
        </div>
      ),
    },
  ]
}