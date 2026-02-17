/**
 * JUNY Discovery Engine
 *
 * Système de recommandation et scoring pour portfolios
 * Inspiré des algorithmes de Behance, Pinterest, Instagram
 *
 * Phase 4 : Optimisations de performance avec cache et métriques
 * Phase 5 : Redis cache distribué avec fallback automatique
 */

import { cacheService } from './cache.service.js';
import { redisCacheService } from './redis-cache.service.js';

interface Portfolio {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  isFeatured: boolean;
  projectType: string | null;
  professional: {
    id: string;
    averageRating: number | null;
    projectsCompleted: number;
    profileCompleteness: number;
    createdAt: Date;
    firstName: string | null;
    lastName: string | null;
    profilePictureUrl: string | null;
    bannerUrl: string | null;
    bio: string | null;
  };
  tags: Array<{ id: string; tag: string }>;
  media: Array<any>;
  _count: {
    likes: number;
    comments?: number;
  };
}

interface ScoreComponents {
  quality: number;
  engagement: number;
  recency: number;
  velocity: number;
  fairness: number;
  final: number;
}

interface DiscoveryContext {
  type: 'explore' | 'search' | 'matching';
  viewerId?: string;
  viewerRole?: 'PROFESSIONAL' | 'CREATOR';
  searchQuery?: string;
  desiredProfessions?: string[];
  desiredMissionTypes?: string[];
  budget?: number;
  location?: string;
}

// Constantes de configuration
const CONFIG = {
  // Poids par défaut (contexte explore)
  WEIGHTS: {
    explore: {
      quality: 0.25,
      engagement: 0.30,
      recency: 0.20,
      velocity: 0.15,
      fairness: 0.10,
    },
    search: {
      quality: 0.30,
      engagement: 0.25,
      recency: 0.15,
      velocity: 0.10,
      fairness: 0.10,
      relevance: 0.10,
    },
    matching: {
      quality: 0.35,
      engagement: 0.20,
      recency: 0.10,
      velocity: 0.05,
      fairness: 0.05,
      match: 0.25,
    },
  },

  // Time decay - Half-life en jours
  HALF_LIFE: {
    explore: 7,
    search: 14,
    matching: 30,
  },

  // Seuils
  THRESHOLDS: {
    NEW_ACCOUNT_MONTHS: 3,
    TRENDING_LIKES_24H: 20,
    VIRAL_VELOCITY_RATIO: 3,
    HIGH_ENGAGEMENT_RATE: 0.05,
  },
};

export class DiscoveryService {
  private performanceMetrics = {
    totalCalculations: 0,
    cacheHits: 0,
    cacheMisses: 0,
    avgCalculationTimeMs: 0,
    totalTimeMs: 0,
  };

  // Sélection du cache (Redis par défaut, fallback sur in-memory)
  private get cache() {
    const useRedis = process.env.USE_REDIS_CACHE !== 'false';
    return useRedis ? redisCacheService : cacheService;
  }

