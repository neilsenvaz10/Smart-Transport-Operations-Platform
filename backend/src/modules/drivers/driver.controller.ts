import { Request, Response, NextFunction } from 'express'
import { DriverService } from './driver.service'
import { createDriverSchema, updateDriverSchema } from './driver.validation'
import { AppError } from '../../middleware/errorHandler'
import { DriverStatus } from '@prisma/client'

export const createDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = createDriverSchema.safeParse(req.body)
    if (!parseResult.success) {
      return next(new AppError('Validation failed', 400, parseResult.error.flatten().fieldErrors))
    }

    const driver = await DriverService.create(parseResult.data)
    res.status(201).json({
      status: 'success',
      data: driver,
    })
  } catch (error) {
    next(error)
  }
}

export const getDrivers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query
    const filters = {
      status: status ? (status as DriverStatus) : undefined,
    }

    const drivers = await DriverService.getAll(filters)
    res.json({
      status: 'success',
      results: drivers.length,
      data: drivers,
    })
  } catch (error) {
    next(error)
  }
}

export const getDriverById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await DriverService.getById(req.params.id)
    res.json({
      status: 'success',
      data: driver,
    })
  } catch (error) {
    next(error)
  }
}

export const updateDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = updateDriverSchema.safeParse(req.body)
    if (!parseResult.success) {
      return next(new AppError('Validation failed', 400, parseResult.error.flatten().fieldErrors))
    }

    const driver = await DriverService.update(req.params.id, parseResult.data)
    res.json({
      status: 'success',
      data: driver,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await DriverService.delete(req.params.id)
    res.json({
      status: 'success',
      message: 'Driver deleted successfully',
      data: driver,
    })
  } catch (error) {
    next(error)
  }
}
