import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export class AiController {
  // GET /api/ai/conversations - Get all conversations for creator
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
          id: id as string,
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
          id: id as string,
          creatorId: creator.id,
        },
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation non trouvée',
        });
      }

      // Get current messages and insights
      const currentMessages = (conversation.messages as any[]) || [];
      const currentInsights = conversation.projectInsights as any;

      // Analyze user message for insights (if user message)
      let updatedInsights = currentInsights;
      if (role === 'user') {
        updatedInsights = this.analyzeMessageForInsights(message, currentInsights);
      }

      // For now, we'll just store the messages without calling the actual AI
      // In production, this is where you'd call OpenAI/Claude API
      let aiResponse = '';

      if (role === 'user') {
        // Simulate AI response (in production, call actual AI API here)
        aiResponse = this.generateMockAiResponse(message, currentMessages.length, updatedInsights);
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

      // Update conversation with messages and insights
      const updatedConversation = await prisma.aiConversation.update({
        where: { id: id as string },
        data: {
          messages: newMessages,
          projectInsights: updatedInsights,
          aiCreditsUsed: conversation.aiCreditsUsed + 1,
        },
      });

      // Calculate readiness for response
      const readiness = this.isReadyForMatching(updatedInsights);

      res.json({
        success: true,
        data: {
          conversation: updatedConversation,
          aiResponse: role === 'user' ? aiResponse : null,
          readiness: {
            ready: readiness.ready,
            goodCount: readiness.goodCount,
            missingCategories: readiness.missingCategories,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'ajout du message',
      });
    }
  }

  // PUT /api/ai/conversations/:id/title - Update conversation title
  async updateTitle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { projectTitle } = req.body;
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

      const conversation = await prisma.aiConversation.update({
        where: {
          id: id as string,
          creatorId: creator.id,
        },
        data: {
          projectTitle,
        },
      });

      res.json({
        success: true,
        message: 'Titre mis à jour avec succès',
        data: conversation,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du titre',
      });
    }
  }

  // PUT /api/ai/conversations/:id/complete - Mark conversation as complete
  async completeConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { projectSummary } = req.body;
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

      const conversation = await prisma.aiConversation.update({
        where: { id: id as string },
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

      await prisma.aiConversation.delete({
        where: { id: id as string },
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

  // Helper: Analyze user message and score project insights
  private analyzeMessageForInsights(
    userMessage: string,
    currentInsights: any = null
  ): any {
    const message = userMessage.toLowerCase();

    // Initialize insights if not exists
    const insights = currentInsights || {
      projectType: 'none',
      targetAudience: 'none',
      visualStyle: 'none',
      budget: 'none',
      deadline: 'none',
    };

    // Project Type Keywords
    const projectTypeKeywords = {
      excellent: [
        /logo.*détaillé/,
        /site web.*e-commerce/,
        /application mobile.*ios.*android/,
        /vidéo.*motion.*design/,
        /campagne.*publicitaire.*complète/,
      ],
      good: [
        /logo/,
        /site web/,
        /site internet/,
        /application/,
        /app/,
        /vidéo/,
        /animation/,
        /motion/,
        /3d/,
        /graphisme/,
        /illustration/,
        /branding/,
        /identité visuelle/,
        /packaging/,
        /affiche/,
        /flyer/,
        /brochure/,
        /catalogue/,
      ],
      acceptable: [/créer/, /besoin/, /projet/, /design/, /création/],
    };

    // Target Audience Keywords
    const audienceKeywords = {
      excellent: [
        /jeunes.*\d+.*\d+.*ans/,
        /professionnels.*secteur/,
        /entreprises.*b2b/,
        /grand public.*familles/,
      ],
      good: [
        /jeunes/,
        /ados/,
        /adolescents/,
        /adultes/,
        /seniors/,
        /professionnels/,
        /entreprises/,
        /b2b/,
        /b2c/,
        /grand public/,
        /familles/,
        /enfants/,
        /étudiants/,
      ],
      acceptable: [/public/, /cible/, /audience/, /clients/, /utilisateurs/],
    };

    // Visual Style Keywords
    const styleKeywords = {
      excellent: [
        /minimaliste.*moderne.*épuré/,
        /vintage.*rétro.*années/,
        /coloré.*dynamique.*énergique/,
      ],
      good: [
        /minimaliste/,
        /moderne/,
        /épuré/,
        /vintage/,
        /rétro/,
        /coloré/,
        /sobre/,
        /élégant/,
        /dynamique/,
        /professionnel/,
        /ludique/,
        /corporate/,
        /créatif/,
        /artistique/,
      ],
      acceptable: [/style/, /design/, /visuel/, /esthétique/, /look/],
    };

    // Budget Keywords
    const budgetKeywords = {
      excellent: [/\d+\s*€/, /\d+\s*euros?/, /budget.*\d+/, /entre.*\d+.*et.*\d+/],
      good: [
        /petit budget/,
        /budget limité/,
        /budget moyen/,
        /budget confortable/,
        /budget important/,
        /sans limite/,
      ],
      acceptable: [/budget/, /prix/, /coût/, /tarif/, /combien/],
    };

    // Deadline Keywords
    const deadlineKeywords = {
      excellent: [
        /\d+\s*(jours?|semaines?|mois)/,
        /avant.*\d+/,
        /deadline.*\d+/,
        /date.*précise/,
      ],
      good: [
        /urgent/,
        /rapide/,
        /vite/,
        /bientôt/,
        /court terme/,
        /long terme/,
        /pas pressé/,
        /flexible/,
      ],
      acceptable: [/délai/, /deadline/, /temps/, /quand/, /date/],
    };

    // Scoring function
    const scoreCategory = (keywords: any): string => {
      if (keywords.excellent?.some((regex: RegExp) => regex.test(message))) {
        return 'excellent';
      }
      if (keywords.good?.some((regex: RegExp) => regex.test(message))) {
        return 'good';
      }
      if (keywords.acceptable?.some((regex: RegExp) => regex.test(message))) {
        return 'acceptable';
      }
      return 'none';
    };

    // Update scores (only upgrade, never downgrade)
    const levels = ['none', 'acceptable', 'good', 'excellent'];
    const updateScore = (current: string, newScore: string): string => {
      const currentLevel = levels.indexOf(current);
      const newLevel = levels.indexOf(newScore);
      return newLevel > currentLevel ? newScore : current;
    };

    insights.projectType = updateScore(
      insights.projectType,
      scoreCategory(projectTypeKeywords)
    );
    insights.targetAudience = updateScore(
      insights.targetAudience,
      scoreCategory(audienceKeywords)
    );
    insights.visualStyle = updateScore(
      insights.visualStyle,
      scoreCategory(styleKeywords)
    );
    insights.budget = updateScore(insights.budget, scoreCategory(budgetKeywords));
    insights.deadline = updateScore(
      insights.deadline,
      scoreCategory(deadlineKeywords)
    );

    return insights;
  }

  // Helper: Check if insights are sufficient for matching
  private isReadyForMatching(insights: any): {
    ready: boolean;
    goodCount: number;
    missingCategories: string[];
  } {
    if (!insights) {
      return { ready: false, goodCount: 0, missingCategories: [] };
    }

    const categories = [
      'projectType',
      'targetAudience',
      'visualStyle',
      'budget',
      'deadline',
    ];
    const categoryLabels: Record<string, string> = {
      projectType: 'le type de projet',
      targetAudience: 'le public cible',
      visualStyle: 'le style visuel',
      budget: 'le budget',
      deadline: 'les délais',
    };

    let goodCount = 0;
    const missingCategories: string[] = [];

    categories.forEach((cat) => {
      const level = insights[cat];
      if (level === 'good' || level === 'excellent') {
        goodCount++;
      } else {
        missingCategories.push(categoryLabels[cat]);
      }
    });

    return {
      ready: goodCount >= 3,
      goodCount,
      missingCategories,
    };
  }

  // Helper: Generate mock AI response (replace with actual AI API call in production)
  private generateMockAiResponse(
    userMessage: string,
    messageCount: number,
    insights: any
  ): string {
    const readiness = this.isReadyForMatching(insights);

    if (messageCount === 0) {
      return `Parfait! Je suis ravi de vous aider à développer votre projet "${userMessage}". Pour mieux vous accompagner, j'aurais besoin de quelques informations:\n\n1. Quel est l'objectif principal de ce projet?\n2. Qui est votre public cible?\n3. Avez-vous déjà une identité visuelle ou des références?\n4. Quel est votre budget approximatif?\n5. Quelle est votre deadline souhaitée?\n\nRépondez aux questions qui vous semblent pertinentes, et nous pourrons affiner ensemble votre vision!`;
    }

    // If ready for matching, suggest it
    if (readiness.ready) {
      return `Parfait! J'ai maintenant une vision claire de votre projet. Avec ${readiness.goodCount} aspects bien définis, je peux vous proposer des professionnels qui correspondent parfaitement à vos besoins.\n\nVoulez-vous que je lance le matching pour trouver les meilleurs créatifs disponibles? Cliquez sur "Trouver des Professionnels" quand vous êtes prêt!`;
    }

    // If close to ready, encourage more details
    if (readiness.goodCount >= 2) {
      return `Excellent! On progresse bien. Il me manque encore quelques précisions sur ${readiness.missingCategories.slice(0, 2).join(' et ')}. Plus vous me donnez de détails, meilleurs seront les professionnels que je pourrai vous proposer!`;
    }

    // General responses to keep conversation going
    const responses = [
      "Excellent! Ces informations sont très utiles. Pouvez-vous m'en dire plus sur le style visuel que vous imaginez?",
      "Je comprends mieux votre vision. Avez-vous des exemples de projets similaires qui vous inspirent?",
      "Très intéressant! Pour ce type de projet, je recommande de faire appel à un graphiste et éventuellement un motion designer.",
      "Super! Plus vous me donnez de détails, mieux je pourrai matcher votre projet avec les bons professionnels.",
    ];

    return responses[Math.min(messageCount - 1, responses.length - 1)];
  }
}

export const aiController = new AiController();