  /**
   * Calcule le score de découverte complet pour un portfolio
   * Utilise le cache si disponible pour améliorer les performances
   */
  async calculateDiscoveryScore(
    portfolio: Portfolio,
    context: DiscoveryContext = { type: 'explore' },
    useCache: boolean = true
  ): Promise<{ score: number; components: ScoreComponents; personalizationBoost?: number }> {
    const startTime = Date.now();

    // Génération de la clé de cache
    const cacheKey = this.generateCacheKey(portfolio.id, context);

    // Vérifier le cache (Redis ou in-memory)
    if (useCache) {
      const cached = await this.cache.get<{ score: number; components: ScoreComponents; personalizationBoost?: number }>(cacheKey);
      if (cached) {
        this.performanceMetrics.cacheHits++;
        return cached;
      }
      this.performanceMetrics.cacheMisses++;
    }
    const quality = this.calculateQualityScore(portfolio);
    const engagement = this.calculateEngagementScore(portfolio);
    const recency = this.calculateRecencyScore(portfolio, context.type);
    const velocity = this.calculateVelocityScore(portfolio);
    const fairness = this.calculateFairnessScore(portfolio);

    // Récupérer les poids selon le contexte
    const weights = CONFIG.WEIGHTS[context.type];

    // Score de base
    let baseScore =
      quality * weights.quality +
      engagement * weights.engagement +
      recency * weights.recency +
      velocity * weights.velocity +
      fairness * weights.fairness;

    // 🎯 PERSONNALISATION
    let personalizationBoost = 0;
    if (context.viewerId && context.viewerRole) {
      personalizationBoost = this.calculatePersonalizationScore(portfolio, context);
      // La personnalisation est un multiplicateur, pas additif
      baseScore *= (1 + personalizationBoost);
    }

    // Bonus/Malus spéciaux
    if (portfolio.isFeatured) baseScore *= 1.2;
    if (portfolio.professional.averageRating && portfolio.professional.averageRating >= 4.5) {
      baseScore *= 1.1;
    }

    // Quality gates (seuils minimum)
    if (!portfolio.imageUrl) baseScore *= 0.7; // Pas d'image = pénalité
    if (!portfolio.description) baseScore *= 0.85; // Pas de description = pénalité
    if (portfolio.media.length === 0) baseScore *= 0.8; // Pas de médias = pénalité

    // Normalisation (0-100)
    const finalScore = Math.min(Math.max(baseScore * 100, 0), 100);

    const result = {
      score: finalScore,
      components: {
        quality,
        engagement,
        recency,
        velocity,
        fairness,
        final: finalScore,
      },
      personalizationBoost,
    };

    // Mise en cache (TTL = 5 minutes) - Redis ou in-memory
    if (useCache) {
      await this.cache.set(cacheKey, result, 300);
    }

    // Métriques de performance
    const elapsedTime = Date.now() - startTime;
    this.performanceMetrics.totalCalculations++;
    this.performanceMetrics.totalTimeMs += elapsedTime;
    this.performanceMetrics.avgCalculationTimeMs =
      this.performanceMetrics.totalTimeMs / this.performanceMetrics.totalCalculations;

    return result;
  }

  /**
   * Génère une clé de cache unique pour un portfolio et un contexte
   */
  private generateCacheKey(portfolioId: string, context: DiscoveryContext): string {
    const parts = [
      'discovery',
      portfolioId,
      context.type,
      context.viewerId || 'anon',
      context.viewerRole || 'none',
      context.searchQuery || '',
      (context.desiredMissionTypes || []).join(','),
    ];
    return parts.join(':');
  }

  /**
   * 1. QUALITY SCORE (0-1)
   * Évalue la qualité du profil et du projet
   */
  private calculateQualityScore(portfolio: Portfolio): number {
    const prof = portfolio.professional;

    // Score du profil (0-100)
    const profileQuality =
      ((prof.averageRating || 0) / 5) * 40 + // Note moyenne
      Math.min(prof.projectsCompleted / 50, 1) * 20 + // Projets complétés
      (prof.profileCompleteness / 100) * 15 + // Profil complété
      this.getAccountAgeScore(prof.createdAt) * 15 + // Ancienneté
      (prof.profilePictureUrl ? 5 : 0) + // Photo profil
      (prof.bannerUrl ? 2.5 : 0) + // Bannière
      (prof.bio ? 2.5 : 0); // Bio

    // Score du projet (0-100)
    const projectQuality =
      (portfolio.description ? 20 : 0) + // Description
      (portfolio.imageUrl ? 30 : 0) + // Image couverture
      Math.min(portfolio.media.length * 3, 30) + // Médias (max 10 → 30pts)
      Math.min(portfolio.tags.length * 5, 20) + // Tags (max 4 → 20pts)
      (portfolio.isFeatured ? 20 : 0); // Mis en avant

    // Moyenne pondérée (profil 40%, projet 60%)
    const quality = (profileQuality * 0.4 + projectQuality * 0.6) / 100;

    return Math.min(Math.max(quality, 0), 1);
  }

  /**
   * 2. ENGAGEMENT SCORE (0-1)
   * Normalisation logarithmique pour éviter que les gros dominent
   */
  private calculateEngagementScore(portfolio: Portfolio): number {
    const likesCount = portfolio._count.likes || 0;
    const commentsCount = portfolio._count.comments || 0;

    // Pondération : commentaire = 3x un like
    const engagementRaw = likesCount * 1.0 + commentsCount * 3.0;

    // Normalisation log (0 → 0, 1000 → 1)
    const normalized = Math.log10(1 + engagementRaw) / Math.log10(1001);

    return Math.min(Math.max(normalized, 0), 1);
  }

