import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'
import {
  useCategories,
  useSubCategoriesPage,
  useUpdateSubCategoryStatus,
  useDeleteSubCategory,
} from '../../hooks/useCategories'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import DataTable from '../../components/common/DataTable'
import Pagination from '../../components/common/Pagination'
import { getSubCategoryColumns } from './subCategoryColumns'

export default function SubCategories() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data: categories } = useCategories()
  const category = categories?.find((c) => String(c.id) === categoryId)

  const listParams = useMemo(() => {
    const params = { page, limit: pageSize }
    const q = search.trim()
    if (q) params.search = q
    return params
  }, [page, pageSize, search])

  const { data, isLoading, isError, error } = useSubCategoriesPage(categoryId, listParams)

  const subCategories = data?.items ?? []
  const pagination = data?.pagination ?? {}
  const totalRecords = Number(pagination.total ?? subCategories.length)
  const totalPages = Math.max(
    1,
    Number(pagination.totalPages ?? Math.ceil(totalRecords / pageSize) ?? 1)
  )
  const currentPage = Math.min(page, totalPages)
  const showingFrom =
    subCategories.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const showingTo =
    subCategories.length === 0 ? 0 : showingFrom + subCategories.length - 1

  const handleSearch = (value) => {
    setSearch(value)
    setPage(1)
  }

  const handlePageSizeChange = (size) => {
    setPageSize(size)
    setPage(1)
  }

  const pageNumbers = Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
    if (totalPages <= 3) return i + 1
    if (currentPage <= 2) return i + 1
    if (currentPage >= totalPages - 1) return totalPages - 2 + i
    return currentPage - 1 + i
  })

  const deleteMutation = useDeleteSubCategory()
  const {
    mutate: updateStatus,
    isPending: isStatusPending,
    variables: statusVariables,
  } = useUpdateSubCategoryStatus()

  const [deleteItem, setDeleteItem] = useState(null)

  const handleDelete = () => {
    deleteMutation.mutate(deleteItem.id, {
      onSuccess: () => setDeleteItem(null),
    })
  }

  const columns = useMemo(
    () =>
      getSubCategoryColumns({
        categoryId,
        currentPage,
        pageSize,
        navigate,
        updateStatus,
        isStatusPending,
        statusVariables,
      }),
    [categoryId, currentPage, pageSize, navigate, updateStatus, isStatusPending, statusVariables]
  )

  return (
    <div>
      <Link
        to="/categories"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#6c5ce7]"
      >
        <ArrowLeft size={16} /> Back to Categories
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{category?.name ?? 'Subcategories'}</h1>
        <p className="mt-1 text-sm text-slate-500">Manage subcategories of this category</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search subcategory name..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20"
          />
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => navigate(`/categories/${categoryId}/subcategories/new`)}
            className="rounded-xl bg-[#6c5ce7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5b4bd6]"
          >
            + Add Subcategory
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">Subcategories</h2>
        </div>

        <DataTable
          columns={columns}
          data={subCategories}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.message}
          emptyText="No subcategories found"
          minWidth={480}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          showingFrom={showingFrom}
          showingTo={showingTo}
          totalRecords={totalRecords}
          pageNumbers={pageNumbers}
          isLoading={isLoading}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      <ConfirmDialog
        open={!!deleteItem}
        title="Delete Subcategory"
        message={`Are you sure you want to delete "${deleteItem?.name}"?`}
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteItem(null)}
      />
    </div>
  )
}
