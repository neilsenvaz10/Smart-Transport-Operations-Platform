import { z } from 'zod';
import { DriverStatus } from '@prisma/client';

export const createDriverSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  licenseNumber: z.string().min(3, 'License number must be at least 3 characters long'),
  licenseCategory: z.string().min(1, 'License category is required'),
  licenseExpiry: z.string().datetime({ message: 'Invalid expiry date format, must be ISO-8601 DateTime' })
    .or(z.date())
    .transform((val) => new Date(val)),
  contactNumber: z.string().min(5, 'Contact number is required'),
  safetyScore: z.number().min(0).max(100).default(100.0),
  status: z.nativeEnum(DriverStatus).default(DriverStatus.available),
  userId: z.string().uuid('Invalid user ID format').optional().nullable(),
});

export const updateDriverSchema = createDriverSchema.partial();

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
