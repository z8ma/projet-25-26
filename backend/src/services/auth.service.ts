import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import prisma from '../config/prisma.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';
import { emailService } from './email.service.js';

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

    // Generate verification token (valid for 24 hours)
    const verificationToken = randomUUID();
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24);

    // Create user with role-specific profile
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
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
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            companyName: true,
            profilePictureUrl: true,
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

    // Send verification email (non-blocking)
    emailService.sendVerificationEmail(user.email, verificationToken).catch(err => {
      console.error('Failed to send verification email:', err);
    });

    // Generate JWT token and auto-login
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
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            companyName: true,
            profilePictureUrl: true,
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
      throw new Error('Email ou mot de passe incorrect');
    }

    // Check if user has a password (not OAuth-only account)
    if (!user.passwordHash) {
      throw new Error('Ce compte utilise Google Sign-In. Veuillez vous connecter avec Google.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Generate JWT token (allow login even if email not verified)
    const token = this.generateToken(user.id);

    // Remove passwordHash from response but keep emailVerified
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
        emailVerified: true,
        googleId: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            companyName: true,
            profilePictureUrl: true,
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
  generateToken(userId: string): string {
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

  // Verify email with token
  async verifyEmail(token: string) {
    // Find user by verification token
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerificationExpiry: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            companyName: true,
            profilePictureUrl: true,
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
      throw new Error('Token de vérification invalide');
    }

    // Check if token has expired
    if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
      throw new Error('Le lien de vérification a expiré. Veuillez demander un nouveau lien.');
    }

    // Update user: mark as verified and clear verification token
    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
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
            profilePictureUrl: true,
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

    // Generate JWT token for auto-login
    const jwtToken = this.generateToken(verifiedUser.id);

    return { user: verifiedUser, token: jwtToken };
  }

  // Resend verification email
  async resendVerification(email: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new Error('Aucun utilisateur trouvé avec cet email');
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new Error('Cet email est déjà vérifié');
    }

    // Generate new verification token (valid for 24 hours)
    const verificationToken = randomUUID();
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24);

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
    });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken);

    return { message: 'Email de vérification renvoyé avec succès' };
  }

  // Forgot password — generate reset token and send email
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });

    // Always respond with success to avoid email enumeration
    if (!user || !user.passwordHash) {
      return { message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' };
    }

    const resetToken = randomUUID();
    const resetExpiry = new Date();
    resetExpiry.setHours(resetExpiry.getHours() + 1);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpiry,
      },
    });

    emailService.sendPasswordResetEmail(user.email, resetToken).catch(err => {
      console.error('Failed to send password reset email:', err);
    });

    return { message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' };
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { passwordResetToken: token },
      select: { id: true, passwordResetExpires: true },
    });

    if (!user) {
      throw new Error('Lien de réinitialisation invalide ou déjà utilisé.');
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      throw new Error('Ce lien de réinitialisation a expiré. Veuillez en demander un nouveau.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  // Complete Google signup (for new Google users)
  async completeGoogleSignup(data: {
    email: string;
    googleId: string;
    role: 'CREATOR' | 'PROFESSIONAL';
    firstName?: string;
    lastName?: string;
  }) {
    // Check if user already exists by email (existing account linking)
    let user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        role: true,
        googleId: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            companyName: true,
            profilePictureUrl: true,
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

    if (user) {
      // User exists - link Google account
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: data.googleId,
          emailVerified: true, // Google OAuth users are pre-verified
        },
        select: {
          id: true,
          email: true,
          role: true,
          googleId: true,
          createdAt: true,
          updatedAt: true,
          creator: {
            select: {
              id: true,
              companyName: true,
              profilePictureUrl: true,
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

      const token = this.generateToken(updatedUser.id);
      return { user: updatedUser, token, isExisting: true };
    }

    // Create new user with Google OAuth (email is pre-verified)
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        googleId: data.googleId,
        role: data.role,
        emailVerified: true, // Google OAuth users are pre-verified
        // Create creator or professional profile based on role
        ...(data.role === 'CREATOR' && {
          creator: {
            create: {},
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
        googleId: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            companyName: true,
            profilePictureUrl: true,
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

    const token = this.generateToken(newUser.id);
    return { user: newUser, token, isExisting: false };
  }
}

export const authService = new AuthService();
