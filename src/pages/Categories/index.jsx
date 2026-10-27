import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { Pencil, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useCategoriesPage,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useCategories'
import { getAllSubCategories } from '../../services/categoryService'
import NameFormModal from './NameFormModal'
import ConfirmDialog from '../../components/common/ConfirmDialog'

const PAGE_SIZE = 10

const resolveSubcategoryCount = (cat, query) => {
  const fromItem =
    cat.subcategoryCount ?? cat._count?.children ?? cat.childrenCount
  if (fromItem != null) return Number(fromItem)
  if (query?.isLoading || query?.isPending) return null
  return Number(query?.data?.length ?? 0)
}

export default function Categories() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error } = useCategoriesPage({ page, limit: PAGE_SIZE })

  const categories = data?.items ?? []
  const pagination = data?.pagination ?? {}
  const totalRecords = Number(pagination.total ?? categories.length)
  const totalPages = Math.max(
    1,
    Number(pagination.totalPages ?? Math.ceil(totalRecords / PAGE_SIZE) ?? 1)
  )
  const currentPage = Math.min(page, totalPages)
  const showingFrom = categories.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const showingTo = categories.length === 0 ? 0 : showingFrom + categories.length - 1

  const pageNumbers = Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
    if (totalPages <= 3) return i + 1
    if (currentPage <= 2) return i + 1
    if (currentPage >= totalPages - 1) return totalPages - 2 + i
    return currentPage - 1 + i
  })

  const subcategoryQueries = useQueries({
    queries: categories.map((cat) => ({
      queryKey: ['subcategories', 'all', cat.id],
      queryFn: () => getAllSubCategories(cat.id),
      enabled: !!cat.id,
    })),
  })

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const [formModal, setFormModal] = useState(null) // { mode: 'add' | 'edit', item }
  const [deleteItem, setDeleteItem] = useState(null)

  const handleSubmit = ({ name }) => {
    const options = { onSuccess: () => setFormModal(null) }

    if (formModal.mode === 'add') {
      createMutation.mutate({ name }, options)
    } else {
      updateMutation.mutate({ id: formModal.item.id, name }, options)
    }
  }

  const handleDelete = () => {
    deleteMutation.mutate(deleteItem.id, {
      onSuccess: () => setDeleteItem(null),
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage categories and subcategories yourself
        </p>
      </div>

      <div className="mb-6 flex justify-end">
        <button
          onClick={() => navigate('/categories/new')}
          className="rounded-lg bg-[#6c5ce7] px-6 py-3 text-sm font-semibold text-white hover:bg-[#5b4bd6]"
        >
          + Add Category
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">Inventory Categories</h2>
          <p className="mt-1 text-xs text-slate-500">
            Click a category to manage its subcategories.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="w-14 pl-6 pr-2 py-3 font-semibold">SN</th>
                <th className="pl-2 pr-4 py-3 font-semibold">Category</th>
                <th className="px-6 py-3 font-semibold">Subcategories</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-red-500">
                    {error.message}
                  </td>
                </tr>
              )}

              {!isLoading && !isError && categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    No categories found
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                categories.map((cat, index) => {
                  const count = resolveSubcategoryCount(cat, subcategoryQueries[index])
                  return (
                  <tr
                    key={cat.id}
                    onClick={() => navigate(`/categories/${cat.id}`)}
                    className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/80"
                  >
                    <td className="w-14 pl-6 pr-2 py-3.5 text-slate-600">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="pl-2 pr-4 py-3.5 font-semibold text-slate-800">{cat.name}</td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {count == null ? '—' : count}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-8">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/categories/${cat.id}/subcategories/new`)
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Plus size={14} /> Add subcategory
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/categories/${cat.id}/edit`)
                          }}
                          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#6c5ce7]"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing {showingFrom}–{showingTo} of {totalRecords.toLocaleString()} items
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </button>
            {pageNumbers.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`min-w-8 rounded-lg px-2.5 py-1 text-sm font-medium ${
                  currentPage === n
                    ? 'bg-[#6c5ce7] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <NameFormModal
        open={!!formModal}
        title={formModal?.mode === 'edit' ? 'Edit Category' : 'Add Category'}
        label="Category Name"
        initialName={formModal?.item?.name ?? ''}
        isPending={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormModal(null)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteItem}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteItem?.name}"?`}
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteItem(null)}
      />
    </div>
  )
}
