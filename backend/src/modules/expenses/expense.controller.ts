import { Response, NextFunction } from 'express'
import { ExpenseService } from './expense.service'
import { createExpenseSchema } from './expense.validation'
import { AppError } from '../../middleware/errorHandler'
import { AuthRequest } from '../../middleware/auth'

export const createExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401))

    const parseResult = createExpenseSchema.safeParse(req.body)
    if (!parseResult.success) {
      return next(new AppError('Validation failed', 400, parseResult.error.flatten().fieldErrors))
    }

    const expense = await ExpenseService.create(parseResult.data, req.user.id)
    res.status(201).json({
      status: 'success',
      data: expense,
    })
  } catch (error) {
    next(error)
  }
}

export const getExpenses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { vehicleId, search, sortBy, sortOrder, page, limit } = req.query
    
    const result = await ExpenseService.getAll({
      vehicleId: vehicleId ? String(vehicleId) : undefined,
      search: search ? String(search) : undefined,
      sortBy: sortBy ? String(sortBy) : undefined,
      sortOrder: sortOrder === 'desc' ? 'desc' as const : 'asc' as const,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    
    res.json({
      status: 'success',
      results: result.data.length,
      data: result.data,
      meta: result.meta,
    })
  } catch (error) {
    next(error)
  }
}
