import prisma from '../../lib/prisma';
import { CreateExpenseInput } from './expense.validation';
import { AppError } from '../../middleware/errorHandler';

export class ExpenseService {
  static async create(input: CreateExpenseInput, userId: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } });
    if (!vehicle) throw new AppError('Vehicle not found', 404);

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
    });
  }

  static async getAll(filters: { vehicleId?: string }) {
    const where: any = {};
    if (filters.vehicleId) where.vehicleId = filters.vehicleId;

    return prisma.expense.findMany({
      where,
      include: { vehicle: true },
      orderBy: { expenseDate: 'desc' },
    });
  }
}
