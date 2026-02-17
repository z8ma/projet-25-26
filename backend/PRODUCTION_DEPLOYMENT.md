# 🚀 JUNY Production Deployment Guide

Guide complet pour déployer JUNY en production avec Redis, monitoring, et haute disponibilité.

## 📋 Prérequis

### Infrastructure requise

1. **Serveur Node.js**
   - Node.js 18+ LTS
   - PM2 ou Docker pour process management
   - 2GB RAM minimum, 4GB recommandé

2. **Base de données**
   - MySQL 8.0+
   - Connection pooling configuré
   - Backups automatiques

3. **Redis Cache** (FORTEMENT RECOMMANDÉ)
   - Redis 6.0+ ou Redis Cloud
   - Persistence activée (AOF ou RDB)
   - 512MB RAM minimum

4. **CDN & Storage**
   - Cloudinary pour les images/vidéos
   - CloudFront (optionnel) pour CDN

---

## 🔧 Configuration

### 1. Variables d'environnement

Copier `.env.production.example` vers `.env.production` et remplir :

```bash
cp .env.production.example .env.production
nano .env.production
```

**Variables critiques** :
```env
DATABASE_URL="mysql://..."
JWT_SECRET="STRONG_RANDOM_SECRET"
REDIS_URL="redis://your-redis-instance.com:6379"
STRIPE_SECRET_KEY="sk_live_..."
NODE_ENV="production"
```

### 2. Redis Setup

#### Option A : Redis Cloud (Recommandé pour débutants)
1. Créer un compte sur [Redis Cloud](https://redis.com/try-free/)
2. Créer une base Redis (Free tier: 30MB gratuit)
3. Copier l'URL de connexion dans `REDIS_URL`

#### Option B : AWS ElastiCache
1. Créer un cluster ElastiCache Redis
2. Configurer le security group pour autoriser l'accès depuis le serveur Node.js
3. Utiliser l'endpoint dans `REDIS_URL`

#### Option C : Redis auto-hébergé
```bash
# Installation Redis sur Ubuntu
sudo apt update
sudo apt install redis-server

# Configuration persistence
sudo nano /etc/redis/redis.conf
# Activer: appendonly yes
# Définir: maxmemory 512mb
# Définir: maxmemory-policy allkeys-lru

# Redémarrer
sudo systemctl restart redis-server
```

### 3. Base de données

```bash
# Migration Prisma en production
npx prisma migrate deploy

# Générer le client Prisma
npx prisma generate
```

---

## 🚀 Déploiement

### Méthode 1 : PM2 (Simple)

```bash
# Installation
npm install -g pm2

# Build
npm run build

# Démarrer avec PM2
pm2 start dist/index.js --name juny-api -i max

# Sauvegarder la config
pm2 save

# Auto-démarrage au boot
pm2 startup
```

**Configuration PM2** (`ecosystem.config.js`) :
```javascript
module.exports = {
  apps: [{
    name: 'juny-api',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    max_memory_restart: '1G'
  }]
};
```

### Méthode 2 : Docker

**Dockerfile** :
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copier package files
COPY package*.json ./
COPY prisma ./prisma/

# Installer dépendances
RUN npm ci --only=production

# Générer Prisma client
RUN npx prisma generate

# Copier le code
COPY . .

# Build TypeScript
RUN npm run build

# Exposer le port
EXPOSE 3000

# Démarrer
CMD ["node", "dist/index.js"]
```

**docker-compose.yml** (avec Redis) :
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  redis-data:
```

---

## 📊 Monitoring & Health Checks

### 1. Health Check Endpoint

L'API expose plusieurs endpoints de monitoring :

```bash
# Health check global
GET /api/professionals/discovery/health

# Métriques de performance
GET /api/professionals/discovery/metrics

# Réponse attendue
{
  "success": true,
  "data": {
    "cache": {
      "redis": true,
      "fallback": true,
      "latency": 2
    },
    "metrics": {
      "totalCalculations": 12345,
      "avgCalculationTimeMs": 1.2,
      "cacheType": "redis"
    }
  }
}
```

### 2. Logs structurés

Utiliser un logger production-ready :

```bash
npm install winston
```

### 3. Alertes

Configurer des alertes sur :
- **Redis down** : `cache.redis === false`
- **Latence élevée** : `avgCalculationTimeMs > 100ms`
- **Erreurs** : Logs d'erreur dans les services

---

## 🔄 Jobs CRON

### Pre-computation du Discovery Engine

Ajouter au crontab du serveur :

```bash
crontab -e

# Toutes les heures (pré-calcul incrémental)
0 * * * * cd /path/to/backend && npx ts-node src/jobs/discovery-precompute.job.ts

# Refresh complet toutes les 6h
0 */6 * * * cd /path/to/backend && npx ts-node src/jobs/discovery-precompute.job.ts --refresh
```

**Avec PM2** :
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    // ... API config
  ],
  cron: {
    discovery_precompute: {
      script: 'src/jobs/discovery-precompute.job.ts',
      cron: '0 * * * *'
    }
  }
};
```

---

## 🛡️ Sécurité

### 1. Secrets Management

```bash
# Générer un JWT secret fort
openssl rand -base64 64

