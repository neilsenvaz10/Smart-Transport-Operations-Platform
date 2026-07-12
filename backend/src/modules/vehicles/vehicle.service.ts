import prisma from '../../lib/prisma';
import { CreateVehicleInput, UpdateVehicleInput } from './vehicle.validation';
import { AppError } from '../../middleware/errorHandler';
import { VehicleStatus } from '@prisma/client';

export class VehicleService {
  static async create(input: CreateVehicleInput) {
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNumber: input.registrationNumber },
    });

    if (existing) {
      throw new AppError('A vehicle with this registration number already exists', 400);
    }

    return prisma.vehicle.create({
      data: input,
    });
  }

  static async getAll(filters: { status?: VehicleStatus; type?: string; region?: string }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = { contains: filters.type, mode: 'insensitive' };
    if (filters.region) where.region = { contains: filters.region, mode: 'insensitive' };

    return prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        maintenances: { orderBy: { openedAt: 'desc' } },
        expenses: { orderBy: { expenseDate: 'desc' } },
        fuelLogs: { orderBy: { logDate: 'desc' } },
      },
    });

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    return vehicle;
  }

  static async update(id: string, input: UpdateVehicleInput) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    // Enforce unique registration number
    if (input.registrationNumber && input.registrationNumber !== vehicle.registrationNumber) {
      const existing = await prisma.vehicle.findUnique({
        where: { registrationNumber: input.registrationNumber },
      });
      if (existing) {
        throw new AppError('A vehicle with this registration number already exists', 400);
      }
    }

    // Business rule: Prevent setting status from/to invalid transitions if active
    if (input.status && input.status !== vehicle.status) {
      if (vehicle.status === VehicleStatus.on_trip && input.status !== VehicleStatus.available) {
        throw new AppError('Cannot change status of a vehicle currently on a trip', 400);
      }
    }

    return prisma.vehicle.update({
      where: { id },
      data: input,
    });
  }

  static async delete(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: { trips: { take: 1 } },
    });

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    // Business rule: Prevent deletion/retirement if vehicle is active
    if (vehicle.status === VehicleStatus.on_trip) {
      throw new AppError('Cannot delete or retire a vehicle that is currently on a trip', 400);
    }
    if (vehicle.status === VehicleStatus.in_shop) {
      throw new AppError('Cannot delete or retire a vehicle that is currently in maintenance', 400);
    }

    // If it has trip history, set it to Retired instead of hard deleting to preserve referential integrity
    if (vehicle.trips.length > 0) {
      return prisma.vehicle.update({
        where: { id },
        data: { status: VehicleStatus.retired },
      });
    }

    return prisma.vehicle.delete({
      where: { id },
    });
  }
}
