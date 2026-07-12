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

  static async getAll(filters: { 
    vehicleId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const where: any = {}
    if (filters.vehicleId) where.vehicleId = filters.vehicleId
    
    if (filters.search) {
      where.OR = [
        { vehicle: { nameModel: { contains: filters.search, mode: 'insensitive' } } },
        { vehicle: { registrationNumber: { contains: filters.search, mode: 'insensitive' } } }
      ]
    }

    const orderBy: any = {}
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'asc'
    } else {
      orderBy.logDate = 'desc'
    }

    const limit = filters.limit ? Number(filters.limit) : 50;
    const page = filters.page ? Number(filters.page) : 1;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.fuelLog.findMany({
        where,
        include: { vehicle: true, trip: true },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.fuelLog.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }
}
