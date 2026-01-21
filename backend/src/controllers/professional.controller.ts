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
      const {
        firstName,
        lastName,
        experienceYears,
        hourlyRate,
        availability,
        bio,
        otherProfession,
        // Nouveaux champs IA Matching
        missionTypes,
        otherMissionType,
        preferredClientTypes,
        preferredCollabTypes,
        minimumBudget,
        exclusions,
      } = req.body;

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
          // Nouveaux champs IA Matching
          missionTypes: missionTypes || undefined,
          otherMissionType,
          preferredClientTypes: preferredClientTypes || undefined,
          preferredCollabTypes: preferredCollabTypes || undefined,
          minimumBudget: minimumBudget ? parseFloat(minimumBudget) : undefined,
          exclusions: exclusions || undefined,
        },
      });

      // Recalculer le score de complétude du profil
      const completeness = this.calculateProfileCompleteness(professional);
      await prisma.professional.update({
        where: { id: professional.id },
        data: { profileCompleteness: completeness },
      });

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: { ...professional, profileCompleteness: completeness },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du profil',
      });
    }
  }

  // Calcule le score de complétude du profil (0-100)
  private calculateProfileCompleteness(professional: any): number {
    let score = 0;
    const weights = {
      firstName: 5,
      lastName: 5,
      bio: 10,
      experienceYears: 5,
      hourlyRate: 5,
      availability: 5,
      missionTypes: 15,          // Prioritaire pour le matching
      preferredClientTypes: 10,
      preferredCollabTypes: 10,
      minimumBudget: 5,
      exclusions: 5,            // Important pour éviter les mauvais matchs
    };

    if (professional.firstName) score += weights.firstName;
    if (professional.lastName) score += weights.lastName;
    if (professional.bio && professional.bio.length > 50) score += weights.bio;
    if (professional.experienceYears) score += weights.experienceYears;
    if (professional.hourlyRate) score += weights.hourlyRate;
    if (professional.availability) score += weights.availability;
    if (professional.missionTypes && professional.missionTypes.length > 0) score += weights.missionTypes;
    if (professional.preferredClientTypes && professional.preferredClientTypes.length > 0) score += weights.preferredClientTypes;
    if (professional.preferredCollabTypes && professional.preferredCollabTypes.length > 0) score += weights.preferredCollabTypes;
    if (professional.minimumBudget) score += weights.minimumBudget;
    if (professional.exclusions && professional.exclusions.length > 0) score += weights.exclusions;

    // Score de base = 80, les 20% restants viennent des skills et portfolio
    return Math.min(score, 80);
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

  // POST /api/professionals/professions - Add profession to professional
  async addProfession(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { professionId, isPrimary } = req.body;

      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Profil professionnel non trouvé',
        });
      }

      // If setting as primary, remove primary from all other professions
      if (isPrimary) {
        await prisma.professionalProfession.updateMany({
          where: { professionalId: professional.id },
          data: { isPrimary: false },
        });
      }

      const professionalProfession = await prisma.professionalProfession.create({
        data: {
          professionalId: professional.id,
          professionId,
          isPrimary: isPrimary || false,
        },
        include: {
          profession: true,
        },
      });

      res.json({
        success: true,
        message: 'Métier ajouté avec succès',
        data: professionalProfession,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'ajout du métier',
      });
    }
  }

  // DELETE /api/professionals/professions/:id - Remove profession
  async removeProfession(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.professionalProfession.delete({
        where: { id: id as string },
      });

      res.json({
        success: true,
        message: 'Métier supprimé avec succès',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression du métier',
      });
    }
  }

  // POST /api/professionals/skills - Add software skill
  async addSkill(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const { softwareName, proficiencyLevel, yearsOfUse } = req.body;

      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Profil professionnel non trouvé',
        });
      }

      const skill = await prisma.softwareSkill.create({
        data: {
          professionalId: professional.id,
          softwareName,
          proficiencyLevel: proficiencyLevel || 'CONFIRMED',
          yearsOfUse: yearsOfUse ? parseInt(yearsOfUse) : undefined,
        },
      });

      res.json({
        success: true,
        message: 'Compétence ajoutée avec succès',
        data: skill,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'ajout de la compétence',
      });
    }
  }

  // PUT /api/professionals/skills/:id - Update software skill
  async updateSkill(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { softwareName, proficiencyLevel, yearsOfUse } = req.body;

      const skill = await prisma.softwareSkill.update({
        where: { id: id as string },
        data: {
          softwareName,
          proficiencyLevel,
          yearsOfUse: yearsOfUse ? parseInt(yearsOfUse) : undefined,
        },
      });

      res.json({
        success: true,
        message: 'Compétence mise à jour avec succès',
        data: skill,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour de la compétence',
      });
    }
  }

  // DELETE /api/professionals/skills/:id - Remove software skill
  async removeSkill(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.softwareSkill.delete({
        where: { id: id as string },
      });

      res.json({
        success: true,
        message: 'Compétence supprimée avec succès',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression de la compétence',
      });
    }
  }

  // POST /api/professionals/portfolio - Add portfolio item
  async addPortfolio(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const {
        title,
        description,
        imageUrl,
        projectType,
        tags,
        // Nouveaux champs enrichissement IA
        clientType,
        projectGoal,
        roleDescription,
        projectDuration,
        projectImpact,
        projectYear,
      } = req.body;

      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Profil professionnel non trouvé',
        });
      }

      const portfolio = await prisma.portfolio.create({
        data: {
          professionalId: professional.id,
          title,
          description,
          imageUrl,
          projectType,
          // Nouveaux champs enrichissement IA
          clientType,
          projectGoal,
          roleDescription,
          projectDuration,
          projectImpact,
          projectYear: projectYear ? parseInt(projectYear) : undefined,
          tags: {
            create: tags?.map((tag: string) => ({ tag })) || [],
          },
        },
        include: {
          tags: true,
        },
      });

      res.json({
        success: true,
        message: 'Projet ajouté au portfolio avec succès',
        data: portfolio,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'ajout du projet',
      });
    }
  }

  // PUT /api/professionals/portfolio/:id - Update portfolio item
  async updatePortfolio(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        imageUrl,
        projectType,
        clientType,
        projectGoal,
        roleDescription,
        projectDuration,
        projectImpact,
        projectYear,
      } = req.body;

      const portfolio = await prisma.portfolio.update({
        where: { id: id as string },
        data: {
          title,
          description,
          imageUrl,
          projectType,
          clientType,
          projectGoal,
          roleDescription,
          projectDuration,
          projectImpact,
          projectYear: projectYear ? parseInt(projectYear) : undefined,
        },
        include: {
          tags: true,
        },
      });

      res.json({
        success: true,
        message: 'Projet mis à jour avec succès',
        data: portfolio,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du projet',
      });
    }
  }

  // DELETE /api/professionals/portfolio/:id - Remove portfolio item
  async removePortfolio(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.portfolio.delete({
        where: { id: id as string },
      });

      res.json({
        success: true,
        message: 'Projet supprimé du portfolio avec succès',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression du projet',
      });
    }
  }

  // GET /api/professionals/messages - Get messages for professional
  async getMessages(req: Request, res: Response) {
    try {
      const userId = req.userId as string;

      const messages = await prisma.message.findMany({
        where: { receiverId: userId },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: messages,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des messages',
      });
    }
  }

  // PUT /api/professionals/messages/:id/read - Mark message as read
  async markMessageAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const message = await prisma.message.update({
        where: { id: id as string },
        data: { isRead: true },
      });

      res.json({
        success: true,
        message: 'Message marqué comme lu',
        data: message,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du message',
      });
    }
  }
}

export const professionalController = new ProfessionalController();
