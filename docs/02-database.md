# Architecture Base de Données PostgreSQL

## 🗄️ Schéma Global

### Tables Principales

#### 1. Users (Tous les utilisateurs)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('creator', 'professional')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. Subscription Plans (Offres d'abonnement)
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL, -- 'Starter', 'Premium'
  price_monthly DECIMAL(10, 2) NOT NULL,
  max_projects_month INTEGER NOT NULL,
  ai_credits_month INTEGER NOT NULL,
  features JSONB, -- Fonctionnalités incluses
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Plans définis:**
- **Starter**: 5 projets/mois, 50 crédits IA/mois
- **Premium**: 30 projets/mois, 500 crédits IA/mois

#### 3. Subscriptions (Abonnements actifs)
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  projects_used INTEGER DEFAULT 0, -- Compteur ce mois
  ai_credits_used INTEGER DEFAULT 0, -- Compteur ce mois
  reset_date DATE NOT NULL, -- Date de reset mensuel
  started_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

#### 4. Creators (Profils créateurs)
```sql
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  project_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_creators_user ON creators(user_id);
```

#### 5. Professions (Métiers disponibles)
```sql
CREATE TABLE professions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL, -- 'Design', '3D', 'Motion', etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- Données initiales
INSERT INTO professions (name, category) VALUES
  ('Graphiste', 'Design'),
  ('Designer 3D', '3D'),
  ('Motion Designer', 'Motion'),
  ('Illustrateur', 'Design'),
  ('UI/UX Designer', 'Design'),
  ('Architecte 3D', '3D'),
  ('Animateur 3D', '3D'),
  ('Video Editor', 'Motion');
```

#### 6. Professionals (Profils professionnels)
```sql
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  experience_years INTEGER,
  hourly_rate DECIMAL(10, 2),
  availability VARCHAR(50), -- 'Disponible', 'Partiellement disponible', 'Non disponible'
  bio TEXT,
  other_profession VARCHAR(255), -- Si "Autre métier"
  is_premium BOOLEAN DEFAULT false, -- Profil premium (boost visibilité)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_professionals_user ON professionals(user_id);
CREATE INDEX idx_professionals_premium ON professionals(is_premium);
CREATE INDEX idx_professionals_availability ON professionals(availability);
```

#### 7. Professional Professions (Relation many-to-many)
```sql
CREATE TABLE professional_professions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  profession_id UUID REFERENCES professions(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false, -- Métier principal ou secondaire
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(professional_id, profession_id)
);

CREATE INDEX idx_prof_professions_professional ON professional_professions(professional_id);
CREATE INDEX idx_prof_professions_profession ON professional_professions(profession_id);
```

#### 8. Software Skills (Logiciels maîtrisés)
```sql
CREATE TABLE software_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  software_name VARCHAR(100) NOT NULL,
  proficiency_level VARCHAR(20) CHECK (proficiency_level IN ('Débutant', 'Intermédiaire', 'Expert')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_software_skills_professional ON software_skills(professional_id);
CREATE INDEX idx_software_skills_name ON software_skills(software_name);
```

**Logiciels suggérés par métier:**
- **Graphiste**: Photoshop, Illustrator, InDesign, Figma, Canva
- **Designer 3D**: Blender, Cinema 4D, 3ds Max, Maya, ZBrush
- **Motion Designer**: After Effects, Premiere Pro, DaVinci Resolve
- **UI/UX**: Figma, Sketch, Adobe XD, Framer

#### 9. Portfolios (Projets des professionnels)
```sql
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  project_type VARCHAR(100), -- 'Branding', 'Web Design', '3D Animation', etc.
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_portfolios_professional ON portfolios(professional_id);
CREATE INDEX idx_portfolios_type ON portfolios(project_type);
```

#### 10. Portfolio Tags (Tags détectés par IA)
```sql
CREATE TABLE portfolio_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL, -- 'minimaliste', 'coloré', '3D réaliste', etc.
  ai_detected BOOLEAN DEFAULT false, -- Tag auto-détecté par IA ou manuel
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_portfolio_tags_portfolio ON portfolio_tags(portfolio_id);
CREATE INDEX idx_portfolio_tags_tag ON portfolio_tags(tag);
```

**Limite:** Max 10 tags par image pour éviter la surcharge.

**Types de tags:**
- Style: minimaliste, coloré, dark, moderne, vintage
- Technique: 3D réaliste, flat design, isométrique
- Couleurs dominantes: bleu, rouge, monochrome
- Industrie: tech, food, fashion, corporate

#### 11. AI Conversations (Historique brainstorming)
```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  project_title VARCHAR(255),
  project_summary TEXT,
  messages JSONB NOT NULL DEFAULT '[]', -- Stocke tout l'échange IA
  ai_credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_creator ON ai_conversations(creator_id);
CREATE INDEX idx_ai_conversations_status ON ai_conversations(status);
```

**Structure JSONB messages:**
```json
[
  {
    "role": "assistant",
    "content": "Bonjour! Parlez-moi de votre projet...",
    "timestamp": "2026-01-17T10:00:00Z"
  },
  {
    "role": "user",
    "content": "Je veux créer une app mobile...",
    "timestamp": "2026-01-17T10:01:23Z"
  }
]
```

#### 12. Generated Documents (Documents générés)
```sql
CREATE TABLE generated_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  doc_type VARCHAR(50) NOT NULL, -- 'pitch_deck', 'brief', 'business_plan', 'mood_board'
  content JSONB, -- Contenu structuré
  file_url VARCHAR(500), -- URL du fichier généré (PDF, DOCX, etc.)
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_generated_docs_conversation ON generated_docs(conversation_id);
CREATE INDEX idx_generated_docs_type ON generated_docs(doc_type);
```

#### 13. Matches (Propositions IA)
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  reasoning TEXT, -- Explication du matching
  status VARCHAR(20) CHECK (status IN ('proposed', 'contacted', 'accepted', 'declined')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_matches_conversation ON matches(conversation_id);
CREATE INDEX idx_matches_professional ON matches(professional_id);
CREATE INDEX idx_matches_score ON matches(match_score DESC);
```

#### 14. Ratings (Notations - v2 pour amélioration IA)
```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ratings_match ON ratings(match_id);
CREATE INDEX idx_ratings_rating ON ratings(rating);
```

## 🔗 Relations Clés

```
users (1) ──→ (1) creators
users (1) ──→ (1) professionals
users (1) ──→ (*) subscriptions

creators (1) ──→ (*) ai_conversations
ai_conversations (1) ──→ (*) generated_docs
ai_conversations (1) ──→ (*) matches

professionals (1) ──→ (*) portfolios
professionals (1) ──→ (*) professional_professions
professionals (1) ──→ (*) software_skills
professionals (1) ──→ (*) matches

portfolios (1) ──→ (*) portfolio_tags
matches (1) ──→ (0..1) ratings
```

## 📊 Optimisations

- Index sur les colonnes fréquemment requêtées
- JSONB pour flexibilité (messages, features, content)
- UUIDs pour sécurité et scalabilité
- Constraints pour intégrité des données
- Cascades pour nettoyage automatique
