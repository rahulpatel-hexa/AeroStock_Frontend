import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import Login from './pages/Login'
import Categories from './pages/Categories'
import SubCategories from './pages/Categories/SubCategories'
import AddItem from './pages/Inventory/AddItem'
import LogStock from './pages/Inventory/LogStock'
import EditItem from './pages/Inventory/EditItem'
import ViewItem from './pages/Inventory/ViewItem'
import Inventory from './pages/Inventory'
import StockHistory from './pages/StockHistory'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import { NAV_ITEMS } from './utils/constants'
import AddCategory from './pages/Categories/AddCategory'
import EditCategory from './pages/Categories/EditCategory'
import AddSubCategory from './pages/Categories/AddSubCategory'
import EditSubCategory from './pages/Categories/EditSubCategory'



const Placeholder = ({ title }) => (
  <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
)

// Jin pages ke real components ban gaye, unko placeholder se hatao
const REAL_PAGES = [
  '/dashboard',
  '/categories',
  '/inventory',
  '/stock-history',
  '/reports',
  '/settings',
]

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/new" element={<AddCategory />} />
        <Route path="/categories/:categoryId/edit" element={<EditCategory />} />
        <Route
          path="/categories/:categoryId/subcategories/new"
          element={<AddSubCategory />}
        />
        <Route
          path="/categories/:categoryId/subcategories/:subCategoryId/edit"
          element={<EditSubCategory />}
        />
        <Route path="/categories/:categoryId" element={<SubCategories />} />

        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/new" element={<AddItem />} />
        <Route path="/inventory/log-stock" element={<LogStock />} />
        <Route path="/inventory/:id/edit" element={<EditItem />} />
        <Route path="/inventory/:id" element={<ViewItem />} />

        <Route path="/stock-history" element={<StockHistory />} />

        <Route path="/reports" element={<Reports />} />

        <Route path="/settings" element={<Settings />} />

        {NAV_ITEMS.filter((n) => !REAL_PAGES.includes(n.path)).map(({ path, label }) => (
          <Route key={path} path={path} element={<Placeholder title={label} />} />
        ))}
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}