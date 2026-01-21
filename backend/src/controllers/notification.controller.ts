import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export class NotificationController {
  // GET /api/notifications - Get all notifications for professional
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.userId as string;

      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Profil professionnel non trouvé',
        });
      }

      const notifications = await prisma.notification.findMany({
        where: { professionalId: professional.id },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit to 50 most recent
      });

      const unreadCount = await prisma.notification.count({
        where: {
          professionalId: professional.id,
          isRead: false,
        },
      });

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
        },
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

      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Profil professionnel non trouvé',
        });
      }

      const notification = await prisma.notification.update({
        where: {
          id: id as string,
          professionalId: professional.id,
        },
        data: {
          isRead: true,
        },
      });

      res.json({
        success: true,
        data: notification,
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

      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Profil professionnel non trouvé',
        });
      }

      await prisma.notification.updateMany({
        where: {
          professionalId: professional.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      res.json({
        success: true,
        message: 'Toutes les notifications ont été marquées comme lues',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour',
      });
    }
  }

  // Helper: Create notification
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
}

export const notificationController = new NotificationController();
