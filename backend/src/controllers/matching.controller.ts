import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export class MatchingController {
  // POST /api/matching/conversations/:conversationId/match - Generate matches for conversation
  async generateMatches(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = req.userId;

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
          id: conversationId,
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

      // Simple matching algorithm (in production, use AI for better matching)
      const matches = this.calculateMatches(conversation, professionals);

      // Delete existing matches for this conversation
      await prisma.match.deleteMany({
        where: { conversationId },
      });

      // Create new matches
      const createdMatches = await Promise.all(
        matches.map((match) =>
          prisma.match.create({
            data: {
              conversationId,
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
      const userId = req.userId;

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
        where: { conversationId },
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
      const userId = req.userId;

      const match = await prisma.match.findUnique({
        where: { id: matchId },
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
        where: { id: matchId },
        data: { status: 'CONTACTED' },
      });

      // Create message to professional
      if (message) {
        await prisma.message.create({
          data: {
            senderId: userId,
            receiverId: match.professional.userId,
            matchId: matchId,
            subject: `Nouveau projet: ${match.conversation.projectTitle}`,
            content: message,
          },
        });
      }

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

  // Helper: Calculate match scores (simple algorithm, replace with AI in production)
  private calculateMatches(
    conversation: any,
    professionals: any[]
  ): Array<{ professionalId: string; score: number; reasoning: string }> {
    const matches: Array<{ professionalId: string; score: number; reasoning: string }> = [];

    // Extract keywords from conversation messages
    const messages = (conversation.messages as any[]) || [];
    const conversationText = messages.map((m) => m.content).join(' ').toLowerCase();

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

      // Check profession match
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
