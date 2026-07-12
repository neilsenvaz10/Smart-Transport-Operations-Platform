import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { Role } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadDocument, getDocuments, deleteDocument } from './document.controller';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(authenticate);

// We attach these routes to vehicles prefix in index.ts:
// app.use('/api/vehicles', documentRoutes);
// So the path here will be /:vehicleId/documents
router.post(
  '/:vehicleId/documents', 
  authorize([Role.fleet_manager, Role.admin]), 
  upload.single('file'), 
  uploadDocument
);

router.get(
  '/:vehicleId/documents', 
  getDocuments // all authenticated users can view
);

// We also need a direct /documents/:id route for deletion
// Or we can just do /:vehicleId/documents/:id, let's keep it simple:
router.delete(
  '/documents/:id',
  authorize([Role.fleet_manager, Role.admin]),
  deleteDocument
);

export default router;
