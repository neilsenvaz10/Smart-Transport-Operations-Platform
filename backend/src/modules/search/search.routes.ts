import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { globalSearch } from './search.controller';

const router = Router();

// Apply auth middleware
router.use(authenticate);

router.get('/', globalSearch);

export default router;