  /**
   * 3. RECENCY SCORE (0-1)
   * Décroissance exponentielle - les nouveaux projets sont boostés
   */
  private calculateRecencyScore(portfolio: Portfolio, context: 'explore' | 'search' | 'matching'): number {
    const now = new Date();
    const createdAt = new Date(portfolio.createdAt);
    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    // Half-life selon le contexte
    const halfLife = CONFIG.HALF_LIFE[context];

    // Décroissance exponentielle : e^(-t/halfLife)
    let recencyScore = Math.exp(-daysSinceCreation / halfLife);

    // Boost les tout nouveaux projets (< 24h)
    if (daysSinceCreation < 1) {
      recencyScore = Math.min(recencyScore + 0.3, 1);
    }
    // Boost les projets très récents (< 3 jours)
    else if (daysSinceCreation < 3) {
      recencyScore = Math.min(recencyScore + 0.15, 1);
    }

    return Math.min(Math.max(recencyScore, 0), 1);
  }

  /**
   * 4. VELOCITY SCORE (0-1)
   * Détecte les projets "trending" avec forte croissance récente
   */
  private calculateVelocityScore(portfolio: Portfolio): number {
    // Pour l'instant, on utilise une approximation basée sur la combinaison
    // recency + engagement. Dans une version future, on trackera les likes
    // avec timestamps pour un calcul précis de vélocité.

    const likesCount = portfolio._count.likes || 0;
    const daysSinceCreation = this.getDaysSince(portfolio.createdAt);

    // Éviter division par 0
    if (daysSinceCreation === 0 || likesCount === 0) {
      return 0;
    }

    // Likes par jour
    const likesPerDay = likesCount / Math.max(daysSinceCreation, 1);

    // Si > 3 likes/jour, c'est trending
    const velocityScore = Math.min(likesPerDay / 3, 1);

    // Bonus si beaucoup de likes récents
    if (likesCount > CONFIG.THRESHOLDS.TRENDING_LIKES_24H && daysSinceCreation < 2) {
      return Math.min(velocityScore + 0.3, 1);
    }

    return Math.min(Math.max(velocityScore, 0), 1);
  }

  /**
   * 5. FAIRNESS SCORE (0-1)
   * Donne une chance aux nouveaux et évite les monopoles
   */
  private calculateFairnessScore(portfolio: Portfolio): number {
    const accountAgeMonths = this.getAccountAgeMonths(portfolio.professional.createdAt);
    const projectsCompleted = portfolio.professional.projectsCompleted;

    let fairnessBoost = 0;

    // Boost nouveaux comptes
    if (accountAgeMonths < 1) {
      fairnessBoost = 1.0; // Max boost
    } else if (accountAgeMonths < 3) {
      fairnessBoost = 0.6;
    } else if (accountAgeMonths < 6) {
      fairnessBoost = 0.3;
    }

    // Pénaliser les très établis (légèrement)
    if (projectsCompleted > 50) {
      fairnessBoost -= 0.2;
    }
    if (projectsCompleted > 100) {
      fairnessBoost -= 0.3;
    }

    return Math.min(Math.max(fairnessBoost, 0), 1);
  }

  /**
   * 6. PERSONALIZATION SCORE (0-1)
   * Adapte le score selon le contexte et le viewer
   */
  private calculatePersonalizationScore(
    portfolio: Portfolio,
    context: DiscoveryContext
  ): number {
    if (!context.viewerRole) return 0;

    // CRÉATEUR cherche un talent
    if (context.viewerRole === 'CREATOR') {
      return this.calculateCreatorMatchScore(portfolio, context);
    }

    // PROFESSIONNEL explore (inspiration)
    if (context.viewerRole === 'PROFESSIONAL') {
      return this.calculateProfessionalInspirationScore(portfolio, context);
    }

    return 0;
  }

