import api from './api'
import API from './apiEndpoints'

// List API: data.data.items + data.data.pagination
export const getInventoryItems = async (params = {}) => {
  const { data } = await api.get(API.INVENTORY_ITEMS.LIST, {
    params: { page: 1, limit: 10, ...params },
  })
  return {
    items: data.data.items ?? [],
    pagination: data.data.pagination ?? {},
  }
}

// Detail API: data.data.item
export const getInventoryItem = async (id) => {
  const { data } = await api.get(API.INVENTORY_ITEMS.DETAIL(id))
  return data.data.item
}

/** Map Add Item form values to multipart FormData for POST /inventory-items */
export const buildInventoryFormData = (data) => {
  const formData = new FormData()

  formData.append('description', data.description)
  formData.append('trackingType', data.trackingType.toUpperCase())
  formData.append('categoryId', data.category)
  if (data.subCategory) {
    formData.append('subcategoryId', data.subCategory)
  }
  formData.append('partNumber', data.partNumber)
  formData.append('conditionValue', data.condition.toUpperCase().replace(/\s+/g, '_'))
  formData.append('currency', data.currency)
  formData.append('quantity', String(Number(data.quantity)))

  if (data.serialNumber?.trim()) {
    formData.append('serialNumber', data.serialNumber.trim())
  }
  if (data.purchasePrice !== '' && data.purchasePrice != null) {
    formData.append('purchasePrice', String(Number(data.purchasePrice)))
  }
  if (data.askingPrice !== '' && data.askingPrice != null) {
    formData.append('askingPrice', String(Number(data.askingPrice)))
  }
  if (data.manufacturer) {
    formData.append('manufacturer_id', String(Number(data.manufacturer)))
  }
  if (data.storageLocation) {
    formData.append('locationId', String(Number(data.storageLocation)))
  }
  if (data.notes?.trim()) {
    formData.append('notes', data.notes.trim())
  }
  if (data.purchaseDate) {
    formData.append('purchaseDate', data.purchaseDate)
  }

  const files = Array.from(data.attachments ?? [])
  files.forEach((file) => {
    formData.append('attachments', file)
  })

  return formData
}

const multipartConfig = {
  transformRequest: [
    (body, headers) => {
      // Let the browser set multipart boundary (override default application/json)
      if (body instanceof FormData) {
        delete headers['Content-Type']
      }
      return body
    },
  ],
}

export const createInventoryItem = async (formData) => {
  const { data } = await api.post(
    API.INVENTORY_ITEMS.CREATE,
    formData,
    multipartConfig,
  )
  return data.data
}

export const importInventoryItems = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post(
    API.INVENTORY_ITEMS.IMPORT,
    formData,
    multipartConfig,
  )
  return data.data ?? data
}

export const updateInventoryItem = async ({ id, formData }) => {
  const { data } = await api.put(
    API.INVENTORY_ITEMS.UPDATE(id),
    formData,
    multipartConfig,
  )
  return data.data
}

export const updateInventoryItemStatus = async ({ id, isActive }) => {
  const path = isActive
    ? API.INVENTORY_ITEMS.ACTIVATE(id)
    : API.INVENTORY_ITEMS.DEACTIVATE(id)

  const { data } = await api.patch(path)
  return data.data.item ?? data.data
}

export const createStockMovement = async ({ id, payload }) => {
  const { data } = await api.post(
    API.INVENTORY_ITEMS.CREATE_STOCK_MOVEMENT(id),
    payload,
  )
  return data.data
}

export const getStockMovements = async (params = {}) => {
  const { data } = await api.get(API.STOCK_MOVEMENTS.LIST, {
    params: { page: 1, limit: 100, ...params },
  })
  return {
    items: data.data.items ?? [],
    pagination: data.data.pagination ?? {},
  }
}

export const exportStockHistory = async (params = {}) => {
  const { data } = await api.get(API.STOCK_HISTORY.EXPORT, {
    params,
    responseType: 'blob',
  })
  return data
}

export const getItemStockMovements = async (id, params = {}) => {
  const { data } = await api.get(API.INVENTORY_ITEMS.STOCK_MOVEMENTS(id), {
    params: { page: 1, limit: 10, ...params },
  })
  return {
    items: data.data.items ?? [],
    pagination: data.data.pagination ?? {},
  }
}
