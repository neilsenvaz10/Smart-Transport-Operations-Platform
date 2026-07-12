import prisma from '../../lib/prisma'
import { CreateDriverInput, UpdateDriverInput } from './driver.validation'
import { AppError } from '../../middleware/errorHandler'
import { DriverStatus } from '@prisma/client'

export class DriverService {
  static async create(input: CreateDriverInput) {
    const existing = await prisma.driver.findUnique({
      where: { licenseNumber: input.licenseNumber },
    })

    if (existing) {
      throw new AppError('A driver with this license number already exists', 400)
    }

    return prisma.driver.create({
      data: input,
    })
  }

  static async getAll(filters: { status?: DriverStatus }) {
    const where: any = {}
    if (filters.status) where.status = filters.status

    return prisma.driver.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
  }

  static async getById(id: string) {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        trips: { orderBy: { createdAt: 'desc' } },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    })

    if (!driver) {
      throw new AppError('Driver not found', 404)
    }

    return driver
  }

  static async update(id: string, input: UpdateDriverInput) {
    const driver = await prisma.driver.findUnique({ where: { id } })
    if (!driver) {
      throw new AppError('Driver not found', 404)
    }

    // Unique license check
    if (input.licenseNumber && input.licenseNumber !== driver.licenseNumber) {
      const existing = await prisma.driver.findUnique({
        where: { licenseNumber: input.licenseNumber },
      })
      if (existing) {
        throw new AppError('A driver with this license number already exists', 400)
      }
    }

    // Business rule: Prevent setting status from/to invalid transitions if active
    if (input.status && input.status !== driver.status) {
      if (driver.status === DriverStatus.on_trip && input.status !== DriverStatus.available) {
        throw new AppError('Cannot change status of a driver currently on a trip', 400)
      }
    }

    return prisma.driver.update({
      where: { id },
      data: input,
    })
  }

  static async delete(id: string) {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: { trips: { take: 1 } },
    })

    if (!driver) {
      throw new AppError('Driver not found', 404)
    }

    // Business rule: Prevent deletion if driver is active
    if (driver.status === DriverStatus.on_trip) {
      throw new AppError('Cannot delete a driver who is currently on a trip', 400)
    }

    // If driver has trip history, suspend them or handle soft deletion by keeping the record
    if (driver.trips.length > 0) {
      throw new AppError(
        'Cannot delete a driver with existing trip history. Please set status to suspended instead.',
        400,
      )
    }

    return prisma.driver.delete({
      where: { id },
    })
  }
}
