import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import FormField from '../../components/common/FormField'
import { passwordSchema } from '../../schemas/settingsSchema'
import { inputClass } from '../../utils/helpers'

function PasswordInput({ error, show, onToggle, ...props }) {
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        className={inputClass(error)}
        {...props}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

export default function PasswordTab() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = () => {
    toast.success('Password updated')
    reset()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h2 className="text-lg font-bold text-slate-800">Password</h2>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        Update your account password
      </p>

      <div className="space-y-5">
        <FormField label="Current password" required error={errors.currentPassword}>
          <PasswordInput
            error={errors.currentPassword}
            show={showCurrent}
            onToggle={() => setShowCurrent((v) => !v)}
            placeholder="Enter current password"
            {...register('currentPassword')}
          />
        </FormField>

        <FormField label="New password" required error={errors.newPassword}>
          <PasswordInput
            error={errors.newPassword}
            show={showNew}
            onToggle={() => setShowNew((v) => !v)}
            placeholder="Enter new password"
            {...register('newPassword')}
          />
        </FormField>

        <FormField label="Confirm password" required error={errors.confirmPassword}>
          <PasswordInput
            error={errors.confirmPassword}
            show={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
            placeholder="Confirm new password"
            {...register('confirmPassword')}
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
  )
}
