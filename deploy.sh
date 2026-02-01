#!/bin/bash

# Script de déploiement pour Hostinger
# Usage: ./deploy.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Démarrage du déploiement..."

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 0. Récupérer les derniers changements
echo -e "${YELLOW}🔄 Récupération des derniers changements...${NC}"
git pull
echo -e "${GREEN}✅ Code mis à jour${NC}"

# 1. Build Frontend
echo -e "${YELLOW}📦 Build du Frontend...${NC}"
cd frontend
npm install
npm run build
cd ..
echo -e "${GREEN}✅ Frontend build terminé${NC}"

# 2. Build Backend
echo -e "${YELLOW}📦 Build du Backend...${NC}"
cd backend
npm install
npm run build
npm run prisma:generate
cd ..
echo -e "${GREEN}✅ Backend build terminé${NC}"

# 3. Créer un dossier de déploiement
echo -e "${YELLOW}📁 Préparation des fichiers de déploiement...${NC}"
rm -rf deploy
mkdir -p deploy

# Copier le frontend build
cp -r frontend/dist deploy/public

# Copier le backend build
cp -r backend/dist deploy/
cp -r backend/node_modules deploy/
cp -r backend/prisma deploy/
cp backend/package.json deploy/
cp backend/package-lock.json deploy/

# Copier les fichiers de configuration
if [ -f "backend/.env.production" ]; then
  cp backend/.env.production deploy/.env
  echo -e "${GREEN}✅ Fichier .env.production copié${NC}"
else
  echo -e "${YELLOW}⚠️  Attention: backend/.env.production n'existe pas${NC}"
fi

echo -e "${GREEN}✅ Fichiers de déploiement préparés dans le dossier 'deploy'${NC}"
echo -e "${YELLOW}📤 Prêt pour le transfert vers Hostinger${NC}"
echo ""
echo -e "${YELLOW}Pour déployer manuellement via SFTP:${NC}"
echo -e "1. Connectez-vous à votre compte Hostinger"
echo -e "2. Uploadez le contenu du dossier 'deploy/public' vers 'public_html'"
echo -e "3. Uploadez le reste du contenu du dossier 'deploy' vers votre répertoire d'application"
echo ""
echo -e "${GREEN}✅ Déploiement préparé avec succès!${NC}"
