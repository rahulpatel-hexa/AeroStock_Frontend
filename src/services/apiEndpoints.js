const API = {
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_ACTIVITY: '/dashboard/recent-activity',
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`,
    ACTIVATE: (id) => `/users/${id}/activate`,
    DEACTIVATE: (id) => `/users/${id}/deactivate`,
  },
  CATEGORIES: {
    LIST: '/categories',
    ALL: '/categories/all',
    DETAIL: (id) => `/categories/${id}`,
    CREATE: '/categories',
    UPDATE: (id) => `/categories/${id}`,
    ACTIVATE: (id) => `/categories/${id}/activate`,
    DEACTIVATE: (id) => `/categories/${id}/deactivate`,
    SUBCATEGORIES: (categoryId) => `/categories/${categoryId}/subcategories`,
    ALL_SUBCATEGORIES: (categoryId) =>
      `/categories/${categoryId}/subcategories/all`,
    CREATE_SUBCATEGORY: (categoryId) =>
      `/categories/${categoryId}/subcategories`,
    SUBCATEGORY: (id) => `/subcategories/${id}`,
    ACTIVATE_SUBCATEGORY: (id) => `/subcategories/${id}/activate`,
    DEACTIVATE_SUBCATEGORY: (id) => `/subcategories/${id}/deactivate`,
  },
  INVENTORY_ITEMS: {
    LIST: '/inventory-items',
    DETAIL: (id) => `/inventory-items/${id}`,
    CREATE: '/inventory-items',
    IMPORT: '/inventory-items/import',
    UPDATE: (id) => `/inventory-items/${id}`,
    ACTIVATE: (id) => `/inventory-items/${id}/activate`,
    DEACTIVATE: (id) => `/inventory-items/${id}/deactivate`,
    CREATE_STOCK_MOVEMENT: (id) =>
      `/inventory-items/${id}/stock-movement`,
    STOCK_MOVEMENTS: (id) => `/inventory-items/${id}/stock-movements`,
  },
  STOCK_MOVEMENTS: {
    LIST: '/stock-movements',
  },
  STOCK_HISTORY: {
    EXPORT: '/stock-history/export',
  },
}

export default API