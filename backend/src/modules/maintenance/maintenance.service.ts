import prisma from '../../lib/prisma'
import { CreateMaintenanceInput, CloseMaintenanceInput } from './maintenance.validation'
import { AppError } from '../../middleware/errorHandler'
import { MaintenanceStatus, VehicleStatus } from '@prisma/client'

export class MaintenanceService {
  static async create(input: CreateMaintenanceInput, userId: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } })
    if (!vehicle) throw new AppError('Vehicle not found', 404)

    if (vehicle.status === VehicleStatus.on_trip) {
      throw new AppError('Cannot send vehicle to maintenance while it is currently on a trip', 400)
    }
    if (vehicle.status === VehicleStatus.retired) {
      throw new AppError('Cannot log maintenance for a retired vehicle', 400)
    }

    return prisma.$transaction(async (tx) => {
      // 1. Create Maintenance Log
      const log = await tx.maintenanceLog.create({
        data: {
          vehicleId: input.vehicleId,
          description: input.description,
          cost: input.cost,
          status: MaintenanceStatus.active,
          createdById: userId,
        },
      })

      // 2. Set vehicle status to in_shop
      await tx.vehicle.update({
        where: { id: input.vehicleId },
        data: { status: VehicleStatus.in_shop },
      })

      return log
    })
  }

  static async getAll() {
    return prisma.maintenanceLog.findMany({
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async getById(id: string) {
    const log = await prisma.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    })
    if (!log) throw new AppError('Maintenance log not found', 404)
    return log
  }

  static async close(id: string, input: CloseMaintenanceInput) {
    const log = await prisma.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    })

    if (!log) throw new AppError('Maintenance log not found', 404)
    if (log.status === MaintenanceStatus.closed) {
      throw new AppError('Maintenance log is already closed', 400)
    }

    return prisma.$transaction(async (tx) => {
      // 1. Close the maintenance log
      const updatedLog = await tx.maintenanceLog.update({
        where: { id },
        data: {
          status: MaintenanceStatus.closed,
          closedAt: new Date(),
          cost: input.cost,
        },
      })

      // 2. Restore vehicle status to available (unless retired)
      if (log.vehicle.status !== VehicleStatus.retired) {
        await tx.vehicle.update({
          where: { id: log.vehicleId },
          data: { status: VehicleStatus.available },
        })
      }

      return updatedLog
    })
  }
}
