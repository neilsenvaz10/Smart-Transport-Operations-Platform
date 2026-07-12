import { Response, NextFunction } from 'express'
import { MaintenanceService } from './maintenance.service'
import { createMaintenanceSchema, closeMaintenanceSchema } from './maintenance.validation'
import { AppError } from '../../middleware/errorHandler'
import { AuthRequest } from '../../middleware/auth'

export const createMaintenance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401))

    const parseResult = createMaintenanceSchema.safeParse(req.body)
    if (!parseResult.success) {
      return next(new AppError('Validation failed', 400, parseResult.error.flatten().fieldErrors))
    }

    const log = await MaintenanceService.create(parseResult.data, req.user.id)
    res.status(201).json({
      status: 'success',
      data: log,
    })
  } catch (error) {
    next(error)
  }
}

export const getMaintenances = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await MaintenanceService.getAll()
    res.json({
      status: 'success',
      results: logs.length,
      data: logs,
    })
  } catch (error) {
    next(error)
  }
}

export const getMaintenanceById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const log = await MaintenanceService.getById(req.params.id)
    res.json({
      status: 'success',
      data: log,
    })
  } catch (error) {
    next(error)
  }
}

export const closeMaintenance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parseResult = closeMaintenanceSchema.safeParse(req.body)
    if (!parseResult.success) {
      return next(new AppError('Validation failed', 400, parseResult.error.flatten().fieldErrors))
    }

    const log = await MaintenanceService.close(req.params.id, parseResult.data)
    res.json({
      status: 'success',
      message: 'Maintenance closed successfully',
      data: log,
    })
  } catch (error) {
    next(error)
  }
}
