import { Request, Response, NextFunction } from 'express';
import { VehicleService } from './vehicle.service';
import { createVehicleSchema, updateVehicleSchema } from './vehicle.validation';
import { AppError } from '../../middleware/errorHandler';
import { VehicleStatus } from '@prisma/client';

export const createVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = createVehicleSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(new AppError('Validation failed', 400, parseResult.error.flatten().fieldErrors));
    }

    const vehicle = await VehicleService.create(parseResult.data);
    res.status(201).json({
      status: 'success',
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const getVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, type, region } = req.query;
    const filters = {
      status: status ? (status as VehicleStatus) : undefined,
      type: type ? String(type) : undefined,
      region: region ? String(region) : undefined,
    };

    const vehicles = await VehicleService.getAll(filters);
    res.json({
      status: 'success',
      results: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};

export const getVehicleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicle = await VehicleService.getById(req.params.id);
    res.json({
      status: 'success',
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = updateVehicleSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(new AppError('Validation failed', 400, parseResult.error.flatten().fieldErrors));
    }

    const vehicle = await VehicleService.update(req.params.id, parseResult.data);
    res.json({
      status: 'success',
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await VehicleService.delete(req.params.id);
    res.json({
      status: 'success',
      message: result.status === VehicleStatus.retired 
        ? 'Vehicle has been retired due to existing history' 
        : 'Vehicle deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
