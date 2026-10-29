import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams, Link } from 'react-router-dom'
import FormField from '../../components/common/FormField'
import { inventorySchema } from '../../schemas/inventorySchema'
import { CONDITIONS, CURRENCIES } from '../../utils/constants'
import { inputClass } from '../../utils/helpers'
import { useCategories, useSubCategories } from '../../hooks/useCategories'
import { useManufacturers } from '../../hooks/useManufacturers'
import { useLocations } from '../../hooks/useLocations'
import { useInventoryItem, useUpdateInventoryItem } from '../../hooks/useInventory'
import { buildInventoryFormData } from '../../services/inventoryService'
import { ArrowLeft } from 'lucide-react'

const emptyDefaults = {
  trackingType: 'bulk',
  description: '',
  category: '',
  subCategory: '',
  manufacturer: '',
  partNumber: '',
  serialNumber: '',
  condition: '',
  storageLocation: '',
  quantity: '',
  currency: 'USD',
  purchasePrice: '',
  askingPrice: '',
  purchaseDate: '',
  notes: '',
}

const humanizeCondition = (value) => {
  if (!value) return ''
  const normalized = String(value).toUpperCase().replace(/\s+/g, '_')
  const match = CONDITIONS.find((c) => c.toUpperCase().replace(/\s+/g, '_') === normalized)
  return match ?? value
}

const toDateInput = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10)
  return d.toISOString().slice(0, 10)
}

const mapItemToForm = (item) => ({
  trackingType: String(item.trackingType || 'BULK').toLowerCase(),
  description: item.description ?? '',
  category: item.categoryId != null ? String(item.categoryId) : '',
  subCategory: item.subcategoryId != null ? String(item.subcategoryId) : '',
  manufacturer: item.manufacturerId != null ? String(item.manufacturerId) : '',
  partNumber: item.partNumber ?? '',
  serialNumber: item.serialNumber ?? '',
  condition: humanizeCondition(item.conditionValue),
  storageLocation: item.locationId != null ? String(item.locationId) : '',
  quantity: item.quantityOnHand != null ? String(item.quantityOnHand) : '',
  currency: item.currency || 'USD',
  purchasePrice: item.purchasePrice != null && item.purchasePrice !== '' ? String(item.purchasePrice) : '',
  askingPrice: item.askingPrice != null && item.askingPrice !== '' ? String(item.askingPrice) : '',
  purchaseDate: toDateInput(item.purchaseDate),
  notes: item.notes ?? item.note ?? '',
})

