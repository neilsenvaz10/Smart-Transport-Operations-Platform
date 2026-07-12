import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import prisma from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import * as bcrypt from 'bcryptjs';
import { sendInvitationEmail } from '../../lib/email';
import { inviteUserSchema, updateUserSchema, resetPasswordSchema, changePasswordSchema } from './user.validation';

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ status: 'success', data: { users } });
  } catch (error) {
    next(error);
  }
};

export const inviteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'fleet_manager') {
      return next(new AppError('Only Fleet Managers can invite users', 403));
    }

    const parseResult = inviteUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(new AppError('Validation failed', 400, parseResult.error.flatten().fieldErrors));
    }

    const { name, email, role, temporaryPassword, phone } = parseResult.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AppError('Email is already in use', 400));
    }

    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        phone,
        passwordHash,
        status: 'pending_invite',
        isFirstLogin: true,
      }
    });

    const emailResult = await sendInvitationEmail(name, email, role, temporaryPassword);

    res.status(201).json({
      status: 'success',
      message: emailResult.success ? 'Invitation sent successfully.' : 'User created, but invitation email could not be sent.',
      data: { user: { id: user.id, email: user.email, status: user.status } }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'fleet_manager') {
      return next(new AppError('Only Fleet Managers can edit users', 403));
    }

    const { id } = req.params;
    const parseResult = updateUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(new AppError('Validation failed', 400, parseResult.error.flatten().fieldErrors));
    }

    const user = await prisma.user.update({
      where: { id },
      data: parseResult.data
    });

    res.json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const suspendUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'fleet_manager') {
      return next(new AppError('Only Fleet Managers can suspend users', 403));
    }

    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) return next(new AppError('User not found', 404));

    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    
    const updated = await prisma.user.update({
      where: { id },
      data: { status: newStatus }
    });

    res.json({ status: 'success', data: { user: updated } });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'fleet_manager') {
      return next(new AppError('Only Fleet Managers can reset passwords', 403));
    }

    const { id } = req.params;
    const parseResult = resetPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(new AppError('Validation failed', 400, parseResult.error.flatten().fieldErrors));
    }

    const passwordHash = await bcrypt.hash(parseResult.data.newPassword, 10);
    
    await prisma.user.update({
      where: { id },
      data: { passwordHash }
    });

    res.json({ status: 'success', message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parseResult = changePasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(new AppError('Validation failed', 400, parseResult.error.flatten().fieldErrors));
    }

    const userId = req.user!.id;
    const { currentPassword, newPassword } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return next(new AppError('User not found', 404));

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return next(new AppError('Incorrect current password', 400));
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { 
        passwordHash, 
        isFirstLogin: false,
        status: user.status === 'pending_invite' ? 'active' : user.status
      }
    });

    res.json({ status: 'success', message: 'Password changed successfully', data: { isFirstLogin: updated.isFirstLogin, status: updated.status } });
  } catch (error) {
    next(error);
  }
};
