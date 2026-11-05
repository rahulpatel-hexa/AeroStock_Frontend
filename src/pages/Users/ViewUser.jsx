import { useState } from 'react'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../../hooks/useUsers'

function getNameInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return parts.length > 1
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase()
}

function ProfileImage({ user }) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <div className="flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-3xl font-semibold text-[#6c5ce7]">
      {user.profileImageUrl && !imageFailed ? (
        <img
          src={user.profileImageUrl}
          alt={`${user.name}'s profile`}
          className="size-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        getNameInitials(user.name)
      )}
    </div>
  )
}

function DetailField({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium text-slate-500">{label}</p>
      <p className="break-words text-sm font-semibold text-slate-800">{children}</p>
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
    <div className="space-y-5">
      <Link
        to="/users"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6c5ce7] hover:text-[#5b4bd6]"
      >
        <ArrowLeft className="size-4" />
        Back to Users
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">User Details</h1>
          <p className="mt-1 text-sm text-slate-500">View user profile and account information</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate(`/users/${id}/edit`)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Pencil className="size-4" />
            Edit User
          </button>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-start sm:p-7">
          <ProfileImage user={user} />
          <div className="min-w-0 flex-1 pt-1">
            <h2 className="break-words text-xl font-bold text-slate-800 sm:text-2xl">
              {user.name || '—'}
            </h2>
            <p className="mt-1 break-words text-sm text-slate-500">{user.email || '—'}</p>
            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-200 px-5 py-5 sm:px-7 sm:py-6">
          <h3 className="mb-5 text-sm font-bold text-slate-800">User Information</h3>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <DetailField label="Name">{user.name || '—'}</DetailField>
            <DetailField label="Email">{user.email || '—'}</DetailField>
            <DetailField label="Status">{status}</DetailField>
          </div>
        </div>
      </section>
    </div>
  )
}
