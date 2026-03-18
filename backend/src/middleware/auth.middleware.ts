import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { prisma } from '../config/prisma.js';

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = authService.verifyToken(token);

    // Attach userId to request
    req.userId = decoded.userId;

    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Token invalide',
    });
  }
};

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
