import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export class AiController {
  // GET /api/ai/conversations - Get all conversations for creator
  async getConversations(req: Request, res: Response) {
    try {
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

      const conversations = await prisma.aiConversation.findMany({
        where: { creatorId: creator.id },
        orderBy: { updatedAt: 'desc' },
        include: {
          matches: {
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
                },
              },
            },
          },
        },
      });

      res.json({
        success: true,
        data: conversations,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des conversations',
      });
    }
  }

  // GET /api/ai/conversations/:id - Get single conversation
  async getConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
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
          id,
          creatorId: creator.id,
        },
        include: {
          matches: {
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
                    take: 5,
                  },
                },
              },
            },
            orderBy: {
              matchScore: 'desc',
            },
          },
          documents: true,
        },
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation non trouvée',
        });
      }

      res.json({
        success: true,
        data: conversation,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération de la conversation',
      });
    }
  }

  // POST /api/ai/conversations - Create new conversation
  async createConversation(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { projectTitle } = req.body;

      const creator = await prisma.creator.findUnique({
        where: { userId },
      });

      if (!creator) {
        return res.status(404).json({
          success: false,
          message: 'Profil créateur non trouvé',
        });
      }

      const conversation = await prisma.aiConversation.create({
        data: {
          creatorId: creator.id,
          projectTitle: projectTitle || 'Nouveau projet',
          status: 'IN_PROGRESS',
          messages: [],
        },
      });

      res.json({
        success: true,
        message: 'Conversation créée avec succès',
        data: conversation,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la création de la conversation',
      });
    }
  }

  // POST /api/ai/conversations/:id/messages - Add message to conversation
  async addMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { message, role } = req.body; // role: 'user' or 'assistant'
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
          id,
          creatorId: creator.id,
        },
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation non trouvée',
        });
      }

      // Get current messages
      const currentMessages = (conversation.messages as any[]) || [];

      // For now, we'll just store the messages without calling the actual AI
      // In production, this is where you'd call OpenAI/Claude API
      let aiResponse = '';

      if (role === 'user') {
        // Simulate AI response (in production, call actual AI API here)
        aiResponse = this.generateMockAiResponse(message, currentMessages.length);
      }

      // Add user message
      const newMessages = [
        ...currentMessages,
        {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        },
      ];

      // Add AI response if this was a user message
      if (role === 'user' && aiResponse) {
        newMessages.push({
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toISOString(),
        });
      }

      // Update conversation
      const updatedConversation = await prisma.aiConversation.update({
        where: { id },
        data: {
          messages: newMessages,
          aiCreditsUsed: conversation.aiCreditsUsed + 1,
        },
      });

      res.json({
        success: true,
        data: {
          conversation: updatedConversation,
          aiResponse: role === 'user' ? aiResponse : null,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'ajout du message',
      });
    }
  }

  // PUT /api/ai/conversations/:id/complete - Mark conversation as complete
  async completeConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { projectSummary } = req.body;
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

      const conversation = await prisma.aiConversation.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          projectSummary: projectSummary || '',
        },
      });

      res.json({
        success: true,
        message: 'Conversation terminée avec succès',
        data: conversation,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la finalisation',
      });
    }
  }

  // DELETE /api/ai/conversations/:id - Delete conversation
  async deleteConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
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

      await prisma.aiConversation.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Conversation supprimée avec succès',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression',
      });
    }
  }

  // Helper: Generate mock AI response (replace with actual AI API call in production)
  private generateMockAiResponse(userMessage: string, messageCount: number): string {
    if (messageCount === 0) {
      return `Parfait! Je suis ravi de vous aider à développer votre projet "${userMessage}". Pour mieux vous accompagner, j'aurais besoin de quelques informations:\n\n1. Quel est l'objectif principal de ce projet?\n2. Qui est votre public cible?\n3. Avez-vous déjà une identité visuelle ou des références?\n4. Quel est votre budget approximatif?\n5. Quelle est votre deadline souhaitée?\n\nRépondez aux questions qui vous semblent pertinentes, et nous pourrons affiner ensemble votre vision!`;
    }

    const responses = [
      "Excellent! Ces informations sont très utiles. Pouvez-vous m'en dire plus sur le style visuel que vous imaginez?",
      "Je comprends mieux votre vision. Avez-vous des exemples de projets similaires qui vous inspirent?",
      "Très intéressant! Pour ce type de projet, je recommande de faire appel à un graphiste et éventuellement un motion designer.",
      "Parfait! Je pense qu'on a assez d'informations maintenant. Avec ces détails sur votre projet, je peux vous suggérer des professionnels qui correspondent parfaitement à vos besoins.\n\nVoulez-vous que je lance le matching pour trouver les meilleurs créatifs disponibles?",
      "Super! Plus vous me donnez de détails, mieux je pourrai matcher votre projet avec les bons professionnels. N'hésitez pas à cliquer sur 'Trouver des Professionnels' quand vous êtes prêt!",
    ];

    return responses[Math.min(messageCount - 1, responses.length - 1)];
  }
}

export const aiController = new AiController();
