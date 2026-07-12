import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { Role } from '@prisma/client';
import { createFuelLog, getFuelLogs } from './fuel.controller';

const router = Router();

// Apply auth middleware
router.use(authenticate);

// CRUD
router.get('/', getFuelLogs); // All roles can read
router.post('/', authorize([Role.fleet_manager, Role.driver]), createFuelLog); // Fleet Manager & Driver can log

export default router;
