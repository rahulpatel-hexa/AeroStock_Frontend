import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,        // 1 min tak data "fresh" maana jayega
      gcTime: 1000 * 60 * 5,       // unused cache 5 min baad delete
      retry: 1,                    // fail hone par 1 baar retry
      refetchOnWindowFocus: false, // tab switch pe auto refetch band
    },
    mutations: {
      retry: 0,                    // POST/PUT/DELETE dobara auto-try nahi hoga
    },
  },
})