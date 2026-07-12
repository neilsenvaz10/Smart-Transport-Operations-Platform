import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { Role } from '@prisma/client';
import {
  createTrip,
  getTrips,
  getTripById,
  dispatchTrip,
  completeTrip,
  cancelTrip,
} from './trip.controller';

const router = Router();

// Apply auth middleware to all endpoints
router.use(authenticate);

// CRUD / Lifecycle
router.get('/', getTrips); // All roles can read
router.get('/:id', getTripById); // All roles can read

router.post('/', authorize([Role.fleet_manager, Role.driver]), createTrip);
router.patch('/:id/dispatch', authorize([Role.fleet_manager, Role.driver]), dispatchTrip);
router.patch('/:id/complete', authorize([Role.fleet_manager, Role.driver]), completeTrip);
router.patch('/:id/cancel', authorize([Role.fleet_manager, Role.driver]), cancelTrip);

export default router;
