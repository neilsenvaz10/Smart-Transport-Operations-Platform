import { Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { AuthRequest } from '../../middleware/auth';

export const getDashboardKPIs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await ReportsService.getDashboardKPIs();
    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const getVehicleReports = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await ReportsService.getVehicleMetrics();
    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const exportCSVReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const csv = await ReportsService.generateCSVReport();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fleet-report.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

export const getFuelEfficiency = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const metrics = await ReportsService.getVehicleMetrics();
    const data = metrics.map(m => ({ registrationNumber: m.registrationNumber, fuelEfficiency: m.fuelEfficiency }));
    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const getFleetUtilization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const kpis = await ReportsService.getDashboardKPIs();
    const data = { fleetUtilization: kpis.fleetUtilization };
    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const getOperationalCost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const metrics = await ReportsService.getVehicleMetrics();
    const data = metrics.map(m => ({ registrationNumber: m.registrationNumber, totalOperationalCost: m.totalOperationalCost }));
    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const getVehicleRoi = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const metrics = await ReportsService.getVehicleMetrics();
    const data = metrics.map(m => ({ registrationNumber: m.registrationNumber, roi: m.roi }));
    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};
