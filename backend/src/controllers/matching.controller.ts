import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { NotificationController } from './notification.controller.js';

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

      // Convert creator budget to numeric range for comparison
      const creatorBudgetMax = this.getBudgetMaxValue(creator.typicalBudget);

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

      // Smart matching algorithm using creator preferences
      const matches = this.calculateMatches(conversation, professionals, creator, creatorBudgetMax);

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

      // Create message to professional
      if (message) {
        await prisma.message.create({
          data: {
            senderId: userId,
            receiverId: match.professional.userId,
            matchId: matchId as string,
            subject: `Nouveau projet: ${match.conversation.projectTitle}`,
            content: message,
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

  // Helper: Convert budget string to max numeric value
  private getBudgetMaxValue(budget: string | null): number {
    if (!budget) return Infinity;
    const budgetMap: Record<string, number> = {
      '<1k': 1000,
      '1-5k': 5000,
      '5-10k': 10000,
      '10-25k': 25000,
      '25-50k': 50000,
      '50k+': 100000,
    };
    return budgetMap[budget] || Infinity;
  }

  // Helper: Map creative type ID to profession keywords
  private getCreativeTypeKeywords(creativeType: string): string[] {
    const typeMap: Record<string, string[]> = {
      'graphiste': ['graphiste', 'graphic', 'designer'],
      'ux-ui': ['ux', 'ui', 'interface', 'experience'],
      'motion': ['motion', 'animation', 'animateur'],
      'illustrateur': ['illustra', 'dessin'],
      '3d': ['3d', 'three', 'modéli'],
      'web': ['web', 'développeur', 'frontend'],
      'branding': ['brand', 'identité', 'marque'],
      'photo': ['photo', 'photograph'],
      'video': ['vidéo', 'video', 'réalisateur'],
      'social': ['social', 'community', 'média'],
    };
    return typeMap[creativeType] || [];
  }

  // Helper: Calculate match scores with creator preferences
  private calculateMatches(
    conversation: any,
    professionals: any[],
    creator: any,
    creatorBudgetMax: number
  ): Array<{ professionalId: string; score: number; reasoning: string }> {
    const matches: Array<{ professionalId: string; score: number; reasoning: string }> = [];

    // Extract keywords from conversation messages
    const messages = (conversation.messages as any[]) || [];
    const conversationText = messages.map((m) => m.content).join(' ').toLowerCase();

    // Get creator preferences
    const preferredCreatives = creator.preferredCreatives || [];
    const creatorIndustry = (creator.industry || '').toLowerCase();
    const companyName = creator.companyName || '';

    // Keywords for different professions
    const keywords = {
      graphiste: ['logo', 'identité', 'graphisme', 'branding', 'charte', 'visuel'],
      '3d': ['3d', 'modélisation', 'render', 'animation 3d', 'blender', 'maya'],
      motion: ['motion', 'animation', 'vidéo', 'after effects', 'mouvement'],
      web: ['site', 'web', 'landing', 'interface', 'ui', 'ux'],
      illustration: ['illustration', 'dessin', 'artwork', 'personnage'],
    };

    for (const professional of professionals) {
      let score = 50; // Base score
      const reasons: string[] = [];

      // === BUDGET COMPATIBILITY CHECK ===
      const profMinBudget = professional.minimumBudget ? Number(professional.minimumBudget) : 0;
      if (profMinBudget > 0 && creatorBudgetMax < profMinBudget) {
        // Skip professionals who require more budget than creator typically spends
        continue;
      }
      if (profMinBudget > 0 && creatorBudgetMax >= profMinBudget) {
        score += 10;
        reasons.push('Budget compatible');
      }

      // === PREFERRED CREATIVE TYPES BONUS ===
      if (preferredCreatives.length > 0) {
        for (const pp of professional.professions) {
          const professionName = pp.profession.name.toLowerCase();
          for (const preferredType of preferredCreatives) {
            const typeKeywords = this.getCreativeTypeKeywords(preferredType);
            if (typeKeywords.some(kw => professionName.includes(kw))) {
              score += 15;
              reasons.push(`Type de créatif recherché par ${companyName || 'le client'}`);
              break;
            }
          }
        }
      }

      // === INDUSTRY MATCH (via portfolio client types) ===
      if (creatorIndustry && professional.portfolios) {
        const hasIndustryExperience = professional.portfolios.some((p: any) => {
          const clientType = (p.clientType || '').toLowerCase();
          return clientType.includes(creatorIndustry) || creatorIndustry.includes(clientType);
        });
        if (hasIndustryExperience) {
          score += 10;
          reasons.push(`Expérience dans le secteur ${creator.industry}`);
        }
      }

      // Check profession match with conversation keywords
      for (const pp of professional.professions) {
        const professionName = pp.profession.name.toLowerCase();

        for (const [key, keywordList] of Object.entries(keywords)) {
          if (professionName.includes(key)) {
            const matchedKeywords = keywordList.filter((kw) =>
              conversationText.includes(kw)
            );

            if (matchedKeywords.length > 0) {
              score += matchedKeywords.length * 10;
              reasons.push(`Métier "${pp.profession.name}" correspond aux besoins`);
              break;
            }
          }
        }

        if (pp.isPrimary) {
          score += 5;
        }
      }

      // Availability bonus
      if (professional.availability === 'Disponible') {
        score += 10;
        reasons.push('Disponible immédiatement');
      }

      // Experience bonus
      if (professional.experienceYears) {
        if (professional.experienceYears >= 5) {
          score += 15;
          reasons.push(`${professional.experienceYears} ans d'expérience`);
        } else if (professional.experienceYears >= 2) {
          score += 10;
        }
      }

      // Portfolio bonus
      if (professional.portfolios && professional.portfolios.length > 0) {
        score += Math.min(professional.portfolios.length * 2, 10);
        reasons.push(`${professional.portfolios.length} projets dans le portfolio`);
      }

      // Skills bonus
      if (professional.softwareSkills && professional.softwareSkills.length > 0) {
        score += Math.min(professional.softwareSkills.length * 1, 5);
      }

      // Premium bonus
      if (professional.isPremium) {
        score += 5;
        reasons.push('Profil Premium');
      }

      // Only include if score is above threshold
      if (score >= 60) {
        matches.push({
          professionalId: professional.id,
          score: Math.min(score, 100), // Cap at 100
          reasoning: reasons.join(', ') || 'Profil correspondant',
        });
      }
    }

    // Sort by score descending and take top 10
    return matches.sort((a, b) => b.score - a.score).slice(0, 10);
  }
}

export const matchingController = new MatchingController();
