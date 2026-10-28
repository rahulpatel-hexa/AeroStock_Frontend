import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Minimum 2 characters').max(100, 'Maximum 100 characters'),
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
  isActive: z.boolean(),
})

export const editUserSchema = z.object({
  name: z.string().trim().min(2, 'Minimum 2 characters').max(100, 'Maximum 100 characters'),
  email: z.string().trim().email('Enter a valid email'),
  password: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 8, 'Minimum 8 characters'),
  isActive: z.boolean(),
})
