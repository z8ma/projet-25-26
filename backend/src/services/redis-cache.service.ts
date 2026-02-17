/**
 * JUNY Redis Cache Service
 *
 * Service de cache distribué basé sur Redis avec fallback automatique
 * vers le cache en mémoire en cas de panne Redis.
 *
 * Features:
 * - Auto-reconnection avec retry exponentiel
 * - Graceful degradation (fallback vers in-memory)
 * - Health checks
 * - Métriques de performance
 * - Support clustering Redis
 */

import Redis, { RedisOptions } from 'ioredis';
import { cacheService as inMemoryCache } from './cache.service.js';

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  errors: number;
  fallbackHits: number;
  redisStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
}

export class RedisCacheService {
  private redis: Redis | null = null;
  private isRedisAvailable: boolean = false;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    errors: 0,
    fallbackHits: 0,
    redisStatus: 'disconnected',
  };

  constructor() {
    this.initialize();
  }

  /**
   * Initialise la connexion Redis
   */
  private initialize(): void {
    // Configuration Redis depuis les variables d'environnement
    const redisUrl = process.env.REDIS_URL;
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
    const redisPassword = process.env.REDIS_PASSWORD;
    const redisDb = parseInt(process.env.REDIS_DB || '0', 10);

    // Si REDIS_ENABLED=false, on reste en mode fallback
    if (process.env.REDIS_ENABLED === 'false') {
      console.log('[RedisCache] Redis disabled via env var, using in-memory fallback');
      return;
    }

    try {
      const options: RedisOptions = {
        retryStrategy: (times: number) => {
          // Retry exponentiel avec max 5 secondes
          const delay = Math.min(times * 100, 5000);
          console.log(`[RedisCache] Retry attempt ${times}, waiting ${delay}ms`);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
      };

      // Connexion via URL ou host/port
      if (redisUrl) {
        this.redis = new Redis(redisUrl, options);
      } else {
        this.redis = new Redis({
          ...options,
          host: redisHost,
          port: redisPort,
          password: redisPassword,
          db: redisDb,
        });
      }

      // Event handlers
      this.redis.on('connect', () => {
        console.log('[RedisCache] ✅ Connected to Redis');
        this.isRedisAvailable = true;
        this.stats.redisStatus = 'connected';
      });

      this.redis.on('ready', () => {
        console.log('[RedisCache] 🚀 Redis is ready');
        this.isRedisAvailable = true;
        this.stats.redisStatus = 'connected';
      });

      this.redis.on('error', (error) => {
        console.error('[RedisCache] ❌ Redis error:', error.message);
        this.isRedisAvailable = false;
        this.stats.redisStatus = 'error';
        this.stats.errors++;
      });

      this.redis.on('close', () => {
        console.log('[RedisCache] 🔌 Redis connection closed');
        this.isRedisAvailable = false;
        this.stats.redisStatus = 'disconnected';
      });

      this.redis.on('reconnecting', () => {
        console.log('[RedisCache] 🔄 Reconnecting to Redis...');
        this.stats.redisStatus = 'connecting';
      });

    } catch (error) {
      console.error('[RedisCache] Failed to initialize Redis:', error);
      this.isRedisAvailable = false;
      this.stats.redisStatus = 'error';
    }
  }

  /**
   * Récupère une valeur du cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    // Si Redis disponible, essayer Redis d'abord
    if (this.isRedisAvailable && this.redis) {
      try {
        const value = await this.redis.get(key);
        if (value !== null) {
          this.stats.hits++;
          return JSON.parse(value) as T;
        }
        this.stats.misses++;
        return undefined;
      } catch (error) {
        console.error(`[RedisCache] Error getting key ${key}:`, error);
        this.stats.errors++;
        // Fallback vers in-memory
      }
    }

    // Fallback vers cache en mémoire
    this.stats.fallbackHits++;
    return inMemoryCache.get<T>(key);
  }

  /**
   * Stocke une valeur dans le cache
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    this.stats.sets++;

    // Si Redis disponible, stocker dans Redis
    if (this.isRedisAvailable && this.redis) {
      try {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
      } catch (error) {
        console.error(`[RedisCache] Error setting key ${key}:`, error);
        this.stats.errors++;
        // Continue avec fallback
      }
    }

    // Toujours stocker aussi dans le cache en mémoire (double write)
    // pour avoir un backup si Redis devient indisponible
    inMemoryCache.set(key, value, ttlSeconds);
  }

  /**
   * Supprime une clé
   */
  async delete(key: string): Promise<boolean> {
    let deleted = false;

    if (this.isRedisAvailable && this.redis) {
      try {
        const result = await this.redis.del(key);
        deleted = result > 0;
      } catch (error) {
        console.error(`[RedisCache] Error deleting key ${key}:`, error);
        this.stats.errors++;
      }
    }

    // Supprimer aussi du cache en mémoire
    inMemoryCache.delete(key);

    return deleted;
  }

  /**
   * Supprime toutes les clés correspondant à un pattern
   */
  async deletePattern(pattern: string | RegExp): Promise<number> {
    let count = 0;
    const regexPattern = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    if (this.isRedisAvailable && this.redis) {
      try {
        // Scan pour trouver toutes les clés matching
        const keys: string[] = [];
        const stream = this.redis.scanStream({
          match: typeof pattern === 'string' ? pattern : '*',
          count: 100,
        });

        for await (const keyBatch of stream) {
          for (const key of keyBatch) {
            if (regexPattern.test(key)) {
              keys.push(key);
            }
          }
        }

        if (keys.length > 0) {
          count = await this.redis.del(...keys);
        }
      } catch (error) {
        console.error(`[RedisCache] Error deleting pattern ${pattern}:`, error);
        this.stats.errors++;
      }
    }

    // Supprimer aussi du cache en mémoire
    count += inMemoryCache.deletePattern(regexPattern);

    return count;
  }

  /**
   * Vide tout le cache
   */
  async clear(): Promise<void> {
    if (this.isRedisAvailable && this.redis) {
      try {
        await this.redis.flushdb();
      } catch (error) {
        console.error('[RedisCache] Error clearing cache:', error);
        this.stats.errors++;
      }
    }

    inMemoryCache.clear();
  }

  /**
   * Vérifie si une clé existe
   */
  async has(key: string): Promise<boolean> {
    if (this.isRedisAvailable && this.redis) {
      try {
        const exists = await this.redis.exists(key);
        return exists === 1;
      } catch (error) {
        console.error(`[RedisCache] Error checking key ${key}:`, error);
        this.stats.errors++;
      }
    }

    return inMemoryCache.has(key);
  }

  /**
   * Retourne les statistiques du cache
   */
  getStats(): CacheStats & {
    inMemoryStats: ReturnType<typeof inMemoryCache.getStats>;
  } {
    return {
      ...this.stats,
      inMemoryStats: inMemoryCache.getStats(),
    };
  }

  /**
   * Reset les statistiques
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      errors: 0,
      fallbackHits: 0,
      redisStatus: this.stats.redisStatus,
    };
    inMemoryCache.resetStats();
  }

  /**
   * Health check - vérifie que Redis fonctionne
   */
  async healthCheck(): Promise<{
    redis: boolean;
    fallback: boolean;
    latency: number | null;
  }> {
    let redisHealthy = false;
    let latency: number | null = null;

    if (this.redis) {
      try {
        const start = Date.now();
        await this.redis.ping();
        latency = Date.now() - start;
        redisHealthy = true;
      } catch (error) {
        console.error('[RedisCache] Health check failed:', error);
      }
    }

    return {
      redis: redisHealthy,
      fallback: true, // In-memory cache is always available
      latency,
    };
  }

  /**
   * Ferme proprement la connexion Redis
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.quit();
        console.log('[RedisCache] 👋 Disconnected from Redis');
      } catch (error) {
        console.error('[RedisCache] Error disconnecting:', error);
      }
    }
  }

  /**
   * Retourne le statut de Redis
   */
  getStatus(): {
    available: boolean;
    status: CacheStats['redisStatus'];
    errorCount: number;
  } {
    return {
      available: this.isRedisAvailable,
      status: this.stats.redisStatus,
      errorCount: this.stats.errors,
    };
  }
}

// Instance singleton
export const redisCacheService = new RedisCacheService();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[RedisCache] SIGTERM received, closing Redis connection...');
  await redisCacheService.disconnect();
});

process.on('SIGINT', async () => {
  console.log('[RedisCache] SIGINT received, closing Redis connection...');
  await redisCacheService.disconnect();
});
