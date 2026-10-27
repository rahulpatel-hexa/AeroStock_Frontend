import { z } from 'zod'

const price = z
  .string()
  .trim()
  .refine((v) => v === '' || /^\d+(\.\d{1,2})?$/.test(v), 'Enter a valid amount (e.g. 320.00)')

export const inventorySchema = z
  .object({
    trackingType: z.enum(['bulk', 'serialized']),
    description: z.string().trim().min(1, 'Description is required').max(100, 'Max 100 characters'),
    category: z.string().min(1, 'Select a category'),
    subCategory: z.string().optional(),
    manufacturer: z.string().optional(),
    partNumber: z.string().trim().min(1, 'Part number is required'),
    serialNumber: z.string().trim().optional(),
    condition: z.string().min(1, 'Select a condition'),
    storageLocation: z.string().trim().optional(),
    quantity: z
      .string()
      .trim()
      .min(1, 'Quantity is required')
      .refine((v) => /^\d+$/.test(v) && Number(v) > 0, 'Enter a whole number greater than 0'),
    currency: z.string().min(1, 'Select currency'),
    purchasePrice: price,
    askingPrice: price,
    purchaseDate: z
      .string()
      .optional()
      .refine((v) => !v || new Date(v) <= new Date(), 'Date cannot be in the future'),
    notes: z.string().max(300, 'Max 300 characters').optional(),
    attachments: z
      .any()
      .optional()
      .refine(
        (files) => Array.from(files ?? []).every((f) => f.size <= 5 * 1024 * 1024),
        'Each file must be under 5MB'
      ),
  })
  .superRefine((data, ctx) => {
    if (data.trackingType === 'serialized' && data.quantity !== '1') {
      ctx.addIssue({
        code: 'custom',
        path: ['quantity'],
        message: 'Serialized item quantity must be 1',
      })
    }
  })