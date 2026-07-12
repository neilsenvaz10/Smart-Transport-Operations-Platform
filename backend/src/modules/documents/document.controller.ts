import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import fs from 'fs';
import path from 'path';
import { DocumentType } from '@prisma/client';

export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vehicleId } = req.params;
    const { type, issueDate, expiryDate } = req.body;
    
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return next(new AppError('Vehicle not found', 404));
    }

    const document = await prisma.vehicleDocument.create({
      data: {
        vehicleId,
        type: type as DocumentType || DocumentType.OTHER,
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        issueDate: issueDate ? new Date(issueDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        uploadedBy: (req as any).user?.id || 'System'
      }
    });

    res.status(201).json({
      status: 'success',
      data: document
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(error);
  }
};

export const getDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vehicleId } = req.params;
    
    const documents = await prisma.vehicleDocument.findMany({
      where: { vehicleId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      status: 'success',
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const document = await prisma.vehicleDocument.findUnique({ where: { id } });
    if (!document) {
      return next(new AppError('Document not found', 404));
    }

    // Extract filename from URL and delete file
    const filename = path.basename(document.fileUrl);
    const filePath = path.join(__dirname, '../../../uploads', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.vehicleDocument.delete({ where: { id } });

    res.json({
      status: 'success',
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
