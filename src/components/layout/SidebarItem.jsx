
import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/helpers'

export default function SidebarItem({ label, path, icon: Icon }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
          isActive
            ? 'bg-[#443f8f] text-white'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
        )
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  )
}