import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export class ProfessionalController {
  // GET /api/professionals/profile - Get professional profile
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.userId;

      const professional = await prisma.professional.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              email: true,
              role: true,
            },
          },
          professions: {
            include: {
              profession: true,
            },
          },
          softwareSkills: true,
          portfolios: {
            include: {
              tags: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Profil professionnel non trouvé',
        });
      }

      res.json({
        success: true,
        data: professional,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération du profil',
      });
    }
  }

  // PUT /api/professionals/profile - Update professional profile
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { firstName, lastName, experienceYears, hourlyRate, availability, bio, otherProfession } = req.body;

      const professional = await prisma.professional.update({
        where: { userId },
        data: {
          firstName,
          lastName,
          experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
          availability,
          bio,
          otherProfession,
        },
      });

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: professional,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du profil',
      });
    }
  }

  // GET /api/professionals/professions - Get all available professions
  async getProfessions(req: Request, res: Response) {
    try {
      const professions = await prisma.profession.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      res.json({
        success: true,
        data: professions,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des métiers',
      });
    }
  }
}

export const professionalController = new ProfessionalController();
