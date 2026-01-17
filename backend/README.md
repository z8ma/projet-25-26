# Backend - Creative Match

API Node.js + Express + TypeScript pour la plateforme Creative Match.

## 🛠️ Stack Technique

- **Node.js 20+ LTS**
- **Express.js**
- **TypeScript**
- **PostgreSQL** (via Prisma ORM)
- **JWT** (authentification)
- **Stripe** (paiements)
- **OpenAI & Anthropic** (IA)
- **Zod** (validation)

## 📁 Structure Prévue

```
backend/
├── prisma/
│   ├── schema.prisma    # Schéma DB
│   └── seed.ts          # Données initiales
├── src/
│   ├── config/          # Configuration (DB, env, etc.)
│   ├── controllers/     # Logique métier
│   │   ├── auth.controller.ts
│   │   ├── creator.controller.ts
│   │   ├── professional.controller.ts
│   │   ├── ai.controller.ts
│   │   └── matching.controller.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── routes/          # Routes API
│   │   ├── auth.routes.ts
│   │   ├── creator.routes.ts
│   │   ├── professional.routes.ts
│   │   ├── ai.routes.ts
│   │   └── matching.routes.ts
│   ├── services/        # Logique business
│   │   ├── ai.service.ts         # GPT-4 & Claude
│   │   ├── matching.service.ts   # Algorithme matching
│   │   ├── document.service.ts   # Génération docs
│   │   ├── stripe.service.ts     # Paiements
│   │   └── portfolio.service.ts  # Analyse portfolio
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilitaires
│   ├── validators/      # Schémas Zod
│   └── server.ts        # Point d'entrée
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Variables d'Environnement

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/creative_match"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# OpenAI
OPENAI_API_KEY="sk-..."

# Anthropic
ANTHROPIC_API_KEY="sk-ant-..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
PORT=3000
NODE_ENV="development"
```

## 🚀 Installation (à venir)

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## 📝 Scripts

- `npm run dev` - Développement (avec hot reload)
- `npm run build` - Build TypeScript
- `npm start` - Production
- `npm run prisma:studio` - Interface DB
- `npm run test` - Tests (Jest)