# Utiliser dotenv-vault ou AWS Secrets Manager
npm install @dotenv/vault-core
```

### 2. Rate Limiting

```bash
npm install express-rate-limit redis-rate-limit
```

### 3. CORS

Configuration stricte en production :

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
}));
```

---

## 📈 Performance Tuning

### 1. Node.js

```bash
# Utiliser le max de CPU cores
NODE_OPTIONS="--max-old-space-size=4096" pm2 start dist/index.js -i max
```

### 2. Redis

```bash
# Configuration optimale
maxmemory 512mb
maxmemory-policy allkeys-lru
appendonly yes
appendfsync everysec
```

### 3. Database

```sql
-- Index critiques (déjà dans schema.prisma)
CREATE INDEX idx_portfolio_created ON portfolios(created_at);
CREATE INDEX idx_portfolio_featured ON portfolios(is_featured);
CREATE INDEX idx_likes_created ON portfolio_likes(created_at);
```

---

## 🔍 Troubleshooting

### Redis connection errors

```bash
# Vérifier la connexion
redis-cli -h your-redis-host -p 6379 ping

# Logs Redis
tail -f /var/log/redis/redis-server.log

# Fallback automatique activé
# L'API continue de fonctionner avec cache en mémoire
```

### Cache not working

```bash
# Vérifier les métriques
curl http://localhost:3000/api/professionals/discovery/metrics

# Invalider le cache manuellement
curl -X POST http://localhost:3000/api/professionals/discovery/invalidate-cache
```

### High latency

```bash
# Pré-calculer les scores
npx ts-node src/jobs/discovery-precompute.job.ts --limit=1000 --verbose

# Vérifier la latence Redis
redis-cli --latency -h your-redis-host
```

---

## 📊 Métriques clés à surveiller

| Métrique | Seuil Normal | Alerte si > |
|----------|--------------|-------------|
| **Redis latency** | < 5ms | 50ms |
| **Cache hit rate** | > 70% | < 50% |
| **API response time** | < 100ms | 500ms |
| **Redis memory** | < 80% | 90% |
| **CPU usage** | < 70% | 85% |

---

## 🚀 Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Redis connecté et testé
- [ ] Migrations DB appliquées
- [ ] Prisma client généré
- [ ] Build TypeScript réussi
- [ ] PM2/Docker configuré
- [ ] CRON jobs configurés
- [ ] Health checks accessibles
- [ ] Logs structurés en place
- [ ] Backups DB automatiques
- [ ] Redis persistence activée
- [ ] CORS configuré strictement
- [ ] SSL/TLS activé (nginx/load balancer)

---

**Dernière mise à jour** : Février 2026
**Maintenu par** : JUNY Platform Team
