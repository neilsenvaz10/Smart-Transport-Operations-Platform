import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import prisma from '../../lib/prisma'
import { RegisterInput, LoginInput } from './auth.validation'
import { AppError } from '../../middleware/errorHandler'

const JWT_SECRET = process.env.JWT_SECRET || 'transitops_super_secret_key_12345!'

export class AuthService {
  static async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (existingUser) {
      throw new AppError('A user with this email already exists', 400)
    }

    const passwordHash = await bcrypt.hash(input.password, 10)

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        role: input.role,
        status: 'active',
        isFirstLogin: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '1d' },
    )

    return { user, token }
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (!user) {
      throw new AppError('Invalid email or password', 401)
    }

    if (user.status === 'suspended' || user.status === 'inactive') {
      throw new AppError('Your account is not active. Please contact your Fleet Manager.', 403)
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash)
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, isFirstLogin: user.isFirstLogin },
      JWT_SECRET,
      { expiresIn: '1d' },
    )

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        isFirstLogin: user.isFirstLogin,
      },
      token,
    }
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        isFirstLogin: true,
      },
    });

    if (!user || user.status === 'suspended' || user.status === 'inactive') {
      throw new AppError('User not found or inactive', 401);
    }
    return user;
  }
}
