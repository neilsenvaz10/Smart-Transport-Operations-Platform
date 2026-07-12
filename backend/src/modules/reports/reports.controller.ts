import { Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { AuthRequest } from '../../middleware/auth';

export const getDashboardKPIs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const kpis = await ReportsService.getDashboardKPIs();
    res.json({
      status: 'success',
      data: kpis,
    });
  } catch (error) {
    next(error);
  }
};

export const getVehicleReports = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const metrics = await ReportsService.getVehicleMetrics();
    res.json({
      status: 'success',
      results: metrics.length,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

export const exportCSVReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const csv = await ReportsService.generateCSVReport();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transitops_fleet_report.csv');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
