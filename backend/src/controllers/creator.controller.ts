import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export class CreatorController {
  // GET /api/creators/profile - Get creator profile
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.userId;

      const creator = await prisma.creator.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              email: true,
              role: true,
            },
          },
        },
      });

      if (!creator) {
        return res.status(404).json({
          success: false,
          message: 'Profil créateur non trouvé',
        });
      }

      res.json({
        success: true,
        data: creator,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération du profil',
      });
    }
  }

  // PUT /api/creators/profile - Update creator profile
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const {
        companyName,
        industry,
        companySize,
        website,
        description,
        logoUrl,
        phone,
        city,
        country,
        typicalBudget,
        preferredCreatives,
        linkedinUrl,
        twitterUrl,
      } = req.body;

      const creator = await prisma.creator.update({
        where: { userId },
        data: {
          companyName,
          industry,
          companySize,
          website,
          description,
          logoUrl,
          phone,
          city,
          country,
          typicalBudget,
          preferredCreatives,
          linkedinUrl,
          twitterUrl,
        },
        include: {
          user: {
            select: {
              email: true,
              role: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: creator,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du profil',
      });
    }
  }
}

export const creatorController = new CreatorController();
