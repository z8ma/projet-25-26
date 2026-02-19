import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { validateExternalUrl, validateExternalUrlWithSafeBrowsing } from '../utils/urlValidator.js';
import { deleteImageByUrl, uploadFile, deleteMedia } from '../services/upload.service.js';
import { NotificationController } from './notification.controller.js';
import { discoveryService } from '../services/discovery.service.js';

const MAX_PORTFOLIO_ITEMS = 20;

export class ProfessionalController {
  // GET /api/professionals/profile - Get professional profile
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.userId;

      const professional = await prisma.professional.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              email: true,
              role: true,
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
              media: {
                orderBy: { order: 'asc' },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Profil professionnel non trouvé',
        });
      }

      res.json({
        success: true,
        data: professional,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération du profil',
      });
    }
  }

  // PUT /api/professionals/profile - Update professional profile
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const {
        firstName,
        lastName,
        experienceYears,
        hourlyRate,
        availability,
        bio,
        otherProfession,
        profilePictureUrl,
        bannerUrl,
        // Nouveaux champs IA Matching
        missionTypes,
        otherMissionType,
        preferredClientTypes,
        preferredCollabTypes,
        minimumBudget,
        exclusions,
        // Localisation
        city,
        country,
        // Social links
        websiteUrl,
        linkedinUrl,
        instagramUrl,
        twitterUrl,
        youtubeUrl,
        // Préférences de notifications
        notifyNewMatch,
        notifyMessage,
        notifyProjectUpdate,
        notifyEmail,
      } = req.body;

      // Get current profile to check for old images
      const currentProfile = await prisma.professional.findUnique({
        where: { userId },
        select: {
          profilePictureUrl: true,
          bannerUrl: true,
        },
      });

      // Delete old profile picture if it's being replaced
      if (
        profilePictureUrl &&
        currentProfile?.profilePictureUrl &&
        currentProfile.profilePictureUrl !== profilePictureUrl
      ) {
        await deleteImageByUrl(currentProfile.profilePictureUrl);
      }

      // Delete old banner if it's being replaced
      if (
        bannerUrl &&
        currentProfile?.bannerUrl &&
        currentProfile.bannerUrl !== bannerUrl
      ) {
        await deleteImageByUrl(currentProfile.bannerUrl);
      }

      const professional = await prisma.professional.update({
        where: { userId },
        data: {
          firstName,
          lastName,
          experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
          availability,
          bio,
          otherProfession,
          profilePictureUrl,
          bannerUrl,
          // Nouveaux champs IA Matching
          missionTypes: missionTypes || undefined,
          otherMissionType,
          preferredClientTypes: preferredClientTypes || undefined,
          preferredCollabTypes: preferredCollabTypes || undefined,
          minimumBudget: minimumBudget ? parseFloat(minimumBudget) : undefined,
          exclusions: exclusions || undefined,
          // Localisation
          city: city !== undefined ? city : undefined,
          country: country !== undefined ? country : undefined,
          // Social links
          websiteUrl: websiteUrl || undefined,
          linkedinUrl: linkedinUrl || undefined,
          instagramUrl: instagramUrl || undefined,
          twitterUrl: twitterUrl || undefined,
          youtubeUrl: youtubeUrl || undefined,
          // Préférences de notifications
          notifyNewMatch: notifyNewMatch !== undefined ? notifyNewMatch : undefined,
          notifyMessage: notifyMessage !== undefined ? notifyMessage : undefined,
          notifyProjectUpdate: notifyProjectUpdate !== undefined ? notifyProjectUpdate : undefined,
          notifyEmail: notifyEmail !== undefined ? notifyEmail : undefined,
        },
      });

      // Recalculer le score de complétude du profil
      const completeness = this.calculateProfileCompleteness(professional);
      await prisma.professional.update({
        where: { id: professional.id },
        data: { profileCompleteness: completeness },
      });

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: { ...professional, profileCompleteness: completeness },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du profil',
      });
    }
  }

  // Calcule le score de complétude du profil (0-100)
  private calculateProfileCompleteness(professional: any): number {
    let score = 0;
    const weights = {
      firstName: 5,
      lastName: 5,
      bio: 10,
      experienceYears: 5,
      hourlyRate: 5,
      availability: 5,
      missionTypes: 15,          // Prioritaire pour le matching
      preferredClientTypes: 10,
      preferredCollabTypes: 10,
      minimumBudget: 5,
      exclusions: 5,            // Important pour éviter les mauvais matchs
    };

    if (professional.firstName) score += weights.firstName;
    if (professional.lastName) score += weights.lastName;
    if (professional.bio && professional.bio.length > 50) score += weights.bio;
    if (professional.experienceYears) score += weights.experienceYears;
    if (professional.hourlyRate) score += weights.hourlyRate;
    if (professional.availability) score += weights.availability;
    if (professional.missionTypes && professional.missionTypes.length > 0) score += weights.missionTypes;
    if (professional.preferredClientTypes && professional.preferredClientTypes.length > 0) score += weights.preferredClientTypes;
    if (professional.preferredCollabTypes && professional.preferredCollabTypes.length > 0) score += weights.preferredCollabTypes;
    if (professional.minimumBudget) score += weights.minimumBudget;
    if (professional.exclusions && professional.exclusions.length > 0) score += weights.exclusions;

    // Score de base = 80, les 20% restants viennent des skills et portfolio
    return Math.min(score, 80);
  }

  // GET /api/professionals/professions - Get all available professions
  async getProfessions(req: Request, res: Response) {
    try {
      const professions = await prisma.profession.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      res.json({
        success: true,
        data: professions,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des métiers',
      });
    }
  }

  // POST /api/professionals/professions - Add profession to professional
  async addProfession(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { professionId, isPrimary } = req.body;

      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Profil professionnel non trouvé',
        });
      }

      // If setting as primary, remove primary from all other professions
      if (isPrimary) {
        await prisma.professionalProfession.updateMany({
          where: { professionalId: professional.id },
          data: { isPrimary: false },
        });
      }

      const professionalProfession = await prisma.professionalProfession.create({
        data: {
          professionalId: professional.id,
          professionId,
          isPrimary: isPrimary || false,
        },
        include: {
          profession: true,
        },
      });

      res.json({
        success: true,
        message: 'Métier ajouté avec succès',
        data: professionalProfession,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'ajout du métier',
      });
    }
  }

  // DELETE /api/professionals/professions/:id - Remove profession
  async removeProfession(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.professionalProfession.delete({
        where: { id: id as string },
      });

      res.json({
        success: true,
        message: 'Métier supprimé avec succès',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression du métier',
      });
    }
  }

  // POST /api/professionals/skills - Add software skill
  async addSkill(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const { softwareName, proficiencyLevel, yearsOfUse } = req.body;

      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Profil professionnel non trouvé',
        });
      }

      const skill = await prisma.softwareSkill.create({
        data: {
          professionalId: professional.id,
          softwareName,
          proficiencyLevel: proficiencyLevel || 'CONFIRMED',
          yearsOfUse: yearsOfUse ? parseInt(yearsOfUse) : undefined,
        },
      });

      res.json({
        success: true,
        message: 'Compétence ajoutée avec succès',
        data: skill,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'ajout de la compétence',
      });
    }
  }

  // PUT /api/professionals/skills/:id - Update software skill
  async updateSkill(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { softwareName, proficiencyLevel, yearsOfUse } = req.body;

      const skill = await prisma.softwareSkill.update({
        where: { id: id as string },
        data: {
          softwareName,
          proficiencyLevel,
          yearsOfUse: yearsOfUse ? parseInt(yearsOfUse) : undefined,
        },
      });

      res.json({
        success: true,
        message: 'Compétence mise à jour avec succès',
        data: skill,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour de la compétence',
      });
    }
  }

  // DELETE /api/professionals/skills/:id - Remove software skill
  async removeSkill(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.softwareSkill.delete({
        where: { id: id as string },
      });

      res.json({
        success: true,
        message: 'Compétence supprimée avec succès',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression de la compétence',
      });
    }
  }

  // POST /api/professionals/portfolio - Add portfolio item
  async addPortfolio(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const {
        title,
        description,
        imageUrl,
        projectUrl,
        projectType,
        tags,
        isFeatured,
        // Nouveaux champs enrichissement IA
        clientType,
        projectGoal,
        roleDescription,
        projectDuration,
        projectImpact,
        projectYear,
      } = req.body;

      const professional = await prisma.professional.findUnique({
        where: { userId },
        include: {
          portfolios: {
            select: { id: true },
          },
        },
      });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Profil professionnel non trouvé',
        });
      }

      // Check portfolio limit
      if (professional.portfolios.length >= MAX_PORTFOLIO_ITEMS) {
        return res.status(400).json({
          success: false,
          message: `Vous avez atteint la limite de ${MAX_PORTFOLIO_ITEMS} projets dans votre portfolio`,
        });
      }

      // Validate external URL if provided (with Google Safe Browsing)
      let sanitizedProjectUrl: string | undefined;
      if (projectUrl) {
        const urlValidation = await validateExternalUrlWithSafeBrowsing(projectUrl);
        if (!urlValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: urlValidation.error || 'URL invalide',
            threats: urlValidation.threats,
          });
        }
        sanitizedProjectUrl = urlValidation.sanitizedUrl;
      }

      // If setting as featured, unfeature other projects
      if (isFeatured) {
        await prisma.portfolio.updateMany({
          where: { professionalId: professional.id },
          data: { isFeatured: false },
        });
      }

      const portfolio = await prisma.portfolio.create({
        data: {
          professionalId: professional.id,
          title,
          description,
          imageUrl,
          projectUrl: sanitizedProjectUrl,
          projectType,
          isFeatured: isFeatured || false,
          // Nouveaux champs enrichissement IA
          clientType,
          projectGoal,
          roleDescription,
          projectDuration,
          projectImpact,
          projectYear: projectYear ? parseInt(projectYear) : undefined,
          tags: {
            create: tags?.map((tag: string) => ({ tag })) || [],
          },
        },
        include: {
          tags: true,
        },
      });

      res.json({
        success: true,
        message: 'Projet ajouté au portfolio avec succès',
        data: portfolio,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'ajout du projet',
      });
    }
  }

  // PUT /api/professionals/portfolio/:id - Update portfolio item
  async updatePortfolio(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const { id } = req.params;
      const {
        title,
        description,
        imageUrl,
        projectUrl,
        projectType,
        isFeatured,
        clientType,
        projectGoal,
        roleDescription,
        projectDuration,
        projectImpact,
        projectYear,
      } = req.body;

      // Validate external URL if provided (with Google Safe Browsing)
      let sanitizedProjectUrl: string | null | undefined;
      if (projectUrl) {
        const urlValidation = await validateExternalUrlWithSafeBrowsing(projectUrl);
        if (!urlValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: urlValidation.error || 'URL invalide',
            threats: urlValidation.threats,
          });
        }
        sanitizedProjectUrl = urlValidation.sanitizedUrl;
      } else if (projectUrl === '') {
        // Explicitly clearing the URL
        sanitizedProjectUrl = null;
      }

      // Get the portfolio item to check ownership and get professionalId
      const existingPortfolio = await prisma.portfolio.findUnique({
        where: { id: id as string },
        include: {
          professional: true,
        },
      });

      if (!existingPortfolio) {
        return res.status(404).json({
          success: false,
          message: 'Projet non trouvé',
        });
      }

      // If setting as featured, unfeature other projects
      if (isFeatured) {
        await prisma.portfolio.updateMany({
          where: {
            professionalId: existingPortfolio.professionalId,
            id: { not: id as string },
          },
          data: { isFeatured: false },
        });
      }

      const portfolio = await prisma.portfolio.update({
        where: { id: id as string },
        data: {
          title,
          description,
          imageUrl,
          projectUrl: sanitizedProjectUrl,
          projectType,
          isFeatured: isFeatured !== undefined ? isFeatured : undefined,
          clientType,
          projectGoal,
          roleDescription,
          projectDuration,
          projectImpact,
          projectYear: projectYear ? parseInt(projectYear) : undefined,
        },
        include: {
          tags: true,
        },
      });

      // Invalider le cache du Discovery Engine pour ce portfolio
      discoveryService.invalidatePortfolioCache(id as string);

      res.json({
        success: true,
        message: 'Projet mis à jour avec succès',
        data: portfolio,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du projet',
      });
    }
  }

  // DELETE /api/professionals/portfolio/:id - Remove portfolio item
  async removePortfolio(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Get portfolio item to retrieve image URL before deletion
      const portfolioItem = await prisma.portfolio.findUnique({
        where: { id: id as string },
        select: { imageUrl: true },
      });

      if (!portfolioItem) {
        return res.status(404).json({
          success: false,
          message: 'Projet portfolio non trouvé',
        });
      }

      // Delete from database first
      await prisma.portfolio.delete({
        where: { id: id as string },
      });

      // Invalider le cache du Discovery Engine pour ce portfolio
      discoveryService.invalidatePortfolioCache(id as string);

      // Then delete image from Cloudinary (don't await - let it run in background)
      if (portfolioItem.imageUrl) {
        deleteImageByUrl(portfolioItem.imageUrl).catch((err) => {
          console.error('Failed to delete portfolio image from Cloudinary:', err);
        });
      }

      res.json({
        success: true,
        message: 'Projet supprimé du portfolio avec succès',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression du projet',
      });
    }
  }

  // GET /api/professionals/matches - Get all matches for the professional
  async getMyMatches(req: Request, res: Response) {
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

      // Get all matches where this professional is involved
      const matches = await prisma.match.findMany({
        where: {
          professionalId: professional.id,
          status: {
            in: ['CONTACTED', 'ACCEPTED', 'DECLINED', 'PROPOSED'],
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
                  user: {
                    select: {
                      email: true,
                    },
                  },
                },
              },
            },
          },
          rating: true,
        },
      });

      // Get messages count for each match
      const matchesWithMessages = await Promise.all(
        matches.map(async (match) => {
          const messageCount = await prisma.message.count({
            where: { matchId: match.id },
          });
          const unreadCount = await prisma.message.count({
            where: {
              matchId: match.id,
              receiverId: userId,
              isRead: false,
            },
          });
          return {
            ...match,
            messageCount,
            unreadCount,
          };
        })
      );

      res.json({
        success: true,
        data: matchesWithMessages,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des matchs',
      });
    }
  }

  // PUT /api/professionals/matches/:matchId/respond - Accept or decline a match
  async respondToMatch(req: Request, res: Response) {
    try {
      const { matchId } = req.params;
      const { status } = req.body; // 'ACCEPTED' or 'DECLINED'
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
        include: {
          conversation: {
            include: {
              creator: true,
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

      const updatedMatch = await prisma.match.update({
        where: { id: matchId as string },
        data: { status },
      });

      res.json({
        success: true,
        message: status === 'ACCEPTED' ? 'Mission acceptée' : 'Mission déclinée',
        data: updatedMatch,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la réponse',
      });
    }
  }

  // GET /api/professionals/messages - Get messages for professional
  async getMessages(req: Request, res: Response) {
    try {
      const userId = req.userId as string;

      const messages = await prisma.message.findMany({
        where: { receiverId: userId },
        orderBy: { createdAt: 'desc' },
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

  // PUT /api/professionals/messages/:id/read - Mark message as read
  async markMessageAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const message = await prisma.message.update({
        where: { id: id as string },
        data: { isRead: true },
      });

      res.json({
        success: true,
        message: 'Message marqué comme lu',
        data: message,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du message',
      });
    }
  }

  // GET /api/professionals/explore - List all professionals for exploration (public)
  async exploreProfessionals(req: Request, res: Response) {
    try {
      const {
        profession,
        availability,
        minRating,
        maxHourlyRate,
        search,
        page = '1',
        limit = '20',
      } = req.query;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const take = parseInt(limit as string);

      // Build where clause
      const where: any = {};

      if (profession) {
        where.professions = {
          some: {
            profession: {
              name: {
                contains: profession as string,
                mode: 'insensitive',
              },
            },
          },
        };
      }

      if (availability) {
        where.availability = availability;
      }

      if (minRating) {
        where.averageRating = {
          gte: parseFloat(minRating as string),
        };
      }

      if (maxHourlyRate) {
        where.hourlyRate = {
          lte: parseFloat(maxHourlyRate as string),
        };
      }

      if (search) {
        where.OR = [
          { firstName: { contains: search as string } },
          { lastName: { contains: search as string } },
          { bio: { contains: search as string } },
          { softwareSkills: { some: { softwareName: { contains: search as string } } } },
          { professions: { some: { profession: { name: { contains: search as string } } } } },
        ];
      }

      const [professionals, total] = await Promise.all([
        prisma.professional.findMany({
          where,
          include: {
            professions: {
              include: {
                profession: true,
              },
            },
            softwareSkills: {
              take: 5,
            },
            portfolios: {
              take: 4,
              orderBy: { createdAt: 'desc' },
              include: {
                media: {
                  orderBy: { order: 'asc' },
                  take: 1,
                },
              },
            },
          },
          orderBy: [
            { isPremium: 'desc' },
            { averageRating: 'desc' },
            { projectsCompleted: 'desc' },
          ],
          skip,
          take,
        }),
        prisma.professional.count({ where }),
      ]);

      res.json({
        success: true,
        data: professionals,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des professionnels',
      });
    }
  }

  // GET /api/professionals/:id - Get a single professional's public profile
  async getProfessionalById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const professional = await prisma.professional.findUnique({
        where: { id: id as string },
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
              media: { orderBy: { order: 'asc' } },
              _count: { select: { likes: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
      });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Professionnel non trouvé',
        });
      }

      res.json({
        success: true,
        data: professional,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération du professionnel',
      });
    }
  }

  // POST /api/professionals/details/:id/message - Send direct message to a professional
  async sendDirectMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const userId = req.userId as string;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Le message ne peut pas être vide',
        });
      }

      // Find the professional
      const professional = await prisma.professional.findUnique({
        where: { id: id as string },
        select: { id: true, userId: true, firstName: true },
      });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Professionnel non trouvé',
        });
      }

      // Get sender info
      const sender = await prisma.user.findUnique({
        where: { id: userId },
        include: { creator: true },
      });

      if (!sender || sender.role !== 'CREATOR') {
        return res.status(403).json({
          success: false,
          message: 'Seuls les créateurs peuvent envoyer des messages directs',
        });
      }

      // Create the message
      await prisma.message.create({
        data: {
          senderId: userId,
          receiverId: professional.userId,
          subject: `Message de ${sender.creator?.companyName || 'un créateur'}`,
          content: message.trim(),
        },
      });

      // Create notification for the professional
      await prisma.notification.create({
        data: {
          professionalId: professional.id,
          type: 'MESSAGE_RECEIVED',
          title: 'Nouveau message',
          message: `${sender.creator?.companyName || 'Un créateur'} vous a envoyé un message`,
        },
      });

      res.json({
        success: true,
        message: 'Message envoyé avec succès',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Erreur lors de l'envoi du message",
      });
    }
  }

  // GET /api/professionals/professions/list - Get all available professions
  async listProfessions(req: Request, res: Response) {
    try {
      const professions = await prisma.profession.findMany({
        orderBy: { name: 'asc' },
      });

      res.json({
        success: true,
        data: professions,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des métiers',
      });
    }
  }

  // GET /api/professionals/dashboard - Get dashboard stats for professional
  async getDashboardStats(req: Request, res: Response) {
    try {
      const userId = req.userId as string;

      const professional = await prisma.professional.findUnique({
        where: { userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          projectsCompleted: true,
          averageRating: true,
          totalRatings: true,
          profileCompleteness: true,
          bio: true,
          missionTypes: true,
          hourlyRate: true,
          availability: true,
          experienceYears: true,
        },
      });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Profil professionnel non trouvé',
        });
      }

      // Get ratings/reviews received
      const ratings = await prisma.rating.findMany({
        where: {
          match: {
            professionalId: professional.id,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          match: {
            include: {
              conversation: {
                select: {
                  projectTitle: true,
                  creator: {
                    select: {
                      companyName: true,
                      industry: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Get completed projects (matches with COMPLETED status)
      const completedProjects = await prisma.match.findMany({
        where: {
          professionalId: professional.id,
          projectStatus: 'COMPLETED',
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: {
          conversation: {
            select: {
              projectTitle: true,
              projectSummary: true,
              creator: {
                select: {
                  companyName: true,
                  industry: true,
                },
              },
            },
          },
          rating: true,
        },
      });

      // Get recent collaborators (unique creators from recent matches)
      const recentMatches = await prisma.match.findMany({
        where: {
          professionalId: professional.id,
          status: { in: ['ACCEPTED', 'CONTACTED'] },
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
        include: {
          conversation: {
            select: {
              projectTitle: true,
              creator: {
                select: {
                  id: true,
                  companyName: true,
                  industry: true,
                  profilePictureUrl: true,
                },
              },
            },
          },
        },
      });

      // Dedupe collaborators by creator id
      const seenCreators = new Set<string>();
      const recentCollaborators = recentMatches
        .filter((match) => {
          const creatorId = match.conversation?.creator?.id;
          if (!creatorId || seenCreators.has(creatorId)) return false;
          seenCreators.add(creatorId);
          return true;
        })
        .slice(0, 6)
        .map((match) => ({
          id: match.conversation?.creator?.id,
          companyName: match.conversation?.creator?.companyName,
          industry: match.conversation?.creator?.industry,
          profilePictureUrl: match.conversation?.creator?.profilePictureUrl,
          lastProject: match.conversation?.projectTitle,
        }));

      // Get pending missions count
      const pendingMissions = await prisma.match.count({
        where: {
          professionalId: professional.id,
          status: 'CONTACTED',
        },
      });

      // Get favorites count
      const favoritesCount = await prisma.savedProfessional.count({
        where: {
          professionalId: professional.id,
        },
      });

      // Get active missions count
      const activeMissions = await prisma.match.count({
        where: {
          professionalId: professional.id,
          status: 'ACCEPTED',
          projectStatus: { in: ['IN_PROGRESS', 'NOT_STARTED'] },
        },
      });

      // Total matches received (all time)
      const totalMatches = await prisma.match.count({
        where: {
          professionalId: professional.id,
        },
      });

      // Recommendation appearances (PROPOSED matches = appeared in search results)
      const recommendationAppearances = await prisma.match.count({
        where: {
          professionalId: professional.id,
          status: { in: ['PROPOSED', 'CONTACTED', 'ACCEPTED', 'DECLINED'] },
        },
      });

      // Profile view statistics by source
      const profileViewsBySource = await prisma.profileView.groupBy({
        by: ['source'],
        where: {
          professionalId: professional.id,
        },
        _count: {
          id: true,
        },
      });

      // Transform to easier format
      const viewSources = {
        aiRecommendation: profileViewsBySource.find((v) => v.source === 'AI_RECOMMENDATION')?._count.id || 0,
        directSearch: profileViewsBySource.find((v) => v.source === 'DIRECT_SEARCH')?._count.id || 0,
        fromFavorites: profileViewsBySource.find((v) => v.source === 'FROM_FAVORITES')?._count.id || 0,
        linkSharing: profileViewsBySource.find((v) => v.source === 'LINK_SHARING')?._count.id || 0,
      };

      const totalViews = viewSources.aiRecommendation + viewSources.directSearch + viewSources.fromFavorites + viewSources.linkSharing;

      // Get active projects (IN_PROGRESS, REVIEW, NOT_STARTED with ACCEPTED status)
      const activeProjects = await prisma.match.findMany({
        where: {
          professionalId: professional.id,
          status: 'ACCEPTED',
          projectStatus: { in: ['NOT_STARTED', 'IN_PROGRESS', 'REVIEW'] },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: {
          conversation: {
            select: {
              projectTitle: true,
              projectSummary: true,
              creator: {
                select: {
                  companyName: true,
                  industry: true,
                },
              },
            },
          },
        },
      });

      // Projects in review
      const reviewProjects = await prisma.match.count({
        where: {
          professionalId: professional.id,
          status: 'ACCEPTED',
          projectStatus: 'REVIEW',
        },
      });

      // Get followers count
      const followersCount = await prisma.professionalFollow.count({
        where: {
          followedId: professional.id,
        },
      });

      // Get total portfolio likes across all portfolios
      const totalPortfolioLikes = await prisma.portfolioLike.count({
        where: {
          portfolio: {
            professionalId: professional.id,
          },
        },
      });

      // Get top liked portfolio projects
      const topLikedProjects = await prisma.portfolio.findMany({
        where: {
          professionalId: professional.id,
        },
        include: {
          media: {
            orderBy: { order: 'asc' },
            take: 1,
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
        orderBy: {
          likes: {
            _count: 'desc',
          },
        },
        take: 4,
      });

      res.json({
        success: true,
        data: {
          stats: {
            projectsCompleted: professional.projectsCompleted,
            averageRating: professional.averageRating ? Number(professional.averageRating) : null,
            totalRatings: professional.totalRatings,
            profileCompleteness: professional.profileCompleteness,
            pendingMissions,
            activeMissions,
            favoritesCount,
            totalMatches,
            recommendationAppearances,
            reviewProjects,
            followersCount,
            totalPortfolioLikes,
            // Profile view statistics
            totalViews,
            viewSources,
          },
          ratings: ratings.map((r) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            projectTitle: r.match?.conversation?.projectTitle,
            clientName: r.match?.conversation?.creator?.companyName,
            clientIndustry: r.match?.conversation?.creator?.industry,
          })),
          completedProjects: completedProjects.map((p) => ({
            id: p.id,
            projectTitle: p.conversation?.projectTitle,
            projectSummary: p.conversation?.projectSummary,
            clientName: p.conversation?.creator?.companyName,
            clientIndustry: p.conversation?.creator?.industry,
            completedAt: p.updatedAt,
            rating: p.rating?.rating,
          })),
          recentCollaborators,
          activeProjects: activeProjects.map((p) => ({
            id: p.id,
            projectTitle: p.conversation?.projectTitle,
            projectSummary: p.conversation?.projectSummary,
            clientName: p.conversation?.creator?.companyName,
            clientIndustry: p.conversation?.creator?.industry,
            projectStatus: p.projectStatus,
            updatedAt: p.updatedAt,
          })),
          topLikedProjects: topLikedProjects.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            imageUrl: p.imageUrl,
            media: p.media,
            likesCount: p._count.likes,
          })),
          profile: {
            bio: professional.bio,
            missionTypes: professional.missionTypes,
            hourlyRate: professional.hourlyRate,
            availability: professional.availability,
            experienceYears: professional.experienceYears,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des statistiques',
      });
    }
  }
  // ==========================================
  // PORTFOLIO MEDIA ENDPOINTS
  // ==========================================

  // POST /api/professionals/portfolio/:portfolioId/media - Upload media to portfolio
  async uploadPortfolioMedia(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const portfolioId = req.params.portfolioId as string;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni',
        });
      }

      // Verify ownership
      const professional = await prisma.professional.findUnique({
        where: { userId },
      });
      if (!professional) {
        return res.status(404).json({ success: false, message: 'Profil non trouvé' });
      }

      const portfolio = await prisma.portfolio.findFirst({
        where: { id: portfolioId, professionalId: professional.id },
        include: { media: { select: { id: true } } },
      });
      if (!portfolio) {
        return res.status(404).json({ success: false, message: 'Portfolio non trouvé' });
      }

      // Limit: max 10 media per portfolio
      if (portfolio.media.length >= 10) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 10 médias par projet',
        });
      }

      // Upload to Cloudinary
      const result = await uploadFile(
        req.file.buffer,
        req.file.mimetype,
        `juny/portfolio/${professional.id}`
      );

      // Determine media type
      const mediaType = req.file.mimetype.startsWith('video/')
        ? 'VIDEO' as const
        : req.file.mimetype === 'application/pdf'
          ? 'PDF' as const
          : 'IMAGE' as const;

      // Get next order value
      const maxOrder = await prisma.portfolioMedia.aggregate({
        where: { portfolioId },
        _max: { order: true },
      });

      const media = await prisma.portfolioMedia.create({
        data: {
          portfolioId,
          type: mediaType,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl || null,
          publicId: result.publicId,
          order: (maxOrder._max?.order ?? -1) + 1,
          duration: result.duration ? Math.round(result.duration) : null,
          width: result.width || null,
          height: result.height || null,
          fileSize: result.fileSize || null,
        },
      });

      res.json({
        success: true,
        message: 'Média uploadé avec succès',
        data: media,
      });
    } catch (error: any) {
      res.status(error.message?.includes('duration exceeds') ? 400 : 500).json({
        success: false,
        message: error.message || "Erreur lors de l'upload",
      });
    }
  }

  // DELETE /api/professionals/portfolio/:portfolioId/media/:mediaId - Delete media
  async deletePortfolioMedia(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const portfolioId = req.params.portfolioId as string;
      const mediaId = req.params.mediaId as string;

      const professional = await prisma.professional.findUnique({
        where: { userId },
      });
      if (!professional) {
        return res.status(404).json({ success: false, message: 'Profil non trouvé' });
      }

      const media = await prisma.portfolioMedia.findFirst({
        where: {
          id: mediaId,
          portfolioId: portfolioId,
          portfolio: { professionalId: professional.id },
        },
      });
      if (!media) {
        return res.status(404).json({ success: false, message: 'Média non trouvé' });
      }

      // Delete from Cloudinary
      const resourceType = media.type === 'VIDEO' ? 'video' : media.type === 'PDF' ? 'raw' : 'image';
      try {
        await deleteMedia(media.publicId, resourceType as 'image' | 'video' | 'raw');
      } catch (err) {
        console.error('Failed to delete from Cloudinary:', err);
      }

      // Delete from DB
      await prisma.portfolioMedia.delete({ where: { id: mediaId } });

      res.json({ success: true, message: 'Média supprimé' });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression',
      });
    }
  }

  // PUT /api/professionals/portfolio/:portfolioId/media/reorder - Reorder media
  async reorderPortfolioMedia(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const portfolioId = req.params.portfolioId as string;
      const { mediaIds } = req.body; // Array of media IDs in new order

      if (!Array.isArray(mediaIds)) {
        return res.status(400).json({ success: false, message: 'mediaIds doit être un tableau' });
      }

      const professional = await prisma.professional.findUnique({
        where: { userId },
      });
      if (!professional) {
        return res.status(404).json({ success: false, message: 'Profil non trouvé' });
      }

      // Verify portfolio ownership
      const portfolio = await prisma.portfolio.findFirst({
        where: { id: portfolioId, professionalId: professional.id },
      });
      if (!portfolio) {
        return res.status(404).json({ success: false, message: 'Portfolio non trouvé' });
      }

      // Update order for each media
      await Promise.all(
        mediaIds.map((id: string, index: number) =>
          prisma.portfolioMedia.updateMany({
            where: { id, portfolioId: portfolioId },
            data: { order: index },
          })
        )
      );

      res.json({ success: true, message: 'Ordre mis à jour' });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la réorganisation',
      });
    }
  }

  // POST /api/professionals/follow/:id - Follow a professional
  async followProfessional(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const targetId = req.params.id as string;

      const follower = await prisma.professional.findUnique({ where: { userId } });
      if (!follower) {
        return res.status(404).json({ success: false, message: 'Profil non trouvé' });
      }

      if (follower.id === targetId) {
        return res.status(400).json({ success: false, message: 'Vous ne pouvez pas vous suivre vous-même' });
      }

      const follow = await prisma.professionalFollow.create({
        data: { followerId: follower.id, followedId: targetId },
      });

      // Notify the followed professional
      await NotificationController.createNotification(
        targetId,
        'FOLLOW_RECEIVED',
        'Nouvel abonné',
        `${follower.firstName} ${follower.lastName} vous suit maintenant.`
      );

      res.json({ success: true, data: follow });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ success: false, message: 'Vous suivez déjà ce professionnel' });
      }
      res.status(500).json({ success: false, message: error.message || 'Erreur' });
    }
  }

  // DELETE /api/professionals/follow/:id - Unfollow a professional
  async unfollowProfessional(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const targetId = req.params.id as string;

      const follower = await prisma.professional.findUnique({ where: { userId } });
      if (!follower) {
        return res.status(404).json({ success: false, message: 'Profil non trouvé' });
      }

      await prisma.professionalFollow.deleteMany({
        where: { followerId: follower.id, followedId: targetId },
      });

      res.json({ success: true, message: 'Unfollowed' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Erreur' });
    }
  }

  // GET /api/professionals/follow/:id/status - Check if following
  async getFollowStatus(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const targetId = req.params.id as string;

      const follower = await prisma.professional.findUnique({ where: { userId } });
      if (!follower) {
        return res.json({ success: true, data: { isFollowing: false } });
      }

      const follow = await prisma.professionalFollow.findUnique({
        where: { followerId_followedId: { followerId: follower.id, followedId: targetId } },
      });

      res.json({ success: true, data: { isFollowing: !!follow } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Erreur' });
    }
  }

  // POST /api/professionals/portfolio/:portfolioId/like - Like a portfolio item
  async likePortfolio(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const portfolioId = req.params.portfolioId as string;

      const professional = await prisma.professional.findUnique({ where: { userId } });
      if (!professional) {
        return res.status(404).json({ success: false, message: 'Profil non trouvé' });
      }

      const like = await prisma.portfolioLike.create({
        data: { portfolioId, professionalId: professional.id },
      });

      // Invalider le cache du Discovery Engine pour ce portfolio (engagement a changé)
      discoveryService.invalidatePortfolioCache(portfolioId);

      // Notify the portfolio owner
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: portfolioId },
        select: { professionalId: true, title: true },
      });
      if (portfolio && portfolio.professionalId !== professional.id) {
        await NotificationController.createNotification(
          portfolio.professionalId,
          'PORTFOLIO_LIKED',
          'Nouveau like',
          `${professional.firstName} ${professional.lastName} a aimé votre projet "${portfolio.title}".`
        );
      }

      res.json({ success: true, data: like });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ success: false, message: 'Déjà liké' });
      }
      res.status(500).json({ success: false, message: error.message || 'Erreur' });
    }
  }

  // DELETE /api/professionals/portfolio/:portfolioId/like - Unlike a portfolio item
  async unlikePortfolio(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const portfolioId = req.params.portfolioId as string;

      const professional = await prisma.professional.findUnique({ where: { userId } });
      if (!professional) {
        return res.status(404).json({ success: false, message: 'Profil non trouvé' });
      }

      await prisma.portfolioLike.deleteMany({
        where: { portfolioId, professionalId: professional.id },
      });

      // Invalider le cache du Discovery Engine pour ce portfolio (engagement a changé)
      discoveryService.invalidatePortfolioCache(portfolioId);

      res.json({ success: true, message: 'Unlike' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Erreur' });
    }
  }

  // GET /api/professionals/explore/portfolios - List portfolios from all professionals
  async explorePortfolios(req: Request, res: Response) {
    try {
      const {
        projectType,
        search,
        page = '1',
        limit = '20',
        sortBy = 'discovery', // 'discovery' | 'recent' | 'popular'
        missionTypes, // Types de mission recherchés (pour matching)
        budget, // Budget du créateur (pour matching)
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const userId = req.userId; // Peut être undefined si non authentifié

      const where: any = {};

      if (projectType) {
        where.projectType = projectType as string;
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string } },
          { description: { contains: search as string } },
          { tags: { some: { tag: { contains: search as string } } } },
          { professional: { firstName: { contains: search as string } } },
          { professional: { lastName: { contains: search as string } } },
        ];
      }

      // Récupérer le viewer si authentifié
      let viewerRole: 'PROFESSIONAL' | 'CREATOR' | undefined;
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });
        viewerRole = user?.role as any;
      }

      // Récupérer tous les portfolios qui matchent (sans pagination initiale)
      // On pagine APRÈS le scoring pour avoir les meilleurs résultats
      const [allPortfolios, total] = await Promise.all([
        prisma.portfolio.findMany({
          where,
          include: {
            professional: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePictureUrl: true,
                bannerUrl: true,
                bio: true,
                averageRating: true,
                projectsCompleted: true,
                profileCompleteness: true,
                createdAt: true,
                professions: {
                  include: { profession: true },
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
            tags: true,
            media: { orderBy: { order: 'asc' } },
            _count: {
              select: {
                likes: true,
                comments: true,
              }
            },
          },
          // Limite raisonnable pour éviter de charger trop de données
          take: Math.min(pageNum * limitNum + 100, 500),
        }),
        prisma.portfolio.count({ where }),
      ]);

      let sortedPortfolios: any[] = [];

      // Appliquer le tri selon le mode choisi
      if (sortBy === 'discovery') {
        // 🎯 Algorithme de découverte intelligent avec personnalisation
        const contextType = search ? ('search' as const) : ('explore' as const);

        const context = {
          type: contextType,
          viewerId: userId,
          viewerRole,
          searchQuery: search as string,
          desiredMissionTypes: missionTypes ? (missionTypes as string).split(',') : undefined,
          budget: budget ? parseFloat(budget as string) : undefined,
        };

        const scoredPortfolios = await discoveryService.sortByDiscoveryScore(allPortfolios as any, context);

        // Diversification - éviter trop de projets du même pro consécutifs
        sortedPortfolios = discoveryService.diversifyResults(scoredPortfolios, 2);
      } else if (sortBy === 'popular') {
        // Tri par likes uniquement
        sortedPortfolios = allPortfolios.sort((a, b) =>
          (b._count?.likes || 0) - (a._count?.likes || 0)
        );
      } else {
        // Tri par date (recent)
        sortedPortfolios = allPortfolios.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      // Pagination après tri
      const skip = (pageNum - 1) * limitNum;
      const paginatedPortfolios = sortedPortfolios.slice(skip, skip + limitNum);

      res.json({
        success: true,
        data: paginatedPortfolios,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
        meta: {
          sortBy,
          algorithm: sortBy === 'discovery' ? 'JUNY Discovery Engine v1.0' : undefined,
          personalized: sortBy === 'discovery' && !!viewerRole,
          viewerRole: viewerRole || 'anonymous',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des portfolios',
      });
    }
  }

  // GET /api/professionals/portfolio/likes/status - Check liked status for multiple portfolios
  async getLikedPortfolios(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const ids = req.query.ids as string;

      const professional = await prisma.professional.findUnique({ where: { userId } });
      if (!professional) {
        return res.json({ success: true, data: [] });
      }

      const portfolioIds = ids?.split(',').filter(Boolean) || [];
      const likes = await prisma.portfolioLike.findMany({
        where: { professionalId: professional.id, portfolioId: { in: portfolioIds } },
        select: { portfolioId: true },
      });

      res.json({ success: true, data: likes.map(l => l.portfolioId) });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Erreur' });
    }
  }

  // GET /api/professionals/portfolio/:portfolioId/comments - Get comments for a portfolio
  async getPortfolioComments(req: Request, res: Response) {
    try {
      const portfolioId = req.params.portfolioId as string;

      const comments = await prisma.portfolioComment.findMany({
        where: { portfolioId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              creator: {
                select: {
                  id: true,
                  companyName: true,
                  profilePictureUrl: true,
                },
              },
              professional: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profilePictureUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: comments });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la récupération des commentaires' });
    }
  }

  // POST /api/professionals/portfolio/:portfolioId/comments - Add a comment to a portfolio
  async addPortfolioComment(req: Request, res: Response) {
    try {
      const portfolioId = req.params.portfolioId as string;
      const { content } = req.body;
      const userId = req.userId as string;

      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Le commentaire ne peut pas être vide',
        });
      }

      // Check if portfolio exists
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: portfolioId },
        select: { id: true, professionalId: true },
      });

      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio non trouvé',
        });
      }

      // Create comment
      const comment = await prisma.portfolioComment.create({
        data: {
          portfolioId,
          userId,
          content: content.trim(),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              creator: {
                select: {
                  id: true,
                  companyName: true,
                  profilePictureUrl: true,
                },
              },
              professional: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profilePictureUrl: true,
                },
              },
            },
          },
        },
      });

      // Create notification for portfolio owner (if not commenting on own portfolio)
      const professional = await prisma.professional.findUnique({
        where: { id: portfolio.professionalId },
        select: { userId: true },
      });

      if (professional && professional.userId !== userId) {
        const commenter = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            creator: { select: { companyName: true } },
            professional: { select: { firstName: true, lastName: true } },
          },
        });

        const commenterName = commenter?.role === 'CREATOR'
          ? commenter.creator?.companyName || 'Un créateur'
          : `${commenter?.professional?.firstName || ''} ${commenter?.professional?.lastName || ''}`.trim() || 'Un professionnel';

        await prisma.notification.create({
          data: {
            professionalId: portfolio.professionalId,
            type: 'PORTFOLIO_COMMENT',
            title: 'Nouveau commentaire',
            message: `${commenterName} a commenté votre projet`,
          },
        });
      }

      res.json({ success: true, data: comment });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Erreur lors de l'ajout du commentaire" });
    }
  }

  // DELETE /api/professionals/portfolio/comments/:commentId - Delete own comment
  async deletePortfolioComment(req: Request, res: Response) {
    try {
      const commentId = req.params.commentId as string;
      const userId = req.userId as string;

      // Find comment
      const comment = await prisma.portfolioComment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Commentaire non trouvé',
        });
      }

      // Check ownership
      if (comment.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Vous ne pouvez supprimer que vos propres commentaires',
        });
      }

      await prisma.portfolioComment.delete({
        where: { id: commentId },
      });

      res.json({ success: true, message: 'Commentaire supprimé' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la suppression du commentaire' });
    }
  }

  // GET /api/professionals/discovery/metrics - Get Discovery Engine performance metrics
  async getDiscoveryMetrics(req: Request, res: Response) {
    try {
      const metrics = await discoveryService.getPerformanceMetrics();

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des métriques',
      });
    }
  }

  // POST /api/professionals/discovery/invalidate-cache - Invalidate Discovery Engine cache
  async invalidateDiscoveryCache(req: Request, res: Response) {
    try {
      const { portfolioId } = req.body;

      if (portfolioId) {
        // Invalider le cache pour un portfolio spécifique
        await discoveryService.invalidatePortfolioCache(portfolioId);
        res.json({
          success: true,
          message: `Cache invalidé pour le portfolio ${portfolioId}`,
        });
      } else {
        // Invalider tout le cache
        await discoveryService.invalidateAllCache();
        res.json({
          success: true,
          message: 'Tout le cache du Discovery Engine a été invalidé',
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'invalidation du cache',
      });
    }
  }

  // GET /api/professionals/discovery/health - Health check for Discovery Engine and cache
  async getDiscoveryHealth(req: Request, res: Response) {
    try {
      const health = await discoveryService.cacheHealthCheck();
      const metrics = await discoveryService.getPerformanceMetrics();

      res.json({
        success: true,
        data: {
          cache: health,
          metrics: {
            totalCalculations: metrics.totalCalculations,
            avgCalculationTimeMs: metrics.avgCalculationTimeMs,
            cacheType: metrics.cacheType,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors du health check',
      });
    }
  }
}

export const professionalController = new ProfessionalController();
