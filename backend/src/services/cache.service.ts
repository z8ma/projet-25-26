/**
 * JUNY Cache Service
 *
 * Service de cache en mémoire avec TTL pour optimiser les performances
 * du Discovery Engine et autres services nécessitant du caching.
 *
 * IMPORTANT: Ce cache est en mémoire (in-process). Si vous déployez
 * plusieurs instances de l'API, chaque instance aura son propre cache.
 * Pour un cache distribué, utilisez Redis (voir Phase 5).
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0,
  };

  /**
   * Récupère une valeur du cache
   * @returns La valeur si trouvée et non expirée, sinon undefined
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Vérifier expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      return undefined;
    }

    this.stats.hits++;
    return entry.value as T;
  }

  /**
   * Stocke une valeur dans le cache
   * @param key Clé unique
   * @param value Valeur à stocker
   * @param ttlSeconds Time To Live en secondes (défaut: 5 minutes)
   */
  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
    this.stats.sets++;
  }

  /**
   * Supprime une clé du cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.evictions++;
    }
    return deleted;
  }

  /**
   * Supprime toutes les clés correspondant à un pattern
   * @param pattern Expression régulière ou string
   */
  deletePattern(pattern: string | RegExp): number {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    this.stats.evictions += count;
    return count;
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.evictions += size;
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    this.stats.evictions += cleaned;
    return cleaned;
  }

  /**
   * Retourne les statistiques du cache
   */
  getStats(): typeof this.stats & {
    size: number;
    hitRate: number;
  } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
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
      evictions: 0,
    };
  }

  /**
   * Retourne la taille actuelle du cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Vérifie si une clé existe (et n'est pas expirée)
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }
}

// Instance singleton
export const cacheService = new CacheService();

// Nettoyage automatique toutes les 10 minutes
setInterval(() => {
  const cleaned = cacheService.cleanup();
  if (cleaned > 0) {
    console.log(`[CacheService] Cleaned ${cleaned} expired entries`);
  }
}, 10 * 60 * 1000);
