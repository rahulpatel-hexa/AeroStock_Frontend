import { NAV_ITEMS } from '../../utils/constants'
import SidebarItem from './SidebarItem'
import UserMenu from './UserMenu'
import { useAuthStore } from '../../store/authStore'

export default function Sidebar() {
    const user = useAuthStore((s) => s.user)

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

            {/* User profile dropdown */}
            {user && (
                <div className="m-4 border-t border-white/10 pt-4">
                    <UserMenu />
                </div>
            )}
        </aside>
    )
}