export default function EditItem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const updateMutation = useUpdateInventoryItem()
  const { data: item, isLoading: itemLoading, isError, error } = useInventoryItem(id)

  const { data: categories = [], isLoading: categoriesLoading } = useCategories({
    page: 1,
    limit: 10,
  })
  const { data: manufacturers = [], isLoading: manufacturersLoading } = useManufacturers({
    page: 1,
    limit: 100,
  })
  const { data: locations = [], isLoading: locationsLoading } = useLocations({
    page: 1,
    limit: 100,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    if (item) reset(mapItemToForm(item))
  }, [item, reset])

  const selectedCategoryId = watch('category')
  const trackingType = watch('trackingType')

  const { data: subCategories = [], isLoading: subCategoriesLoading } = useSubCategories(
    selectedCategoryId,
    { page: 1, limit: 10 }
  )

  const { onChange: onCategoryChange, ...categoryRegister } = register('category')

  const onSubmit = async (data) => {
    try {
      const formData = buildInventoryFormData(data)
      await updateMutation.mutateAsync({ id, formData })
      navigate('/inventory')
    } catch {
      // Error toast handled by useUpdateInventoryItem
    }
  }

  const isSaving = updateMutation.isPending

  const pill =
    'cursor-pointer rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-500 peer-checked:bg-[#e9e6fb] peer-checked:text-[#6c5ce7]'

  if (itemLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading item…</p>
  }

  if (isError) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-red-500">{error?.message || 'Failed to load item'}</p>
        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="mt-4 text-sm font-semibold text-[#6c5ce7] hover:underline"
        >
          Back to Inventory
        </button>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-slate-500">Item not found</p>
        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="mt-4 text-sm font-semibold text-[#6c5ce7] hover:underline"
        >
          Back to Inventory
        </button>
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/inventory"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#6c5ce7]"
      >
        <ArrowLeft size={16} /> Back to Inventory
      </Link>
      <h1 className="text-2xl font-bold text-slate-800">Edit Inventory Item</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        Update details for {item.inventoryCode || `item #${item.id}`}
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-2xl border border-slate-200 bg-white p-6"
      >
        <h2 className="mb-4 text-lg font-bold text-slate-800">Basic Information</h2>

        <p className="mb-2 text-xs font-semibold text-slate-500">Tracking Type</p>
        <div className="mb-6 flex gap-2">
          {[
            { value: 'bulk', label: 'Bulk' },
            { value: 'serialized', label: 'Serialized' },
          ].map((t) => (
            <label key={t.value}>
              <input type="radio" value={t.value} className="peer sr-only" {...register('trackingType')} />
              <span className={pill}>{t.label}</span>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3">
          <FormField label="Item Name" required error={errors.description}>
            <input
              placeholder="Aircraft Alternator"
              className={inputClass(errors.description)}
              {...register('description')}
            />
          </FormField>

          <FormField label="Category" required error={errors.category}>
            <select
              className={inputClass(errors.category)}
              disabled={categoriesLoading}
              {...categoryRegister}
              onChange={(e) => {
                onCategoryChange(e)
                setValue('subCategory', '')
              }}
            >
              <option value="">
                {categoriesLoading ? 'Loading categories…' : 'Select category'}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Subcategory" error={errors.subCategory}>
            <select
              className={inputClass(errors.subCategory)}
              disabled={!selectedCategoryId || subCategoriesLoading}
              {...register('subCategory')}
            >
              <option value="">
                {!selectedCategoryId
                  ? 'Select category first'
                  : subCategoriesLoading
                    ? 'Loading subcategories…'
                    : 'Select subcategory'}
              </option>
              {subCategories.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Manufacturer" error={errors.manufacturer}>
            <select
              className={inputClass(errors.manufacturer)}
              disabled={manufacturersLoading}
              {...register('manufacturer')}
            >
              <option value="">
                {manufacturersLoading ? 'Loading manufacturers…' : 'Select manufacturer'}
              </option>
              {manufacturers.map((m) => (
                <option key={m.id} value={String(m.id)}>
                  {m.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Part Number" required error={errors.partNumber}>
            <input placeholder="ALT-240" className={inputClass(errors.partNumber)} {...register('partNumber')} />
          </FormField>

          <FormField
            label="Serial Number"
            required={trackingType === 'serialized'}
            error={errors.serialNumber}
          >
            <input
              placeholder={
                trackingType === 'serialized' ? 'Enter serial number' : 'Optional serial number'
              }
              className={inputClass(errors.serialNumber)}
              {...register('serialNumber')}
            />
          </FormField>

          <FormField label="Condition" required error={errors.condition}>
            <select className={inputClass(errors.condition)} {...register('condition')}>
              <option value="">Select condition</option>
              {CONDITIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Storage Location" error={errors.storageLocation}>
            <select
              className={inputClass(errors.storageLocation)}
              disabled={locationsLoading}
              {...register('storageLocation')}
            >
              <option value="">
                {locationsLoading ? 'Loading locations…' : 'Select storage location'}
              </option>
              {locations.map((loc) => (
                <option key={loc.id} value={String(loc.id)}>
                  {loc.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Quantity" required error={errors.quantity}>
            <input
              inputMode="numeric"
              placeholder="20"
              readOnly
              tabIndex={-1}
              className={`${inputClass(errors.quantity)} cursor-not-allowed read-only:border-slate-200 read-only:bg-slate-100 read-only:text-slate-400 read-only:focus:border-slate-200 read-only:focus:ring-0`}
              {...register('quantity')}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Currency" error={errors.currency}>
              <select className={inputClass(errors.currency)} {...register('currency')}>
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Purchase Price" error={errors.purchasePrice}>
              <input
                inputMode="decimal"
                placeholder="320.00"
                className={inputClass(errors.purchasePrice)}
                {...register('purchasePrice')}
              />
            </FormField>
          </div>

          <FormField label="Asking Price" error={errors.askingPrice}>
            <input
              inputMode="decimal"
              placeholder="450.00"
              className={inputClass(errors.askingPrice)}
              {...register('askingPrice')}
            />
          </FormField>

          <FormField label="Purchase Date" error={errors.purchaseDate}>
            <input type="date" className={inputClass(errors.purchaseDate)} {...register('purchaseDate')} />
          </FormField>

          <FormField label="Notes" error={errors.notes}>
            <input placeholder="Optional notes" className={inputClass(errors.notes)} {...register('notes')} />
          </FormField>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-bold text-slate-800">Attachments</h3>
          <p className="mb-3 text-xs text-slate-500">
            Add new photos or PDF documents (optional). Existing files are kept unless replaced by the API.
          </p>
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            className="text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#e9e6fb] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#6c5ce7]"
            {...register('attachments')}
          />
          {errors.attachments && <p className="mt-1 text-xs text-red-500">{errors.attachments.message}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-[#6c5ce7] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5b4bd6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Updating...' : 'Update Item'}
          </button>
        </div>
      </form>
    </div>
  )
}
