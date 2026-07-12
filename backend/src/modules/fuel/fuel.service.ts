import prisma from '../../lib/prisma'
import { CreateFuelLogInput } from './fuel.validation'
import { AppError } from '../../middleware/errorHandler'

export class FuelService {
  static async create(input: CreateFuelLogInput, userId: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } })
    if (!vehicle) throw new AppError('Vehicle not found', 404)

    if (input.tripId) {
      const trip = await prisma.trip.findUnique({ where: { id: input.tripId } })
      if (!trip) throw new AppError('Trip not found', 404)
    }

    return prisma.fuelLog.create({
      data: {
        vehicleId: input.vehicleId,
        tripId: input.tripId,
        liters: input.liters,
        cost: input.cost,
        logDate: input.logDate,
        createdById: userId,
      },
      include: { vehicle: true, trip: true },
    })
  }

  static async getAll(filters: { vehicleId?: string }) {
    const where: any = {}
    if (filters.vehicleId) where.vehicleId = filters.vehicleId

    return prisma.fuelLog.findMany({
      where,
      include: { vehicle: true, trip: true },
      orderBy: { logDate: 'desc' },
    })
  }
}
