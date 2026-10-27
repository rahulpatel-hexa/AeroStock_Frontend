import { z } from 'zod'

// Subcategory / Edit modal ke liye (NameFormModal.jsx)
export const nameSchema = z.object({
  name: z.string().trim().min(2, 'Minimum 2 characters').max(50, 'Maximum 50 characters'),
})

// Add Category page ke liye
export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Minimum 2 characters').max(50, 'Maximum 50 characters'),
  description: z.string().trim().max(200, 'Maximum 200 characters').optional(),
  // sortOrder: z
  //   .string()
  //   .trim()
  //   .optional()
  //   .refine((v) => !v || /^\d+$/.test(v), 'Enter a valid number'),
  isActive: z.boolean(),
})


export const editCategorySchema = z.object({
  name: z.string().trim().min(2, 'Minimum 2 characters').max(50, 'Maximum 50 characters'),
  description: z.string().trim().max(200, 'Maximum 200 characters').optional(),
  isActive: z.boolean(),
})