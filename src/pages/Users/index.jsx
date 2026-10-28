import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Pencil, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUsersPage, useUpdateUserStatus } from '../../hooks/useUsers'

const PAGE_SIZE = 10

const STATUS_BADGE = {
  Enabled: 'bg-emerald-50 text-emerald-700',
  Disabled: 'bg-slate-100 text-slate-600',
}

const resolveStatus = (user) => (user.isActive ? 'Enabled' : 'Disabled')

export default function Users() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const listParams = useMemo(() => {
    const params = { page, limit: PAGE_SIZE }
    const q = search.trim()
    if (q) params.search = q
    return params
  }, [page, search])

  const { data, isLoading, isError, error } = useUsersPage(listParams)
  const { mutate: updateStatus, isPending: isStatusPending, variables: statusVariables } =
    useUpdateUserStatus()

  const users = data?.items ?? []
  const pagination = data?.pagination ?? {}
  const totalRecords = Number(pagination.total ?? users.length)
  const totalPages = Math.max(
    1,
    Number(pagination.totalPages ?? pagination.lastPage ?? Math.ceil(totalRecords / PAGE_SIZE) ?? 1)
  )
  const currentPage = Math.min(page, totalPages)
  const showingFrom = users.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const showingTo = users.length === 0 ? 0 : showingFrom + users.length - 1

  const handleSearch = (value) => {
    setSearch(value)
    setPage(1)
  }

  const pageNumbers = Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
    if (totalPages <= 3) return i + 1
    if (currentPage <= 2) return i + 1
    if (currentPage >= totalPages - 1) return totalPages - 2 + i
    return currentPage - 1 + i
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Users</h1>
        <p className="mt-1 text-sm text-slate-500">Manage system users and access</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search name or email..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20"
          />
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => navigate('/users/new')}
            className="rounded-xl bg-[#6c5ce7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5b4bd6]"
          >
            + Add User
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">User List</h2>
          <p className="mt-1 text-xs text-slate-500">View and manage registered users.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="w-14 pl-6 pr-2 py-3 font-semibold">SN</th>
                <th className="pl-2 pr-4 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                {/* <th className="px-6 py-3 font-semibold">Status</th> */}
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-red-500">
                    {error.message}
                  </td>
                </tr>
              )}

              {!isLoading && !isError && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                users.map((user, index) => {
                  const status = resolveStatus(user)
                  const statusUpdating =
                    isStatusPending && statusVariables?.id === user.id
                  return (
                    <tr
                      key={user.id}
                      onClick={() => navigate(`/users/${user.id}`)}
                      className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/80"
                    >
                      <td className="w-14 pl-6 pr-2 py-3.5 text-slate-600">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="pl-2 pr-4 py-3.5 font-semibold text-slate-800">
                        {user.name}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">{user.email}</td>
                      {/* <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[status]}`}
                        >
                          {status}
                        </span>
                      </td> */}
                      <td
                        className="px-6 py-3.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label
                          className={`inline-flex items-center ${statusUpdating ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}
                        >
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={!!user.isActive}
                            disabled={statusUpdating}
                            onChange={(e) =>
                              updateStatus({ id: user.id, isActive: e.target.checked })
                            }
                          />
                          <span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
                        </label>
                      </td>
                      <td
                        className="px-6 py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-5">
                          <button
                            type="button"
                            onClick={() => navigate(`/users/${user.id}/edit`)}
                            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#6c5ce7]"
                          >
                            <Pencil size={15} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/users/${user.id}`)}
                            className="flex items-center gap-1.5 text-sm font-semibold text-[#6c5ce7] hover:text-[#5a4bd1]"
                          >
                            <Eye size={15} /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
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
              disabled={currentPage <= 1 || isLoading}
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
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
