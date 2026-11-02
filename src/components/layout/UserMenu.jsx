import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { queryClient } from '../../lib/queryClient'

function getInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('')
}

export default function UserMenu() {
    const user = useAuthStore((s) => s.user)
    const logout = useAuthStore((s) => s.logout)
    const navigate = useNavigate()

    if (!user) return null

    const initials = getInitials(user.name) || '?'

    const handleLogout = () => {
        logout()
        queryClient.clear()
        navigate('/login', { replace: true })
    }

    return (
        <Menu>
            {/* Sidebar ke neeche wala button */}
            <MenuButton className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/10 data-[open]:bg-white/10 focus:outline-none">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-800">
                    {initials}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-slate-400">{user.role}</p>
                </div>
                <ChevronsUpDown size={16} className="shrink-0 text-slate-400" />
            </MenuButton>

            {/* Popup: button ke upar khulega */}
            <MenuItems
                transition
                anchor={{ to: 'top start', gap: 8 }}
                className="z-50 w-(--button-width) min-w-56 rounded-lg bg-white text-slate-800 shadow-lg ring-1 ring-black/10 transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
            >
                {/* Profile info (sirf dikhane ke liye, click nahi hota) */}
                <div className="flex items-center gap-3 border-b border-slate-200 px-3 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{user.name}</p>
                        <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                </div>

                <MenuItem>
                    <Link
                        to="/settings"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm data-[focus]:bg-slate-100"
                    >
                        <Settings size={16} className="text-slate-500" />
                        Settings
                    </Link>
                </MenuItem>

                <MenuItem>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-b-lg border-t border-slate-200 px-3 py-2.5 text-sm data-[focus]:bg-slate-100"
                    >
                        <LogOut size={16} className="text-slate-500" />
                        Log Out
                    </button>
                </MenuItem>
            </MenuItems>
        </Menu>
    )
}
