# Stack Technique

## 🛠️ Technologies Choisies

### Frontend
- **Framework:** React 18+
- **Langage:** TypeScript
- **Styling:** TailwindCSS (recommandé) ou CSS Modules
- **State Management:** React Context + Hooks (Redux si nécessaire plus tard)
- **Routing:** React Router v6
- **Forms:** React Hook Form
- **HTTP Client:** Axios
- **Build Tool:** Vite (rapide et moderne)

### Backend
- **Runtime:** Node.js 20+ LTS
- **Framework:** Express.js
- **Langage:** TypeScript
- **Validation:** Zod ou Joi
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **ORM:** Prisma (recommandé pour TypeScript) ou Sequelize
- **API Documentation:** Swagger/OpenAPI

### Base de Données
- **SGBD:** PostgreSQL 15+
- **Migrations:** Prisma Migrate ou node-pg-migrate
- **Connection Pooling:** pg-pool

### Intelligence Artificielle
- **APIs IA:**
  - **OpenAI GPT-4** (via openai npm package)
  - **Anthropic Claude** (via @anthropic-ai/sdk)
- **Stratégie:** Utilisation alternée ou simultanée selon le contexte
- **Vision AI:** GPT-4 Vision pour analyse des portfolios

### Paiements
- **Stripe:** Gestion des abonnements (Starter/Premium)
- **Webhooks:** Synchronisation statuts abonnements

### Stockage Fichiers
- **AWS S3** ou **Cloudflare R2** pour portfolios/documents générés
- Alternative économique: Stockage Hostinger si disponible

### Hébergement
- **Plateforme:** Hostinger
- **Frontend:** Build statique (React) via Hostinger ou Vercel
- **Backend:** VPS Hostinger avec PM2
- **Base de données:** PostgreSQL sur Hostinger VPS

### DevOps
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions (tests + déploiement)
- **Process Manager:** PM2 (backend Node.js)
- **Monitoring:** (À définir - Sentry pour errors tracking?)

### Testing
- **Frontend:** Vitest + React Testing Library
- **Backend:** Jest + Supertest
- **E2E:** Playwright (optionnel v2)

## 📦 Packages Principaux

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "typescript": "^5.3.0",
  "axios": "^1.6.0",
  "react-hook-form": "^7.49.0",
  "tailwindcss": "^3.4.0",
  "zustand": "^4.4.0"
}
```

### Backend Dependencies
```json
{
  "express": "^4.18.0",
  "typescript": "^5.3.0",
  "prisma": "^5.8.0",
  "@prisma/client": "^5.8.0",
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.0",
  "zod": "^3.22.0",
  "openai": "^4.24.0",
  "@anthropic-ai/sdk": "^0.9.0",
  "stripe": "^14.10.0",
  "cors": "^2.8.5",
  "dotenv": "^16.3.0"
}
```

## 🏗️ Architecture Globale

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND                            │
│              React + TypeScript + Vite                  │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Auth    │  │   AI     │  │ Matching │             │
│  │  Pages   │  │Chatbot UI│  │   UI     │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS/REST API
┌─────────────────────▼───────────────────────────────────┐
│                     BACKEND                             │
│              Node.js + Express + TypeScript             │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Auth   │  │    AI    │  │ Matching │             │
│  │  Service │  │ Service  │  │ Service  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│         │             │             │                  │
│         └─────────────┴─────────────┘                  │
│                       │                                │
└───────────────────────┼────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┬────────────┐
        │               │               │            │
┌───────▼──────┐ ┌─────▼─────┐ ┌───────▼────┐ ┌────▼────┐
│  PostgreSQL  │ │   GPT-4   │ │   Claude   │ │ Stripe  │
│   Database   │ │    API    │ │    API     │ │   API   │
└──────────────┘ └───────────┘ └────────────┘ └─────────┘
```

## 🔐 Sécurité

- **HTTPS:** Obligatoire en production
- **CORS:** Configuration stricte (domaines autorisés)
- **Rate Limiting:** express-rate-limit
- **Helmet.js:** Headers HTTP sécurisés
- **Input Validation:** Zod sur toutes les entrées
- **SQL Injection:** Protection via Prisma ORM
- **XSS Protection:** Sanitization des inputs
- **JWT:** Tokens avec expiration courte + refresh tokens
- **Environment Variables:** .env jamais commité

## 📊 Performance

- **Code Splitting:** React lazy loading
- **Image Optimization:** Compression avant upload
- **Database:** Indexes sur colonnes fréquentes
- **Caching:** Redis (optionnel v2 pour sessions/cache)
- **CDN:** Cloudflare pour assets statiques

## 🌍 Scalabilité Future

- Microservices (si croissance forte)
- Load balancing (Nginx)
- Database replication (read replicas)
- Message Queue (Bull/RabbitMQ pour jobs IA asynchrones)
