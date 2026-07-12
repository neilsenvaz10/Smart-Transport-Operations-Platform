import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID format'),
  description: z.string().min(3, 'Description must be at least 3 characters long'),
  cost: z.number().nonnegative('Cost cannot be negative').default(0.0),
});

export const closeMaintenanceSchema = z.object({
  cost: z.number().nonnegative('Final cost cannot be negative'),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type CloseMaintenanceInput = z.infer<typeof closeMaintenanceSchema>;
