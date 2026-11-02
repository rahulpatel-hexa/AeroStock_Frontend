import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import FormField from '../../components/common/FormField'
import { useAuthStore } from '../../store/authStore'
import { useUpdateProfile } from '../../hooks/useAuth'
import { profileSchema } from '../../schemas/settingsSchema'
import { inputClass } from '../../utils/helpers'

export default function ProfileTab() {
  const user = useAuthStore((s) => s.user)
  const { mutate: updateProfile, isPending } = useUpdateProfile()

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
    updateProfile({ name: values.name })
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

        {/* <div className="mb-5">
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
        </div> */}

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
              readOnly
              aria-readonly="true"
              className={`${inputClass(errors.email)} cursor-not-allowed read-only:border-slate-200 read-only:bg-slate-100 read-only:text-slate-400 read-only:focus:border-slate-200 read-only:focus:ring-0`}
              {...register('email')}
            />
          </FormField>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-[#6c5ce7] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5b4bd6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
