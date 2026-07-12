import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { Role } from '@prisma/client';
import {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
} from './driver.controller';

const router = Router();

// Apply auth middleware
router.use(authenticate);

// CRUD
router.get('/', getDrivers); // All roles can read
router.get('/:id', getDriverById); // All roles can read

router.post('/', authorize([Role.fleet_manager, Role.safety_officer]), createDriver);
router.patch('/:id', authorize([Role.fleet_manager, Role.safety_officer]), updateDriver);
router.delete('/:id', authorize([Role.fleet_manager, Role.safety_officer]), deleteDriver);

export default router;
