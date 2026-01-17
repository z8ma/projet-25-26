# Frontend - Creative Match

Application React + TypeScript pour la plateforme Creative Match.

## 🛠️ Stack Technique

- **React 18+**
- **TypeScript**
- **Vite** (build tool)
- **TailwindCSS** (styling)
- **React Router v6** (routing)
- **React Hook Form** (formulaires)
- **Axios** (HTTP client)
- **Zustand** (state management léger)

## 📁 Structure Prévue

```
frontend/
├── public/
├── src/
│   ├── assets/           # Images, fonts, etc.
│   ├── components/       # Composants réutilisables
│   │   ├── common/      # Buttons, Inputs, etc.
│   │   ├── layout/      # Header, Footer, Sidebar
│   │   └── features/    # Composants métier
│   ├── pages/            # Pages principales
│   │   ├── auth/        # Login, Register
│   │   ├── creator/     # Dashboard créateur
│   │   ├── professional/# Dashboard professionnel
│   │   └── landing/     # Page d'accueil
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API calls
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript types
│   ├── utils/            # Utilitaires
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🚀 Installation (à venir)

```bash
cd frontend
npm install
npm run dev
```

## 📝 Scripts

- `npm run dev` - Développement
- `npm run build` - Build production
- `npm run preview` - Preview du build
- `npm run lint` - ESLint
- `npm run test` - Tests (Vitest)
