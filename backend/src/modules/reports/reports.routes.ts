import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { Role } from '@prisma/client';
import {
  getDashboardKPIs,
  getVehicleReports,
  exportCSVReport,
  getFuelEfficiency,
  getFleetUtilization,
  getOperationalCost,
  getVehicleRoi,
} from './reports.controller';

const router = Router();

// Apply auth middleware
router.use(authenticate);

// KPIs – all authenticated roles can read
router.get('/kpis', getDashboardKPIs);

// Full vehicle metrics – fleet_manager & financial_analyst only
router.get(
  '/vehicles',
  authorize([Role.fleet_manager, Role.financial_analyst]),
  getVehicleReports
);

// CSV export
router.get(
  '/export.csv',
  authorize([Role.fleet_manager, Role.financial_analyst]),
  exportCSVReport
);

// Individual metric endpoints
router.get(
  '/fuel-efficiency',
  authorize([Role.fleet_manager, Role.financial_analyst]),
  getFuelEfficiency
);
router.get(
  '/fleet-utilization',
  authorize([Role.fleet_manager, Role.financial_analyst]),
  getFleetUtilization
);
router.get(
  '/operational-cost',
  authorize([Role.fleet_manager, Role.financial_analyst]),
  getOperationalCost
);
router.get(
  '/vehicle-roi',
  authorize([Role.fleet_manager, Role.financial_analyst]),
  getVehicleRoi
);

export default router;
