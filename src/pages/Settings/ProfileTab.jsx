import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import FormField from '../../components/common/FormField'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { useAuthStore } from '../../store/authStore'
import { profileSchema } from '../../schemas/settingsSchema'
import { inputClass } from '../../utils/helpers'

export default function ProfileTab() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const setAuth = useAuthStore((s) => s.setAuth)

  const [fileName, setFileName] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? '',
        email: user.email ?? '',
      })
    }
  }, [user, reset])

  const onSubmit = (values) => {
    if (!user) return
    setAuth({
      user: { ...user, name: values.name, email: values.email },
      token,
    })
    toast.success('Profile updated')
  }

  const handleDeleteConfirm = () => {
    setDeleteOpen(false)
    toast('Account deletion is not available yet')
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-2xl border border-slate-200 bg-white p-6"
      >
        <h2 className="text-lg font-bold text-slate-800">Profile</h2>
        <p className="mb-6 mt-1 text-sm text-slate-500">
          Update your name and email address
        </p>

        <div className="mb-5">
          <p className="mb-1.5 text-xs font-semibold text-slate-500">Photo</p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Choose file
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  setFileName(file ? file.name : '')
                }}
              />
            </label>
            <span className="text-sm text-slate-500">
              {fileName || 'No file chosen'}
            </span>
          </div>
        </div>

        <div className="space-y-5">
          <FormField label="Name" required error={errors.name}>
            <input
              placeholder="Your name"
              className={inputClass(errors.name)}
              {...register('name')}
            />
          </FormField>

          <FormField label="Email" required error={errors.email}>
            <input
              type="email"
              placeholder="you@example.com"
              className={inputClass(errors.email)}
              {...register('email')}
            />
          </FormField>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="rounded-xl bg-[#6c5ce7] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5b4bd6]"
          >
            Save
          </button>
        </div>
      </form>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-800">Delete account</h2>
        <p className="mb-6 mt-1 text-sm text-slate-500">
          Delete your account and all of its resources
        </p>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="rounded-xl bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
        >
          Delete account
        </button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete account"
        message="Delete your account and all of its resources? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  )
}
