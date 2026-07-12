import { Response, NextFunction } from 'express';
import { FuelService } from './fuel.service';
import { createFuelLogSchema } from './fuel.validation';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';

export const createFuelLog = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    const parseResult = createFuelLogSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(new AppError('Validation failed', 400, parseResult.error.flatten().fieldErrors));
    }

    const log = await FuelService.create(parseResult.data, req.user.id);
    res.status(201).json({
      status: 'success',
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

export const getFuelLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { vehicleId } = req.query;
    const logs = await FuelService.getAll({
      vehicleId: vehicleId ? String(vehicleId) : undefined,
    });
    res.json({
      status: 'success',
      results: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
