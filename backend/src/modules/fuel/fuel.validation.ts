import { z } from 'zod';

export const createFuelLogSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID format'),
  tripId: z.string().uuid('Invalid trip ID format').optional().nullable(),
  liters: z.number().positive('Liters must be a positive number'),
  cost: z.number().positive('Cost must be a positive number'),
  logDate: z.string().datetime({ message: 'Invalid log date format, must be ISO-8601 DateTime' })
    .or(z.date())
    .transform((val) => new Date(val)),
});

export type CreateFuelLogInput = z.infer<typeof createFuelLogSchema>;
