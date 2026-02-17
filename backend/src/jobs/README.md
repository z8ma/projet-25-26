# JUNY Background Jobs

Ce dossier contient les jobs en arrière-plan pour optimiser les performances de la plateforme.

## 📋 Jobs Disponibles

### 1. Discovery Pre-compute Job

**Fichier** : `discovery-precompute.job.ts`

**Description** : Pré-calcule les scores du Discovery Engine pour les portfolios populaires et les met en cache.

**Utilisation** :

```bash
# Exécution basique (500 portfolios)
npx ts-node src/jobs/discovery-precompute.job.ts

# Avec limite personnalisée
npx ts-node src/jobs/discovery-precompute.job.ts --limit=1000

# Avec logs verbeux
npx ts-node src/jobs/discovery-precompute.job.ts --verbose

# Refresh complet du cache
npx ts-node src/jobs/discovery-precompute.job.ts --refresh

# Combinaison
npx ts-node src/jobs/discovery-precompute.job.ts --limit=1000 --refresh --verbose
```

**CRON suggéré** :

```bash
# Toutes les heures
0 * * * * cd /path/to/backend && npx ts-node src/jobs/discovery-precompute.job.ts

# Toutes les 6 heures avec refresh
0 */6 * * * cd /path/to/backend && npx ts-node src/jobs/discovery-precompute.job.ts --refresh
```

**Bénéfices** :
- ⚡ Réponses API plus rapides (cache hit)
- 📊 Scores à jour pour les portfolios populaires
- 🎯 Meilleure expérience utilisateur

---

## 🔧 Configuration

### Variables d'environnement

Aucune variable spécifique requise. Les jobs utilisent la même configuration que l'API.

### Prérequis

- Node.js >= 18
- TypeScript
- Accès à la base de données (via `DATABASE_URL`)

---

## 📈 Monitoring

Les jobs génèrent des logs avec les métriques suivantes :

- Nombre de portfolios traités
- Temps d'exécution total
- Temps moyen par portfolio
- Taille du cache
- Taux de hit du cache

Exemple de sortie :

```
🚀 [Discovery Pre-compute] Starting...
   - Limit: 500 portfolios
   - Contexts: explore, search, matching
   ✓ Found 500 portfolios

📈 Pre-computing scores for context: explore
   ✓ Completed context: explore

✅ [Discovery Pre-compute] Completed!
   - Total scored: 1500
   - Time elapsed: 2450ms (2.45s)
   - Avg time per portfolio: 1.63ms

📊 Performance Metrics:
   - Cache size: 1500 entries
   - Cache hit rate: 0.0%
   - Avg calculation time: 1.63ms
```

---

## 🚀 Évolutions Futures

### Phase 5 : Redis

Remplacer le cache en mémoire par Redis pour :
- Cache distribué entre instances
- Persistance des données
- Meilleure scalabilité

### Autres Jobs Potentiels

- **Profile Analysis Job** : Analyse IA des portfolios
- **Trending Detection Job** : Détection des projets trending
- **Analytics Aggregation Job** : Agrégation des métriques
- **Email Digest Job** : Envoi des notifications par email
