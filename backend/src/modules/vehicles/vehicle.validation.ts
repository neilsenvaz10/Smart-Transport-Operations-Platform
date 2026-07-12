import { z } from 'zod';
import { VehicleStatus } from '@prisma/client';

export const createVehicleSchema = z.object({
  registrationNumber: z.string().min(3, 'Registration number must be at least 3 characters long'),
  nameModel: z.string().min(2, 'Name/Model must be at least 2 characters long'),
  type: z.string().min(2, 'Vehicle type is required'),
  maxLoadCapacity: z.number().positive('Max load capacity must be a positive number'),
  odometer: z.number().nonnegative('Odometer reading cannot be negative').default(0),
  acquisitionCost: z.number().positive('Acquisition cost must be a positive number'),
  status: z.nativeEnum(VehicleStatus).default(VehicleStatus.available),
  region: z.string().optional().nullable(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