  /**
   * Score de matching pour un créateur qui cherche un talent
   */
  private calculateCreatorMatchScore(
    portfolio: Portfolio,
    context: DiscoveryContext
  ): number {
    let matchScore = 0;
    const maxScore = 100;

    // Match profession exacte (si spécifié)
    if (context.desiredProfessions && context.desiredProfessions.length > 0) {
      // TODO: Vérifier si le pro a une des professions demandées
      // Pour l'instant on ne peut pas car on n'a pas inclus professions dans le portfolio
      // matchScore += 40;
    }

    // Match type de mission (si spécifié)
    if (context.desiredMissionTypes && context.desiredMissionTypes.length > 0) {
      if (portfolio.projectType && context.desiredMissionTypes.includes(portfolio.projectType)) {
        matchScore += 30;
      }
    }

    // Match budget (si spécifié)
    // TODO: Nécessite d'avoir le minimumBudget du pro
    // if (context.budget) { ... }

    // Match localisation (si spécifié)
    // TODO: Nécessite d'avoir la localisation du pro
    // if (context.location) { ... }

    // Qualité du profil booste le match
    if (portfolio.professional.averageRating && portfolio.professional.averageRating >= 4.5) {
      matchScore += 20;
    }
    if (portfolio.professional.projectsCompleted >= 10) {
      matchScore += 15;
    }

    // Disponibilité (on suppose que les actifs sont disponibles)
    if (portfolio.professional.profileCompleteness >= 80) {
      matchScore += 15;
    }

    // Normalisation
    return Math.min(matchScore / maxScore, 1);
  }

  /**
   * Score d'inspiration pour un professionnel qui explore
   */
  private calculateProfessionalInspirationScore(
    portfolio: Portfolio,
    context: DiscoveryContext
  ): number {
    // Pour un pro qui explore, on booste :
    // - Les projets similaires (même type)
    // - Les projets très engageants (inspiration)
    // - Les nouveaux trending

    let inspirationScore = 0;

    // Projets populaires = inspirant
    const likesCount = portfolio._count.likes || 0;
    if (likesCount > 50) inspirationScore += 0.3;
    if (likesCount > 100) inspirationScore += 0.2;

    // Projets récents ET populaires = tendance
    const daysSince = this.getDaysSince(portfolio.createdAt);
    if (daysSince < 30 && likesCount > 20) {
      inspirationScore += 0.3;
    }

    // Featured = coup de cœur plateforme
    if (portfolio.isFeatured) {
      inspirationScore += 0.2;
    }

    return Math.min(inspirationScore, 1);
  }

  /**
   * Helpers
   */
  private getAccountAgeScore(createdAt: Date): number {
    const ageInYears = this.getDaysSince(createdAt) / 365;
    return Math.min(ageInYears, 1); // Max 1 an = score parfait
  }

  private getAccountAgeMonths(createdAt: Date): number {
    const now = new Date();
    const created = new Date(createdAt);
    return (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30);
  }

  private getDaysSince(date: Date): number {
    const now = new Date();
    const target = new Date(date);
    return (now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24);
  }

  /**
   * Détecte les flags de trending
   */
  getTrendingFlags(portfolio: Portfolio): string[] {
    const flags: string[] = [];
    const likesCount = portfolio._count.likes || 0;
    const daysSince = this.getDaysSince(portfolio.createdAt);
    const likesPerDay = likesCount / Math.max(daysSince, 1);

    // HOT : Beaucoup de likes récemment
    if (daysSince < 2 && likesCount >= CONFIG.THRESHOLDS.TRENDING_LIKES_24H) {
      flags.push('HOT');
    }

    // TRENDING : Bonne vélocité
    if (likesPerDay > 3 && daysSince < 7) {
      flags.push('TRENDING');
    }

    // VIRAL : Vélocité exceptionnelle
    if (likesPerDay > 10) {
      flags.push('VIRAL');
    }

    // NEW : Nouveau projet
    if (daysSince < 3) {
      flags.push('NEW');
    }

    // FEATURED : Mis en avant
    if (portfolio.isFeatured) {
      flags.push('FEATURED');
    }

    return flags;
  }

