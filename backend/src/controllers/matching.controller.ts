import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { NotificationController } from './notification.controller.js';
import { matchingService } from '../services/matching.service.js';
import { geminiService, generateProjectSummary } from '../services/gemini.service.js';
import { emailService } from '../services/email.service.js';

export class MatchingController {
  // POST /api/matching/conversations/:conversationId/match - Generate matches for conversation
  async generateMatches(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = req.userId as string;

      const creator = await prisma.creator.findUnique({
        where: { userId },
      });

      if (!creator) {
        return res.status(404).json({
          success: false,
          message: 'Profil créateur non trouvé',
        });
      }

      const conversation = await prisma.aiConversation.findFirst({
        where: {
          id: conversationId as string,
          creatorId: creator.id,
        },
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation non trouvée',
        });
      }

      // Get all available professionals
      const professionals = await prisma.professional.findMany({
        where: {
          availability: {
            in: ['Disponible', 'Partiellement disponible'],
          },
        },
        include: {
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
            take: 5,
          },
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      // Run AI matching AND rich brief generation in parallel
      const conversationMessages = ((conversation.messages as any[]) || []).map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content as string,
      }));

      const [matches, briefResult] = await Promise.all([
        this.calculateMatchesWithAI(conversation, professionals, creator),
        generateProjectSummary(conversationMessages),
      ]);

      // Parse and save the rich brief
      if (briefResult.text) {
        try {
          const cleaned = briefResult.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const brief = JSON.parse(cleaned);
          const currentInsights = (conversation.projectInsights as any) || {};

          await prisma.aiConversation.update({
            where: { id: conversationId as string },
            data: {
              projectSummary: brief.summary || '',
              projectInsights: {
                ...currentInsights,
                ...brief.insights,
                sections: brief.sections,
                keywords: brief.keywords || [],
              },
            },
          });
        } catch (briefErr) {
          console.error('Failed to parse/save project brief:', briefErr);
        }
      }

      // Delete existing matches for this conversation
      await prisma.match.deleteMany({
        where: { conversationId: conversationId as string },
      });

      // Create new matches
      const createdMatches = await Promise.all(
        matches.map((match) =>
          prisma.match.create({
            data: {
              conversationId: conversationId as string,
              professionalId: match.professionalId,
              matchScore: match.score,
              reasoning: match.reasoning,
              status: 'PROPOSED',
            },
            include: {
              professional: {
                include: {
                  user: {
                    select: {
                      email: true,
                    },
                  },
                  professions: {
                    include: {
                      profession: true,
                    },
                  },
                  portfolios: {
                    include: {
                      tags: true,
                    },
                    take: 3,
                  },
                },
              },
            },
          })
        )
      );

      res.json({
        success: true,
        message: `${createdMatches.length} professionnels matchés avec succès`,
        data: createdMatches,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors du matching',
      });
    }
  }

  // GET /api/matching/conversations/:conversationId/matches - Get matches for conversation
  async getMatches(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = req.userId as string;

      const creator = await prisma.creator.findUnique({
        where: { userId },
      });

      if (!creator) {
        return res.status(404).json({
          success: false,
          message: 'Profil créateur non trouvé',
        });
      }

      const matches = await prisma.match.findMany({
        where: { conversationId: conversationId as string },
        orderBy: { matchScore: 'desc' },
        include: {
          professional: {
            include: {
              user: {
                select: {
                  email: true,
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
                take: 5,
              },
            },
          },
        },
      });

      res.json({
        success: true,
        data: matches,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des matchs',
      });
    }
  }

  // PUT /api/matching/matches/:matchId/contact - Mark match as contacted
  async contactProfessional(req: Request, res: Response) {
    try {
      const { matchId } = req.params;
      const { message } = req.body;
      const userId = req.userId as string;

      const match = await prisma.match.findUnique({
        where: { id: matchId as string },
        include: {
          conversation: {
            include: {
              creator: true,
            },
          },
          professional: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!match) {
        return res.status(404).json({
          success: false,
          message: 'Match non trouvé',
        });
      }

      // Verify that the user is the creator of this conversation
      if (match.conversation.creator.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé',
        });
      }

      // Update match status
      const updatedMatch = await prisma.match.update({
        where: { id: matchId as string },
        data: { status: 'CONTACTED' },
      });

      // Generate AI summary from brainstorming conversation
      const conversation = await prisma.aiConversation.findUnique({
        where: { id: match.conversationId },
        select: {
          projectTitle: true,
          projectSummary: true,
          projectInsights: true,
          messages: true,
        },
      });

      let summaryMessage = message || '';

      if (!message && conversation) {
        try {
          const insights = conversation.projectInsights as any;
          const messages = (conversation.messages as any[]) || [];
          const userMessages = messages
            .filter((m: any) => m.role === 'user')
            .map((m: any) => m.content)
            .join('\n');

          const prompt = `Tu es l'assistant de la plateforme JUNY. Un créateur souhaite contacter un professionnel pour un projet.
Génère un message de présentation du projet clair et professionnel (en français, 150-200 mots max) à partir des informations suivantes.
Le message doit résumer : le contexte du projet, les besoins principaux, le budget s'il est mentionné, le délai s'il est mentionné, et le style recherché.
N'ajoute pas de formule de politesse au début ni à la fin, juste le contenu descriptif du projet.

Titre du projet : ${conversation.projectTitle || 'Non défini'}
Résumé : ${conversation.projectSummary || 'Non disponible'}
Insights extraits : ${insights ? JSON.stringify(insights) : 'Aucun'}
Messages du créateur : ${userMessages || 'Aucun'}`;

          summaryMessage = await geminiService.generateText(prompt);
        } catch (err) {
          console.error('Error generating AI summary:', err);
          summaryMessage = `Bonjour,\n\nJe vous contacte concernant mon projet "${match.conversation.projectTitle}". ${conversation.projectSummary || ''}\n\nJe serais ravi d'en discuter avec vous.`;
        }
      }

      // Create AI summary message to professional
      if (summaryMessage) {
        await prisma.message.create({
          data: {
            senderId: userId,
            receiverId: match.professional.userId,
            matchId: matchId as string,
            subject: `Nouveau projet: ${match.conversation.projectTitle}`,
            content: summaryMessage,
          },
        });
      }

      // Create additional personal message if provided
      if (message && message.trim()) {
        await prisma.message.create({
          data: {
            senderId: userId,
            receiverId: match.professional.userId,
            matchId: matchId as string,
            subject: `Re: ${match.conversation.projectTitle}`,
            content: message.trim(),
          },
        });
      }

      // Create notification for professional
      await NotificationController.createNotification(
        match.professionalId,
        'NEW_MATCH',
        'Nouveau projet correspondant!',
        `Un créateur vous a contacté pour le projet: ${match.conversation.projectTitle}`,
        matchId as string
      );

      // Send email to professional (non-blocking)
      const proName = `${match.professional.firstName} ${match.professional.lastName}`.trim() || 'Professionnel';
      const creatorName = match.conversation.creator.companyName || 'Un créateur';
      emailService.sendMatchContactedEmail(
        match.professional.user.email,
        proName,
        creatorName,
        match.conversation.projectTitle || 'Projet sans titre',
      ).catch(err => console.error('Failed to send match contacted email:', err));

      res.json({
        success: true,
        message: 'Professionnel contacté avec succès',
        data: updatedMatch,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors du contact',
      });
    }
  }

  // GET /api/matching/conversations/professional - Get all conversations with messages for professional
  async getConversationsProfessional(req: Request, res: Response) {
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

      const matches = await prisma.match.findMany({
        where: {
          professionalId: professional.id,
          status: {
            in: ['CONTACTED', 'ACCEPTED', 'DECLINED'],
          },
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          conversation: {
            select: {
              id: true,
              projectTitle: true,
              projectSummary: true,
              status: true,
              creator: {
                select: {
                  id: true,
                  companyName: true,
                  industry: true,
                  userId: true,
                  user: {
                    select: {
                      id: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          professional: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      const conversationsWithMessages = await Promise.all(
        matches.map(async (match) => {
          const messages = await prisma.message.findMany({
            where: { matchId: match.id },
            orderBy: { createdAt: 'asc' },
          });

          const unreadCount = messages.filter(
            (m) => m.receiverId === userId && !m.isRead
          ).length;

          return {
            ...match,
            messages,
            unreadCount,
            lastMessage: messages[messages.length - 1] || null,
          };
        })
      );

      conversationsWithMessages.sort((a, b) => {
        const dateA = a.lastMessage?.createdAt || new Date(0);
        const dateB = b.lastMessage?.createdAt || new Date(0);
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      res.json({
        success: true,
        data: conversationsWithMessages,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des conversations',
      });
    }
  }

  // GET /api/matching/conversations - Get all conversations with messages for creator
  async getConversations(req: Request, res: Response) {
    try {
      const userId = req.userId as string;

      const creator = await prisma.creator.findUnique({
        where: { userId },
      });

      if (!creator) {
        return res.status(404).json({
          success: false,
          message: 'Profil créateur non trouvé',
        });
      }

      // Get all matches for creator's conversations with messages
      const matches = await prisma.match.findMany({
        where: {
          conversation: {
            creatorId: creator.id,
          },
          status: {
            in: ['CONTACTED', 'ACCEPTED', 'DECLINED'],
          },
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          conversation: {
            select: {
              id: true,
              projectTitle: true,
              projectSummary: true,
              status: true,
            },
          },
          professional: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
              professions: {
                include: {
                  profession: true,
                },
              },
            },
          },
        },
      });

      // Get messages for each match
      const conversationsWithMessages = await Promise.all(
        matches.map(async (match) => {
          const messages = await prisma.message.findMany({
            where: { matchId: match.id },
            orderBy: { createdAt: 'asc' },
          });

          const unreadCount = messages.filter(
            (m) => m.receiverId === userId && !m.isRead
          ).length;

          return {
            ...match,
            messages,
            unreadCount,
            lastMessage: messages[messages.length - 1] || null,
          };
        })
      );

      // Sort by last message date
      conversationsWithMessages.sort((a, b) => {
        const dateA = a.lastMessage?.createdAt || new Date(0);
        const dateB = b.lastMessage?.createdAt || new Date(0);
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      res.json({
        success: true,
        data: conversationsWithMessages,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des conversations',
      });
    }
  }

  // GET /api/matching/matches/:matchId/messages - Get messages for a specific match
  async getMessages(req: Request, res: Response) {
    try {
      const { matchId } = req.params;
      const userId = req.userId as string;

      const match = await prisma.match.findUnique({
        where: { id: matchId as string },
        include: {
          conversation: {
            include: {
              creator: true,
            },
          },
          professional: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!match) {
        return res.status(404).json({
          success: false,
          message: 'Conversation non trouvée',
        });
      }

      // Verify user is part of this conversation
      const isCreator = match.conversation.creator.userId === userId;
      const isProfessional = match.professional.userId === userId;

      if (!isCreator && !isProfessional) {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé',
        });
      }

      const messages = await prisma.message.findMany({
        where: { matchId: matchId as string },
        orderBy: { createdAt: 'asc' },
      });

      // Mark messages as read for the current user
      await prisma.message.updateMany({
        where: {
          matchId: matchId as string,
          receiverId: userId,
          isRead: false,
        },
        data: { isRead: true },
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

  // POST /api/matching/matches/:matchId/messages - Send a message
  async sendMessage(req: Request, res: Response) {
    try {
      const { matchId } = req.params;
      const { content } = req.body;
      const userId = req.userId as string;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Le message ne peut pas être vide',
        });
      }

      const match = await prisma.match.findUnique({
        where: { id: matchId as string },
        include: {
          conversation: {
            include: {
              creator: true,
            },
          },
          professional: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!match) {
        return res.status(404).json({
          success: false,
          message: 'Conversation non trouvée',
        });
      }

      // Verify user is part of this conversation
      const isCreator = match.conversation.creator.userId === userId;
      const isProfessional = match.professional.userId === userId;

      if (!isCreator && !isProfessional) {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé',
        });
      }

      // Determine receiver
      const receiverId = isCreator
        ? match.professional.userId
        : match.conversation.creator.userId;

      // Create the message
      const message = await prisma.message.create({
        data: {
          senderId: userId,
          receiverId,
          matchId: matchId as string,
          subject: `Re: ${match.conversation.projectTitle}`,
          content: content.trim(),
        },
      });

      // Create notification for receiver
      const notificationTarget = isCreator ? match.professionalId : match.conversation.creatorId;
      await NotificationController.createNotification(
        notificationTarget,
        'MESSAGE_RECEIVED',
        'Nouveau message',
        `Vous avez reçu un nouveau message concernant: ${match.conversation.projectTitle}`,
        matchId as string
      );

      res.json({
        success: true,
        message: 'Message envoyé avec succès',
        data: message,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'envoi du message',
      });
    }
  }

  // PUT /api/matching/matches/:matchId/project-status - Update project status (for professionals)
  async updateProjectStatus(req: Request, res: Response) {
    try {
      const { matchId } = req.params;
      const { projectStatus } = req.body;
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

      const match = await prisma.match.findFirst({
        where: {
          id: matchId as string,
          professionalId: professional.id,
        },
      });

      if (!match) {
        return res.status(404).json({
          success: false,
          message: 'Match non trouvé ou non autorisé',
        });
      }

      // Update match with new project status
      const updateData: any = { projectStatus };

      if (projectStatus === 'IN_PROGRESS' && !match.startedAt) {
        updateData.startedAt = new Date();
      }

      if (projectStatus === 'COMPLETED' && !match.completedAt) {
        updateData.completedAt = new Date();
      }

      const updatedMatch = await prisma.match.update({
        where: { id: matchId as string },
        data: updateData,
      });

      // Update professional stats
      if (projectStatus === 'IN_PROGRESS' && match.projectStatus === 'NOT_STARTED') {
        await prisma.professional.update({
          where: { id: professional.id },
          data: {
            projectsInProgress: { increment: 1 },
          },
        });
      }

      if (projectStatus === 'COMPLETED' && match.projectStatus !== 'COMPLETED') {
        await prisma.professional.update({
          where: { id: professional.id },
          data: {
            projectsCompleted: { increment: 1 },
            projectsInProgress: { decrement: 1 },
          },
        });
      }

      // Notify creator about project status update
      // (In real app, would create notification for creator too)

      res.json({
        success: true,
        message: 'Statut du projet mis à jour avec succès',
        data: updatedMatch,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour',
      });
    }
  }

  // PUT /api/matching/matches/:matchId/creator-project-status — creator validates project progress
  async creatorUpdateProjectStatus(req: Request, res: Response) {
    try {
      const { matchId } = req.params;
      const { projectStatus } = req.body;
      const userId = req.userId as string;

      const ALLOWED_STATUSES = ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      if (!ALLOWED_STATUSES.includes(projectStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Statut non autorisé. Valeurs acceptées : IN_PROGRESS, COMPLETED, CANCELLED',
        });
      }

      const creator = await prisma.creator.findUnique({ where: { userId } });
      if (!creator) {
        return res.status(404).json({ success: false, message: 'Profil créateur non trouvé' });
      }

      // Verify the match belongs to one of this creator's conversations
      const match = await prisma.match.findFirst({
        where: {
          id: matchId as string,
          status: 'ACCEPTED',
          conversation: { creatorId: creator.id },
        },
        include: {
          professional: { select: { id: true, firstName: true, lastName: true } },
          conversation: { select: { projectTitle: true, creator: { select: { id: true } } } },
        },
      });

      if (!match) {
        return res.status(404).json({ success: false, message: 'Match non trouvé ou non autorisé' });
      }

      const updateData: any = { projectStatus };
      if (projectStatus === 'IN_PROGRESS' && !match.startedAt) {
        updateData.startedAt = new Date();
      }
      if (projectStatus === 'COMPLETED' && !match.completedAt) {
        updateData.completedAt = new Date();
      }

      const updatedMatch = await prisma.match.update({
        where: { id: matchId as string },
        data: updateData,
      });

      // Notify professional of status change
      if (projectStatus === 'COMPLETED') {
        await NotificationController.createNotification(
          match.professionalId,
          'PROJECT_COMPLETED',
          'Mission validée !',
          `Le créateur a validé le projet "${match.conversation.projectTitle}" — félicitations !`,
          matchId as string,
        );
      }

      res.json({
        success: true,
        message: 'Statut mis à jour avec succès',
        data: updatedMatch,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour',
      });
    }
  }


  // Helper: Calculate match scores with AI analysis
  private async calculateMatchesWithAI(
    conversation: any,
    professionals: any[],
    creator: any
  ): Promise<Array<{ professionalId: string; score: number; reasoning: string }>> {
    const matches: Array<{ professionalId: string; score: number; reasoning: string }> = [];

    try {
      // Step 1: Analyze conversation using AI
      const messages = (conversation.messages as any[]) || [];
      const analysis = await matchingService.analyzeConversationForMatching(
        messages,
        {
          industry: creator.industry,
          preferredCreatives: creator.preferredCreatives,
          typicalBudget: creator.typicalBudget,
        }
      );

      console.log('AI Matching Analysis:', JSON.stringify(analysis, null, 2));

      // Step 2: Calculate match score for each professional
      for (const professional of professionals) {
        const { score, reasons } = matchingService.calculateEnhancedMatchScore(
          professional,
          analysis,
          creator.typicalBudget,
          {
            industry: creator.industry,
            preferredCreatives: creator.preferredCreatives,
          }
        );

        // Only include professionals with score >= 60
        if (score >= 60) {
          matches.push({
            professionalId: professional.id,
            score,
            reasoning: reasons.join(' • ') || 'Profil correspondant',
          });
        }
      }

      // Sort by score descending and take top 10
      return matches.sort((a, b) => b.score - a.score).slice(0, 10);
    } catch (error) {
      console.error('Error in AI matching, falling back to basic matching:', error);

      // Fallback to basic matching if AI fails
      return this.calculateBasicMatches(conversation, professionals, creator);
    }
  }

  // Helper: Basic fallback matching (without AI)
  private calculateBasicMatches(
    conversation: any,
    professionals: any[],
    creator: any
  ): Array<{ professionalId: string; score: number; reasoning: string }> {
    const matches: Array<{ professionalId: string; score: number; reasoning: string }> = [];
    const messages = (conversation.messages as any[]) || [];
    const conversationText = messages.map((m) => m.content).join(' ').toLowerCase();

    const keywords = {
      graphiste: ['logo', 'identité', 'graphisme', 'branding'],
      '3d': ['3d', 'modélisation', 'render'],
      motion: ['motion', 'animation', 'vidéo'],
      web: ['site', 'web', 'landing', 'interface'],
    };

    for (const professional of professionals) {
      let score = 50;
      const reasons: string[] = [];

      // Profession keyword match
      for (const pp of professional.professions) {
        const professionName = pp.profession.name.toLowerCase();
        for (const [key, keywordList] of Object.entries(keywords)) {
          if (professionName.includes(key)) {
            const matched = keywordList.filter((kw) => conversationText.includes(kw));
            if (matched.length > 0) {
              score += matched.length * 10;
              reasons.push(`Métier correspondant`);
            }
          }
        }
      }

      // Availability
      if (professional.availability === 'Disponible') {
        score += 10;
        reasons.push('Disponible');
      }

      // Experience
      if (professional.experienceYears >= 3) {
        score += 10;
        reasons.push('Expérimenté');
      }

      if (score >= 60) {
        matches.push({
          professionalId: professional.id,
          score: Math.min(score, 100),
          reasoning: reasons.join(' • ') || 'Profil correspondant',
        });
      }
    }

    return matches.sort((a, b) => b.score - a.score).slice(0, 10);
  }
}

export const matchingController = new MatchingController();
