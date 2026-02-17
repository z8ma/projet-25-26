/**
 * Discovery Engine Pre-computation Job
 *
 * Ce job pré-calcule les scores des portfolios populaires
 * et les met en cache pour améliorer les performances du Discovery Engine.
 *
 * Usage :
 * - CRON : 0 * * * * (chaque heure)
 * - Manuel : ts-node src/jobs/discovery-precompute.job.ts
 */

import { PrismaClient } from '@prisma/client';
import { discoveryService } from '../services/discovery.service';

const prisma = new PrismaClient();

interface PrecomputeOptions {
  limit?: number; // Nombre de portfolios à pré-calculer (défaut: 500)
  contexts?: Array<'explore' | 'search' | 'matching'>; // Contextes à pré-calculer
  verbose?: boolean; // Logs verbeux
}

/**
 * Pré-calcule les scores pour les portfolios les plus pertinents
 */
async function precomputeDiscoveryScores(options: PrecomputeOptions = {}) {
  const {
    limit = 500,
    contexts = ['explore'],
    verbose = false,
  } = options;

  console.log('🚀 [Discovery Pre-compute] Starting...');
  console.log(`   - Limit: ${limit} portfolios`);
  console.log(`   - Contexts: ${contexts.join(', ')}`);

  const startTime = Date.now();

  try {
    // 1. Récupérer les portfolios les plus pertinents
    // (récents, populaires, featured)
    if (verbose) console.log('📊 Fetching portfolios...');

    const portfolios = await prisma.portfolio.findMany({
      where: {
        imageUrl: { not: null }, // Minimum qualité
      },
      include: {
        professional: {
          select: {
            id: true,
            averageRating: true,
            projectsCompleted: true,
            profileCompleteness: true,
            createdAt: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
            bannerUrl: true,
            bio: true,
          },
        },
        tags: {
          select: {
            id: true,
            tag: true,
          },
        },
        media: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    console.log(`   ✓ Found ${portfolios.length} portfolios`);

    // 2. Pré-calculer les scores pour chaque contexte
    let totalScored = 0;

    for (const context of contexts) {
      if (verbose) console.log(`\n📈 Pre-computing scores for context: ${context}`);

      for (const portfolio of portfolios) {
        // Force le calcul et la mise en cache
        discoveryService.calculateDiscoveryScore(
          portfolio as any,
          { type: context },
          true // useCache = true pour mettre en cache
        );
        totalScored++;

        if (verbose && totalScored % 100 === 0) {
          console.log(`   ... processed ${totalScored} / ${portfolios.length * contexts.length}`);
        }
      }

      console.log(`   ✓ Completed context: ${context}`);
    }

    // 3. Afficher les statistiques
    const elapsedTime = Date.now() - startTime;
    const metrics = await discoveryService.getPerformanceMetrics();

    console.log('\n✅ [Discovery Pre-compute] Completed!');
    console.log(`   - Total scored: ${totalScored}`);
    console.log(`   - Time elapsed: ${elapsedTime}ms (${(elapsedTime / 1000).toFixed(2)}s)`);
    console.log(`   - Avg time per portfolio: ${(elapsedTime / totalScored).toFixed(2)}ms`);
    console.log('\n📊 Performance Metrics:');
    console.log(`   - Cache type: ${metrics.cacheType}`);
    console.log(`   - Cache stats:`, metrics.cacheStats);
    console.log(`   - Avg calculation time: ${metrics.avgCalculationTimeMs.toFixed(2)}ms`);

  } catch (error) {
    console.error('❌ [Discovery Pre-compute] Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Nettoie le cache et recalcule tout
 */
async function refreshCache(options: PrecomputeOptions = {}) {
  console.log('🔄 [Discovery Pre-compute] Refreshing cache...');

  // Invalider tout le cache existant
  discoveryService.invalidateAllCache();
  discoveryService.resetPerformanceMetrics();

  // Recalculer
  await precomputeDiscoveryScores(options);
}

// Exécution si appelé directement
if (require.main === module) {
  const args = process.argv.slice(2);
  const isRefresh = args.includes('--refresh');
  const isVerbose = args.includes('--verbose') || args.includes('-v');
  const limitArg = args.find((arg) => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 500;

  const options: PrecomputeOptions = {
    limit,
    contexts: ['explore', 'search', 'matching'],
    verbose: isVerbose,
  };

  if (isRefresh) {
    refreshCache(options)
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else {
    precomputeDiscoveryScores(options)
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  }
}

export { precomputeDiscoveryScores, refreshCache };
