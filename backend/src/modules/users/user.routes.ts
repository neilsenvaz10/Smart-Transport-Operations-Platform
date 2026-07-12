import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { getUsers, inviteUser, updateUser, suspendUser, resetPassword, changePassword } from './user.controller';

const router = Router();

router.use(authenticate);

router.get('/', getUsers);
router.post('/invite', inviteUser);
router.patch('/change-password', changePassword);
router.patch('/:id', updateUser);
router.patch('/:id/suspend', suspendUser);
router.patch('/:id/reset-password', resetPassword);

export default router;
