import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Minimum 2 characters').max(150, 'Maximum 150 characters'),
  email: z.string().trim().email('Enter a valid email'),
})

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
