import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export const adminController = {

  async getStats(req: Request, res: Response) {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      const startOfMonth = new Date(now);
      startOfMonth.setDate(now.getDate() - 30);

      // ── Utilisateurs ──────────────────────────────────────────
      const [
        totalUsers,
        totalCreators,
        totalProfessionals,
        newUsersThisWeek,
        newUsersThisMonth,
        verifiedUsers,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'CREATOR' } }),
        prisma.user.count({ where: { role: 'PROFESSIONAL' } }),
        prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
        prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.user.count({ where: { emailVerified: true } }),
      ]);

      // ── Activité ──────────────────────────────────────────────
      const [
        totalMatches,
        matchesAccepted,
        matchesDeclined,
        matchesInProgress,
        totalConversations,
        conversationsCompleted,
        totalMessages,
        unreadMessages,
        totalProfileViews,
        profileViewsThisWeek,
      ] = await Promise.all([
        prisma.match.count(),
        prisma.match.count({ where: { status: 'ACCEPTED' } }),
        prisma.match.count({ where: { status: 'DECLINED' } }),
        prisma.match.count({ where: { projectStatus: 'IN_PROGRESS' } }),
        prisma.aiConversation.count(),
        prisma.aiConversation.count({ where: { status: 'COMPLETED' } }),
        prisma.message.count(),
        prisma.message.count({ where: { isRead: false } }),
        prisma.profileView.count(),
        prisma.profileView.count({ where: { viewedAt: { gte: startOfWeek } } }),
      ]);

      // ── Abonnements ───────────────────────────────────────────
      const [
        activeSubscriptions,
        subscriptionsByPlan,
      ] = await Promise.all([
        prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        prisma.subscription.groupBy({
          by: ['planId'],
          where: { status: 'ACTIVE' },
          _count: true,
        }),
      ]);

      const planDetails = await prisma.subscriptionPlan.findMany({
        where: { id: { in: subscriptionsByPlan.map(s => s.planId) } },
        select: { id: true, name: true },
      });

      const subscriptionsWithNames = subscriptionsByPlan.map((s: { planId: string; _count: number }) => ({
        plan: planDetails.find((p: { id: string; name: string }) => p.id === s.planId)?.name || 'Inconnu',
        count: s._count,
      }));

      // ── Derniers inscrits ─────────────────────────────────────
      const recentUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          email: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          creator: { select: { companyName: true } },
          professional: { select: { firstName: true, lastName: true } },
        },
      });

      // ── Top professionnels ────────────────────────────────────
      const topProfessionals = await prisma.professional.findMany({
        orderBy: { averageRating: 'desc' },
        take: 5,
        select: {
          firstName: true,
          lastName: true,
          averageRating: true,
          totalRatings: true,
          projectsCompleted: true,
          profileCompleteness: true,
          professions: {
            where: { isPrimary: true },
            include: { profession: { select: { name: true } } },
          },
        },
      });

      // ── Top métiers ───────────────────────────────────────────
      const topProfessions = await prisma.professionalProfession.groupBy({
        by: ['professionId'],
        _count: true,
        orderBy: { _count: { professionId: 'desc' } },
        take: 5,
      });

      const professionDetails = await prisma.profession.findMany({
        where: { id: { in: topProfessions.map(p => p.professionId) } },
        select: { id: true, name: true },
      });

      const topProfessionsWithNames = topProfessions.map((p: { professionId: string; _count: number }) => ({
        name: professionDetails.find((d: { id: string; name: string }) => d.id === p.professionId)?.name || 'Inconnu',
        count: p._count,
      }));

      // ── Inscriptions par jour (30 derniers jours) ─────────────
      const registrationsByDay = await prisma.user.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: startOfMonth } },
        _count: true,
        orderBy: { createdAt: 'asc' },
      });

      // Regrouper par date (jour)
      const dailyRegistrations: Record<string, number> = {};
      registrationsByDay.forEach((r: { createdAt: Date; _count: number }) => {
        const day = r.createdAt.toISOString().split('T')[0];
        dailyRegistrations[day] = (dailyRegistrations[day] || 0) + r._count;
      });

      res.json({
        success: true,
        data: {
          users: {
            total: totalUsers,
            creators: totalCreators,
            professionals: totalProfessionals,
            newThisWeek: newUsersThisWeek,
            newThisMonth: newUsersThisMonth,
            verifiedRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
          },
          activity: {
            matches: {
              total: totalMatches,
              accepted: matchesAccepted,
              declined: matchesDeclined,
              inProgress: matchesInProgress,
            },
            conversations: {
              total: totalConversations,
              completed: conversationsCompleted,
              completionRate: totalConversations > 0 ? Math.round((conversationsCompleted / totalConversations) * 100) : 0,
            },
            messages: {
              total: totalMessages,
              unread: unreadMessages,
            },
            profileViews: {
              total: totalProfileViews,
              thisWeek: profileViewsThisWeek,
            },
          },
          subscriptions: {
            active: activeSubscriptions,
            byPlan: subscriptionsWithNames,
          },
          recentUsers,
          topProfessionals: topProfessionals.map((p: any) => ({
            name: `${p.firstName} ${p.lastName}`,
            rating: p.averageRating,
            totalRatings: p.totalRatings,
            projectsCompleted: p.projectsCompleted,
            completeness: p.profileCompleteness,
            profession: p.professions[0]?.profession?.name || 'Non renseigné',
          })),
          topProfessions: topProfessionsWithNames,
          dailyRegistrations,
        },
      });
    } catch (error) {
      console.error('Admin stats error:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  },
};
