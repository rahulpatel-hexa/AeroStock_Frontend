import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import FormField from '../../components/common/FormField'
import { useCreateUser } from '../../hooks/useUsers'
import { createUserSchema } from '../../schemas/userSchema'
import { inputClass } from '../../utils/helpers'

export default function AddUser() {
  const navigate = useNavigate()
  const { mutate: createUser, isPending } = useCreateUser()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      isActive: true,
    },
  })

  const onSubmit = (values) => {
    createUser(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        isActive: values.isActive,
      },
      { onSuccess: () => navigate('/users') }
    )
  }

  return (
    <div>
      <Link
        to="/users"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#6c5ce7]"
      >
        <ArrowLeft size={16} /> Back to Users
      </Link>

      <h1 className="text-2xl font-bold text-slate-800">Add User</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">Enter the details for a new user</p>

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

          <FormField label="Password" required error={errors.password}>
            <input
              type="password"
              placeholder="Minimum 8 characters"
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
            {isPending ? 'Saving...' : 'Save User'}
          </button>
        </div>
      </form>
    </div>
  )
}
