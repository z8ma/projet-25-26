import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export class RatingController {
  // POST /api/ratings - Create rating for a match
  async createRating(req: Request, res: Response) {
    try {
      const { matchId, rating, comment } = req.body;
      const userId = req.userId as string;

      // Verify the match belongs to the creator
      const match = await prisma.match.findFirst({
        where: {
          id: matchId as string,
        },
        include: {
          conversation: {
            include: {
              creator: true,
            },
          },
          professional: true,
        },
      });

      if (!match) {
        return res.status(404).json({
          success: false,
          message: 'Match non trouvé',
        });
      }

      // Check if creator owns this match
      if (match.conversation.creator.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé',
        });
      }

      // Check if project is completed
      if (match.projectStatus !== 'COMPLETED') {
        return res.status(400).json({
          success: false,
          message: 'Le projet doit être terminé pour pouvoir noter',
        });
      }

      // Check if already rated
      const existingRating = await prisma.rating.findUnique({
        where: { matchId: matchId as string },
      });

      if (existingRating) {
        return res.status(400).json({
          success: false,
          message: 'Ce professionnel a déjà été noté pour ce projet',
        });
      }

      // Create rating
      const newRating = await prisma.rating.create({
        data: {
          matchId: matchId as string,
          rating,
          comment,
        },
      });

      // Update professional's average rating
      const allRatings = await prisma.rating.findMany({
        where: {
          match: {
            professionalId: match.professionalId,
          },
        },
      });

      const totalRatings = allRatings.length;
      const averageRating =
        allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

      await prisma.professional.update({
        where: { id: match.professionalId },
        data: {
          averageRating,
          totalRatings,
        },
      });

      res.json({
        success: true,
        message: 'Note enregistrée avec succès',
        data: newRating,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la notation',
      });
    }
  }

  // GET /api/ratings/match/:matchId - Get rating for a match
  async getRating(req: Request, res: Response) {
    try {
      const { matchId } = req.params;

      const rating = await prisma.rating.findUnique({
        where: { matchId: matchId as string },
      });

      res.json({
        success: true,
        data: rating,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération de la note',
      });
    }
  }
}

export const ratingController = new RatingController();
