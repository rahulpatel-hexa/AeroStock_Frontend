import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../../hooks/useUsers'

function DetailField({ label, children }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800">{children}</p>
    </div>
  )
}

export default function ViewUser() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: user, isLoading, isError, error } = useUser(id)

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading user…</p>
  }

  if (isError) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-red-500">{error?.message || 'Failed to load user'}</p>
        <button
          type="button"
          onClick={() => navigate('/users')}
          className="mt-4 text-sm font-semibold text-[#6c5ce7] hover:underline"
        >
          Back to Users
        </button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-slate-500">User not found</p>
        <button
          type="button"
          onClick={() => navigate('/users')}
          className="mt-4 text-sm font-semibold text-[#6c5ce7] hover:underline"
        >
          Back to Users
        </button>
      </div>
    )
  }

  const status = user.isActive ? 'Enabled' : 'Disabled'
  const statusClass = user.isActive
    ? 'bg-emerald-50 text-emerald-700'
    : 'bg-slate-100 text-slate-600'

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(`/users/${id}/edit`)}
            className="rounded-lg bg-[#6c5ce7] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5b4bd6]"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Back
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-800">User Details</h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3">
          <DetailField label="Name">{user.name || '—'}</DetailField>
          <DetailField label="Email">{user.email || '—'}</DetailField>
          <DetailField label="Status">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass}`}
            >
              {status}
            </span>
          </DetailField>
        </div>
      </div>
    </div>
  )
}
