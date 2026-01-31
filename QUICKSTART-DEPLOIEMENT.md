# 🚀 Démarrage Rapide - Déploiement Automatique

## 📌 Ce que vous avez maintenant

✅ Un système de déploiement automatique complet
✅ Chaque `git push` mettra à jour votre site automatiquement
✅ Scripts de déploiement prêts à l'emploi

## ⚡ Configuration en 5 étapes

### 1️⃣ Configurez Hostinger (5 min)

1. Connectez-vous à votre panneau Hostinger
2. Créez une base de données PostgreSQL
3. Notez les informations de connexion (host, user, password, database)

### 2️⃣ Configurez les variables d'environnement (5 min)

```bash
# 1. Copiez le fichier exemple
cp backend/.env.production.example backend/.env.production

# 2. Éditez le fichier avec vos vraies valeurs
nano backend/.env.production
# ou
code backend/.env.production
```

**Remplissez au minimum :**
- `DATABASE_URL` (votre base de données Hostinger)
- `JWT_SECRET` (générez un secret sécurisé)
- `STRIPE_SECRET_KEY` (vos clés Stripe)
- `OPENAI_API_KEY` et `ANTHROPIC_API_KEY`

### 3️⃣ Configurez GitHub Secrets (3 min)

1. Allez sur : https://github.com/z8ma/projet-25-26/settings/secrets/actions
2. Cliquez sur **New repository secret**
3. Ajoutez ces 3 secrets (trouvez-les dans Hostinger > FTP) :
   - `FTP_SERVER` → Hostname FTP
   - `FTP_USERNAME` → Username FTP
   - `FTP_PASSWORD` → Password FTP

### 4️⃣ Activez Node.js sur Hostinger (2 min)

1. Dans Hostinger, allez dans **Avancé** > **Node.js**
2. Activez Node.js version 20.x
3. Entry point : `app/dist/server.js`
4. Application root : `/home/username/app`

### 5️⃣ Premier déploiement (1 min)

```bash
# Commitez vos changements
git add .
git commit -m "Configuration du déploiement automatique"

# Poussez sur GitHub
git push origin main
```

**C'est tout ! 🎉**

GitHub Actions va automatiquement :
- ✅ Builder votre frontend
- ✅ Builder votre backend
- ✅ Déployer sur Hostinger
- ✅ Votre site sera disponible sur https://junyia.fr

## 🔍 Vérifier le déploiement

1. Allez sur : https://github.com/z8ma/projet-25-26/actions
2. Vous verrez le workflow en cours d'exécution
3. Attendez qu'il devienne vert ✅
4. Visitez https://junyia.fr

## 🔄 Utilisation quotidienne

À partir de maintenant, pour mettre à jour votre site :

```bash
# 1. Modifiez votre code
# 2. Commitez
git add .
git commit -m "Ajout d'une nouvelle fonctionnalité"

# 3. Poussez
git push origin main

# 4. Attendez 2-3 minutes
# ✅ Votre site est mis à jour automatiquement !
```

## 🛠️ Déploiement manuel (optionnel)

Si vous préférez déployer manuellement :

```bash
# Exécutez le script
./deploy.sh

# Puis uploadez le dossier 'deploy' via SFTP sur Hostinger
```

## 📚 Documentation complète

Pour plus de détails, consultez [DEPLOIEMENT.md](./DEPLOIEMENT.md)

## ❓ Problèmes courants

### Le déploiement échoue
→ Vérifiez que les 3 secrets GitHub sont bien configurés

### Le site ne s'affiche pas
→ Vérifiez que Node.js est activé sur Hostinger

### Erreur de base de données
→ Vérifiez `DATABASE_URL` dans `.env.production`

### Le frontend ne se connecte pas au backend
→ Vérifiez `VITE_API_URL` dans `frontend/.env.production`

## 🎯 Prochaines étapes

1. [ ] Configurez votre domaine SSL (HTTPS) sur Hostinger
2. [ ] Exécutez les migrations de base de données
3. [ ] Testez votre application en production
4. [ ] Configurez les webhooks Stripe pour la production

---

**Besoin d'aide ?** Consultez [DEPLOIEMENT.md](./DEPLOIEMENT.md) pour le guide complet.
