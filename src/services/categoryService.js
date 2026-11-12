import api from './api'
import API from './apiEndpoints'

export const getAllCategories = async () => {
  const { data } = await api.get(API.CATEGORIES.ALL)
  const payload = data.data
  const items = Array.isArray(payload) ? payload : payload?.items ?? []
  return items.filter((c) => c.parentId == null)
}

export const getAllSubCategories = async (categoryId) => {
  const { data } = await api.get(API.CATEGORIES.ALL_SUBCATEGORIES(categoryId))
  const payload = data.data
  return Array.isArray(payload) ? payload : payload?.items ?? []
}

// List API: data.data.items (array) + data.data.pagination
export const getCategories = async (params = {}) => {
  const { data } = await api.get(API.CATEGORIES.LIST, {
    params: { limit: 100, ...params },
  })
  return data.data.items
}

export const getCategoriesPage = async (params = {}) => {
  const { data } = await api.get(API.CATEGORIES.LIST, {
    params: { page: 1, limit: 10, ...params },
  })
  return {
    items: (data.data.items ?? []).filter((c) => c.parentId == null),
    pagination: data.data.pagination ?? {},
  }
}

// Create API: data.data.category
export const createCategory = async (payload) => {
  const { data } = await api.post(API.CATEGORIES.CREATE, payload)
  return data.data.category
}

export const updateCategory = async ({ id, ...payload }) => {
  const { data } = await api.put(API.CATEGORIES.UPDATE(id), payload)
  return data.data.category
}

export const updateCategoryStatus = async ({ id, isActive }) => {
  const path = isActive
    ? API.CATEGORIES.ACTIVATE(id)
    : API.CATEGORIES.DEACTIVATE(id)
  const { data } = await api.patch(path)
  return data.data.category ?? data.data
}

export const deleteCategory = async (id) => {
  const { data } = await api.delete(API.CATEGORIES.DETAIL(id))
  return data.data
}

// ---------- Sub categories (same API, parentId ke saath) ----------
// export const getSubCategories = (parentId) => getCategories({ parentId })

// export const createSubCategory = ({ categoryId, ...payload }) =>
//   createCategory({ ...payload, parentId: Number(categoryId) })

// export const updateSubCategory = updateCategory
// export const deleteSubCategory = deleteCategory


export const getSubCategories = async (categoryId, params = {}) => {
  const { data } = await api.get(API.CATEGORIES.SUBCATEGORIES(categoryId), {
    params: { limit: 100, ...params },
  })

  return data.data.items
}

export const getSubCategoriesPage = async (categoryId, params = {}) => {
  const { data } = await api.get(API.CATEGORIES.SUBCATEGORIES(categoryId), {
    params: { page: 1, limit: 10, ...params },
  })
  return {
    items: data.data.items ?? [],
    pagination: data.data.pagination ?? {},
  }
}

export const createSubCategory = async ({ categoryId, ...payload }) => {
  const { data } = await api.post(
    API.CATEGORIES.CREATE_SUBCATEGORY(categoryId),
    payload,
  )
  return data.data.category
}




export const updateSubCategory = async ({ id, ...payload }) => {
  const { data } = await api.put(API.CATEGORIES.SUBCATEGORY(id), payload)
  return data.data.category
}

export const updateSubCategoryStatus = async ({ id, isActive }) => {
  const path = isActive
    ? API.CATEGORIES.ACTIVATE_SUBCATEGORY(id)
    : API.CATEGORIES.DEACTIVATE_SUBCATEGORY(id)
  const { data } = await api.patch(path)
  return data.data.category ?? data.data
}

export const deleteSubCategory = async (id) => {
  const { data } = await api.delete(API.CATEGORIES.SUBCATEGORY(id))
  return data.data
}