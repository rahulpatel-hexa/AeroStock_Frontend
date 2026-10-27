import {
  LayoutDashboard,
  Package,
  Layers,
  History,
  BarChart3,
  Settings,
} from 'lucide-react'

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Inventory', path: '/inventory', icon: Package },
  { label: 'Categories', path: '/categories', icon: Layers },
  { label: 'Stock History', path: '/stock-history', icon: History },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Users & Settings', path: '/settings', icon: Settings },
]


export const CATEGORIES = ['Electrical', 'Engine', 'Avionics', 'Landing Gear', 'Hydraulics', 'Cabin']
export const MANUFACTURERS = ['Boeing', 'Airbus', 'Honeywell', 'Collins Aerospace', 'GE Aviation']
export const CONDITIONS = ['New', 'Serviceable', 'Overhauled', 'Repairable', 'Scrap']
export const CURRENCIES = ['USD', 'EUR', 'INR', 'GBP']