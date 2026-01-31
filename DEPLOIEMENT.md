# Guide de Déploiement sur Hostinger (junyia.fr)

Ce guide vous explique comment configurer le déploiement automatique de votre application sur Hostinger.

## 📋 Prérequis

1. Un compte Hostinger avec un plan d'hébergement Node.js
2. Accès au domaine junyia.fr configuré sur Hostinger
3. Accès SFTP/SSH à votre hébergement
4. Une base de données PostgreSQL ou MySQL configurée sur Hostinger

## 🚀 Configuration Initiale

### 1. Configuration de la base de données sur Hostinger

1. Connectez-vous à votre panneau Hostinger
2. Allez dans **Base de données** > **Gérer**
3. Créez une nouvelle base de données PostgreSQL (ou MySQL selon votre plan)
4. Notez les informations suivantes :
   - Nom de la base de données
   - Nom d'utilisateur
   - Mot de passe
   - Hôte (généralement localhost ou une URL spécifique)
   - Port (5432 pour PostgreSQL, 3306 pour MySQL)

### 2. Configuration des variables d'environnement

1. Créez un fichier `backend/.env.production` avec le contenu suivant :

```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/database_name"

# Server
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://junyia.fr

# JWT
JWT_SECRET=votre_secret_jwt_super_securise_changez_moi

# Stripe
STRIPE_SECRET_KEY=sk_live_votre_cle_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret

# OpenAI
OPENAI_API_KEY=sk-votre_cle_openai

# Anthropic
ANTHROPIC_API_KEY=sk-ant-votre_cle_anthropic

# Google Safe Browsing (optionnel)
GOOGLE_SAFE_BROWSING_API_KEY=votre_cle_google
```

2. **IMPORTANT** : Remplacez toutes les valeurs par vos vraies clés de production !

### 3. Configuration de GitHub Secrets

Pour le déploiement automatique via GitHub Actions, vous devez ajouter les secrets suivants à votre repository GitHub :

1. Allez sur votre repo : https://github.com/z8ma/projet-25-26
2. Cliquez sur **Settings** > **Secrets and variables** > **Actions**
3. Cliquez sur **New repository secret** et ajoutez :

| Nom du Secret | Description | Où le trouver |
|---------------|-------------|---------------|
| `FTP_SERVER` | Adresse du serveur FTP | Panel Hostinger > FTP > Hostname |
| `FTP_USERNAME` | Nom d'utilisateur FTP | Panel Hostinger > FTP > Username |
| `FTP_PASSWORD` | Mot de passe FTP | Panel Hostinger > FTP > Password |

### 4. Configuration de l'hébergement Node.js sur Hostinger

1. Dans le panneau Hostinger, allez dans **Hébergement**
2. Sélectionnez **Gestionnaire de fichiers** ou **File Manager**
3. Créez la structure suivante :
   ```
   /home/username/
   ├── public_html/        # Pour les fichiers frontend (React build)
   └── app/                # Pour le backend Node.js
   ```

4. Configurez Node.js :
   - Allez dans **Avancé** > **Node.js**
   - Activez Node.js (version 20.x recommandée)
   - Définissez le **Entry point** : `app/dist/server.js`
   - Définissez le **Application root** : `/home/username/app`

## 🔄 Déploiement Automatique

### Comment ça marche ?

Une fois configuré, le déploiement automatique fonctionne ainsi :

1. Vous modifiez votre code localement
2. Vous faites un commit : `git add . && git commit -m "Votre message"`
3. Vous poussez sur GitHub : `git push origin main`
4. **GitHub Actions se déclenche automatiquement** et :
   - Build le frontend
   - Build le backend
   - Déploie tout sur Hostinger via SFTP
5. Votre site est mis à jour automatiquement sur junyia.fr ! 🎉

### Vérifier le déploiement

1. Allez sur https://github.com/z8ma/projet-25-26/actions
2. Vous verrez l'état de vos déploiements
3. Cliquez sur un workflow pour voir les détails

## 🛠️ Déploiement Manuel

Si vous préférez déployer manuellement :

### Option 1 : Script de déploiement

```bash
# Exécutez le script de déploiement
./deploy.sh

# Puis uploadez le contenu du dossier 'deploy' via SFTP
# - deploy/public/ → public_html/
# - deploy/ (le reste) → app/
```

### Option 2 : Commandes manuelles

```bash
# 1. Build frontend
cd frontend
npm install
npm run build

# 2. Build backend
cd ../backend
npm install
npm run build
npm run prisma:generate

# 3. Uploadez via SFTP :
# - frontend/dist/ → public_html/
# - backend/dist/, backend/node_modules/, etc. → app/
```

## 🔧 Configuration du domaine junyia.fr

### Frontend (React)

1. Dans Hostinger, allez dans **Domaines**
2. Configurez junyia.fr pour pointer vers `public_html`
3. Activez le SSL (HTTPS) - Hostinger le fait automatiquement

### Backend API

1. Créez un sous-domaine : `api.junyia.fr`
2. Pointez-le vers votre application Node.js
3. OU utilisez un reverse proxy dans `public_html/.htaccess` :

```apache
# Rediriger /api vers le backend Node.js
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
```

## 📝 Migration de la base de données

Lors du premier déploiement, vous devez migrer votre base de données :

### Via SSH (si disponible)

```bash
# Se connecter en SSH
ssh username@junyia.fr

# Aller dans le dossier app
cd app

# Exécuter les migrations Prisma
npx prisma migrate deploy
```

### Via script local

Si vous n'avez pas accès SSH, vous pouvez exécuter les migrations en local en pointant vers la base de données de production (⚠️ ATTENTION) :

```bash
cd backend
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

## 🔍 Dépannage

### Le site ne se met pas à jour

1. Vérifiez que le workflow GitHub Actions s'est bien exécuté
2. Vérifiez les logs dans GitHub Actions
3. Vérifiez que les fichiers ont bien été uploadés sur Hostinger

### Erreurs de déploiement

1. Vérifiez vos secrets GitHub (FTP_SERVER, FTP_USERNAME, FTP_PASSWORD)
2. Vérifiez que Node.js est bien activé sur Hostinger
3. Vérifiez les logs de l'application dans le panneau Hostinger

### Problèmes de base de données

1. Vérifiez que `DATABASE_URL` est correct dans `.env.production`
2. Vérifiez que la base de données existe
3. Exécutez les migrations Prisma

## 📞 Support

- Documentation Hostinger : https://support.hostinger.com
- GitHub Actions : https://docs.github.com/actions
- Prisma Migrations : https://www.prisma.io/docs/guides/migrate

## ✅ Checklist de déploiement

- [ ] Base de données créée sur Hostinger
- [ ] Fichier `.env.production` configuré
- [ ] Secrets GitHub configurés (FTP_SERVER, FTP_USERNAME, FTP_PASSWORD)
- [ ] Node.js activé sur Hostinger
- [ ] Domaine junyia.fr configuré
- [ ] SSL activé
- [ ] Migrations de base de données exécutées
- [ ] Premier déploiement réussi
- [ ] Site accessible sur https://junyia.fr

---

**Une fois tout configuré, chaque `git push` mettra automatiquement à jour votre site ! 🚀**
