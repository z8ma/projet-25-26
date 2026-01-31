import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export class NotificationController {
  // GET /api/notifications - Get all notifications (for professional or creator)
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.userId as string;

      // Check if user is a professional
      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (professional) {
        const notifications = await prisma.notification.findMany({
          where: { professionalId: professional.id },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });

        const unreadCount = await prisma.notification.count({
          where: {
            professionalId: professional.id,
            isRead: false,
          },
        });

        return res.json({
          success: true,
          data: {
            notifications,
            unreadCount,
          },
        });
      }

      // Check if user is a creator
      const creator = await prisma.creator.findUnique({
        where: { userId },
      });

      if (creator) {
        const notifications = await prisma.creatorNotification.findMany({
          where: { creatorId: creator.id },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });

        const unreadCount = await prisma.creatorNotification.count({
          where: {
            creatorId: creator.id,
            isRead: false,
          },
        });

        return res.json({
          success: true,
          data: {
            notifications,
            unreadCount,
          },
        });
      }

      return res.status(404).json({
        success: false,
        message: 'Profil non trouvé',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des notifications',
      });
    }
  }

  // PUT /api/notifications/:id/read - Mark notification as read
  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.userId as string;

      // Check if user is a professional
      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (professional) {
        const notification = await prisma.notification.update({
          where: {
            id: id as string,
            professionalId: professional.id,
          },
          data: { isRead: true },
        });
        return res.json({ success: true, data: notification });
      }

      // Check if user is a creator
      const creator = await prisma.creator.findUnique({
        where: { userId },
      });

      if (creator) {
        const notification = await prisma.creatorNotification.update({
          where: {
            id: id as string,
            creatorId: creator.id,
          },
          data: { isRead: true },
        });
        return res.json({ success: true, data: notification });
      }

      return res.status(404).json({
        success: false,
        message: 'Profil non trouvé',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour',
      });
    }
  }

  // PUT /api/notifications/read-all - Mark all notifications as read
  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.userId as string;

      // Check if user is a professional
      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (professional) {
        await prisma.notification.updateMany({
          where: { professionalId: professional.id, isRead: false },
          data: { isRead: true },
        });
        return res.json({ success: true, message: 'Toutes les notifications ont été marquées comme lues' });
      }

      // Check if user is a creator
      const creator = await prisma.creator.findUnique({
        where: { userId },
      });

      if (creator) {
        await prisma.creatorNotification.updateMany({
          where: { creatorId: creator.id, isRead: false },
          data: { isRead: true },
        });
        return res.json({ success: true, message: 'Toutes les notifications ont été marquées comme lues' });
      }

      return res.status(404).json({
        success: false,
        message: 'Profil non trouvé',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour',
      });
    }
  }

  // Helper: Create notification for professional
  static async createNotification(
    professionalId: string,
    type: string,
    title: string,
    message: string,
    matchId?: string
  ) {
    try {
      await prisma.notification.create({
        data: {
          professionalId,
          type: type as any,
          title,
          message,
          matchId,
        },
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  // Helper: Create notification for creator
  static async createCreatorNotification(
    creatorId: string,
    type: 'MATCH_ACCEPTED' | 'MESSAGE_RECEIVED' | 'PROJECT_COMPLETED' | 'CREDITS_LOW' | 'PROFILE_INCOMPLETE',
    title: string,
    message: string,
    link?: string
  ) {
    try {
      await prisma.creatorNotification.create({
        data: {
          creatorId,
          type: type as any,
          title,
          message,
          link,
        },
      });
    } catch (error) {
      console.error('Error creating creator notification:', error);
    }
  }
}

export const notificationController = new NotificationController();
