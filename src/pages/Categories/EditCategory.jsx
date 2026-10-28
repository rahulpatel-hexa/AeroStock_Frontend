import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import FormField from '../../components/common/FormField'
import { useCategories, useUpdateCategory } from '../../hooks/useCategories'
import { editCategorySchema } from '../../schemas/categorySchema'
import { inputClass } from '../../utils/helpers'

export default function EditCategory() {
  const { categoryId } = useParams()
  const navigate = useNavigate()

  const { data: categories, isLoading, isError, error } = useCategories()
  const category = categories?.find((c) => String(c.id) === categoryId)

  const { mutate: updateCategory, isPending } = useUpdateCategory()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editCategorySchema),
    defaultValues: { name: '', description: '', isActive: true },
  })

  // Data aate hi form me purani values bhar do
  useEffect(() => {
    if (category) {
      reset({
        name: category.name ?? '',
        description: category.description ?? '',
        isActive: category.isActive,
      })
    }
  }, [category, reset])

  const onSubmit = (values) => {
    updateCategory(
      {
        id: categoryId,
        name: values.name,
        description: values.description,
        isActive: values.isActive,
      },
      { onSuccess: () => navigate('/categories') }
    )
  }

  if (isLoading) return <p className="py-8 text-center text-sm text-slate-500">Loading...</p>
  if (isError) return <p className="py-8 text-center text-sm text-red-500">{error.message}</p>
  if (!category) return <p className="py-8 text-center text-sm text-slate-500">Category not found</p>

  return (
    <div>
      <Link
        to="/categories"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#6c5ce7]"
      >
        <ArrowLeft size={16} /> Back to Categories
      </Link>

      <h1 className="text-2xl font-bold text-slate-800">Edit Category</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">Update the details of this category</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-2xl border border-slate-200 bg-white p-6"
      >
        <h2 className="mb-4 text-lg font-bold text-slate-800">Category Information</h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <FormField label="Name" required error={errors.name}>
            <input
              placeholder="Avionics"
              className={inputClass(errors.name)}
              {...register('name')}
            />
          </FormField>

          {/* Status toggle */}
          {/* <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-500">Status</p>
            <label className="inline-flex cursor-pointer items-center gap-3 pt-2">
              <input type="checkbox" className="peer sr-only" {...register('isActive')} />
              <span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-[#6c5ce7] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
              <span className="text-sm text-slate-700">Active</span>
            </label>
          </div> */}

          <FormField label="Description" error={errors.description} className="md:col-span-2">
            <textarea
              rows={3}
              placeholder="Avionics parts"
              className={inputClass(errors.description)}
              {...register('description')}
            />
          </FormField>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/categories')}
            className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[#6c5ce7] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5b4bd6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Updating...' : 'Update Category'}
          </button>
        </div>
      </form>
    </div>
  )
}