import prisma from '../../lib/prisma'
import { CreateTripInput, CompleteTripInput } from './trip.validation'
import { AppError } from '../../middleware/errorHandler'
import { TripStatus, VehicleStatus, DriverStatus } from '@prisma/client'

export class TripService {
  static async create(input: CreateTripInput, userId: string) {
    // 1. Fetch vehicle and driver
    const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } })
    if (!vehicle) throw new AppError('Vehicle not found', 404)

    const driver = await prisma.driver.findUnique({ where: { id: input.driverId } })
    if (!driver) throw new AppError('Driver not found', 404)

    // 2. Business rule: Cargo weight cannot exceed vehicle capacity
    if (input.cargoWeight > vehicle.maxLoadCapacity) {
      throw new AppError(
        `Cargo weight (${input.cargoWeight} kg) exceeds vehicle max capacity (${vehicle.maxLoadCapacity} kg)`,
        400,
      )
    }

    // 3. Business rule: Driver license must not be expired
    if (new Date(driver.licenseExpiry) <= new Date()) {
      throw new AppError('Cannot assign a driver with an expired license', 400)
    }

    // 4. Business rule: Vehicle and driver status must be available
    if (vehicle.status !== VehicleStatus.available) {
      throw new AppError(
        `Selected vehicle is not available (current status: ${vehicle.status})`,
        400,
      )
    }
    if (driver.status !== DriverStatus.available) {
      throw new AppError(`Selected driver is not available (current status: ${driver.status})`, 400)
    }

    // 5. Create trip in DRAFT status
    return prisma.trip.create({
      data: {
        source: input.source,
        destination: input.destination,
        cargoWeight: input.cargoWeight,
        plannedDistance: input.plannedDistance,
        vehicleId: input.vehicleId,
        driverId: input.driverId,
        createdById: userId,
        status: TripStatus.draft,
      },
      include: {
        vehicle: true,
        driver: true,
      },
    })
  }

  static async getAll(filters: { 
    status?: TripStatus;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const where: any = {}
    if (filters.status) where.status = filters.status
    
    if (filters.search) {
      where.OR = [
        { source: { contains: filters.search, mode: 'insensitive' } },
        { destination: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    const orderBy: any = {}
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'asc'
    } else {
      orderBy.createdAt = 'desc'
    }

    const limit = filters.limit ? Number(filters.limit) : 50;
    const page = filters.page ? Number(filters.page) : 1;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: {
          vehicle: true,
          driver: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.trip.count({ where })
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

  static async getById(id: string) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
        createdBy: {
          select: { id: true, email: true, name: true, role: true },
        },
      },
    })

    if (!trip) throw new AppError('Trip not found', 404)
    return trip
  }

  static async dispatch(id: string) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    })

    if (!trip) throw new AppError('Trip not found', 404)
    if (trip.status !== TripStatus.draft) {
      throw new AppError(`Only draft trips can be dispatched. Current status: ${trip.status}`, 400)
    }

    // Re-verify driver license is not expired
    if (new Date(trip.driver.licenseExpiry) <= new Date()) {
      throw new AppError('Cannot dispatch: driver license has expired', 400)
    }

    // Re-verify availability
    if (trip.vehicle.status !== VehicleStatus.available) {
      throw new AppError('Cannot dispatch: vehicle is no longer available', 400)
    }
    if (trip.driver.status !== DriverStatus.available) {
      throw new AppError('Cannot dispatch: driver is no longer available', 400)
    }

    // Transaction to update Trip, Vehicle, and Driver statuses
    return prisma.$transaction(async (tx) => {
      // Set statuses
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: TripStatus.dispatched,
          dispatchedAt: new Date(),
        },
        include: { vehicle: true, driver: true },
      })

      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: VehicleStatus.on_trip },
      })

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.on_trip },
      })

      return updatedTrip
    })
  }

  static async complete(id: string, input: CompleteTripInput, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    })

    if (!trip) throw new AppError('Trip not found', 404)
    if (trip.status !== TripStatus.dispatched) {
      throw new AppError(
        `Only dispatched trips can be completed. Current status: ${trip.status}`,
        400,
      )
    }

    // Validate odometer
    if (input.finalOdometer < trip.vehicle.odometer) {
      throw new AppError(
        `Final odometer (${input.finalOdometer} km) cannot be less than vehicle's current odometer (${trip.vehicle.odometer} km)`,
        400,
      )
    }

    const fuelPricePerLiter = 1.35 // Default constant fuel price for calculations
    const fuelCost = input.fuelConsumed * fuelPricePerLiter

    return prisma.$transaction(async (tx) => {
      // 1. Update Trip details
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: TripStatus.completed,
          finalOdometer: input.finalOdometer,
          fuelConsumed: input.fuelConsumed,
          revenue: input.revenue,
          completedAt: new Date(),
        },
        include: { vehicle: true, driver: true },
      })

      // 2. Update Vehicle odometer and release status
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          odometer: input.finalOdometer,
          status: VehicleStatus.available,
        },
      })

      // 3. Release Driver status
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.available },
      })

      // 4. Create Fuel Log automatically
      await tx.fuelLog.create({
        data: {
          vehicleId: trip.vehicleId,
          tripId: trip.id,
          liters: input.fuelConsumed,
          cost: fuelCost,
          logDate: new Date(),
          createdById: userId,
        },
      })

      return updatedTrip
    })
  }

  static async cancel(id: string) {
    const trip = await prisma.trip.findUnique({
      where: { id },
    })

    if (!trip) throw new AppError('Trip not found', 404)
    if (trip.status !== TripStatus.draft && trip.status !== TripStatus.dispatched) {
      throw new AppError(`Cannot cancel a trip that is already ${trip.status}`, 400)
    }

    const wasDispatched = trip.status === TripStatus.dispatched

    return prisma.$transaction(async (tx) => {
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: TripStatus.cancelled,
          cancelledAt: new Date(),
        },
        include: { vehicle: true, driver: true },
      })

      // Release driver and vehicle if they were dispatched
      if (wasDispatched) {
        await tx.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: VehicleStatus.available },
        })

        await tx.driver.update({
          where: { id: trip.driverId },
          data: { status: DriverStatus.available },
        })
      }

      return updatedTrip
    })
  }
}
