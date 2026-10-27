import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '../../components/common/Modal'
import FormField from '../../components/common/FormField'
import { nameSchema } from '../../schemas/categorySchema'
import { inputClass } from '../../utils/helpers'

export default function NameFormModal({
  open,
  title,
  label = 'Name',
  initialName = '',
  isPending,
  onClose,
  onSubmit,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: '' },
  })

  // Modal khulte hi form reset (edit me purana naam, add me khali)
  useEffect(() => {
    if (open) reset({ name: initialName })
  }, [open, initialName, reset])

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FormField label={label} required error={errors.name}>
          <input
            autoFocus
            placeholder={`Enter ${label.toLowerCase()}`}
            className={inputClass(errors.name)}
            {...register('name')}
          />
        </FormField>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[#6c5ce7] px-5 py-2 text-sm font-semibold text-white hover:bg-[#5b4bd6] disabled:opacity-60"
          >
            {isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}