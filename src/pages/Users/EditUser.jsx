import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ImagePlus, X } from 'lucide-react'
import FormField from '../../components/common/FormField'
import { useUser, useUpdateUser } from '../../hooks/useUsers'
import { editUserSchema } from '../../schemas/userSchema'
import { inputClass } from '../../utils/helpers'

const MAX_PROFILE_IMAGE_SIZE = 10 * 1024 * 1024
const PROFILE_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
])

export default function EditUser() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: user, isLoading, isError, error } = useUser(id)
  const { mutate: updateUser, isPending } = useUpdateUser()
  const imageInputRef = useRef(null)
  const [profileImage, setProfileImage] = useState(null)
  const [profileImageError, setProfileImageError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

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
    if (profileImage) {
      payload.profileImage = profileImage
    }
    updateUser(payload, { onSuccess: () => navigate('/users') })
  }

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!PROFILE_IMAGE_TYPES.has(file.type)) {
      setProfileImageError('Choose a JPEG, PNG, GIF, or WebP image.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      setProfileImageError('Image must be 10 MB or smaller.')
      event.target.value = ''
      return
    }

    setProfileImage(file)
    setPreviewUrl(URL.createObjectURL(file))
    setProfileImageError('')
  }

  const removeSelectedProfileImage = () => {
    setProfileImage(null)
    setPreviewUrl('')
    setProfileImageError('')
    if (imageInputRef.current) imageInputRef.current.value = ''
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

          {/* <FormField label="Password" error={errors.password}>
            <input
              type="password"
              placeholder="Leave blank to keep current"
              className={inputClass(errors.password)}
              {...register('password')}
            />
          </FormField> */}

          {/* <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-500">Status</p>
            <label className="inline-flex cursor-pointer items-center gap-3 pt-2">
              <input type="checkbox" className="peer sr-only" {...register('isActive')} />
              <span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-[#6c5ce7] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
              <span className="text-sm text-slate-700">Enabled</span>
            </label>
          </div> */}
        </div>

        <div className="mt-6">
          <p className="mb-1.5 text-xs font-semibold text-slate-500">
            Profile Image <span className="font-normal">(Optional)</span>
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {(previewUrl || user.profileImageUrl) && (
              <img
                src={previewUrl || user.profileImageUrl}
                alt="Profile preview"
                className="size-20 rounded-xl border border-slate-200 object-cover"
              />
            )}
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="profileImage"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ImagePlus size={16} />
                {profileImage || user.profileImageUrl ? 'Change image' : 'Choose image'}
              </label>
              <input
                ref={imageInputRef}
                id="profileImage"
                type="file"
                accept=".jpg,.jpeg,image/jpeg,image/png,image/gif,image/webp"
                className="sr-only"
                onChange={handleProfileImageChange}
              />
              {profileImage && (
                <>
                  <span className="max-w-56 truncate text-sm text-slate-500">
                    {profileImage.name}
                  </span>
                  <button
                    type="button"
                    onClick={removeSelectedProfileImage}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    <X size={16} />
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
          {profileImageError && (
            <p className="mt-1 text-xs text-red-500">{profileImageError}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            JPEG, PNG, GIF, or WebP. Maximum file size: 10 MB.
          </p>
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
