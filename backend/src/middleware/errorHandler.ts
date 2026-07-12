import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  public statusCode: number
  public errors?: unknown

  constructor(message: string, statusCode: number, errors?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500
  const message = err.message || 'Internal Server Error'

  res.status(statusCode).json({
    status: 'error',
    message,
    errors: err instanceof AppError ? err.errors : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  })
}
