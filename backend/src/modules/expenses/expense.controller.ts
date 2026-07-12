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
    const { vehicleId } = req.query
    const expenses = await ExpenseService.getAll({
      vehicleId: vehicleId ? String(vehicleId) : undefined,
    })
    res.json({
      status: 'success',
      results: expenses.length,
      data: expenses,
    })
  } catch (error) {
    next(error)
  }
}
