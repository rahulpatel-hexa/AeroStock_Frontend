import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import FormField from '../../components/common/FormField'
import { inventorySchema } from '../../schemas/inventorySchema'
import { CONDITIONS, CURRENCIES } from '../../utils/constants'
import { inputClass } from '../../utils/helpers'
import { useAllCategories, useAllSubCategories } from '../../hooks/useCategories'
import { useManufacturers } from '../../hooks/useManufacturers'
import { useLocations } from '../../hooks/useLocations'
import { useCreateInventoryItem } from '../../hooks/useInventory'
import { buildInventoryFormData } from '../../services/inventoryService'

export default function AddItem() {
  const navigate = useNavigate()
  const createMutation = useCreateInventoryItem()
  const { data: categories = [], isLoading: categoriesLoading } = useAllCategories()
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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
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
    },
  })

  const selectedCategoryId = watch('category')
  const trackingType = watch('trackingType')

  const { data: subCategories = [], isLoading: subCategoriesLoading } =
    useAllSubCategories(selectedCategoryId)

  const { onChange: onCategoryChange, ...categoryRegister } = register('category')
  const { onChange: onQuantityChange, ...quantityRegister } = register('quantity')

  const onSubmit = async (data) => {
    try {
      const formData = buildInventoryFormData(data)
      await createMutation.mutateAsync(formData)
      navigate('/inventory')
    } catch {
      // Error toast handled by useCreateInventoryItem
    }
  }

  const isSaving = createMutation.isPending

  const pill =
    'cursor-pointer rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-500 peer-checked:bg-[#e9e6fb] peer-checked:text-[#6c5ce7]'

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Add Inventory Item</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">Enter the essential details for a new part</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-2xl border border-slate-200 bg-white p-6"
      >
        <h2 className="mb-4 text-lg font-bold text-slate-800">Basic Information</h2>

        {/* Tracking Type */}
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
              className={inputClass(errors.quantity)}
              {...quantityRegister}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, '')
                onQuantityChange(e)
              }}
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

        {/* Attachments */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-bold text-slate-800">Attachments</h3>
          <p className="mb-3 text-xs text-slate-500">Drop photos or PDF documents here, or click to browse.</p>
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            className="text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#e9e6fb] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#6c5ce7]"
            {...register('attachments')}
          />
          {errors.attachments && <p className="mt-1 text-xs text-red-500">{errors.attachments.message}</p>}
        </div>

        {/* Actions */}
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
            {isSaving ? 'Saving...' : 'Save Item'}
          </button>
        </div>
      </form>
    </div>
  )
}