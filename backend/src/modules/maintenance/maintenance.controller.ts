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
    const { search, sortBy, sortOrder, page, limit } = req.query
    const filters = {
      search: search ? String(search) : undefined,
      sortBy: sortBy ? String(sortBy) : undefined,
      sortOrder: sortOrder === 'desc' ? 'desc' as const : 'asc' as const,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    }

    const result = await MaintenanceService.getAll(filters)
    res.json({
      status: 'success',
      results: result.data.length,
      data: result.data,
      meta: result.meta,
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
