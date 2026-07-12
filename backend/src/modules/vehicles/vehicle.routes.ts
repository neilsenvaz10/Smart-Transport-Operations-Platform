import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { Role } from '@prisma/client';
import {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from './vehicle.controller';

const router = Router();

// Apply auth middleware to all routes in this module
router.use(authenticate);

// CRUD
router.get('/', getVehicles); // All roles can read
router.get('/:id', getVehicleById); // All roles can read

router.post('/', authorize([Role.fleet_manager]), createVehicle); // Only Fleet Manager can create
router.patch('/:id', authorize([Role.fleet_manager]), updateVehicle); // Only Fleet Manager can update
router.delete('/:id', authorize([Role.fleet_manager]), deleteVehicle); // Only Fleet Manager can delete

export default router;
