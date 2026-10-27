import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'

const INITIAL_USERS = [
  { id: 1, name: 'Pramod', email: 'admin@aerostock.local', role: 'Admin', status: 'Active' },
  { id: 2, name: 'M. Patel', email: 'staff1@aerostock.local', role: 'Staff', status: 'Active' },
  { id: 3, name: 'A. Shah', email: 'staff2@aerostock.local', role: 'Staff', status: 'Active' },
]

const INITIAL_SETTINGS = [
  { key: 'prefix', label: 'Inventory ID Prefix', value: 'AV' },
  { key: 'currency', label: 'Default Currency', value: 'USD' },
  { key: 'retention', label: 'Backup Retention', value: '30 days' },
  { key: 'backup', label: 'Automatic Backup', value: 'Daily' },
  { key: 'export', label: 'Data Export', value: 'CSV / Excel' },
  { key: 'storage', label: 'File Storage', value: 'Private storage' },
]

const emptyUserForm = { name: '', email: '', role: 'Staff' }

export default function Settings() {
  const [users, setUsers] = useState(INITIAL_USERS)
  const [settings, setSettings] = useState(INITIAL_SETTINGS)

  const [userModal, setUserModal] = useState({ open: false, mode: 'add', user: null })
  const [userForm, setUserForm] = useState(emptyUserForm)

  const [settingModal, setSettingModal] = useState({ open: false, setting: null })
  const [settingValue, setSettingValue] = useState('')

  const openAddUser = () => {
    setUserForm(emptyUserForm)
    setUserModal({ open: true, mode: 'add', user: null })
  }

  const openEditUser = (user) => {
    setUserForm({ name: user.name, email: user.email, role: user.role })
    setUserModal({ open: true, mode: 'edit', user })
  }

  const closeUserModal = () => {
    setUserModal({ open: false, mode: 'add', user: null })
    setUserForm(emptyUserForm)
  }

  const saveUser = (e) => {
    e.preventDefault()
    const name = userForm.name.trim()
    const email = userForm.email.trim()
    if (!name || !email) {
      toast.error('Name and email are required')
      return
    }

    if (userModal.mode === 'edit' && userModal.user) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userModal.user.id
            ? { ...u, name, email, role: userForm.role }
            : u
        )
      )
      toast.success('User updated')
    } else {
      setUsers((prev) => [
        ...prev,
        {
          id: Date.now(),
          name,
          email,
          role: userForm.role,
          status: 'Active',
        },
      ])
      toast.success('User added')
    }
    closeUserModal()
  }

  const openConfigure = (setting) => {
    setSettingValue(setting.value)
    setSettingModal({ open: true, setting })
  }

  const closeSettingModal = () => {
    setSettingModal({ open: false, setting: null })
    setSettingValue('')
  }

  const saveSetting = (e) => {
    e.preventDefault()
    const value = settingValue.trim()
    if (!value) {
      toast.error('Value is required')
      return
    }
    setSettings((prev) =>
      prev.map((s) => (s.key === settingModal.setting.key ? { ...s, value } : s))
    )
    toast.success('Setting updated')
    closeSettingModal()
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Users & Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage access and application preferences
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
        >
          Admin
          <ChevronLeft className="size-4 rotate-[-90deg] text-slate-400" />
        </button>
      </div>

      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Users & Permissions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Control who can view, edit, export or archive inventory.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddUser}
            className="shrink-0 rounded-xl bg-[#6c5ce7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5b4bd6]"
          >
            + Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{user.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{user.email}</td>
                  <td className="px-5 py-3.5 text-slate-700">{user.role}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => openEditUser(user)}
                      className="text-sm font-semibold text-[#6c5ce7] hover:text-[#5a4bd1]"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-800">Application Settings</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {settings.map((setting) => (
            <div
              key={setting.key}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 sm:flex sm:flex-1 sm:items-center sm:gap-10">
                <p className="w-48 shrink-0 text-sm font-semibold text-slate-800">
                  {setting.label}
                </p>
                <p className="text-sm text-slate-500">{setting.value}</p>
              </div>
              <button
                type="button"
                onClick={() => openConfigure(setting)}
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Configure
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={userModal.open}
        title={userModal.mode === 'edit' ? 'Edit User' : 'Add User'}
        onClose={closeUserModal}
      >
        <form onSubmit={saveUser} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Name</label>
            <input
              type="text"
              value={userForm.name}
              onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Email</label>
            <input
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Role</label>
            <select
              value={userForm.role}
              onChange={(e) => setUserForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20"
            >
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeUserModal}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#6c5ce7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5b4bd6]"
            >
              {userModal.mode === 'edit' ? 'Save Changes' : 'Add User'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={settingModal.open}
        title={settingModal.setting ? `Configure ${settingModal.setting.label}` : 'Configure'}
        onClose={closeSettingModal}
      >
        <form onSubmit={saveSetting} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Value</label>
            <input
              type="text"
              value={settingValue}
              onChange={(e) => setSettingValue(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeSettingModal}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#6c5ce7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5b4bd6]"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
