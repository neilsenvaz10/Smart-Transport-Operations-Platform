import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from './auth';
import { AppError } from './errorHandler';

export const authorize = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Access forbidden: insufficient permissions', 403));
    }

    next();
  };
};
