import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';

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
        message: 'Utilisateur créé avec succès',
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

      // Delete user (cascade will handle related data)
      await prisma.user.delete({
        where: { id: userId },
      });

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
}

export const authController = new AuthController();
