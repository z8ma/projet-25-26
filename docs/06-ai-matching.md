# IA & Système de Matching

## 🤖 Double IA Stratégique

### 1. IA de Brainstorming (Créateurs)

#### Objectifs
- Aider à clarifier le projet
- Ouvrir de nouveaux axes de réflexion
- Anticiper questions investisseurs/partenaires
- Collecter informations pour matching optimal

#### Technologies
- **API principale:** OpenAI GPT-4 Turbo
- **API secondaire:** Anthropic Claude 3 Opus
- **Stratégie:** Alternance ou consensus selon complexité

#### Méthodes de Brainstorming Intégrées

**Sans étapes rigides visibles**, l'IA s'inspire de ces techniques:

1. **Analogie** - Transposition dans d'autres univers
   - "Si votre projet était dans l'industrie automobile, comment l'aborderiez-vous?"

2. **"Et si..."** - Changement de perspective
   - "Si Apple/Netflix/Tesla développait ce projet, quelles seraient leurs priorités?"

3. **Copier-Réinventer** - Amélioration de l'existant
   - "Quels produits similaires existent? Comment les surpasser?"

4. **Retour vers le Futur** - Projection temporelle
   - "Imaginez votre projet dans 5 ans. Quels usages ont émergé?"

5. **Questions Challengeantes**
   - "Quel est le plus gros risque de votre projet?"
   - "Pourquoi un utilisateur choisirait-il VOTRE solution?"
   - "Que demanderait un investisseur sceptique?"

#### Flow Conversationnel Type

```
1. Introduction & Contexte
   └─ "Parlez-moi de votre projet en quelques phrases"

2. Approfondissement
   ├─ Public cible
   ├─ Problème résolu
   ├─ Proposition de valeur
   └─ Concurrence

3. Aspects Techniques/Créatifs
   ├─ Besoins visuels
   ├─ Identité de marque
   ├─ Type de créations nécessaires
   └─ Inspirations/Références

4. Contraintes & Ressources
   ├─ Budget
   ├─ Timeline
   ├─ Équipe actuelle
   └─ Obstacles prévus

5. Vision Stratégique
   ├─ Objectifs 6-12 mois
   ├─ Pitch investisseurs
   ├─ Positionnement marché
   └─ Facteurs de succès

6. Questions Ouvertes IA
   └─ L'IA pose 3-5 questions personnalisées
       basées sur les réponses précédentes

7. Synthèse & Validation
   └─ Récapitulatif pour validation
```

**Nombre d'échanges:** 10-20 (flexible selon profondeur)

**1 crédit IA = 1 échange complet (question + réponse)**

#### Génération de Documents

À partir de la conversation, l'IA génère:

**1. Pitch Deck (Priorité MVP)**
```markdown
Structure:
- Slide 1: Problème
- Slide 2: Solution
- Slide 3: Marché cible
- Slide 4: Proposition de valeur
- Slide 5: Avantage concurrentiel
- Slide 6: Besoins créatifs
- Slide 7: Budget & Timeline
- Slide 8: Next steps
```

**2. Brief Créatif (Pour professionnels)**
```markdown
Sections:
- Contexte du projet
- Objectifs créatifs
- Public cible
- Ton & Style recherché
- Livrables attendus
- Contraintes (budget, délais)
- Inspirations/Références
- Critères de succès
```

**3. Business Plan Simplifié (Optionnel v2)**
**4. Mood Board (Liste de références visuelles)**

**Formats d'export:**
- Markdown (toujours)
- PDF (via bibliothèque comme Puppeteer ou PDFKit)
- Word/DOCX (via docx npm package)

---

### 2. IA d'Analyse Portfolio (Professionnels)

#### Objectif
Extraire automatiquement le style, compétences, et caractéristiques visuelles du portfolio pour améliorer le matching.

#### Technologie
- **GPT-4 Vision** ou **Claude 3 Opus (Vision)**
- Analyse d'images du portfolio

#### Informations Extraites

**Par image de portfolio (max 10 tags/image):**

1. **Style Artistique**
   - Minimaliste, Coloré, Dark, Moderne, Vintage, Corporate, Ludique, etc.

2. **Technique**
   - 3D Réaliste, Flat Design, Isométrique, Illustration, Photo-manipulation, etc.

3. **Couleurs Dominantes**
   - 3 couleurs max (hex codes + noms)
   - Palette (monochrome, vives, pastels, etc.)

4. **Industrie/Secteur**
   - Tech, Food & Beverage, Fashion, Corporate, Gaming, Santé, etc.

5. **Type de Projet**
   - Branding, UI/UX, Packaging, Motion Graphics, Character Design, etc.

6. **Complexité**
   - Simple, Intermédiaire, Complexe

**Exemple d'analyse:**
```json
{
  "portfolio_item_id": "uuid-123",
  "ai_analysis": {
    "style": ["minimaliste", "moderne", "corporate"],
    "technique": ["flat_design", "vector"],
    "colors": [
      {"hex": "#2C3E50", "name": "dark_blue"},
      {"hex": "#ECF0F1", "name": "light_gray"},
      {"hex": "#E74C3C", "name": "red_accent"}
    ],
    "industry": ["tech", "fintech"],
    "project_type": "ui_ux_design",
    "complexity": "intermediate",
    "tags": ["clean", "professional", "dashboard", "data_visualization"]
  }
}
```

---

## 🎯 Algorithme de Matching

### Inputs (depuis conversation créateur)

