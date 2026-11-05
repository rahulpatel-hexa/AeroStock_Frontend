import { Eye, Pencil } from 'lucide-react'
import { useState } from 'react'

function getNameInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return parts.length > 1
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase()
}

function ProfileAvatar({ user }) {
  const [failedImageUrl, setFailedImageUrl] = useState(null)
  const imageUrl = user.profileImageUrl

  return (
    <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#e9e6fb] text-sm font-semibold text-[#6c5ce7]">
      {imageUrl && failedImageUrl !== imageUrl ? (
        <img
          src={imageUrl}
          alt={`${user.name}'s profile`}
          className="size-full object-cover"
          onError={() => setFailedImageUrl(imageUrl)}
        />
      ) : (
        getNameInitials(user.name)
      )}
    </span>
  )
}

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
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-3">
          <ProfileAvatar user={row.original} />
          <span className="min-w-0 truncate font-semibold text-slate-800">
            {row.original.name}
          </span>
        </div>
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