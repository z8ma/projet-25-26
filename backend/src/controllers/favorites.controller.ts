import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export class FavoritesController {
  // GET /api/favorites - Get all saved professionals for a creator
  async getSavedProfessionals(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      const creator = await prisma.creator.findUnique({
        where: { userId },
      });

      if (!creator) {
        return res.status(404).json({
          success: false,
          message: 'Créateur non trouvé',
        });
      }

      const savedProfessionals = await prisma.savedProfessional.findMany({
        where: { creatorId: creator.id },
        include: {
          professional: {
            include: {
              professions: {
                include: {
                  profession: true,
                },
              },
              portfolios: {
                take: 3,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        data: savedProfessionals,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des favoris',
      });
    }
  }

  // POST /api/favorites/:professionalId - Add a professional to favorites
  async addToFavorites(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const professionalId = req.params.professionalId as string;
      const { note } = req.body;

      const creator = await prisma.creator.findUnique({
        where: { userId },
      });

      if (!creator) {
        return res.status(404).json({
          success: false,
          message: 'Créateur non trouvé',
        });
      }

      // Check if already saved
      const existing = await prisma.savedProfessional.findUnique({
        where: {
          creatorId_professionalId: {
            creatorId: creator.id,
            professionalId,
          },
        },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Ce professionnel est déjà dans vos favoris',
        });
      }

      const savedProfessional = await prisma.savedProfessional.create({
        data: {
          creatorId: creator.id,
          professionalId,
          note,
        },
        include: {
          professional: {
            include: {
              professions: {
                include: {
                  profession: true,
                },
              },
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: savedProfessional,
        message: 'Professionnel ajouté aux favoris',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'ajout aux favoris',
      });
    }
  }

  // DELETE /api/favorites/:professionalId - Remove a professional from favorites
  async removeFromFavorites(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const professionalId = req.params.professionalId as string;

      const creator = await prisma.creator.findUnique({
        where: { userId },
      });

      if (!creator) {
        return res.status(404).json({
          success: false,
          message: 'Créateur non trouvé',
        });
      }

      await prisma.savedProfessional.delete({
        where: {
          creatorId_professionalId: {
            creatorId: creator.id,
            professionalId,
          },
        },
      });

      res.status(200).json({
        success: true,
        message: 'Professionnel retiré des favoris',
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Ce professionnel n\'est pas dans vos favoris',
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression des favoris',
      });
    }
  }

  // PUT /api/favorites/:professionalId - Update note for a saved professional
  async updateNote(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const professionalId = req.params.professionalId as string;
      const { note } = req.body;

      const creator = await prisma.creator.findUnique({
        where: { userId },
      });

      if (!creator) {
        return res.status(404).json({
          success: false,
          message: 'Créateur non trouvé',
        });
      }

      const updated = await prisma.savedProfessional.update({
        where: {
          creatorId_professionalId: {
            creatorId: creator.id,
            professionalId,
          },
        },
        data: { note },
      });

      res.status(200).json({
        success: true,
        data: updated,
        message: 'Note mise à jour',
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Ce professionnel n\'est pas dans vos favoris',
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour',
      });
    }
  }

  // GET /api/favorites/check/:professionalId - Check if a professional is saved
  async checkFavorite(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const professionalId = req.params.professionalId as string;

      const creator = await prisma.creator.findUnique({
        where: { userId },
      });

      if (!creator) {
        return res.status(200).json({
          success: true,
          isSaved: false,
        });
      }

      const saved = await prisma.savedProfessional.findUnique({
        where: {
          creatorId_professionalId: {
            creatorId: creator.id,
            professionalId,
          },
        },
      });

      res.status(200).json({
        success: true,
        isSaved: !!saved,
        note: saved?.note,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur',
      });
    }
  }
}

export const favoritesController = new FavoritesController();