```javascript
{
  project_type: "branding",
  budget_range: "2000-5000€",
  timeline: "2 mois",
  style_preferences: ["moderne", "minimaliste", "tech"],
  industry: "fintech",
  must_have_skills: ["Illustrator", "Figma"],
  experience_level: "intermédiaire_ou_plus",
  availability: "disponible_rapidement"
}
```

### Calcul du Score de Match (0-100)

**Pondération:**
- **Style (30%)**: Correspondance tags portfolio ↔ préférences projet
- **Compétences (25%)**: Logiciels maîtrisés + niveau
- **Expérience (20%)**: Années d'expérience + projets similaires
- **Budget (15%)**: Tarif horaire compatible
- **Disponibilité (10%)**: Peut commencer rapidement

**Formule simplifiée:**
```javascript
function calculateMatchScore(professional, projectNeeds) {
  let score = 0;

  // 1. Style (30 points max)
  const styleMatch = compareStyles(
    professional.portfolio_tags,
    projectNeeds.style_preferences
  );
  score += styleMatch * 30;

  // 2. Compétences (25 points max)
  const skillsMatch = compareSkills(
    professional.software_skills,
    projectNeeds.must_have_skills
  );
  score += skillsMatch * 25;

  // 3. Expérience (20 points max)
  const experienceMatch = evaluateExperience(
    professional.experience_years,
    professional.past_projects,
    projectNeeds.experience_level
  );
  score += experienceMatch * 20;

  // 4. Budget (15 points max)
  const budgetMatch = isBudgetCompatible(
    professional.hourly_rate,
    projectNeeds.budget_range,
    projectNeeds.timeline
  );
  score += budgetMatch * 15;

  // 5. Disponibilité (10 points max)
  const availabilityMatch = checkAvailability(
    professional.availability,
    projectNeeds.timeline
  );
  score += availabilityMatch * 10;

  return Math.round(score);
}
```

### Ranking & Sélection

1. **Calcul** pour tous les professionnels actifs
2. **Tri** par score décroissant
3. **Filtrage:**
   - Score minimum: 60/100
   - Disponibilité compatible
   - Pas déjà contacté par ce créateur
4. **Sélection finale:**
   - Top 5 profils
   - Diversité (éviter 5 profils trop similaires)
   - Boost Premium (si créateur Premium → inclure profils premium prioritairement)

### Explication du Matching

Pour chaque profil proposé, l'IA génère:

```markdown
**Match Score: 87/100**

**Pourquoi ce profil est recommandé:**
- ✅ Style parfaitement aligné: portfolio majoritairement minimaliste et moderne
- ✅ Maîtrise Figma et Illustrator (niveau Expert)
- ✅ 5 ans d'expérience en branding fintech
- ✅ Tarif (60€/h) compatible avec votre budget
- ⚠️  Disponibilité partielle (peut commencer dans 2 semaines)

**Projets similaires dans le portfolio:**
- [Projet 1: Branding startup fintech "PayFlow"]
- [Projet 2: Design système bancaire mobile]
```

---

## 🧠 Amélioration Continue via Notations

### Après Collaboration (v2)

Le créateur note le professionnel:

```javascript
{
  match_id: "uuid-456",
  rating: 5, // 1-5 étoiles
  feedback: {
    quality: 5,
    communication: 4,
    deadline: 5,
    budget_respect: 5
  },
  comment: "Excellent travail, très professionnel!"
}
```

### Machine Learning Progressif

**L'IA apprend:**
- Quels types de matchings aboutissent à des collaborations
- Quels professionnels sont les plus fiables (ratings élevés)
- Ajustement automatique des pondérations de l'algo
- Détection de patterns (ex: "créateurs fintech préfèrent style X")

**Ajustement des scores futurs:**
```javascript
// Professionnel avec rating moyen 4.8/5
professional.reliability_boost = +5; // Bonus au score

// Professionnel avec rating moyen 2.5/5
professional.reliability_penalty = -10; // Malus
```

---

## 🔧 Optimisations Techniques

### Caching & Performance
- **Cache des analyses IA** (éviter re-analyser même image)
- **Pre-computation** des tags portfolios (tâche asynchrone)
- **Indexation** PostgreSQL sur colonnes de matching

### Rate Limiting API
- **GPT-4:** Max 60 requêtes/min (selon tier OpenAI)
- **Claude:** Max 50 requêtes/min
- **Fallback:** Si l'une échoue, utiliser l'autre

### Coûts IA (Estimation)

**GPT-4 Turbo:**
- Input: ~$10 / 1M tokens
- Output: ~$30 / 1M tokens
- Conversation moyenne: ~5,000 tokens → ~$0.20/conversation

**GPT-4 Vision:**
- ~$0.01 par image analysée

**Claude 3 Opus:**
- Input: ~$15 / 1M tokens
- Output: ~$75 / 1M tokens

**Budget mensuel (100 créateurs actifs):**
- 500 conversations/mois × $0.20 = $100
- 200 images analysées/mois × $0.01 = $2
- **Total: ~$102/mois** (très rentable vs revenus)

---

## 📊 Métriques de Succès IA

### Brainstorming
- Taux de complétion des conversations
- Satisfaction des documents générés (1-5)
- Nombre moyen de crédits utilisés par projet

### Matching
- Précision (% de matchings notés 4+/5)
- Taux de contact (% profils contactés vs proposés)
- Taux de collaboration (% aboutissant à un projet)

### Objectifs
- **Précision matching: >80%** (notation moyenne 4+/5)
- **Taux de contact: >40%** (au moins 2/5 profils contactés)
- **Taux de collaboration: >25%** (1/4 des contacts devient projet)
