import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export class CalendarController {
  // GET /api/calendar/events - Get all calendar events for a professional
  async getEvents(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const { startDate, endDate } = req.query;

      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Profil professionnel non trouvé',
        });
      }

      const whereClause: any = {
        professionalId: professional.id,
      };

      // Filter by date range if provided
      if (startDate || endDate) {
        whereClause.OR = [
          {
            startDate: {
              ...(startDate && { gte: new Date(startDate as string) }),
              ...(endDate && { lte: new Date(endDate as string) }),
            },
          },
          {
            endDate: {
              ...(startDate && { gte: new Date(startDate as string) }),
              ...(endDate && { lte: new Date(endDate as string) }),
            },
          },
        ];
      }

      const events = await prisma.calendarEvent.findMany({
        where: whereClause,
        orderBy: { startDate: 'asc' },
      });

      return res.json({
        success: true,
        data: events,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des événements',
      });
    }
  }

  // POST /api/calendar/events - Create a new calendar event
  async createEvent(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const { type, title, description, startDate, endDate, isAllDay, color, clientName, budget } = req.body;

      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Profil professionnel non trouvé',
        });
      }

      // Validate required fields
      if (!type || !title || !startDate) {
        return res.status(400).json({
          success: false,
          message: 'Type, titre et date de début sont requis',
        });
      }

      const event = await prisma.calendarEvent.create({
        data: {
          professionalId: professional.id,
          type,
          title,
          description,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          isAllDay: isAllDay ?? true,
          color,
          clientName,
          budget: budget ? parseFloat(budget) : null,
        },
      });

      return res.status(201).json({
        success: true,
        data: event,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la création de l\'événement',
      });
    }
  }

  // PUT /api/calendar/events/:id - Update a calendar event
  async updateEvent(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const id = req.params.id as string;
      const { type, title, description, startDate, endDate, isAllDay, color, clientName, budget } = req.body;

      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Profil professionnel non trouvé',
        });
      }

      // Check if event exists and belongs to the professional
      const existingEvent = await prisma.calendarEvent.findFirst({
        where: {
          id,
          professionalId: professional.id,
        },
      });

      if (!existingEvent) {
        return res.status(404).json({
          success: false,
          message: 'Événement non trouvé',
        });
      }

      const event = await prisma.calendarEvent.update({
        where: { id },
        data: {
          ...(type && { type }),
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
          ...(isAllDay !== undefined && { isAllDay }),
          ...(color !== undefined && { color }),
          ...(clientName !== undefined && { clientName }),
          ...(budget !== undefined && { budget: budget ? parseFloat(budget) : null }),
        },
      });

      return res.json({
        success: true,
        data: event,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour de l\'événement',
      });
    }
  }

  // DELETE /api/calendar/events/:id - Delete a calendar event
  async deleteEvent(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const id = req.params.id as string;

      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Profil professionnel non trouvé',
        });
      }

      // Check if event exists and belongs to the professional
      const existingEvent = await prisma.calendarEvent.findFirst({
        where: {
          id,
          professionalId: professional.id,
        },
      });

      if (!existingEvent) {
        return res.status(404).json({
          success: false,
          message: 'Événement non trouvé',
        });
      }

      await prisma.calendarEvent.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: 'Événement supprimé',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression de l\'événement',
      });
    }
  }
}

export const calendarController = new CalendarController();
