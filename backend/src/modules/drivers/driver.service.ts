import prisma from '../../lib/prisma';
import { CreateDriverInput, UpdateDriverInput } from './driver.validation';
import { AppError } from '../../middleware/errorHandler';
import { DriverStatus } from '@prisma/client';

export class DriverService {
  static async create(input: CreateDriverInput) {
    if (new Date(input.licenseExpiry) < new Date()) {
      throw new AppError('License expiry date must be in the future', 400);
    }

    const existing = await prisma.driver.findUnique({
      where: { licenseNumber: input.licenseNumber },
    });

    if (existing) {
      throw new AppError('A driver with this license number already exists', 400);
    }

    return prisma.driver.create({
      data: input,
    });
  }

  static async getAll(filters: { status?: DriverStatus }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;

    return prisma.driver.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getExpiringDrivers() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const drivers = await prisma.driver.findMany({
      where: {
        licenseExpiry: {
          lte: thirtyDaysFromNow
        },
        status: {
          not: DriverStatus.suspended
        }
      },
      orderBy: { licenseExpiry: 'asc' }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return drivers.map(d => {
      const expiry = new Date(d.licenseExpiry);
      expiry.setHours(0, 0, 0, 0);
      const timeDiff = expiry.getTime() - today.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      return {
        id: d.id,
        name: d.name,
        licenseNumber: d.licenseNumber.substring(0, 4) + '****',
        licenseExpiryDate: d.licenseExpiry,
        daysRemaining
      };
    });
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
    });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    return driver;
  }

  static async update(id: string, input: UpdateDriverInput) {
    if (input.licenseExpiry && new Date(input.licenseExpiry) < new Date()) {
      throw new AppError('License expiry date must be in the future', 400);
    }

    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    // Unique license check
    if (input.licenseNumber && input.licenseNumber !== driver.licenseNumber) {
      const existing = await prisma.driver.findUnique({
        where: { licenseNumber: input.licenseNumber },
      });
      if (existing) {
        throw new AppError('A driver with this license number already exists', 400);
      }
    }

    // Business rule: Prevent setting status from/to invalid transitions if active
    if (input.status && input.status !== driver.status) {
      if (driver.status === DriverStatus.on_trip && input.status !== DriverStatus.available) {
        throw new AppError('Cannot change status of a driver currently on a trip', 400);
      }
    }

    return prisma.driver.update({
      where: { id },
      data: input,
    });
  }

  static async delete(id: string) {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: { trips: { take: 1 } },
    });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    // Business rule: Prevent deletion if driver is active
    if (driver.status === DriverStatus.on_trip) {
      throw new AppError('Cannot delete a driver who is currently on a trip', 400);
    }

    // If driver has trip history, suspend them or handle soft deletion by keeping the record
    if (driver.trips.length > 0) {
      throw new AppError('Cannot delete a driver with existing trip history. Please set status to suspended instead.', 400);
    }

    return prisma.driver.delete({
      where: { id },
    });
  }
}
