import { Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'
import { Role } from '@prisma/client'
import { AppError } from './errorHandler'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: Role
    name: string
  }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication token missing or invalid', 401))
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as {
      id: string
      email: string
      role: Role
      name: string
    }

    req.user = decoded
    next()
  } catch (_error) {
    return next(new AppError('Invalid or expired authentication token', 401))
  }
}
