import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { generateGeminiResponse, generateProjectTitle } from '../services/gemini.service.js';

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
      const { message, role, attachments } = req.body; // role: 'user' or 'assistant', attachments: optional uploaded files
      const userId = req.userId as string;

      // Fetch creator with all profile info for personalization
      const creator = await prisma.creator.findUnique({
        where: { userId },
        select: {
          id: true,
          companyName: true,
          industry: true,
          typicalBudget: true,
          preferredCreatives: true,
          description: true,
        },
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

      // Generate AI response using Gemini
      let aiResponse = '';

      if (role === 'user') {
        // Convert conversation messages to the format expected by Gemini
        const conversationHistory = currentMessages.map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

        // Call Gemini API for real AI response
        const geminiResult = await generateGeminiResponse(
          message,
          conversationHistory,
          {
            companyName: creator.companyName,
            industry: creator.industry,
            typicalBudget: creator.typicalBudget,
            preferredCreatives: creator.preferredCreatives as string[] | undefined,
          }
        );

        if (geminiResult.text) {
          aiResponse = geminiResult.text;
        } else {
          // Fallback to mock response if Gemini fails
          console.warn('Gemini failed, using mock response:', geminiResult.error);
          aiResponse = this.generateMockAiResponse(message, currentMessages.length, updatedInsights, {
            companyName: creator.companyName,
            industry: creator.industry,
            typicalBudget: creator.typicalBudget,
            preferredCreatives: creator.preferredCreatives as string[] | undefined,
          });
        }
      }

      // TODO: Analyze images with Gemini Vision API (when available)
      // Extract visual insights: style, colors, mood, references, etc.
      let visualInsights: any = null;
      if (attachments && attachments.length > 0) {
        // Placeholder for future Vision API integration
        // visualInsights = await analyzeImagesWithVision(attachments);

        // For now, extract basic info from attachments
        const images = attachments.filter((a: any) => a.resourceType === 'image');
        const pdfs = attachments.filter((a: any) => a.resourceType === 'raw');

        visualInsights = {
          hasVisuals: true,
          imageCount: images.length,
          pdfCount: pdfs.length,
          // These fields will be populated by Vision API later:
          dominantColors: [],
          detectedStyles: [],
          mood: null,
          complexity: null,
        };

        // Update insights with visual information
        if (images.length > 0 && role === 'user') {
          updatedInsights = {
            ...updatedInsights,
            visualReferences: {
              provided: true,
              count: images.length,
              // Will be enriched by Vision API:
              analyzedStyles: [],
              colorPalette: [],
              visualMood: null,
            },
          };
        }
      }

      // Add user message with attachments
      const newMessages = [
        ...currentMessages,
        {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
          ...(attachments && attachments.length > 0 && { attachments }),
          ...(visualInsights && { visualInsights }),
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

      // Auto-generate project title from first user message
      let autoGeneratedTitle: string | undefined;
      const isFirstMessage = currentMessages.length === 0;
      const hasDefaultTitle = conversation.projectTitle === 'Nouveau projet';

      if (role === 'user' && isFirstMessage && hasDefaultTitle) {
        try {
          const titleResult = await generateProjectTitle(message);
          if (titleResult.text && !titleResult.error) {
            autoGeneratedTitle = titleResult.text;
          }
        } catch (error) {
          console.error('Failed to auto-generate title:', error);
          // Continue without auto-generated title
        }
      }

      // Update conversation with messages, insights, and potentially new title
      const updatedConversation = await prisma.aiConversation.update({
        where: { id: id as string },
        data: {
          messages: newMessages,
          projectInsights: updatedInsights,
          aiCreditsUsed: conversation.aiCreditsUsed + 1,
          ...(autoGeneratedTitle && { projectTitle: autoGeneratedTitle }),
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

  // PUT /api/ai/conversations/:id/edit-message - Edit the last user message (requires subscription)
  async editLastMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newContent } = req.body;
      const userId = req.userId as string;

      if (!newContent?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Le contenu du message est requis',
        });
      }

      // Check subscription
      const activeSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
        },
        include: {
          plan: true,
        },
      });

      if (!activeSubscription) {
        return res.status(403).json({
          success: false,
          message: 'Un abonnement Starter ou supérieur est requis pour modifier vos messages',
          requiresUpgrade: true,
        });
      }

      const creator = await prisma.creator.findUnique({
        where: { userId },
      });

      if (!creator) {
        return res.status(404).json({
          success: false,
          message: 'Profil créateur non trouvé',
        });
      }

      const conversation = await prisma.aiConversation.findUnique({
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

      const currentMessages = (conversation.messages as any[]) || [];

      // Find the last user message index
      let lastUserMessageIndex = -1;
      for (let i = currentMessages.length - 1; i >= 0; i--) {
        if (currentMessages[i].role === 'user') {
          lastUserMessageIndex = i;
          break;
        }
      }

      if (lastUserMessageIndex === -1) {
        return res.status(400).json({
          success: false,
          message: 'Aucun message utilisateur à modifier',
        });
      }

      // Remove the last user message and any AI response after it
      const messagesBeforeEdit = currentMessages.slice(0, lastUserMessageIndex);

      // Analyze the new message for insights
      const currentInsights = conversation.projectInsights as any;
      const updatedInsights = this.analyzeMessageForInsights(newContent, currentInsights);

      // Generate new AI response
      const conversationHistory = messagesBeforeEdit.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      const geminiResult = await generateGeminiResponse(
        newContent,
        conversationHistory,
        {
          companyName: creator.companyName,
          industry: creator.industry,
          typicalBudget: creator.typicalBudget,
          preferredCreatives: creator.preferredCreatives as string[] | undefined,
        }
      );

      let aiResponse = '';
      if (geminiResult.text) {
        aiResponse = geminiResult.text;
      } else {
        aiResponse = this.generateMockAiResponse(newContent, messagesBeforeEdit.length, updatedInsights, {
          companyName: creator.companyName,
          industry: creator.industry,
          typicalBudget: creator.typicalBudget,
          preferredCreatives: creator.preferredCreatives as string[] | undefined,
        });
      }

      // Build new messages array
      const newMessages = [
        ...messagesBeforeEdit,
        {
          role: 'user',
          content: newContent,
          timestamp: new Date().toISOString(),
          edited: true,
        },
        {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toISOString(),
        },
      ];

      // Update conversation
      const updatedConversation = await prisma.aiConversation.update({
        where: { id: id as string },
        data: {
          messages: newMessages,
          projectInsights: updatedInsights,
        },
      });

      const readiness = this.isReadyForMatching(updatedInsights);

      res.json({
        success: true,
        data: {
          conversation: updatedConversation,
          aiResponse,
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
        message: error.message || 'Erreur lors de la modification du message',
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
    insights: any,
    creatorInfo?: {
      companyName?: string | null;
      industry?: string | null;
      typicalBudget?: string | null;
      preferredCreatives?: string[];
    }
  ): string {
    const readiness = this.isReadyForMatching(insights);

    // Personalized greeting based on company name
    const greeting = creatorInfo?.companyName
      ? `Bonjour ${creatorInfo.companyName}!`
      : 'Bonjour!';

    // Map industry to context
    const industryContext = this.getIndustryContext(creatorInfo?.industry);

    // Map budget to advice
    const budgetAdvice = this.getBudgetAdvice(creatorInfo?.typicalBudget);

    // Map preferred creatives to suggestions
    const creativeSuggestions = this.getCreativeSuggestions(creatorInfo?.preferredCreatives);

    if (messageCount === 0) {
      let response = `${greeting} Je suis ravi de vous aider à développer votre projet "${userMessage}".`;

      // Add industry-specific context if available
      if (industryContext) {
        response += ` ${industryContext}`;
      }

      response += `\n\nPour mieux vous accompagner, j'aurais besoin de quelques informations:\n\n1. Quel est l'objectif principal de ce projet?\n2. Qui est votre public cible?`;

      // Customize questions based on what we already know
      if (!creatorInfo?.typicalBudget) {
        response += `\n3. Quel est votre budget approximatif?`;
      } else {
        response += `\n3. ${budgetAdvice}`;
      }

      response += `\n4. Avez-vous déjà une identité visuelle ou des références?\n5. Quelle est votre deadline souhaitée?`;

      if (creativeSuggestions) {
        response += `\n\n${creativeSuggestions}`;
      }

      response += `\n\nRépondez aux questions qui vous semblent pertinentes, et nous pourrons affiner ensemble votre vision!`;

      return response;
    }

    // If ready for matching, suggest it
    if (readiness.ready) {
      const companyMention = creatorInfo?.companyName ? ` pour ${creatorInfo.companyName}` : '';
      return `Parfait! J'ai maintenant une vision claire de votre projet${companyMention}. Avec ${readiness.goodCount} aspects bien définis, je peux vous proposer des professionnels qui correspondent parfaitement à vos besoins.\n\nVoulez-vous que je lance le matching pour trouver les meilleurs créatifs disponibles? Cliquez sur "Trouver des Professionnels" quand vous êtes prêt!`;
    }

    // If close to ready, encourage more details
    if (readiness.goodCount >= 2) {
      return `Excellent! On progresse bien. Il me manque encore quelques précisions sur ${readiness.missingCategories.slice(0, 2).join(' et ')}. Plus vous me donnez de détails, meilleurs seront les professionnels que je pourrai vous proposer!`;
    }

    // General responses to keep conversation going
    const responses = [
      "Excellent! Ces informations sont très utiles. Pouvez-vous m'en dire plus sur le style visuel que vous imaginez?",
      "Je comprends mieux votre vision. Avez-vous des exemples de projets similaires qui vous inspirent?",
      creativeSuggestions || "Très intéressant! Pour ce type de projet, je recommande de faire appel à un graphiste et éventuellement un motion designer.",
      "Super! Plus vous me donnez de détails, mieux je pourrai matcher votre projet avec les bons professionnels.",
    ];

    return responses[Math.min(messageCount - 1, responses.length - 1)];
  }

  // Helper: Get industry-specific context
  private getIndustryContext(industry?: string | null): string {
    if (!industry) return '';

    const industryContextMap: Record<string, string> = {
      'tech': 'Dans le secteur tech, une identité visuelle moderne et épurée est souvent appréciée.',
      'finance': 'Pour le secteur financier, la confiance et le professionnalisme sont essentiels dans votre communication visuelle.',
      'retail': 'Dans le retail, attirer l\'attention et se démarquer de la concurrence est primordial.',
      'healthcare': 'Dans la santé, la clarté et la confiance sont des éléments clés de votre image.',
      'education': 'Pour l\'éducation, l\'accessibilité et la clarté du message sont importantes.',
      'food': 'Dans l\'alimentaire, les visuels appétissants et authentiques font toute la différence.',
      'fashion': 'Dans la mode, l\'esthétique et les tendances actuelles sont cruciales.',
      'entertainment': 'Dans le divertissement, la créativité et l\'impact visuel sont essentiels.',
      'real-estate': 'Dans l\'immobilier, les visuels professionnels inspirent confiance aux acheteurs.',
      'travel': 'Dans le voyage, les visuels immersifs et inspirants sont votre meilleur atout.',
    };

    return industryContextMap[industry] || '';
  }

  // Helper: Get budget advice
  private getBudgetAdvice(budget?: string | null): string {
    if (!budget) return 'Quel est votre budget approximatif?';

    const budgetAdviceMap: Record<string, string> = {
      '<1k': 'Je note que votre budget est limité - je vais vous orienter vers des professionnels juniors ou des freelances qui offrent un excellent rapport qualité-prix.',
      '1-5k': 'Avec ce budget, vous pouvez accéder à des professionnels expérimentés pour des projets de taille moyenne.',
      '5-10k': 'Ce budget vous permet de travailler avec des professionnels confirmés sur des projets complets.',
      '10-25k': 'Excellent budget qui ouvre la porte à des équipes créatives et des projets ambitieux.',
      '25-50k': 'Avec ce budget conséquent, je peux vous orienter vers les meilleurs talents du marché.',
      '50k+': 'Budget premium - je vais vous mettre en relation avec des agences et des créatifs de renom.',
    };

    return budgetAdviceMap[budget] || 'Quel est votre budget approximatif?';
  }

  // Helper: Get creative suggestions based on preferences
  private getCreativeSuggestions(preferredCreatives?: string[]): string {
    if (!preferredCreatives || preferredCreatives.length === 0) return '';

    const creativeNames: Record<string, string> = {
      'graphiste': 'graphistes',
      'ux-ui': 'designers UX/UI',
      'motion': 'motion designers',
      'video': 'vidéastes',
      '3d': 'artistes 3D',
      'illustrateur': 'illustrateurs',
      'photographe': 'photographes',
      'directeur-artistique': 'directeurs artistiques',
    };

    const names = preferredCreatives
      .map(c => creativeNames[c])
      .filter(Boolean)
      .slice(0, 3);

    if (names.length === 0) return '';

    return `Je vois que vous travaillez habituellement avec des ${names.join(', ')} - je garderai cela en tête pour le matching!`;
  }
}

export const aiController = new AiController();
