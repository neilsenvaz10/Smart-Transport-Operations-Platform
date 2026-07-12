import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from './auth.validation';
import { AppError } from '../../middleware/errorHandler';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(new AppError('Validation failed', 400, parseResult.error.flatten().fieldErrors));
    }

    const { user, token } = await AuthService.register(parseResult.data);
    res.status(201).json({
      status: 'success',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(new AppError('Validation failed', 400, parseResult.error.flatten().fieldErrors));
    }

    const { user, token } = await AuthService.login(parseResult.data);
    res.status(200).json({
      status: 'success',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};
