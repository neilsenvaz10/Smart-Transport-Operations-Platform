import { z } from 'zod';

export const inviteUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['fleet_manager', 'driver', 'safety_officer', 'financial_analyst']),
  temporaryPassword: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['fleet_manager', 'driver', 'safety_officer', 'financial_analyst']).optional(),
  phone: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});
