# Shared - Types TypeScript Partagés

Types TypeScript communs entre frontend et backend.

## 📦 Contenu

Ce dossier contiendra les types partagés pour assurer la cohérence entre le frontend et le backend.

## 📁 Structure Prévue

```
shared/
├── types/
│   ├── user.types.ts
│   ├── creator.types.ts
│   ├── professional.types.ts
│   ├── subscription.types.ts
│   ├── ai.types.ts
│   ├── matching.types.ts
│   ├── portfolio.types.ts
│   └── document.types.ts
├── constants/
│   ├── professions.ts
│   ├── software.ts
│   └── subscription-plans.ts
├── validators/
│   └── common.validators.ts
└── package.json
```

## 🎯 Objectif

Éviter la duplication de code et garantir que frontend et backend utilisent exactement les mêmes types.

## 📝 Exemples de Types

### User
```typescript
export interface User {
  id: string;
  email: string;
  role: 'creator' | 'professional';
  createdAt: Date;
}
```

### Subscription
```typescript
export interface Subscription {
  id: string;
  userId: string;
  planType: 'starter' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  projectsUsed: number;
  aiCreditsUsed: number;
  resetDate: Date;
}
```

### Match
```typescript
export interface Match {
  id: string;
  conversationId: string;
  professionalId: string;
  matchScore: number; // 0-100
  reasoning: string;
  status: 'proposed' | 'contacted' | 'accepted' | 'declined';
}
```

## 🚀 Usage

```bash
# Dans frontend ou backend
npm install ../shared
```

Puis dans le code:
```typescript
import { User, Subscription } from '@creative-match/shared';
```
