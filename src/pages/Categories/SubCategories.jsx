import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import {
  useCategories,
  useSubCategories,
  useUpdateSubCategoryStatus,
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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">Subcategories</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="pl-6 pr-4 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-red-500">
                    {error.message}
                  </td>
                </tr>
              )}

              {!isLoading && !isError && subCategories?.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-slate-500">
                    No subcategories found
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                subCategories?.map((sub) => {
                  const statusUpdating =
                    isStatusPending && statusVariables?.id === sub.id
                  return (
                    <tr
                      key={sub.id}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="pl-6 pr-4 py-3.5 font-semibold text-slate-800">
                        {sub.name}
                      </td>
                      <td className="px-6 py-3.5">
                        <label
                          className={`inline-flex items-center ${statusUpdating ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}
                        >
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={!!sub.isActive}
                            disabled={statusUpdating}
                            onChange={(e) =>
                              updateStatus({ id: sub.id, isActive: e.target.checked })
                            }
                          />
                          <span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
                        </label>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/categories/${categoryId}/subcategories/${sub.id}/edit`
                              )
                            }
                            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#6c5ce7]"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          {/* <button
                            type="button"
                            onClick={() => setDeleteItem(sub)}
                            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-500"
                          >
                            <Trash2 size={14} /> Delete
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
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
