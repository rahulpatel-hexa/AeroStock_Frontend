import api from './api'

export const getAllCategories = async () => {
  const { data } = await api.get('/categories/all')
  const payload = data.data
  const items = Array.isArray(payload) ? payload : payload?.items ?? []
  return items.filter((c) => c.parentId == null)
}

export const getAllSubCategories = async (categoryId) => {
  const { data } = await api.get(`/categories/${categoryId}/subcategories/all`)
  const payload = data.data
  return Array.isArray(payload) ? payload : payload?.items ?? []
}

// List API: data.data.items (array) + data.data.pagination
export const getCategories = async (params = {}) => {
  const { data } = await api.get('/categories', {
    params: { limit: 100, ...params },
  })
  return data.data.items
}

export const getCategoriesPage = async (params = {}) => {
  const { data } = await api.get('/categories', {
    params: { page: 1, limit: 10, ...params },
  })
  return {
    items: (data.data.items ?? []).filter((c) => c.parentId == null),
    pagination: data.data.pagination ?? {},
  }
}

// Create API: data.data.category
export const createCategory = async (payload) => {
  const { data } = await api.post('/categories', payload)
  return data.data.category
}

export const updateCategory = async ({ id, ...payload }) => {
  const { data } = await api.put(`/categories/${id}`, payload)
  return data.data.category
}

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`)
  return data.data
}

// ---------- Sub categories (same API, parentId ke saath) ----------
// export const getSubCategories = (parentId) => getCategories({ parentId })

// export const createSubCategory = ({ categoryId, ...payload }) =>
//   createCategory({ ...payload, parentId: Number(categoryId) })

// export const updateSubCategory = updateCategory
// export const deleteSubCategory = deleteCategory


export const getSubCategories = async (categoryId, params = {}) => {
  const { data } = await api.get(`/categories/${categoryId}/subcategories`, {
    params: { limit: 100, ...params },
  })

  return data.data.items
}

export const createSubCategory = async ({ categoryId, ...payload }) => {
  const { data } = await api.post(`/categories/${categoryId}/subcategories`, payload)
  return data.data.category
}




export const updateSubCategory = async ({ id, ...payload }) => {
  const { data } = await api.put(`/subcategories/${id}`, payload)
  return data.data.category
}

export const deleteSubCategory = async (id) => {
  const { data } = await api.delete(`/subcategories/${id}`)
  return data.data
}