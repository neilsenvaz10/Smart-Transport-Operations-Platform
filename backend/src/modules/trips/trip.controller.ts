import { Response, NextFunction } from 'express'
import { TripService } from './trip.service'
import { createTripSchema, completeTripSchema } from './trip.validation'
import { AppError } from '../../middleware/errorHandler'
import { AuthRequest } from '../../middleware/auth'
import { TripStatus } from '@prisma/client'

export const createTrip = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401))

    const parseResult = createTripSchema.safeParse(req.body)
    if (!parseResult.success) {
      return next(new AppError('Validation failed', 400, parseResult.error.flatten().fieldErrors))
    }

    const trip = await TripService.create(parseResult.data, req.user.id)
    res.status(201).json({
      status: 'success',
      data: trip,
    })
  } catch (error) {
    next(error)
  }
}

export const getTrips = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query
    const filters = {
      status: status ? (status as TripStatus) : undefined,
    }

    const trips = await TripService.getAll(filters)
    res.json({
      status: 'success',
      results: trips.length,
      data: trips,
    })
  } catch (error) {
    next(error)
  }
}

export const getTripById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const trip = await TripService.getById(req.params.id)
    res.json({
      status: 'success',
      data: trip,
    })
  } catch (error) {
    next(error)
  }
}

export const dispatchTrip = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const trip = await TripService.dispatch(req.params.id)
    res.json({
      status: 'success',
      message: 'Trip dispatched successfully',
      data: trip,
    })
  } catch (error) {
    next(error)
  }
}

export const completeTrip = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401))

    const parseResult = completeTripSchema.safeParse(req.body)
    if (!parseResult.success) {
      return next(new AppError('Validation failed', 400, parseResult.error.flatten().fieldErrors))
    }

    const trip = await TripService.complete(req.params.id, parseResult.data, req.user.id)
    res.json({
      status: 'success',
      message: 'Trip completed successfully',
      data: trip,
    })
  } catch (error) {
    next(error)
  }
}

export const cancelTrip = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const trip = await TripService.cancel(req.params.id)
    res.json({
      status: 'success',
      message: 'Trip cancelled successfully',
      data: trip,
    })
  } catch (error) {
    next(error)
  }
}
