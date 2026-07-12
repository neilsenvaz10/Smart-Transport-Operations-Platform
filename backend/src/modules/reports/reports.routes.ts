import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/rbac'
import { Role } from '@prisma/client'
import { getDashboardKPIs, getVehicleReports, exportCSVReport, exportPDFReport } from './reports.controller'

const router = Router()

// Apply auth middleware
router.use(authenticate)

// Routes
router.get('/kpis', getDashboardKPIs) // All authenticated roles can read KPIs

// Reports are restricted to Fleet Managers and Financial Analysts
router.get('/vehicles', authorize([Role.fleet_manager, Role.financial_analyst]), getVehicleReports)
router.get('/export', authorize([Role.fleet_manager, Role.financial_analyst]), exportCSVReport)
router.get('/export/pdf', authorize([Role.fleet_manager, Role.financial_analyst]), exportPDFReport)

export default router
