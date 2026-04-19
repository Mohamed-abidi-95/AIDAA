# 🌐 AIDAA — Solutions d'Hébergement Complet (Site + Téléconsultation)

**Date:** 19 avril 2026  
**Objectif:** Mettre l'application AIDAA en ligne gratuitement avec téléconsultation intégrée  
**Durée totale de mise en ligne:** 1-2 heures  

---

## 📋 Vue d'ensemble

Vous avez une application full-stack qui nécessite d'être hébergée en 3 parties :

| Composant | Fonction | Solution recommandée | Coût |
|-----------|----------|---------------------|------|
| **Frontend** | Interface web (React/Vite) | ✅ Vercel | **0€** |
| **Backend** | API REST Node.js | ✅ Railway | **0€** (Student Pack) |
| **Base de données** | MySQL | ✅ Railway MySQL | **0€** (Student Pack) |
| **Téléconsultation** | Jitsi Meet (vidéo) | ✅ Jitsi.org (gratuit) | **0€** |
| **Email** | Notifications | ✅ Brevo / Ethereal | **0€** (Free tier) |
| **CDN/Media** | Uploads vidéo | ✅ Cloudinary Free | **0€** (25GB) |

---

## 🎯 Architecture finale (Déployée)

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET (Users)                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                ┌──────────┴──────────┬──────────────┐
                │                     │              │
        ┌───────▼────────┐   ┌────────▼─────┐   ┌───▼──────────┐
        │ Vercel         │   │ Railway      │   │ Jitsi.org    │
        │ (Frontend)     │   │ (Backend)    │   │ (Vidéo)      │
        │                │   │              │   │              │
        │ aidaa.vercel.  │   │ API: Railway │   │ meet.jitsi.  │
        │ app            │   │ :5000        │   │ si/room_*    │
        │                │   │              │   │              │
        └────────┬────────┘   └───────┬──────┘   └──────────────┘
                 │                    │
                 │ Requêtes HTTP      │
                 │ /api/*             │
                 │                    │
                 │         ┌──────────▼─────────┐
                 │         │  Railway MySQL     │
                 │         │  (Base de données) │
                 │         │                    │
                 │         │  aidaa_db          │
                 │         └────────────────────┘
                 │
        ┌────────▼────────────────────────────┐
        │  Users (World-wide)                  │
        │  - Parents                           │
        │  - Professionnels                    │
        │  - Administrateurs                   │
        └──────────────────────────────────────┘
```

---

## 🚀 SOLUTION 1 — Recommandée (100% Gratuit avec Student Pack)

### Architecture:
- **Frontend:** Vercel (déploiement auto depuis GitHub)
- **Backend:** Railway Node.js (avec Student Pack credits)
- **DB:** Railway MySQL (inclus dans le Student Pack)
- **Vidéo:** Jitsi.org (gratuit, open-source)
- **Email:** Brevo free tier (300/jour) ou Ethereal (dev)

### Coûts:
| Service | Coût | Notes |
|---------|------|-------|
| Vercel | **0€** | Gratuit illimité pour les étudiants |
| Railway | **0€** | $5 credits/mois (Student Pack GitHub) |
| Jitsi | **0€** | Gratuit public, pas de limite d'appels |
| Brevo | **0€** | 300 emails/jour (free tier) |
| **TOTAL** | **0€** | ✅ Totalement gratuit |

### Étapes de déploiement:

#### **Étape 1.1 — Préparer GitHub**

```bash
# 1. Initialiser git (si pas déjà fait)
cd C:\Users\MohamedAbidi\PhpstormProjects\AIDAA
git init
git add .
git commit -m "AIDAA v1.0 - Full stack autism support platform"

# 2. Créer un repo sur GitHub (public, gratuit)
# Aller sur https://github.com/new
# Nom: AIDAA
# Description: Platform for autism support with teleconsultation
# Public: OUI

# 3. Ajouter le remote et pousser
git remote add origin https://github.com/TON_USERNAME/AIDAA.git
git branch -M main
git push -u origin main
```

**Vérification:**
- [ ] Le repo est visible sur GitHub
- [ ] Tous les fichiers sont pushés

---

#### **Étape 1.2 — Déployer le Frontend sur Vercel**

1. Aller sur https://vercel.com
2. Cliquer "Sign up" → "Continue with GitHub"
3. Autoriser Vercel à accéder à tes repos
4. Cliquer "New Project"
5. Sélectionner le repo **AIDAA**
6. Configuration:
   - **Framework:** Vite
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
7. Cliquer "Deploy"

**Résultat:**
- URL: `https://aidaa-xyz.vercel.app`
- Auto-redéploiement à chaque push sur `main`

**Vérification:**
- [ ] Frontend accessible sur Vercel
- [ ] Page de login se charge
- [ ] Essayer un login (échec normal car pas de backend yet)

---

#### **Étape 1.3 — Déployer le Backend sur Railway**

1. Aller sur https://railway.app
2. Cliquer "Sign up" → "GitHub"
3. Cliquer "New Project"
4. Sélectionner "Deploy from GitHub repo"
5. Sélectionner **AIDAA**
6. Configuration:
   - **Root directory:** `backend`
   - **Framework:** Node.js
   - **Start command:** `npm start`
7. Ajouter une **MySQL Database:**
   - Cliquer "Create" → "Database" → "MySQL"
   - Attendre 2-3 min
8. Configurer les **variables d'environnement** (Railway Dashboard):

```env
# Database
DB_HOST=<copier depuis Railway MySQL>
DB_USER=root
DB_PASSWORD=<copier depuis Railway MySQL>
DB_NAME=aidaa_db

# JWT & Security
JWT_SECRET=aidaa_secret_key_prod_$(date +%s)

# Frontend URL
FRONTEND_URL=https://aidaa-xyz.vercel.app

# Email (Brevo)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<votre_email@example.com>
SMTP_PASSWORD=<brevo_api_key>
SMTP_FROM=noreply@aidaa-app.com

# Node
NODE_ENV=production
PORT=3000
```

9. Cliquer "Deploy"

**Vérification:**
- [ ] Backend accessible via Railway
- [ ] GET `https://railway-url.up.railway.app/health` retourne `{"status":"ok"}`

---

#### **Étape 1.4 — Importer la base de données**

1. Depuis **Railway Dashboard** → MySQL → "Connect"
2. Copier les identifiants MySQL
3. Exécuter dans le terminal:

```bash
cd backend

# Importer le schéma et les données
mysql -h <HOST> -u root -p<PASSWORD> aidaa_db < ../setup_complete.sql
mysql -h <HOST> -u root -p<PASSWORD> aidaa_db < ../seed_fix.sql

# Exécuter la migration téléconsultation
mysql -h <HOST> -u root -p<PASSWORD> aidaa_db < migrations/add_teleconsultation_fields.sql
```

**Vérification SQL:**
```sql
SELECT COUNT(*) FROM users;        -- Doit retourner 40
SELECT COUNT(*) FROM children;     -- Doit retourner 35
SELECT COUNT(*) FROM child_badges; -- Doit retourner 100+
```

---

#### **Étape 1.5 — Mettre à jour le Frontend pour le backend en prod**

**Fichier:** `frontend/src/lib/api.ts`

```typescript
const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://<votre-railway-url>.up.railway.app/api'
  : 'http://localhost:5000/api';

export default axios.create({ baseURL: API_BASE });
```

**Push vers GitHub:**
```bash
git add .
git commit -m "chore: Update API base URL for production"
git push
```

**Vercel redéploie automatiquement.**

---

#### **Étape 1.6 — Configurer Jitsi (déjà inclus)**

Aucune configuration nécessaire ! Jitsi.org est **100% gratuit** et pas de limite.

Les room IDs sont générés automatiquement : `room_<uuid>_<timestamp>`

Les liens Jitsi sont créés automatiquement : `https://meet.jitsi.si/room_abc123_xyz789`

---

#### **Étape 1.7 — Configurer Brevo pour les emails**

1. Aller sur https://www.brevo.com
2. S'inscrire (gratuit)
3. Onglet "API & SMTP" → Copier la clé API
4. Dans Railway → Variables d'environnement :

```env
SMTP_USER=votre_email_brevo@example.com
SMTP_PASSWORD=<votre_api_key>
```

**Limites:**
- 300 emails/jour (suffisant pour démo)
- Pas de limite d'appels

---

## 🎯 SOLUTION 2 — Alternative (Render + Supabase)

Si vous préférez une autre stack:

| Service | Coût | Notes |
|---------|------|-------|
| Render | **0€** | Backend (sleep après 15 min inactivité) |
| Supabase | **0€** | PostgreSQL + Auth (free tier) |
| Vercel | **0€** | Frontend |
| Jitsi | **0€** | Vidéo |
| **TOTAL** | **0€** | ✅ Gratuit |

**Avantage:** Supabase a une meilleure couche d'auth intégrée  
**Inconvénient:** Migration MySQL → PostgreSQL requise

---

## 🎯 SOLUTION 3 — Scalable (Payer plus tard)

Quand vous aurez 1000+ utilisateurs, passer à:

| Service | Coût/mois | Notes |
|---------|-----------|-------|
| Vercel | **$20** | Pro plan avec analytics |
| Railway | **$10-50** | Pay-as-you-go après free credits |
| PlanetScale | **$10** | MySQL serverless |
| Sendgrid | **$15** | 100k emails/mois |
| Cloudinary | **$10** | Stockage illimité images/vidéos |
| **TOTAL** | **~$65-100** | Scalable pour 10k+ users |

---

## 📊 Comparaison des solutions

| Critère | Solution 1 (Railway) | Solution 2 (Render) | Solution 3 (Scalable) |
|---------|-------------------|-------------------|----------------------|
| **Coût initial** | 0€ | 0€ | 65-100€/mois |
| **Facilité déploiement** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Performance** | Très bon | Moyen (sleep) | Excellent |
| **Support MySQL** | Natif | PostgreSQL only | ✅ |
| **Jitsi intégré** | ✅ | ✅ | ✅ |
| **Recommandé pour** | **Démo + MVP** | Prototype | Production |

---

## ✅ Tests après déploiement

### Test 1: Login
```bash
curl -X POST https://aidaa-xyz.vercel.app/login \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@aidaa.com","password":"parent123"}'
# Doit retourner un JWT token
```

### Test 2: Filtres activités
- Aller sur https://aidaa-xyz.vercel.app
- Se connecter en parent
- Dashboard → Activités → tester les filtres

### Test 3: Téléconsultation
- Se connecter en parent
- Aller sur Mes professionnels → Planifier une séance
- Accepter en tant que professionnel
- Cliquer "Accéder" → Jitsi Meet se charge

### Test 4: Emails
- Vérifier que les emails d'invitation arrivent
- Vérifier que les rappels arrivent 1h avant

---

## 🔒 Sécurité en production

### Points importants:

1. **Secrets:**
```bash
# JAMAIS commit ces fichiers:
.env
.env.local
.env.*.local

# Utiliser Railway/Vercel environment variables
```

2. **JWT Secret:**
```bash
# Générer un nouveau secret fort
openssl rand -base64 32
# Résultat: KUBWqJKHSd8sKJ7/sK7+Z/JSK7sKJ7/sK7sKJQs=
# Mettre dans Railway SMTP_PASSWORD
```

3. **CORS:**
```javascript
// backend/src/config/cors.js
const corsOptions = {
  origin: [
    'https://aidaa-xyz.vercel.app',
    'http://localhost:3000' // dev
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

4. **Rate limiting:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100 // 100 requêtes par 15 min
});

app.use('/api/', limiter);
```

---

## 📈 Monitoring et Logs

### Railway Dashboard:
- Logs en temps réel
- CPU/Memory usage
- Erreurs automatiquement alertées

### Vercel Analytics:
- Performances frontend
- Core Web Vitals
- User sessions

### Configuration des alertes:

**Railway Settings:**
```
Déploiement → Alertes → Slack/Email
- Erreur de déploiement
- CPU > 80%
- Memory > 90%
```

---

## 🎥 Tests de téléconsultation en prod

### Scénario de test complet:

1. **Parent planifie une séance**
   - Date: Demain 14h
   - Professionnel: Dr. Abderrahman Sbai
   - Notes: "Consultation de suivi"

2. **Professionnel reçoit email d'invitation**
   - ✅ Email reçu
   - ✅ Lien Jitsi fonctionnel

3. **Professionnel accepte l'invitation**
   - Dashboard → Invitations → Accepter

4. **Parent et professionnel accèdent à la salle 14h**
   - ✅ Iframe Jitsi se charge
   - ✅ Audio/Vidéo fonctionnent
   - ✅ Statut passe à "in_progress"

5. **Rappel automatique 1h avant**
   - 13h → Email de rappel envoyé
   - ✅ Les 2 participants reçoivent

6. **Après la séance**
   - Statut: "completed"
   - ✅ Visible dans l'historique

---

## 🚨 Troubleshooting courant

| Problème | Cause | Solution |
|----------|-------|----------|
| Frontend ne se charge pas | Pas de build Vercel | Attendre 5-10 min ou forcer rebuild |
| Backend retourne 502 | Crash Node.js | Vérifier Railway logs |
| MySQL timeout | Trop de connexions | Réduire le pool de connexions |
| Email ne s'envoie pas | SMTP incorrecte | Vérifier clés Brevo |
| Jitsi ne se charge | CORS issue | Ajouter domain à CORS whitelist |

---

## 📋 Checklist finale de déploiement

- [ ] **GitHub repo créé et code pushé**
- [ ] **Vercel frontend déployé**
  - URL: `https://...vercel.app`
  - Build réussi
  
- [ ] **Railway backend déployé**
  - URL: `https://...railway.app`
  - GET `/health` OK
  
- [ ] **Railway MySQL configurée**
  - Connexion fonctionnelle
  - `setup_complete.sql` importé
  - `seed_fix.sql` importé
  - Migration téléconsultation exécutée
  
- [ ] **Variables d'environnement définies**
  - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
  - JWT_SECRET
  - FRONTEND_URL
  - SMTP_* pour Brevo
  
- [ ] **Frontend pointe vers le backend prod**
  - API_BASE = Railway URL
  - Vercel redéployé
  
- [ ] **Jitsi.org fonctionne**
  - Room IDs générés automatiquement
  - Liens créés en DB
  
- [ ] **Brevo emails configuré**
  - Test email envoyé
  - Reçu correctement
  
- [ ] **Tests de bout en bout**
  - Login OK
  - Dashboard charges données
  - Filtres activités OK
  - Téléconsultation OK
  - Emails OK

---

## 🎯 Résultat final

✅ **Application complète en ligne:**

| Accès | URL | Status |
|-------|-----|--------|
| **Frontend** | https://aidaa-xyz.vercel.app | ✅ En ligne 24/7 |
| **Backend API** | https://...railway.app | ✅ En ligne 24/7 |
| **Base de données** | Railway MySQL | ✅ En ligne 24/7 |
| **Jitsi vidéo** | meet.jitsi.si/room_* | ✅ Gratuit illimité |
| **Emails** | Brevo SMTP | ✅ 300/jour |

**L'application est maintenant accessible de n'importe où dans le monde !**

---

## 💡 Prochaines étapes (v2.0)

1. **Augmenter les limits:**
   - Railway → Plan payant ($10/mois)
   - Brevo → Plan payant ($15/mois) pour 100k emails
   - PlanetScale MySQL (réplication, backups)

2. **Améliorer les perfs:**
   - Ajouter Redis pour la cache (Railway)
   - Optimiser les requêtes SQL
   - CDN images (Cloudinary)

3. **Monitoring en production:**
   - Sentry pour les erreurs
   - DataDog pour les logs
   - New Relic pour les perfs

4. **Jitsi custom:**
   - Auto-héberger Jitsi (si ≥ 100 users)
   - Configuration personnalisée
   - Meilleur contrôle

---

**Prochaines étapes :** Cliquer "Deploy" sur Railway et attendre 5-10 minutes ! 🚀

