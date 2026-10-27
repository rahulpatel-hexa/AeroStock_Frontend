import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import {
    useCategories,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
} from '../../hooks/useCategories'
import NameFormModal from './NameFormModal'
import ConfirmDialog from '../../components/common/ConfirmDialog'

export default function Categories() {
    const navigate = useNavigate()
    const { data: categories, isLoading, isError, error } = useCategories()

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
                    //   onClick={() => setFormModal({ mode: 'add', item: null })}
                    onClick={() => navigate('/categories/new')}
                    className="rounded-lg bg-[#6c5ce7] px-6 py-3 text-sm font-semibold text-white hover:bg-[#5b4bd6]"
                >
                    + Add Category
                </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-slate-800">Inventory Categories</h2>
                <p className="mb-4 text-xs text-slate-500">
                    Click a category to manage its subcategories.
                </p>

                {isLoading && <p className="py-8 text-center text-sm text-slate-500">Loading...</p>}

                {isError && <p className="py-8 text-center text-sm text-red-500">{error.message}</p>}

                {!isLoading && !isError && categories?.length === 0 && (
                    <p className="py-8 text-center text-sm text-slate-500">No categories found</p>
                )}

                {categories?.map((cat) => (
                    <div
                        key={cat.id}
                        onClick={() => navigate(`/categories/${cat.id}`)}
                        className="flex cursor-pointer items-center justify-between border-b border-slate-100 px-2 py-3 hover:bg-slate-50"
                    >
                        <span className="text-sm font-semibold text-slate-800">{cat.name}</span>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/categories/${cat.id}/edit`)
                                }}
                                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#6c5ce7]"
                            >
                                <Pencil size={14} /> Edit
                            </button>
                            {/* <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setDeleteItem(cat)
                                }}
                                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-500"
                            >
                                <Trash2 size={14} /> Delete
                            </button> */}
                        </div>
                    </div>
                ))}
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