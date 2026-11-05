const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const quantityClass = (qty, movement) => {
  if (movement === 'Reserved') return 'text-slate-800'
  if (movement === 'Released') return 'font-semibold text-blue-600'
  if (qty > 0) return 'font-semibold text-emerald-600'
  if (qty < 0) return 'font-semibold text-rose-600'
  return 'text-slate-800'
}

const formatQuantity = (qty, movement) => {
  if (movement === 'Reserved') return String(Math.abs(qty))
  if (movement === 'Released') return `+${Math.abs(qty)}`
  if (qty > 0) return `+${qty}`
  return String(qty)
}

export function getStockHistoryColumns({ currentPage, pageSize }) {
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
      header: 'Inventory Item',
      accessorKey: 'itemName',
      cell: ({ getValue }) => (
        <span className="font-semibold text-slate-800">{getValue()}</span>
      ),
    },
    {
      header: 'Movement',
      accessorKey: 'movement',
      cell: ({ row, getValue }) => (
        <span className={row.original.movementType === 'RELEASED' ? 'font-semibold text-blue-600' : 'text-slate-700'}>
          {getValue()}
        </span>
      ),
    },
    // {
    //   header: 'Notes',
    //   accessorKey: 'notes',
    //   cell: ({ getValue }) => <span className="text-slate-600">{getValue()}</span>,
    // },
    {
      header: 'Quantity',
      // size: 100,
      cell: ({ row }) => (
        <span className={quantityClass(row.original.quantity, row.original.movement)}>
          {formatQuantity(row.original.quantity, row.original.movement)}
        </span>
      ),
    },
    {
      header: 'Date',
      // size: 130,
      cell: ({ row }) => (
        <span className="text-slate-600">{formatDate(row.original.date)}</span>
      ),
    },
    {
      header: 'User',
      accessorKey: 'user',
      cell: ({ getValue }) => <span className="text-slate-700">{getValue()}</span>,
    },
  ]
}
