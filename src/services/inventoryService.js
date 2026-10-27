import api from './api'

// List API: data.data.items + data.data.pagination
export const getInventoryItems = async (params = {}) => {
  const { data } = await api.get('/inventory-items', {
    params: { page: 1, limit: 10, ...params },
  })
  return {
    items: data.data.items ?? [],
    pagination: data.data.pagination ?? {},
  }
}

// Detail API: data.data.item
export const getInventoryItem = async (id) => {
  const { data } = await api.get(`/inventory-items/${id}`)
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
  const { data } = await api.post('/inventory-items', formData, multipartConfig)
  return data.data
}

export const updateInventoryItem = async ({ id, formData }) => {
  const { data } = await api.put(`/inventory-items/${id}`, formData, multipartConfig)
  return data.data
}

export const createStockMovement = async ({ id, payload }) => {
  const { data } = await api.post(`/inventory-items/${id}/stock-movement`, payload)
  return data.data
}

export const getStockMovements = async (params = {}) => {
  const { data } = await api.get('/stock-movements', {
    params: { page: 1, limit: 100, ...params },
  })
  return {
    items: data.data.items ?? [],
    pagination: data.data.pagination ?? {},
  }
}
