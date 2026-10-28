import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import FormField from '../../components/common/FormField'
import { useUser, useUpdateUser } from '../../hooks/useUsers'
import { editUserSchema } from '../../schemas/userSchema'
import { inputClass } from '../../utils/helpers'

export default function EditUser() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: user, isLoading, isError, error } = useUser(id)
  const { mutate: updateUser, isPending } = useUpdateUser()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      isActive: true,
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? '',
        email: user.email ?? '',
        password: '',
        isActive: user.isActive ?? true,
      })
    }
  }, [user, reset])

  const onSubmit = (values) => {
    const payload = {
      id,
      name: values.name,
      email: values.email,
      isActive: values.isActive,
    }
    if (values.password?.trim()) {
      payload.password = values.password
    }
    updateUser(payload, { onSuccess: () => navigate('/users') })
  }

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading...</p>
  }

  if (isError) {
    return <p className="py-8 text-center text-sm text-red-500">{error.message}</p>
  }

  if (!user) {
    return <p className="py-8 text-center text-sm text-slate-500">User not found</p>
  }

  return (
    <div>
      <Link
        to="/users"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#6c5ce7]"
      >
        <ArrowLeft size={16} /> Back to Users
      </Link>

      <h1 className="text-2xl font-bold text-slate-800">Edit User</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">Update the details of this user</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-2xl border border-slate-200 bg-white p-6"
      >
        <h2 className="mb-4 text-lg font-bold text-slate-800">User Information</h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <FormField label="Name" required error={errors.name}>
            <input
              placeholder="John Doe"
              className={inputClass(errors.name)}
              {...register('name')}
            />
          </FormField>

          <FormField label="Email" required error={errors.email}>
            <input
              type="email"
              placeholder="user@example.com"
              className={inputClass(errors.email)}
              {...register('email')}
            />
          </FormField>

          <FormField label="Password" error={errors.password}>
            <input
              type="password"
              placeholder="Leave blank to keep current"
              className={inputClass(errors.password)}
              {...register('password')}
            />
          </FormField>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-500">Status</p>
            <label className="inline-flex cursor-pointer items-center gap-3 pt-2">
              <input type="checkbox" className="peer sr-only" {...register('isActive')} />
              <span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-[#6c5ce7] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
              <span className="text-sm text-slate-700">Enabled</span>
            </label>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[#6c5ce7] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5b4bd6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Updating...' : 'Update User'}
          </button>
        </div>
      </form>
    </div>
  )
}
