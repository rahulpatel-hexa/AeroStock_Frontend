import { useState } from 'react'
import ProfileTab from './ProfileTab'
import PasswordTab from './PasswordTab'

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'password', label: 'Password' },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
      <p className="mb-8 mt-1 text-sm text-slate-500">
        Manage your profile and account settings.
      </p>

      <div className="flex flex-col gap-8 md:flex-row">
        <nav className="flex shrink-0 flex-row gap-4 md:w-40 md:flex-col md:gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                activeTab === tab.id
                  ? 'font-semibold text-slate-800'
                  : 'font-medium text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {activeTab === 'profile' ? <ProfileTab /> : <PasswordTab />}
        </div>
      </div>
    </div>
  )
}
