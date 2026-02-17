# 🎯 JUNY Discovery Engine

Système de recommandation intelligente pour les portfolios créatifs.

## 📊 Vue d'ensemble

Le Discovery Engine est un algorithme multi-factoriel qui combine **5 composantes principales** pour calculer un score de pertinence (0-100) pour chaque portfolio :

1. **Quality Score** (25%) - Qualité du profil et du projet
2. **Engagement Score** (30%) - Preuve sociale (likes, commentaires)
3. **Recency Score** (20%) - Fraîcheur avec décroissance temporelle
4. **Velocity Score** (15%) - Détection des trending
5. **Fairness Score** (10%) - Équité pour les nouveaux

## 🎨 Utilisation

### Endpoint Principal

```
GET /api/professionals/explore/portfolios
```

### Paramètres

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `sortBy` | string | `'discovery'` | Mode de tri : `discovery` / `popular` / `recent` |
| `page` | number | `1` | Page de résultats |
| `limit` | number | `20` | Nombre de résultats par page |
| `projectType` | string | - | Filtrer par type de projet |
| `search` | string | - | Recherche textuelle |
| `missionTypes` | string | - | Types de missions (CSV) pour matching |
| `budget` | number | - | Budget du créateur pour matching |

### Exemples d'utilisation

**1. Mode Découverte (recommandé)**
```
GET /api/professionals/explore/portfolios?sortBy=discovery
```
→ Utilise l'algorithme complet avec tous les facteurs

**2. Mode Populaire**
```
GET /api/professionals/explore/portfolios?sortBy=popular
```
→ Tri simple par nombre de likes

