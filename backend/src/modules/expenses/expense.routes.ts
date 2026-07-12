import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { Role } from '@prisma/client';
import { createExpense, getExpenses } from './expense.controller';

const router = Router();

// Apply auth middleware
router.use(authenticate);

// CRUD
router.get('/', getExpenses); // All roles can read
router.post('/', authorize([Role.fleet_manager, Role.driver]), createExpense); // Fleet Manager & Driver can log

export default router;
