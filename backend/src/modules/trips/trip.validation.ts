import { z } from 'zod'

export const createTripSchema = z.object({
  source: z.string().min(2, 'Source location must be at least 2 characters long'),
  destination: z.string().min(2, 'Destination location must be at least 2 characters long'),
  cargoWeight: z.number().positive('Cargo weight must be a positive number'),
  plannedDistance: z.number().positive('Planned distance must be a positive number'),
  vehicleId: z.string().uuid('Invalid vehicle ID format'),
  driverId: z.string().uuid('Invalid driver ID format'),
})

export const completeTripSchema = z.object({
  finalOdometer: z.number().positive('Final odometer reading must be a positive number'),
  fuelConsumed: z.number().positive('Fuel consumed must be a positive number'),
  revenue: z.number().nonnegative('Revenue must be a non-negative number'),
})

export type CreateTripInput = z.infer<typeof createTripSchema>
export type CompleteTripInput = z.infer<typeof completeTripSchema>