**3. Mode Récent**
```
GET /api/professionals/explore/portfolios?sortBy=recent
```
→ Tri chronologique (les plus récents d'abord)

**4. Mode Matching (créateur cherchant un talent)**
```
GET /api/professionals/explore/portfolios?
  sortBy=discovery&
  missionTypes=ui-ux,web-design&
  budget=5000
```
→ Personnalise les résultats selon les besoins du créateur

## 🔢 Détail des Composantes

### 1. Quality Score (25%)

**Profil** (40% du quality score) :
- Note moyenne (40 points max)
- Projets complétés (20 points)
- Profil complété (15 points)
- Ancienneté (15 points)
- Photo/bannière/bio (10 points)

**Projet** (60% du quality score) :
- Description présente (20 points)
- Image de couverture (30 points)
- Nombre de médias (30 points max)
- Tags présents (20 points)
- Featured (20 points)

### 2. Engagement Score (30%)

Normalisation logarithmique pour éviter que les gros monopolisent :

```
Engagement = log10(1 + (likes × 1.0 + comments × 3.0)) / log10(1001)
```

**Exemples** :
- 0 interactions → Score = 0
- 10 likes → Score = 0.30
- 50 likes + 5 comments → Score = 0.61
- 100 likes + 10 comments → Score = 0.71
- 500 likes + 20 comments → Score = 0.90

### 3. Recency Score (20%)

Décroissance exponentielle avec boost nouveauté :

```
Recency = e^(-days / halfLife)
```

**Half-life** selon contexte :
- Explore : 7 jours
- Search : 14 jours
- Matching : 30 jours

**Boost** :
- < 24h : +30%
- < 3 jours : +15%

**Exemples** (halfLife = 7 jours) :
- Jour 0 → 100%
- Jour 7 → 50%
- Jour 14 → 25%
- Jour 30 → 6%

### 4. Velocity Score (15%)

Détecte les projets qui montent vite :

```
Velocity = min(likesPerDay / 3, 1.0)
```

**Trending Flags** :
- 🔥 **HOT** : >20 likes en <2 jours
- 📈 **TRENDING** : >3 likes/jour sur 7 jours
- 🚀 **VIRAL** : >10 likes/jour
- ✨ **NEW** : <3 jours
- ⭐ **FEATURED** : Mis en avant

### 5. Fairness Score (10%)

Boost pour nouveaux comptes :

| Ancienneté | Boost |
|------------|-------|
| < 1 mois | 100% |
| 1-3 mois | 60% |
| 3-6 mois | 30% |
| > 6 mois | 0% |

Pénalités anti-monopole :
- >50 projets complétés : -20%
- >100 projets complétés : -30%

## 🎯 Personnalisation

### Pour un CRÉATEUR qui cherche

Le système booste les portfolios qui matchent :
- Type de mission recherché
- Budget compatible
- Note élevée (>4.5★)
- Expérience avérée (>10 projets)
- Profil complété (>80%)

**Boost max** : +100% sur le score final

### Pour un PROFESSIONNEL qui explore

Le système booste les portfolios :
- Très populaires (>50 likes)
- Récents ET populaires (trending)
- Featured (coup de cœur plateforme)

**Boost max** : +100% sur le score final

## 📈 Quality Gates

Seuils automatiques :

- ❌ Pas d'image → Score × 0.7
- ❌ Pas de description → Score × 0.85
- ❌ Pas de médias → Score × 0.8

## 🔀 Diversification

Pour éviter la monotonie, le système :
- Limite à **max 2 projets consécutifs** du même professionnel
- Distribue les résultats de manière équilibrée

## 🎪 Exemple Concret

**Scénario** : 3 projets en compétition

### Portfolio A : Vétéran
- Profil : 50 projets, 4.8★, 2 ans
- Projet : nouveau (2 jours), 5 likes

**Calcul** :
```
Quality:    95/100 × 0.25 = 23.75%
Engagement: 10/100 × 0.30 = 3.00%
Recency:    90/100 × 0.20 = 18.00%
Velocity:   30/100 × 0.15 = 4.50%
Fairness:    0/100 × 0.10 = 0.00%
→ Score final : 49.25/100
```

### Portfolio B : Nouveau talent qui cartonne
- Profil : 3 projets, 4.5★, 2 mois
- Projet : nouveau (2 jours), 25 likes (!!)

**Calcul** :
```
Quality:    30/100 × 0.25 = 7.50%
Engagement: 80/100 × 0.30 = 24.00%
Recency:    95/100 × 0.20 = 19.00%
Velocity:   100/100 × 0.15 = 15.00%
Fairness:   70/100 × 0.10 = 7.00%
→ Score final : 72.50/100 🎯 GAGNE !
```

### Portfolio C : Ancien projet populaire
- Profil : 25 projets, 4.6★, 1 an
- Projet : ancien (3 mois), 100 likes

**Calcul** :
```
Quality:    70/100 × 0.25 = 17.50%
Engagement: 70/100 × 0.30 = 21.00% (decay 40%)
→ Engagement réel = 21.00% × 0.4 = 8.40%
Recency:    20/100 × 0.20 = 4.00%
Velocity:   10/100 × 0.15 = 1.50%
Fairness:   30/100 × 0.10 = 3.00%
→ Score final : 34.40/100
```

**Résultat** : B > A > C
Le nouveau talent qui cartonne bat le vétéran ! ✅

## 🚀 Performance

### ✅ Optimisations actuelles (Phase 1-4)

- **Pagination intelligente** : Scoring sur subset, pas toute la DB
- **Limite raisonnable** : Max 500 portfolios scorés par requête
- **Calcul en mémoire** : Pas de requêtes DB supplémentaires
- **🆕 Cache en mémoire** : Scores mis en cache avec TTL de 5 minutes
- **🆕 Indexation DB** : Index sur `createdAt`, `isFeatured`, `projectsCompleted`, etc.
- **🆕 Métriques de performance** : Tracking temps de calcul, hit rate, etc.
- **🆕 Invalidation automatique** : Cache invalidé lors des updates/likes
- **🆕 Pre-computation job** : Script CRON pour pré-calculer les scores populaires

### Métriques en temps réel

**Endpoint** : `GET /api/professionals/discovery/metrics`

Retourne :
```json
{
  "totalCalculations": 1234,
  "cacheHits": 890,
  "cacheMisses": 344,
  "avgCalculationTimeMs": 1.2,
  "totalTimeMs": 1480.8,
  "cacheStats": {
    "hits": 890,
    "misses": 344,
    "sets": 344,
    "evictions": 12,
    "size": 1500,
    "hitRate": 0.72
  }
}
```

### Gestion du cache

**Invalider le cache d'un portfolio** :
```
POST /api/professionals/discovery/invalidate-cache
Body: { "portfolioId": "abc-123" }
```

**Invalider tout le cache** :
```
POST /api/professionals/discovery/invalidate-cache
Body: {}
```

### Pre-computation Job

**Commandes** :
```bash
# Exécution basique (500 portfolios)
npx ts-node src/jobs/discovery-precompute.job.ts

# Avec refresh complet
npx ts-node src/jobs/discovery-precompute.job.ts --refresh

# Avec limite personnalisée
npx ts-node src/jobs/discovery-precompute.job.ts --limit=1000 --verbose
```

**CRON suggéré** :
```bash
# Toutes les heures
0 * * * * cd /path/to/backend && npx ts-node src/jobs/discovery-precompute.job.ts

# Refresh complet toutes les 6h
0 */6 * * * cd /path/to/backend && npx ts-node src/jobs/discovery-precompute.job.ts --refresh
```

### Optimisations futures (Phase 5)

- **Redis Cache** : Cache distribué pour multi-instances
- **CDC (Change Data Capture)** : Invalidation automatique via DB triggers
- **Elasticsearch** : Full-text search optimisé

## 🔮 Évolution Future

### Phase 3 : Machine Learning
- Prédiction de CTR (Click-Through Rate)
- Apprentissage des préférences utilisateur
- A/B testing automatisé

### Phase 4 : Analytics
- Tracking des interactions
- Mesure de performance de l'algorithme
- Optimisation continue des poids

## 📝 Notes Techniques

### Poids Contextuels

```typescript
explore: {
  quality: 0.25,
  engagement: 0.30,
  recency: 0.20,
  velocity: 0.15,
  fairness: 0.10
}

search: {
  quality: 0.30,
  engagement: 0.25,
  recency: 0.15,
  velocity: 0.10,
  fairness: 0.10,
  relevance: 0.10
}

matching: {
  quality: 0.35,
  engagement: 0.20,
  recency: 0.10,
  velocity: 0.05,
  fairness: 0.05,
  match: 0.25
}
```

### Formule Complète

```
FinalScore = (
  Σ (Component × Weight × Context) + PersonalizationBoost
) × SpecialBonuses × QualityGates
```

Normalisé sur 0-100.

---

## 📦 Fichiers créés

### Phase 4 : Performance
- `backend/src/services/cache.service.ts` - Service de cache en mémoire avec TTL
- `backend/src/jobs/discovery-precompute.job.ts` - Job de pré-computation des scores
- `backend/src/jobs/README.md` - Documentation des jobs

### Phase 5 : Production
- `backend/src/services/redis-cache.service.ts` - Service Redis avec fallback
- `backend/PRODUCTION_DEPLOYMENT.md` - Guide de déploiement complet
- `backend/.env.production.example` - Template production

## 🔧 Modifications

- `backend/src/services/discovery.service.ts` - Cache Redis + async/await
- `backend/src/controllers/professional.controller.ts` - Health check endpoint
- `backend/src/routes/professional.routes.ts` - Routes monitoring
- `backend/prisma/schema.prisma` - Index optimisation

---

## 🚀 Quick Start

### Development (cache en mémoire)
```bash
npm install
npm run dev
```

### Production (avec Redis)
```bash
# 1. Installer Redis
docker run -d -p 6379:6379 redis:7-alpine

# 2. Configurer .env
REDIS_ENABLED="true"
USE_REDIS_CACHE="true"
REDIS_URL="redis://localhost:6379"

# 3. Démarrer
npm run build
npm start
```

### Monitoring
```bash
# Métriques
curl http://localhost:3000/api/professionals/discovery/metrics

# Health check
curl http://localhost:3000/api/professionals/discovery/health
```

---

**Version** : 3.0 (Phase 5 complétée - Production Ready)
**Date** : Février 2026
**Auteur** : JUNY Platform
