import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';

export class AuthService {
  // Register a new user
  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user with role-specific profile
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        // Create creator or professional profile based on role
        ...(data.role === 'CREATOR' && {
          creator: {
            create: {
              companyName: data.companyName,
            },
          },
        }),
        ...(data.role === 'PROFESSIONAL' && {
          professional: {
            create: {
              firstName: data.firstName || '',
              lastName: data.lastName || '',
            },
          },
        }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate JWT token
    const token = this.generateToken(user.id);

    return { user, token };
  }

  // Login user
  async login(data: LoginInput) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Generate JWT token
    const token = this.generateToken(user.id);

    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  // Get user by ID (for JWT verification)
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            companyName: true,
          },
        },
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return user;
  }

  // Generate JWT token
  private generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign({ userId }, secret, { expiresIn } as SignOptions);
  }

  // Verify JWT token
  verifyToken(token: string): { userId: string } {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    try {
      const decoded = jwt.verify(token, secret) as { userId: string };
      return decoded;
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }
}

export const authService = new AuthService();
