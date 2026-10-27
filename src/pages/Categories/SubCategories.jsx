import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import {
  useCategories,
  useSubCategories,
  useDeleteSubCategory,
} from '../../hooks/useCategories'
import ConfirmDialog from '../../components/common/ConfirmDialog'

export default function SubCategories() {
  const { categoryId } = useParams()
  const navigate = useNavigate()

  const { data: categories } = useCategories()
  const category = categories?.find((c) => String(c.id) === categoryId)

  const { data: subCategories, isLoading, isError, error } = useSubCategories(categoryId)

  const deleteMutation = useDeleteSubCategory()

  const [deleteItem, setDeleteItem] = useState(null)

  const handleDelete = () => {
    deleteMutation.mutate(deleteItem.id, {
      onSuccess: () => setDeleteItem(null),
    })
  }

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

      <div className="mb-6 flex justify-end">
        <button
          onClick={() => navigate(`/categories/${categoryId}/subcategories/new`)}
          className="rounded-lg bg-[#6c5ce7] px-6 py-3 text-sm font-semibold text-white hover:bg-[#5b4bd6]"
        >
          + Add Subcategory
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Subcategories</h2>

        {isLoading && <p className="py-8 text-center text-sm text-slate-500">Loading...</p>}

        {isError && <p className="py-8 text-center text-sm text-red-500">{error.message}</p>}

        {!isLoading && !isError && subCategories?.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">No subcategories found</p>
        )}

        {subCategories?.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center justify-between border-b border-slate-100 px-2 py-3"
          >
            <span className="text-sm font-semibold text-slate-800">{sub.name}</span>

            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  navigate(`/categories/${categoryId}/subcategories/${sub.id}/edit`)
                }
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#6c5ce7]"
              >
                <Pencil size={14} /> Edit
              </button>
              {/* <button
                onClick={() => setDeleteItem(sub)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-500"
              >
                <Trash2 size={14} /> Delete
              </button> */}
            </div>
          </div>
        ))}
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