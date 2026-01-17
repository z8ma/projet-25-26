import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

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
}

export const authController = new AuthController();
