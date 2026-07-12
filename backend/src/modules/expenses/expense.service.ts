import prisma from '../../lib/prisma'
import { CreateExpenseInput } from './expense.validation'
import { AppError } from '../../middleware/errorHandler'

export class ExpenseService {
  static async create(input: CreateExpenseInput, userId: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } })
    if (!vehicle) throw new AppError('Vehicle not found', 404)

    return prisma.expense.create({
      data: {
        vehicleId: input.vehicleId,
        type: input.type,
        amount: input.amount,
        expenseDate: input.expenseDate,
        notes: input.notes,
        createdById: userId,
      },
      include: { vehicle: true },
    })
  }

  static async getAll(filters: { 
    vehicleId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const where: any = {}
    if (filters.vehicleId) where.vehicleId = filters.vehicleId
    
    if (filters.search) {
      where.OR = [
        { notes: { contains: filters.search, mode: 'insensitive' } },
        { type: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    const orderBy: any = {}
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'asc'
    } else {
      orderBy.expenseDate = 'desc'
    }

    const limit = filters.limit ? Number(filters.limit) : 50;
    const page = filters.page ? Number(filters.page) : 1;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: { vehicle: true },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.expense.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }
}
