import { z } from 'zod'

export const createExpenseSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID format'),
  type: z.string().min(2, 'Expense type is required (e.g. Toll, Misc)'),
  amount: z.number().positive('Amount must be a positive number'),
  expenseDate: z
    .string()
    .datetime({ message: 'Invalid expense date format, must be ISO-8601 DateTime' })
    .or(z.date())
    .transform((val) => new Date(val)),
  notes: z.string().optional().nullable(),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
