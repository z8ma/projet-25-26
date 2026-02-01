import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { validateExternalUrl, validateExternalUrlWithSafeBrowsing } from '../utils/urlValidator.js';

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
        // Nouveaux champs IA Matching
        missionTypes,
        otherMissionType,
        preferredClientTypes,
        preferredCollabTypes,
        minimumBudget,
        exclusions,
      } = req.body;

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
          // Nouveaux champs IA Matching
          missionTypes: missionTypes || undefined,
          otherMissionType,
          preferredClientTypes: preferredClientTypes || undefined,
          preferredCollabTypes: preferredCollabTypes || undefined,
          minimumBudget: minimumBudget ? parseFloat(minimumBudget) : undefined,
          exclusions: exclusions || undefined,
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

      await prisma.portfolio.delete({
        where: { id: id as string },
      });

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
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { bio: { contains: search as string, mode: 'insensitive' } },
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
            },
            orderBy: { createdAt: 'desc' },
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

      // Get active missions count
      const activeMissions = await prisma.match.count({
        where: {
          professionalId: professional.id,
          status: 'ACCEPTED',
          projectStatus: { in: ['IN_PROGRESS', 'NOT_STARTED'] },
        },
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
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des statistiques',
      });
    }
  }
}

export const professionalController = new ProfessionalController();
