import { LogOut } from 'lucide-react'                      // 1) naya import
import { NAV_ITEMS } from '../../utils/constants'
// import { useAuth } from '../../context/AuthContext'
import SidebarItem from './SidebarItem'
import { useAuthStore } from '../../store/authStore'


export default function Sidebar() {
    //   const { user, logout } = useAuth()  
    const user = useAuthStore((s) => s.user)
    const logout = useAuthStore((s) => s.logout)                     // 2) logout add kiya

    return (
        <aside className="flex h-screen w-64 shrink-0 flex-col bg-[#1e2342] text-white">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6c5ce7] text-lg font-bold">
                    A
                </div>
                <div>
                    <h1 className="text-lg font-bold leading-tight">AeroStock</h1>
                    <p className="text-[9px] font-semibold tracking-wider text-slate-300">
                        AVIATION INVENTORY
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
                {NAV_ITEMS.map((item) => (
                    <SidebarItem key={item.path} {...item} />
                ))}
            </nav>

            {/* User profile */}
            <div className="m-4 border-t border-white/10 pt-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-600 text-sm font-bold">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.role}</p>
                    </div>

                    {/* 3) Logout button */}
                    <button
                        onClick={logout}
                        className="ml-auto text-slate-400 hover:text-white"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    )
}