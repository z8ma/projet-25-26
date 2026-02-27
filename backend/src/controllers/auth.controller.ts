import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import { emailService } from '../services/email.service.js';

export class AuthController {
  // POST /api/auth/register
  async register(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);

      // Register user
      const result = await authService.register(validatedData);

      res.status(201).json({
        success: true,
        message: 'Compte créé avec succès',
        data: result,
      });
    } catch (error: any) {
      // Zod validation error
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Validation échouée',
          errors: error.errors,
        });
      }

      // Business logic error
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de l\'inscription',
      });
    }
  }

  // POST /api/auth/login
  async login(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = loginSchema.parse(req.body);

      // Login user
      const result = await authService.login(validatedData);

      res.status(200).json({
        success: true,
        message: 'Connexion réussie',
        data: result,
      });
    } catch (error: any) {
      // Zod validation error
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Validation échouée',
          errors: error.errors,
        });
      }

      // Business logic error
      res.status(401).json({
        success: false,
        message: error.message || 'Erreur lors de la connexion',
      });
    }
  }

  // GET /api/auth/me (requires authentication)
  async me(req: Request, res: Response) {
    try {
      // userId is set by auth middleware
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
      }

      const user = await authService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Utilisateur non trouvé',
      });
    }
  }

  // PUT /api/auth/change-password
  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
      }

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé',
        });
      }

      // Check if user has a password (not OAuth-only account)
      if (!user.passwordHash) {
        return res.status(400).json({
          success: false,
          message: 'Ce compte utilise Google Sign-In et n\'a pas de mot de passe.',
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mot de passe actuel incorrect',
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword },
      });

      res.status(200).json({
        success: true,
        message: 'Mot de passe modifié avec succès',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors du changement de mot de passe',
      });
    }
  }

  // DELETE /api/auth/account
  async deleteAccount(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
      }

      // Get user info before deletion (for email notification)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          creator: {
            select: {
              companyName: true,
            },
          },
          professional: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé',
        });
      }

      // Determine user name
      const userName = user.professional
        ? `${user.professional.firstName} ${user.professional.lastName}`.trim()
        : user.creator?.companyName || 'Utilisateur';

      // Delete user (cascade will handle related data)
      await prisma.user.delete({
        where: { id: userId },
      });

      // Send deletion confirmation email
      try {
        await emailService.sendAccountDeletionEmail(user.email, userName);
      } catch (emailError) {
        // Log email error but don't fail the deletion
        console.error('Failed to send deletion email:', emailError);
      }

      res.status(200).json({
        success: true,
        message: 'Compte supprimé avec succès',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression du compte',
      });
    }
  }

  // POST /api/auth/forgot-password
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: 'Email manquant' });
      }

      const result = await authService.forgotPassword(email);

      res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Erreur serveur' });
    }
  }

  // POST /api/auth/reset-password
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ success: false, message: 'Token ou mot de passe manquant' });
      }

      if (password.length < 8) {
        return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 8 caractères' });
      }

      const result = await authService.resetPassword(token, password);

      res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Erreur lors de la réinitialisation' });
    }
  }

  // GET /api/auth/google/callback
  async googleCallback(req: Request, res: Response) {
    try {
      const user = req.user as any;

      // If this is a new user, redirect to role selection
      if (user.isNewUser) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const params = new URLSearchParams({
          email: user.email,
          googleId: user.googleId,
          token: user.accessToken,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
        });
        return res.redirect(`${frontendUrl}/auth/google/complete?${params.toString()}`);
      }

      // Existing user - generate JWT and redirect
      const token = authService.generateToken(user.id);

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/google/success?token=${token}`);
    } catch (error: any) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  // POST /api/auth/google/complete - Complete Google OAuth signup with role selection
  async completeGoogleSignup(req: Request, res: Response) {
    try {
      const { googleId, email, role, firstName, lastName } = req.body;

      if (!googleId || !email || !role) {
        return res.status(400).json({
          success: false,
          message: 'Données manquantes',
        });
      }

      // Use the auth service to complete Google signup
      const result = await authService.completeGoogleSignup({
        email,
        googleId,
        role,
        firstName,
        lastName,
      });

      const statusCode = result.isExisting ? 200 : 201;
      const message = result.isExisting ? 'Compte lié avec succès' : 'Compte créé avec succès';

      res.status(statusCode).json({
        success: true,
        message,
        data: { token: result.token, user: result.user },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la création du compte',
      });
    }
  }

  // GET /api/auth/verify-email - Verify email with token
  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Token de vérification manquant',
        });
      }

      const result = await authService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: 'Email vérifié avec succès',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la vérification de l\'email',
      });
    }
  }

  // POST /api/auth/resend-verification - Resend verification email
  async resendVerification(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email manquant',
        });
      }

      const result = await authService.resendVerification(email);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors du renvoi de l\'email de vérification',
      });
    }
  }
}

export const authController = new AuthController();
