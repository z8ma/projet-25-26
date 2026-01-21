# JUNY - Roadmap & Features Futures

## Vision

JUNY connecte les créateurs de contenu avec les meilleurs professionnels créatifs grâce à une IA de matching intelligente qui comprend les besoins, analyse les portfolios et garantit des collaborations réussies.

---

## Table des matières

1. [Sources de données externes](#1-sources-de-données-externes)
2. [Architecture IA de matching](#2-architecture-ia-de-matching)
3. [Comment garantir le bon match](#3-comment-garantir-le-bon-match)
4. [Features prioritaires](#4-features-prioritaires)
5. [Monétisation](#5-monétisation)
6. [Stack technique recommandée](#6-stack-technique-recommandée)

---

## 1. Sources de données externes

### 1.1 APIs et plateformes accessibles

| Plateforme | Type de créatifs | Accès | Coût | Priorité |
|------------|------------------|-------|------|----------|
| **Dribbble** | Designers, UI/UX, Illustrateurs | API publique | Gratuit (rate limited) | ⭐⭐⭐ Haute |
| **Behance** | Designers, Photographes, Vidéastes | API Adobe (sur demande) | Gratuit | ⭐⭐⭐ Haute |
| **ArtStation** | Artistes 3D, Concept artists | API limitée | Gratuit | ⭐⭐ Moyenne |
| **GitHub** | Développeurs créatifs | API publique | Gratuit | ⭐⭐ Moyenne |
| **Vimeo** | Vidéastes, Motion designers | API publique | Freemium | ⭐⭐⭐ Haute |
| **YouTube** | Vidéastes, Monteurs | API Google | Gratuit (quotas) | ⭐⭐ Moyenne |
| **LinkedIn** | Tous professionnels | Très restreint | $$$ | ⭐ Basse (complexe) |
| **Unsplash** | Photographes | API publique | Gratuit | ⭐⭐ Moyenne |
| **500px** | Photographes | API disponible | Freemium | ⭐⭐ Moyenne |

### 1.2 Services d'enrichissement de données

| Service | Usage | Coût estimé |
|---------|-------|-------------|
| **Proxycurl** | Données LinkedIn (profils publics) | ~$0.01/profil |
| **Apollo.io** | Base B2B + enrichissement | $49-99/mois |
| **Clearbit** | Enrichissement entreprises | $99+/mois |
| **Hunter.io** | Emails professionnels | Freemium |
| **PhantomBuster** | Scraping automatisé | $59+/mois |

### 1.3 Stratégie d'acquisition de données

```
Phase 1 (MVP+) : Sources ouvertes
├── Dribbble API
├── Vimeo API
└── Profils internes (inscriptions)

Phase 2 (Growth) : Enrichissement
├── Behance (partenariat Adobe)
├── ArtStation
├── Proxycurl pour LinkedIn
└── GitHub pour développeurs créatifs

Phase 3 (Scale) : Partenariats
├── Partenariats écoles (Gobelins, LISAA, etc.)
├── Partenariats agences créatives
├── API partenaires (Malt, Fiverr?)
└── Import LinkedIn avec consentement utilisateur
```

---

## 2. Architecture IA de matching

### 2.1 Pipeline de données

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SOURCES EXTERNES                             │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┤
│   Dribbble  │   Behance   │   Vimeo     │   GitHub    │  Internes   │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┘
       │             │             │             │             │
       ▼             ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CONNECTEURS / INGESTION                           │
│  • Rate limiting & retry logic                                       │
│  • Déduplication (même personne sur plusieurs plateformes)          │
│  • Validation des données                                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NORMALISATION & ETL                               │
│                                                                      │
│  1. Mapping des compétences vers taxonomie unifiée                  │
│     "Photoshop" = "Adobe Photoshop" = "PS" → skill_id: 142          │
│                                                                      │
│  2. Extraction IA des compétences depuis :                          │
│     • Descriptions de projets                                        │
│     • Tags et catégories                                            │
│     • Analyse visuelle des portfolios (Vision AI)                   │
│                                                                      │
│  3. Calcul des métriques :                                          │
│     • Niveau d'expérience estimé                                    │
│     • Qualité du portfolio (engagement, vues, likes)                │
│     • Spécialités détectées                                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    GÉNÉRATION DES EMBEDDINGS                         │
│                                                                      │
│  Pour chaque professionnel, on génère plusieurs vecteurs :          │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ profile_embedding (1536 dims)                                │    │
│  │ = Embedding du profil textuel complet                        │    │
│  │   (bio + compétences + expérience + descriptions projets)    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ portfolio_embedding (512 dims)                               │    │
│  │ = Embedding visuel moyen des images du portfolio             │    │
│  │   (style artistique, couleurs dominantes, composition)       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ skills_embedding (768 dims)                                  │    │
│  │ = Embedding des compétences techniques uniquement            │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    VECTOR DATABASE                                   │
│                    (Pinecone / pgvector / Qdrant)                   │
│                                                                      │
│  Index 1: profiles (recherche sémantique générale)                  │
│  Index 2: portfolios (recherche par style visuel)                   │
│  Index 3: skills (recherche par compétences)                        │
│                                                                      │
│  Métadonnées filtrables :                                           │
│  • hourly_rate_min, hourly_rate_max                                 │
│  • location, remote_ok                                              │
│  • availability                                                      │
│  • experience_years                                                  │
│  • source (dribbble, behance, internal...)                          │
│  • verified (profil vérifié ou non)                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Processus de matching

```
┌─────────────────────────────────────────────────────────────────────┐
│                    REQUÊTE DU CRÉATEUR                               │
│                                                                      │
│  "J'ai besoin d'un motion designer pour une vidéo YouTube           │
│   style néon/cyberpunk, budget 500-800€, livraison 2 semaines"      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                ÉTAPE 1 : ANALYSE DU BRIEF (LLM)                     │
│                                                                      │
│  Le LLM extrait :                                                    │
│  {                                                                   │
│    "profession": "motion designer",                                  │
│    "skills_required": ["After Effects", "animation 2D", "néon"],    │
│    "style_keywords": ["cyberpunk", "néon", "futuriste"],            │
│    "budget": { "min": 500, "max": 800, "currency": "EUR" },         │
│    "deadline": "2 weeks",                                            │
│    "project_type": "YouTube video",                                  │
│    "complexity": "medium"                                            │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              ÉTAPE 2 : GÉNÉRATION EMBEDDING DU BESOIN               │
│                                                                      │
│  query_embedding = embed(                                            │
│    "motion designer spécialisé animation néon cyberpunk             │
│     style futuriste pour vidéo YouTube"                              │
│  )                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              ÉTAPE 3 : RECHERCHE VECTORIELLE                        │
│                                                                      │
│  1. Filtrage dur (SQL/métadonnées) :                                │
│     • profession IN ('motion designer', 'animator', 'video editor') │
│     • hourly_rate <= budget_max / estimated_hours                   │
│     • availability != 'unavailable'                                  │
│                                                                      │
│  2. Recherche similarité cosinus :                                  │
│     • Top 50 profils les plus proches du query_embedding            │
│     • Score sémantique de 0 à 1                                     │
│                                                                      │
│  3. Recherche style visuel (si applicable) :                        │
│     • Comparaison portfolio_embedding avec style_keywords           │
│     • Bonus pour portfolios avec projets similaires                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              ÉTAPE 4 : RE-RANKING INTELLIGENT (LLM)                 │
│                                                                      │
│  Pour les top 50 candidats, le LLM évalue :                         │
│                                                                      │
│  Pour chaque candidat :                                              │
│  {                                                                   │
│    "relevance_score": 0.92,      // Pertinence technique            │
│    "style_match": 0.87,          // Adéquation du style             │
│    "experience_fit": 0.95,       // Expérience appropriée           │
│    "availability_score": 0.80,   // Disponibilité                   │
│    "budget_fit": 0.90,           // Adéquation budget               │
│    "portfolio_quality": 0.88,    // Qualité portfolio               │
│    "reasoning": "Expert After Effects avec 5 projets cyberpunk..."  │
│  }                                                                   │
│                                                                      │
│  Score final = weighted_average(all_scores)                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              ÉTAPE 5 : RÉSULTATS ENRICHIS                           │
│                                                                      │
│  Top 5-10 professionnels avec :                                      │
│  • Score de match global (ex: 94%)                                  │
│  • Explication en langage naturel du pourquoi                       │
│  • Projets similaires du portfolio mis en avant                     │
│  • Estimation de tarif pour ce projet spécifique                    │
│  • Disponibilité estimée                                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Comment garantir le bon match

### 3.1 Scoring multi-critères

```typescript
interface MatchScore {
  // Scores individuels (0-100)
  technicalFit: number;      // Compétences techniques requises
  styleFit: number;          // Adéquation du style créatif
  experienceFit: number;     // Niveau d'expérience approprié
  budgetFit: number;         // Tarif dans le budget
  availabilityFit: number;   // Disponibilité
  reputationScore: number;   // Notes, avis, historique

  // Score final pondéré
  globalScore: number;

  // Explication
  reasoning: string;
  highlights: string[];      // Points forts pour ce projet
  concerns: string[];        // Points d'attention éventuels
}

// Pondérations par défaut (ajustables par le créateur)
const DEFAULT_WEIGHTS = {
  technicalFit: 0.30,      // 30%
  styleFit: 0.25,          // 25%
  experienceFit: 0.15,     // 15%
  budgetFit: 0.10,         // 10%
  availabilityFit: 0.10,   // 10%
  reputationScore: 0.10    // 10%
};
```

### 3.2 Analyse du portfolio par Vision AI

```typescript
interface PortfolioAnalysis {
  // Détection automatique
  dominantStyles: string[];        // ["minimaliste", "coloré", "corporate"]
  colorPalettes: string[][];       // Palettes dominantes
  techniquesDetected: string[];    // ["3D", "illustration vectorielle", "photo manipulation"]
  qualityScore: number;            // Évaluation qualité visuelle
  consistencyScore: number;        // Cohérence du style

  // Catégorisation des projets
  projectTypes: {
    type: string;                  // "logo", "video", "illustration"
    count: number;
    averageQuality: number;
  }[];

  // Industries/secteurs représentés
  industries: string[];            // ["tech", "mode", "food"]
}
```

### 3.3 Système de feedback loop

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AMÉLIORATION CONTINUE                             │
│                                                                      │
│  1. FEEDBACK EXPLICITE                                               │
│     • Note du créateur après collaboration (1-5 étoiles)            │
│     • Commentaire détaillé                                           │
│     • "Le match était-il pertinent ?" (oui/non/partiellement)       │
│     • Signalement des problèmes                                      │
│                                                                      │
│  2. FEEDBACK IMPLICITE                                               │
│     • Taux de réponse aux propositions                              │
│     • Temps de réponse                                               │
│     • Taux de conversion (contact → collaboration)                  │
│     • Projets menés à terme vs abandonnés                           │
│     • Récurrence (même créateur + même pro = bon signe)             │
│                                                                      │
│  3. RÉAJUSTEMENT DU MODÈLE                                          │
│     • Fine-tuning des embeddings sur les matchs réussis             │
│     • Ajustement des poids du scoring                               │
│     • Détection des patterns de succès par catégorie                │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.4 Vérification et trust score

```typescript
interface TrustScore {
  verified: boolean;              // Email/identité vérifiée
  portfolioAuthentic: boolean;    // Vérification anti-plagiat

  trustLevel: 'new' | 'verified' | 'trusted' | 'top_rated';

  signals: {
    emailVerified: boolean;
    linkedinConnected: boolean;
    portfolioVerified: boolean;   // Liens vers sources originales
    identityVerified: boolean;    // KYC optionnel
    hasCompletedProjects: number;
    averageRating: number;
    responseRate: number;         // % de réponses aux demandes
    completionRate: number;       // % de projets terminés
  };
}
```

### 3.5 Matching contextuel avancé

```typescript
// Le système apprend des préférences du créateur
interface CreatorPreferences {
  // Préférences explicites
  preferredBudgetRange: { min: number; max: number };
  preferredResponseTime: 'urgent' | 'normal' | 'flexible';
  preferredCommunicationStyle: 'formal' | 'casual';

  // Préférences apprises
  historicalMatches: {
    professionalId: string;
    wasSuccessful: boolean;
    rating: number;
    projectType: string;
  }[];

  // Le système détecte :
  // - "Ce créateur préfère les designers avec un style épuré"
  // - "Ce créateur a de meilleurs résultats avec des seniors"
  // - "Ce créateur valorise la rapidité de réponse"
  learnedPatterns: {
    pattern: string;
    confidence: number;
    appliedBoost: number;  // Boost appliqué aux candidats matchants
  }[];
}
```

---

## 4. Features prioritaires

### 4.1 Phase 1 - Fondations (Q1 2025)

#### Matching amélioré
- [ ] Intégration pgvector dans PostgreSQL
- [ ] Génération d'embeddings pour les profils existants
- [ ] Recherche vectorielle de base
- [ ] Re-ranking LLM avec explications

#### Sources externes
- [ ] Connecteur Dribbble API
- [ ] Import manuel de portfolio (URL)
- [ ] Détection de doublons cross-platform

#### UX Créateur
- [ ] Dashboard avec statistiques
- [ ] Filtres avancés (budget, dispo, expérience)
- [ ] Sauvegarde de recherches favorites
- [ ] Comparaison de profils côte à côte

### 4.2 Phase 2 - Intelligence (Q2 2025)

#### Vision AI
- [ ] Analyse automatique des portfolios (style, qualité)
- [ ] Détection des compétences depuis les images
- [ ] Matching visuel (uploader une référence → trouver des pros similaires)

#### Sources externes v2
- [ ] Connecteur Behance
- [ ] Connecteur Vimeo
- [ ] Enrichissement Proxycurl (LinkedIn)

#### Communication
- [ ] Messagerie intégrée temps réel
- [ ] Templates de messages personnalisés par l'IA
- [ ] Système de propositions formelles

#### Réputation
- [ ] Système de badges et certifications
- [ ] Vérification de portfolio (anti-plagiat)
- [ ] Score de fiabilité affiché

### 4.3 Phase 3 - Scale (Q3-Q4 2025)

#### Marketplace avancée
- [ ] Gestion de projets intégrée
- [ ] Paiements sécurisés (escrow)
- [ ] Contrats automatisés
- [ ] Facturation intégrée

#### IA conversationnelle avancée
- [ ] Brief assisté par IA (questions intelligentes)
- [ ] Estimation de budget automatique
- [ ] Suggestions proactives ("Vous devriez aussi chercher un sound designer")
- [ ] Négociation assistée

#### Analytics
- [ ] Dashboard analytics pour créateurs
- [ ] Insights marché (tarifs moyens, tendances)
- [ ] Prédiction de succès de collaboration

#### Mobile
- [ ] App iOS/Android
- [ ] Notifications push
- [ ] Portfolio mobile-first pour pros

### 4.4 Phase 4 - Expansion (2026)

#### B2B
- [ ] Comptes entreprise multi-utilisateurs
- [ ] Gestion d'équipes créatives
- [ ] Intégration Slack/Teams
- [ ] API pour intégrations tierces

#### International
- [ ] Multi-langues (EN, ES, DE)
- [ ] Matching cross-border avec gestion fuseaux horaires
- [ ] Paiements multi-devises

#### Communauté
- [ ] Forum / espace communautaire
- [ ] Événements virtuels (workshops)
- [ ] Programme ambassadeurs

---

## 5. Monétisation

### 5.1 Modèle freemium actuel

| Plan | Prix | Fonctionnalités |
|------|------|-----------------|
| **Gratuit** | 0€ | 1 projet/mois, 10 crédits IA, matchs basiques |
| **Starter** | 19€/mois | 5 projets/mois, 100 crédits IA, filtres avancés |
| **Pro** | 49€/mois | 20 projets/mois, 500 crédits IA, analytics |
| **Premium** | 99€/mois | Illimité, API, support prioritaire |

### 5.2 Revenus additionnels potentiels

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SOURCES DE REVENUS                                │
│                                                                      │
│  1. COMMISSIONS (optionnel)                                         │
│     • 5-10% sur les paiements via plateforme                        │
│     • Gagnant-gagnant : sécurité pour les deux parties              │
│                                                                      │
│  2. MISE EN AVANT PAYANTE (pros)                                    │
│     • "Boost" de profil : +visibilité dans les résultats            │
│     • Badge "Pro vérifié" : 9€/mois                                 │
│     • Portfolio mis en avant : 29€/mois                             │
│                                                                      │
│  3. SERVICES PREMIUM                                                │
│     • Recrutement assisté (JUNY trouve pour vous) : sur devis       │
│     • Formation IA pour créateurs : cours payants                   │
│     • Certification JUNY pour les pros : 99€/an                     │
│                                                                      │
│  4. B2B / ENTREPRISE                                                │
│     • Licence entreprise : 299€+/mois                               │
│     • API access : usage-based pricing                              │
│     • Intégrations custom : sur devis                               │
│                                                                      │
│  5. DATA & INSIGHTS                                                  │
│     • Rapports marché créatif : abonnement                          │
│     • Benchmark tarifs par secteur                                  │
│     • Tendances créatives                                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Stack technique recommandée

### 6.1 Architecture actuelle vs cible

```
ACTUEL                              CIBLE
───────                             ─────
PostgreSQL                    →     PostgreSQL + pgvector
└── Prisma ORM                      └── Prisma ORM
                                    └── Vector indexes

Node.js/Express               →     Node.js/Express
└── REST API                        └── REST API
                                    └── WebSocket (temps réel)
                                    └── Worker threads (embeddings)

React/Vite                    →     React/Vite
└── Zustand                         └── Zustand
                                    └── React Query (cache)
                                    └── PWA support

OpenAI API                    →     OpenAI API
└── GPT-4 (chat)                    └── GPT-4 (chat + re-ranking)
                                    └── text-embedding-3-large
                                    └── GPT-4 Vision (portfolio analysis)
```

### 6.2 Nouvelles dépendances recommandées

```json
{
  "backend": {
    "pgvector": "Extension PostgreSQL pour recherche vectorielle",
    "@pinecone-database/pinecone": "Alternative cloud pour vectors (scale)",
    "openai": "Embeddings + Vision + Chat",
    "bull": "Queue de jobs pour ingestion async",
    "sharp": "Traitement d'images (thumbnails)",
    "socket.io": "Temps réel (messagerie)"
  },
  "frontend": {
    "@tanstack/react-query": "Cache et sync serveur",
    "socket.io-client": "Temps réel",
    "framer-motion": "Animations fluides",
    "react-compare-slider": "Comparaison de profils"
  },
  "infrastructure": {
    "redis": "Cache + sessions + queues",
    "s3/cloudinary": "Stockage images portfolios",
    "vercel/railway": "Déploiement"
  }
}
```

### 6.3 Schéma base de données étendu

```sql
-- Extension pour les vecteurs
CREATE EXTENSION IF NOT EXISTS vector;

-- Table des profils unifiés (sources externes + internes)
CREATE TABLE unified_professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Lien avec profil interne (si existe)
  internal_professional_id UUID REFERENCES professionals(id),

  -- Source externe
  source VARCHAR(50) NOT NULL, -- 'internal', 'dribbble', 'behance', etc.
  source_id VARCHAR(255),
  source_url TEXT,

  -- Données normalisées
  display_name VARCHAR(255) NOT NULL,
  bio TEXT,
  location VARCHAR(255),
  remote_available BOOLEAN DEFAULT true,

  -- Tarifs
  hourly_rate_min DECIMAL(10,2),
  hourly_rate_max DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Embeddings (vecteurs)
  profile_embedding vector(1536),      -- Embedding du profil complet
  portfolio_embedding vector(512),      -- Embedding visuel moyen
  skills_embedding vector(768),         -- Embedding des compétences

  -- Métriques calculées
  quality_score DECIMAL(3,2),          -- 0.00 à 1.00
  experience_level VARCHAR(20),         -- junior, mid, senior, expert

  -- Trust
  verified BOOLEAN DEFAULT false,
  trust_score DECIMAL(3,2) DEFAULT 0.50,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_synced_at TIMESTAMP,

  UNIQUE(source, source_id)
);

-- Index vectoriel pour recherche de similarité
CREATE INDEX ON unified_professionals
  USING ivfflat (profile_embedding vector_cosine_ops)
  WITH (lists = 100);

-- Table des compétences unifiées (taxonomie)
CREATE TABLE unified_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100),
  aliases TEXT[], -- ["Photoshop", "Adobe Photoshop", "PS"]
  embedding vector(768)
);

-- Relation professionnel <-> compétences
CREATE TABLE professional_skills_unified (
  professional_id UUID REFERENCES unified_professionals(id),
  skill_id UUID REFERENCES unified_skills(id),
  proficiency_level VARCHAR(20), -- beginner, intermediate, advanced, expert
  detected_from VARCHAR(50), -- 'profile', 'portfolio', 'ai_analysis'
  confidence DECIMAL(3,2),
  PRIMARY KEY (professional_id, skill_id)
);

-- Table des analyses de portfolio
CREATE TABLE portfolio_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES unified_professionals(id),

  -- Analyse IA
  detected_styles TEXT[],
  detected_techniques TEXT[],
  dominant_colors JSONB,
  quality_score DECIMAL(3,2),
  consistency_score DECIMAL(3,2),

  -- Catégories de projets
  project_categories JSONB,

  analyzed_at TIMESTAMP DEFAULT NOW()
);

-- Table des matchs avec feedback
CREATE TABLE match_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id),

  -- Feedback créateur
  was_relevant BOOLEAN,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT,

  -- Feedback implicite
  response_time_hours INTEGER,
  converted_to_project BOOLEAN,
  project_completed BOOLEAN,

  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7. Inspiration ATS : Ce qu'on garde, ce qu'on améliore

### 7.1 Analyse des ATS existants

| ATS | Forces | Faiblesses |
|-----|--------|------------|
| **Workday** | Intégration RH complète, compliance | UX catastrophique, matching par mots-clés basique |
| **Greenhouse** | Bonne UX, analytics | Cher, matching limité |
| **Lever** | Collaboration équipe, pipeline visuel | Pas d'IA réelle, filtrage binaire |
| **SmartRecruiters** | Marketplace intégrée | Matching superficiel |
| **LinkedIn Recruiter** | Base de données massive | Recherche booléenne archaïque, cher |
| **Welcome to the Jungle** | UX moderne, culture fit | Limité aux offres publiées |

### 7.2 Problèmes fondamentaux des ATS qu'on résout

```
┌─────────────────────────────────────────────────────────────────────┐
│           PROBLÈME ATS #1 : MATCHING PAR MOTS-CLÉS                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ATS CLASSIQUE :                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ CV contient "Photoshop" ?                                    │    │
│  │   → OUI = +1 point                                           │    │
│  │   → NON = rejeté (même si expert "Adobe Creative Suite")     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  JUNY (Matching sémantique) :                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Besoin : "retouche photo professionnelle"                    │    │
│  │ Candidat : "Expert Lightroom, Capture One, retouche beauté" │    │
│  │   → MATCH 92% (comprend que c'est pertinent)                 │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│           PROBLÈME ATS #2 : FILTRAGE BINAIRE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ATS CLASSIQUE :                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ "5 ans d'expérience minimum" → 4 ans 11 mois = REJETÉ        │    │
│  │ "Diplôme Bac+5" → Autodidacte génial = REJETÉ                │    │
│  │ "Basé à Paris" → Remote depuis Lyon = REJETÉ                 │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  JUNY (Scoring flexible) :                                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Critère "5 ans exp" :                                        │    │
│  │   → 5+ ans = 100%                                            │    │
│  │   → 4 ans = 90% (proche, compense par portfolio)             │    │
│  │   → 3 ans = 75% (montré si excellent portfolio)              │    │
│  │                                                               │    │
│  │ Le créateur VOIT le candidat avec une note explicative :     │    │
│  │ "4 ans d'exp. mais portfolio exceptionnel sur ce type"       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│           PROBLÈME ATS #3 : IGNORE LE PORTFOLIO                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ATS CLASSIQUE :                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Parse le CV texte uniquement                                 │    │
│  │ Lien portfolio ? → Ignoré ou stocké sans analyse             │    │
│  │ Pièces jointes visuelles ? → Pas supporté                    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  JUNY (Portfolio-first) :                                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ 1. Analyse Vision AI de chaque projet du portfolio           │    │
│  │ 2. Détection automatique : style, techniques, qualité        │    │
│  │ 3. Matching visuel : "trouve-moi des styles similaires à X"  │    │
│  │ 4. Le portfolio PÈSE dans le score (pas juste décoratif)     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│           PROBLÈME ATS #4 : PAS D'EXPLICATION                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ATS CLASSIQUE :                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ "Score: 78/100" → Pourquoi ? Mystère.                        │    │
│  │ Candidat rejeté → Aucune raison donnée                       │    │
│  │ Recruteur doit deviner ce qui a matché                       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  JUNY (Explainable AI) :                                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ "Match 94% - Voici pourquoi :"                               │    │
│  │                                                               │    │
│  │ ✅ Expert After Effects (12 projets motion dans portfolio)   │    │
│  │ ✅ Style cyberpunk/néon (3 projets très similaires)          │    │
│  │ ✅ Tarif dans votre budget (45€/h vs 50€ max)                │    │
│  │ ⚠️ Disponible dans 1 semaine (vous vouliez immédiat)         │    │
│  │                                                               │    │
│  │ Projets similaires de son portfolio : [img1] [img2] [img3]   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│           PROBLÈME ATS #5 : CANDIDAT = DONNÉES STATIQUES            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ATS CLASSIQUE :                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ CV uploadé en 2022 → Jamais mis à jour                       │    │
│  │ Pas de sync avec profils externes                            │    │
│  │ Compétences acquises après = invisibles                      │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  JUNY (Profils vivants) :                                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ • Sync automatique Dribbble/Behance/LinkedIn                 │    │
│  │ • Nouveau projet uploadé → Re-calcul des embeddings          │    │
│  │ • Détection de nouvelles compétences via portfolio           │    │
│  │ • Historique d'activité (actif vs dormant)                   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.3 Features ATS qu'on garde (et améliore)

| Feature ATS | Notre version améliorée |
|-------------|------------------------|
| **Pipeline de candidatures** | Pipeline visuel + statuts automatiques basés sur l'activité |
| **Parsing de CV** | Parsing + enrichissement IA + extraction depuis portfolio |
| **Tags/Labels** | Tags auto-générés par IA + tags manuels |
| **Filtres** | Filtres + recherche en langage naturel ("trouve-moi quelqu'un comme X") |
| **Notes collaboratives** | Notes + résumé IA de la collaboration |
| **Historique** | Historique complet + prédiction de succès basée sur patterns |
| **Templates email** | Templates + personnalisation IA par candidat |
| **Analytics** | Analytics + insights actionnables ("vous passez à côté de X profils") |

### 7.4 Fonctionnalités ATS innovantes à implémenter

```typescript
// 1. RECHERCHE EN LANGAGE NATUREL (pas de query builder complexe)
interface NaturalSearch {
  // Au lieu de : skill=photoshop AND experience>=5 AND location=paris
  // L'utilisateur tape simplement :
  query: "un retoucheur photo senior sur Paris qui a travaillé pour des marques de luxe";

  // L'IA comprend et traduit
  parsed: {
    skills: ["retouche photo", "photoshop", "lightroom"],
    experience: "senior",
    location: "Paris",
    industryExperience: ["luxe", "mode", "beauté"],
    impliedQualities: ["haut de gamme", "attention au détail"]
  };
}

// 2. MATCHING INVERSÉ (le pro trouve le projet)
interface ReverseMatching {
  // Le professionnel définit ses critères
  professionalPreferences: {
    projectTypes: ["branding", "identité visuelle"],
    budgetMin: 1000,
    industries: ["tech", "startup"],
    excludeIndustries: ["gambling", "tabac"],
    availability: "2 weeks notice",
    remoteOnly: true
  };

  // JUNY lui pousse des projets pertinents
  matchedProjects: Project[];
}

// 3. PRÉDICTION DE SUCCÈS
interface SuccessPrediction {
  matchId: string;

  // Basé sur l'historique des collaborations similaires
  predictedSuccess: {
    probability: 0.87,  // 87% de chances de succès
    confidence: "high",

    factors: {
      positive: [
        "Le créateur a bien noté 3 pros similaires",
        "Le pro a 95% de projets complétés",
        "Budget aligné avec tarifs habituels du pro"
      ],
      risks: [
        "Deadline serrée (le pro livre en moyenne +2 jours)",
        "Premier projet dans cette industrie pour le pro"
      ]
    },

    similarPastMatches: [
      { matchId: "xxx", wasSuccessful: true, similarity: 0.92 },
      { matchId: "yyy", wasSuccessful: true, similarity: 0.88 }
    ]
  };
}

// 4. TALENT POOL INTELLIGENT
interface SmartTalentPool {
  poolId: string;
  name: "Mes motion designers préférés";

  // Critères dynamiques (pas juste une liste statique)
  dynamicCriteria: {
    baseSkills: ["motion design", "after effects"],
    minRating: 4.5,
    workedWithMeBefore: true
  };

  // La pool se met à jour automatiquement
  autoAddRules: [
    "Ajouter automatiquement si note >= 4.5 après collaboration",
    "Retirer si inactif > 6 mois"
  ];

  // Suggestions proactives
  suggestions: [
    {
      professional: "Marie D.",
      reason: "Nouveau projet cyberpunk qui matche votre style habituel",
      matchScore: 94
    }
  ];
}

// 5. BRIEF ASSISTÉ (pas de formulaire rigide)
interface AssistedBrief {
  // Conversation naturelle
  conversation: [
    { role: "ai", content: "Quel type de projet avez-vous en tête ?" },
    { role: "user", content: "Une vidéo pour mon lancement de produit" },
    { role: "ai", content: "Super ! C'est pour quel type de produit ? Et vous avez une idée du style ?" },
    { role: "user", content: "Une app mobile, je veux un truc moderne et dynamique" },
    { role: "ai", content: "Je vois, style tech/startup. Quel est votre budget approximatif ?" },
    // ...
  ];

  // Brief structuré généré automatiquement
  generatedBrief: {
    projectType: "Vidéo promotionnelle",
    category: "Lancement produit",
    style: ["moderne", "dynamique", "tech"],
    deliverables: ["Vidéo 30-60s", "Déclinaisons réseaux sociaux"],
    estimatedBudget: { min: 800, max: 1500 },
    suggestedProfessions: ["Motion designer", "Vidéaste"],
    // Questions clarifiantes suggérées
    clarifyingQuestions: [
      "Avez-vous déjà des assets (logo, charte graphique) ?",
      "La voix-off est-elle incluse ou à prévoir séparément ?"
    ]
  };
}

// 6. NÉGOCIATION ASSISTÉE
interface AssistedNegotiation {
  context: {
    creatorBudget: { max: 1000 },
    professionalRate: { usual: 1200, min: 1000 },
    projectScope: "Identité visuelle complète"
  };

  // Suggestions IA
  suggestions: {
    forCreator: [
      "Ce tarif est 15% au-dessus de votre budget mais dans la moyenne du marché",
      "Suggestion : proposer 1100€ avec paiement rapide (< 7 jours)",
      "Alternative : réduire le scope (logo seul) pour 700€"
    ],
    forProfessional: [
      "Ce créateur a un bon historique de paiement",
      "Son budget est légèrement sous votre tarif habituel",
      "Suggestion : proposer un tarif projet à 1050€"
    ]
  };

  // Comparatif marché
  marketData: {
    averagePrice: 1150,
    priceRange: { p25: 800, p75: 1400 },
    insight: "Projet complexe, tarif demandé dans la norme haute"
  };
}

// 7. ANALYTICS PRÉDICTIFS
interface PredictiveAnalytics {
  // Pour le créateur
  creatorInsights: {
    bestTimeToPost: "Mardi 10h - réponses 40% plus rapides",
    budgetOptimization: "Augmenter de 10% attirerait 3x plus de seniors",
    missingInBrief: "Ajouter des références visuelles augmente le match de 25%",

    churnRisk: [
      {
        professional: "Alex M.",
        risk: "high",
        reason: "Pas de projet depuis 3 mois, était très actif",
        suggestion: "Envoyez-lui un message pour garder le contact"
      }
    ]
  };

  // Pour le professionnel
  professionalInsights: {
    profileCompleteness: 78,
    missingForBetterMatches: [
      "Ajouter 3+ projets motion design",
      "Préciser vos tarifs",
      "Lier votre Behance"
    ],
    demandTrends: [
      { skill: "IA/Génératif", trend: "+45%", suggestion: "Compétence en forte demande" },
      { skill: "NFT", trend: "-30%", suggestion: "Demande en baisse" }
    ]
  };
}
```

### 7.5 Tableau comparatif final

| Critère | ATS Classique | LinkedIn Recruiter | JUNY |
|---------|--------------|-------------------|------|
| **Matching** | Mots-clés | Mots-clés + basique ML | Sémantique + Vision AI |
| **Portfolio** | Ignoré | Lien stocké | Analysé par IA |
| **Scoring** | Binaire (oui/non) | Score opaque | Score explicable multi-critères |
| **Recherche** | Query builder | Booléen complexe | Langage naturel |
| **Sources** | CV uploadés | LinkedIn only | Multi-plateformes + enrichi |
| **Brief** | Formulaire rigide | Offre d'emploi | Conversation IA assistée |
| **Feedback loop** | Basique | Limité | ML continu sur succès |
| **Prix** | $$$$ | $$$$ | € (accessible) |
| **Cible** | RH entreprises | Recruteurs | Créateurs indépendants |

---

## 8. Estimation des coûts - Version Premium Maximale

### 8.1 Scénario : "La DB la plus complète + meilleures APIs" sur 1 mois

**Hypothèses :**
- Objectif : 10 000 profils de créatifs enrichis
- Utilisation intensive de l'IA (matching, analyse portfolio)
- Toutes les sources de données activées
- Infrastructure scalable

### 8.2 Coûts détaillés par catégorie

#### A. APIs d'enrichissement de données

| Service | Usage estimé | Prix unitaire | Coût/mois |
|---------|--------------|---------------|-----------|
| **Proxycurl** (LinkedIn) | 5 000 profils | $0.01/profil | **$50** |
| **Apollo.io** (B2B enrichment) | Plan Pro | $99/mois | **$99** |
| **Hunter.io** (emails) | 1 000 recherches | $49/mois (Starter) | **$49** |
| **Clearbit** (enrichissement) | 2 500 requêtes | $99/mois | **$99** |
| **PhantomBuster** (scraping) | 5h/jour | $69/mois | **$69** |
| | | **Sous-total APIs enrichissement** | **~$366** |

#### B. APIs créatives (portfolios)

| Service | Usage | Coût |
|---------|-------|------|
| **Dribbble API** | Gratuit (rate limited) | **$0** |
| **Behance/Adobe** | Sur demande (gratuit) | **$0** |
| **Vimeo API** | Pro ($20/mois pour API avancée) | **$20** |
| **GitHub API** | Gratuit (5000 req/h) | **$0** |
| **Unsplash API** | Gratuit | **$0** |
| | **Sous-total APIs créatives** | **~$20** |

#### C. Intelligence Artificielle (OpenAI)

| Usage | Volume estimé | Prix | Coût/mois |
|-------|---------------|------|-----------|
| **GPT-4 Turbo** (chat + re-ranking) | 500K tokens input | $0.01/1K | **$5** |
| | 200K tokens output | $0.03/1K | **$6** |
| **GPT-4 Vision** (analyse portfolio) | 10 000 images | $0.01/image (~) | **$100** |
| **text-embedding-3-large** | 10 000 profils × 8K tokens | $0.00013/1K | **$10.40** |
| **Embeddings re-calcul** (updates) | 20% refresh | - | **$2** |
| | **Sous-total OpenAI** | **~$125** |

**Alternative Claude (Anthropic) :**
| Usage | Coût estimé |
|-------|-------------|
| Claude 3.5 Sonnet | ~$100-150/mois pour usage équivalent |

#### D. Infrastructure & Base de données

| Service | Spec | Coût/mois |
|---------|------|-----------|
| **PostgreSQL + pgvector** | | |
| → Railway/Render (managed) | 8GB RAM, 50GB storage | **$50** |
| → OU Supabase Pro | 8GB RAM, 50GB | **$25** |
| → OU AWS RDS | db.t3.medium | **$60** |
| **Redis** (cache + queues) | 1GB | **$15** |
| **Pinecone** (vector DB optionnel) | Starter (1M vectors) | **$70** |
| **Cloudinary/S3** (images) | 25GB + 50K transformations | **$45** |
| **Vercel** (hosting frontend) | Pro | **$20** |
| **Railway/Render** (backend) | Pro instance | **$25** |
| | **Sous-total Infrastructure** | **~$180-250** |

#### E. Services additionnels

| Service | Usage | Coût/mois |
|---------|-------|-----------|
| **Postmark/Sendgrid** (emails) | 10K emails | **$15** |
| **Sentry** (monitoring) | Team | **$26** |
| **Algolia** (search optionnel) | 10K records | **$0** (free tier) |
| | **Sous-total Services** | **~$41** |

### 8.3 Récapitulatif - Fourchette de prix

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ESTIMATION COÛTS MENSUELS                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  VERSION MINIMALE (MVP+)                                             │
│  ────────────────────────                                            │
│  • APIs créatives gratuites uniquement                               │
│  • OpenAI basique (GPT-3.5 + embeddings)                            │
│  • Infra minimale (Supabase free + Vercel free)                     │
│                                                                      │
│  💰 TOTAL : ~$50-100/mois                                           │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  VERSION INTERMÉDIAIRE (Recommandée pour lancement)                 │
│  ──────────────────────────────────────────────────                 │
│  • Proxycurl + Hunter.io                                             │
│  • OpenAI GPT-4 + Vision (usage modéré)                             │
│  • Supabase Pro + Vercel Pro                                         │
│  • Pas de Pinecone (pgvector suffit)                                │
│                                                                      │
│  💰 TOTAL : ~$300-400/mois                                          │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  VERSION PREMIUM MAXIMALE (Tout activé)                              │
│  ──────────────────────────────────────                              │
│  • Toutes les APIs d'enrichissement                                  │
│  • OpenAI GPT-4 Vision intensif                                      │
│  • Pinecone + PostgreSQL                                             │
│  • Infrastructure haute dispo                                        │
│                                                                      │
│  💰 TOTAL : ~$700-900/mois                                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.4 Coûts variables selon l'usage

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COÛTS PAR ACTION                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Enrichir 1 profil LinkedIn (Proxycurl)      ~$0.01                 │
│  Analyser 1 image portfolio (GPT-4 Vision)   ~$0.01                 │
│  Générer embedding 1 profil                  ~$0.001                │
│  1 conversation brainstorming (2K tokens)    ~$0.04                 │
│  1 matching complet (re-ranking 50 profils)  ~$0.10                 │
│                                                                      │
│  ═══════════════════════════════════════════════════════════════    │
│                                                                      │
│  COÛT PAR UTILISATEUR ACTIF (estimé)                                │
│  ─────────────────────────────────────                              │
│  • Créateur avec 5 projets/mois : ~$2-3/mois en coûts variables     │
│  • Professionnel (profil enrichi) : ~$0.10 one-time                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.5 ROI et rentabilité

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ANALYSE DE RENTABILITÉ                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  COÛTS FIXES : ~$400/mois (version intermédiaire)                   │
│  COÛTS VARIABLES : ~$2.50/utilisateur actif                         │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
│  SEUIL DE RENTABILITÉ :                                              │
│                                                                      │
│  Plan Starter (19€/mois) :                                           │
│  → Marge nette : 19€ - 2.50€ = 16.50€                               │
│  → Besoin : 400€ ÷ 16.50€ = 25 abonnés Starter                      │
│                                                                      │
│  Plan Pro (49€/mois) :                                               │
│  → Marge nette : 49€ - 5€ = 44€                                     │
│  → Besoin : 400€ ÷ 44€ = 10 abonnés Pro                             │
│                                                                      │
│  Mix réaliste (20 Starter + 5 Pro) :                                │
│  → Revenus : (20 × 19) + (5 × 49) = 380 + 245 = 625€                │
│  → Coûts : 400 + (25 × 3) = 475€                                    │
│  → Marge : +150€/mois                                               │
│                                                                      │
│  ═══════════════════════════════════════════════════════════════    │
│                                                                      │
│  📊 OBJECTIF BREAK-EVEN : ~25-30 utilisateurs payants               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.6 Optimisations possibles pour réduire les coûts

| Optimisation | Économie potentielle |
|--------------|---------------------|
| Cache agressif des embeddings | -30% coûts OpenAI |
| Batch processing (nuit) | -20% sur APIs |
| pgvector au lieu de Pinecone | -$70/mois |
| GPT-3.5 pour tâches simples | -50% sur chat |
| Self-host Redis (VPS) | -$15/mois |
| Compression images avant analyse | -30% Vision API |
| Rate limiting utilisateurs free | Variable |

### 8.7 Budget recommandé pour démarrer

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RECOMMANDATION BUDGET LANCEMENT                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  MOIS 1-2 (Beta / Test)                                              │
│  ──────────────────────                                              │
│  Budget : 150-200€/mois                                              │
│  • APIs gratuites uniquement                                         │
│  • OpenAI limité (quotas utilisateurs)                              │
│  • Infra free tier                                                   │
│                                                                      │
│  MOIS 3-4 (Lancement)                                                │
│  ────────────────────                                                │
│  Budget : 300-400€/mois                                              │
│  • Proxycurl activé                                                  │
│  • GPT-4 pour matching                                               │
│  • Infra payante                                                     │
│                                                                      │
│  MOIS 5+ (Scale)                                                     │
│  ─────────────────                                                   │
│  Budget : Proportionnel aux revenus                                  │
│  • Règle : coûts infra < 30% des revenus                            │
│  • Activer APIs premium si ROI positif                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Annexes

### A. Taxonomie des compétences créatives

```yaml
design:
  graphic_design:
    - Logo design
    - Brand identity
    - Print design
    - Packaging
  ui_ux:
    - UI Design
    - UX Design
    - Prototyping
    - User research
  illustration:
    - Digital illustration
    - Vector illustration
    - Character design
    - Editorial illustration

video:
  video_editing:
    - Montage vidéo
    - Color grading
    - Sound design
  motion_design:
    - Animation 2D
    - Animation 3D
    - Motion graphics
    - VFX
  production:
    - Réalisation
    - Direction artistique
    - Storyboarding

photo:
  photography:
    - Portrait
    - Product photography
    - Event photography
    - Lifestyle
  retouching:
    - Photo retouching
    - Compositing
    - Beauty retouching

audio:
  music:
    - Composition
    - Sound design
    - Mixing
    - Mastering
  voice:
    - Voice over
    - Podcast editing
    - Audiobook narration

development:
  web:
    - Frontend
    - Backend
    - Full-stack
  creative_coding:
    - Generative art
    - Interactive installations
    - WebGL/Three.js
```

### B. Exemples de prompts pour le matching

```typescript
const BRIEF_ANALYSIS_PROMPT = `
Analyse ce brief créatif et extrais les informations structurées.

Brief: {user_brief}

Extrais au format JSON:
{
  "profession_needed": "...",
  "skills_required": ["...", "..."],
  "style_keywords": ["...", "..."],
  "budget": { "min": X, "max": Y, "currency": "EUR" },
  "deadline": "...",
  "project_type": "...",
  "complexity": "low|medium|high",
  "priority_factors": ["quality", "speed", "budget"] // ordre d'importance
}
`;

const RERANKING_PROMPT = `
Évalue ce candidat pour le projet suivant.

PROJET:
{project_summary}

CANDIDAT:
Nom: {candidate_name}
Bio: {candidate_bio}
Compétences: {candidate_skills}
Portfolio: {portfolio_description}
Tarif: {hourly_rate}€/h
Expérience: {experience_years} ans

Évalue sur 100 et explique:
{
  "technical_fit": X,
  "style_fit": X,
  "experience_fit": X,
  "budget_fit": X,
  "overall_score": X,
  "reasoning": "Explication en 2-3 phrases...",
  "highlights": ["Point fort 1", "Point fort 2"],
  "concerns": ["Point d'attention éventuel"]
}
`;
```

---

*Document créé le 20 janvier 2026 - JUNY v2 Planning*
