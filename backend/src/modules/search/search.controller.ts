import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';

export const globalSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string;
    
    if (!q || q.length < 2) {
      return res.json({
        status: 'success',
        data: { vehicles: [], drivers: [], trips: [], maintenance: [], fuel: [], expenses: [] }
      });
    }

    const [vehicles, drivers, trips, maintenance, fuel, expenses] = await Promise.all([
      // Vehicles
      prisma.vehicle.findMany({
        where: {
          OR: [
            { nameModel: { contains: q, mode: 'insensitive' } },
            { registrationNumber: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),
      // Drivers
      prisma.driver.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { licenseNumber: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),
      // Trips
      prisma.trip.findMany({
        where: {
          OR: [
            { id: { contains: q, mode: 'insensitive' } },
            { source: { contains: q, mode: 'insensitive' } },
            { destination: { contains: q, mode: 'insensitive' } },
          ]
        },
        take: 5
      }),
      // Maintenance
      prisma.maintenanceLog.findMany({
        where: {
          OR: [
            { description: { contains: q, mode: 'insensitive' } },
          ]
        },
        take: 5
      }),
      // Fuel
      prisma.fuelLog.findMany({
        where: {
          OR: [
            { id: { contains: q, mode: 'insensitive' } },
          ]
        },
        take: 5
      }),
      // Expenses
      prisma.expense.findMany({
        where: {
          OR: [
            { description: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } },
          ]
        },
        take: 5
      }),
    ]);

    res.json({
      status: 'success',
      data: { vehicles, drivers, trips, maintenance, fuel, expenses }
    });
  } catch (error) {
    next(error);
  }
};
