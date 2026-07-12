import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/rbac'
import { Role } from '@prisma/client'
import {
  createMaintenance,
  getMaintenances,
  getMaintenanceById,
  closeMaintenance,
} from './maintenance.controller'

const router = Router()

// Apply auth middleware
router.use(authenticate)

// CRUD
router.get('/', getMaintenances)
router.get('/:id', getMaintenanceById)

router.post('/', authorize([Role.fleet_manager]), createMaintenance)
router.patch('/:id/close', authorize([Role.fleet_manager]), closeMaintenance)

export default router