  /**
   * Filtre de qualité minimum
   */
  async meetsQualityThreshold(portfolio: Portfolio, minScore: number = 30): Promise<boolean> {
    const { score } = await this.calculateDiscoveryScore(portfolio);
    return score >= minScore;
  }

  /**
   * Tri d'un tableau de portfolios par score
   * Optimisé avec cache et logging de performance
   */
  async sortByDiscoveryScore(
    portfolios: Portfolio[],
    context: DiscoveryContext = { type: 'explore' },
    useCache: boolean = true
  ): Promise<Array<Portfolio & { discoveryScore: number; scoreComponents: ScoreComponents; trendingFlags?: string[] }>> {
    const startTime = Date.now();

    const scoredPromises = portfolios.map(async (portfolio) => {
      const { score, components, personalizationBoost } = await this.calculateDiscoveryScore(portfolio, context, useCache);
      const trendingFlags = this.getTrendingFlags(portfolio);

      return {
        ...portfolio,
        discoveryScore: score,
        scoreComponents: components,
        trendingFlags,
        personalizationBoost,
      };
    });

    const scored = (await Promise.all(scoredPromises))
      .sort((a, b) => b.discoveryScore - a.discoveryScore);

    const elapsedTime = Date.now() - startTime;
    console.log(`[DiscoveryEngine] Scored ${portfolios.length} portfolios in ${elapsedTime}ms`);

    return scored;
  }

  /**
   * Diversification - Évite trop de projets du même pro consécutifs
   */
  diversifyResults(
    portfolios: Array<Portfolio & { discoveryScore: number }>,
    maxConsecutiveSamePro: number = 2
  ): Array<Portfolio & { discoveryScore: number }> {
    const result: Array<Portfolio & { discoveryScore: number }> = [];
    const recentProIds: string[] = [];

    for (const portfolio of portfolios) {
      const proId = portfolio.professional.id;

      // Compter combien de fois ce pro apparaît dans les N derniers
      const countInRecent = recentProIds
        .slice(-maxConsecutiveSamePro)
        .filter((id) => id === proId).length;

      if (countInRecent < maxConsecutiveSamePro) {
        result.push(portfolio);
        recentProIds.push(proId);
      }
    }

    // Ajouter les restants à la fin
    const remaining = portfolios.filter((p) => !result.includes(p));
    return [...result, ...remaining];
  }

  /**
   * Retourne les métriques de performance
   */
  async getPerformanceMetrics(): Promise<typeof this.performanceMetrics & {
    cacheStats: any;
    cacheType: 'redis' | 'memory';
  }> {
    const useRedis = process.env.USE_REDIS_CACHE !== 'false';

    return {
      ...this.performanceMetrics,
      cacheStats: this.cache.getStats(),
      cacheType: useRedis ? 'redis' : 'memory',
    };
  }

  /**
   * Reset les métriques de performance
   */
  async resetPerformanceMetrics(): Promise<void> {
    this.performanceMetrics = {
      totalCalculations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgCalculationTimeMs: 0,
      totalTimeMs: 0,
    };
    this.cache.resetStats();
  }

  /**
   * Invalide le cache pour un portfolio spécifique
   * À appeler quand un portfolio est mis à jour, liké, etc.
   */
  async invalidatePortfolioCache(portfolioId: string): Promise<void> {
    const pattern = new RegExp(`^discovery:${portfolioId}:`);
    const deleted = await this.cache.deletePattern(pattern);
    console.log(`[DiscoveryEngine] Invalidated ${deleted} cache entries for portfolio ${portfolioId}`);
  }

  /**
   * Invalide tout le cache du Discovery Engine
   */
  async invalidateAllCache(): Promise<void> {
    const pattern = /^discovery:/;
    const deleted = await this.cache.deletePattern(pattern);
    console.log(`[DiscoveryEngine] Invalidated ${deleted} cache entries`);
  }

  /**
   * Health check du cache
   */
  async cacheHealthCheck(): Promise<any> {
    const useRedis = process.env.USE_REDIS_CACHE !== 'false';
    if (useRedis && 'healthCheck' in this.cache) {
      return await (this.cache as typeof redisCacheService).healthCheck();
    }
    return { redis: false, fallback: true, latency: null };
  }
}

export const discoveryService = new DiscoveryService();
