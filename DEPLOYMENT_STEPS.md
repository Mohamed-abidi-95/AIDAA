# 🚀 AIDAA — Étapes de Finalisation et Déploiement

**Date:** 19 avril 2026  
**Statut:** 90% complet  
**Dernière mise à jour:** Session courante

---

## 📋 Résumé des changements apportés

### ✅ Déjà fait dans cette session

| # | Fonctionnalité | Status | Fichiers |
|---|---|---|---|
| 1 | Filtres journal d'activités (parent) | ✅ Complété | `ParentDashboard.tsx` |
| 2 | Filtres journal d'activités (professionnel) | ✅ Complété | `ProfessionalPage.tsx` |
| 3 | Grouper par (parent + professionnel) | ✅ Complété | Les deux dashboards |
| 4 | Accept/Reject invitations (professionnel) | ✅ Complété | `ProfessionalPage.tsx` + Backend |
| 5 | Endpoints API accept/reject | ✅ Complété | `professional.controller.js` |
| 6 | Badge rouge "invitations en attente" | ✅ Complété | `ProfessionalPage.tsx` |
| 7 | Données seed enrichies (badges, logs, tél.) | ✅ Complété | `seed_fix.sql` |
| 8 | Fix erreurs TypeScript | ✅ Complété | Frontend build 0 erreur |
| 9 | Get/Update profile endpoints | ✅ Complété | `auth.controller.js` |

---

## 🎯 Étapes à faire (ordre de priorité)

### **ÉTAPE 1 — Vérifier et lancer le backend**

**Objectif:** S'assurer que le backend démarre sans erreur  
**Durée estimée:** 5 min

```bash
cd backend
npm run dev
# Vérifier que le message "Server running on port 5000" s'affiche
```

**Checklist:**
- [ ] Backend démarre sans erreur
- [ ] `npm run dev` affiche "Server running on port 5000"
- [ ] GET `/health` retourne `{"status": "ok"}`
- [ ] Les routes `/api/auth/me`, `/api/professional/invitation/:parentId/accept` etc. ne retournent pas 404

---

### **ÉTAPE 2 — Importer les données seed**

**Objectif:** Remplir la base de données avec des données de démo  
**Durée estimée:** 5 min

#### Option A: Via phpMyAdmin
1. Ouvrir phpMyAdmin → `aidaa_db`
2. Onglet "Importer"
3. Sélectionner le fichier `setup_complete.sql`
4. Cliquer "Exécuter"
5. **Ensuite**, sélectionner le fichier `seed_fix.sql`
6. Cliquer "Exécuter"

#### Option B: Via terminal (MySQL CLI)
```bash
cd C:\Users\MohamedAbidi\PhpstormProjects\AIDAA
mysql -u root aidaa_db < setup_complete.sql
mysql -u root aidaa_db < seed_fix.sql
```

**Checklist:**
- [ ] `setup_complete.sql` exécuté (40 utilisateurs, 35 enfants)
- [ ] `seed_fix.sql` exécuté (badges, activités enrichies, téléconsultations)
- [ ] Requête SQL : `SELECT COUNT(*) FROM child_badges;` retourne ~100+
- [ ] Requête SQL : `SELECT COUNT(*) FROM teleconsultations;` retourne 34

---

### **ÉTAPE 3 — Tester les filtres et groupBy (Frontend)**

**Objectif:** Vérifier que les filtres fonctionnent correctement  
**Durée estimée:** 10 min

```bash
cd frontend
npm run dev
# http://localhost:5173
```

#### Test Parent Dashboard
1. Aller sur `/parent-dashboard` (connecté en parent)
2. Cliquer sur "Activités"
3. Vérifier barre de filtres :
   - [ ] Recherche par nom d'activité
   - [ ] Filtres score min/max
   - [ ] Filtres date from/to
   - [ ] **Grouper par :** aucun / par activité / par date / par score
   - [ ] Bouton "Réinitialiser" réinitialise tous les filtres

#### Test Professional Dashboard
1. Aller sur `/professionnel` (connecté en professionnel)
2. Cliquer sur "Activités"
3. Vérifier les mêmes filtres (thème orange)
4. Vérifier que les filtres sont identiques au parent dashboard

---

### **ÉTAPE 4 — Tester accept/reject invitations (Professionnel)**

**Objectif:** Vérifier le workflow invitation  
**Durée estimée:** 10 min

#### Test 1: Invitations en attente
1. Connecter un professionnel → aller sur "Invitations"
2. Vérifier qu'il y a une section "Invitations en attente de votre réponse"
3. Cliquer sur **"Accepter"**
   - [ ] L'invitation passe en "Familles actives"
   - [ ] Un toast toast vert "Invitation acceptée ✓" s'affiche
4. Cliquer sur **"Refuser"** sur une autre invitation
   - [ ] L'invitation disparaît
   - [ ] Toast "Invitation refusée." s'affiche

#### Test 2: Vérifier que les patients apparaissent après acceptation
1. Après avoir accepté une invitation
2. Aller sur "Mes patients"
3. [ ] Les enfants du parent inviteur apparaissent dans la liste

#### Test 3: Badge rouge sur "Invitations"
1. Vérifier qu'un badge rouge avec le nombre d'invitations en attente s'affiche sur la nav
2. Accepter toutes les invitations
3. [ ] Le badge disparaît quand il n'y a plus d'invitations en attente

---

### **ÉTAPE 5 — Tester l'endpoint profile (GET/PUT)**

**Objectif:** Vérifier que le profil utilisateur peut être consulté et modifié  
**Durée estimée:** 10 min

#### Test 1: GET `/api/auth/me`
```bash
curl -H "Authorization: Bearer <token_jwt>" http://localhost:5000/api/auth/me
# Doit retourner { success: true, data: { id, name, email, role, specialite, ... } }
```

#### Test 2: Frontend - Page profil
1. Cliquer sur "Mon profil" (en bas du sidebar parent/pro/admin)
2. [ ] La page se charge
3. [ ] Les champs (name, email, specialite pour pro) sont remplis
4. [ ] Modifier le nom → cliquer "Enregistrer"
5. [ ] Toast vert "Profil mis à jour." s'affiche
6. [ ] Actualiser la page → le nom reste modifié

#### Test 3: Changement de mot de passe
1. Sur la page profil
2. Cliquer "Changer mon mot de passe" (toggle)
3. [ ] Les champs "mot de passe actuel", "nouveau mot de passe" apparaissent
4. Entrer les infos → cliquer "Enregistrer"
5. [ ] Se déconnecter et se reconnecter avec le nouveau mot de passe
6. [ ] Ça fonctionne ✅

---

### **ÉTAPE 6 — Audit Téléconsultation**

**Objectif:** Documenter l'état actuel et les améliorations futures  
**Durée estimée:** 5 min

**État actuel:**
- [ ] La table `teleconsultations` existe avec 34 entrées de démo
- [ ] Les routes CRUD existent : GET/POST/PUT/DELETE
- [ ] Les pages `TeleconsultationList.tsx`, `Schedule.tsx`, `Room.tsx` existent

**Problèmes identifiés:**
1. ⚠️ Pas de statut (passé/futur/annulé) → toutes les séances s'affichent ensemble
2. ⚠️ Les liens Jitsi sont hardcodés → il faudrait générer des liens uniques
3. ⚠️ Pas de notifications email
4. ⚠️ Pas de rappels automatiques avant la séance

**Solutions proposées (pour la v2.0):**
```sql
-- Ajouter une colonne status
ALTER TABLE teleconsultations ADD COLUMN status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled';

-- Ajouter une colonne pour l'UUID unique
ALTER TABLE teleconsultations ADD COLUMN room_id VARCHAR(100) UNIQUE;
```

---

### **ÉTAPE 7 — Déploiement sur GitHub + Railway (Free Tier)**

**Objectif:** Mettre l'application en ligne sans frais  
**Durée estimée:** 30 min

#### 7.1 — Pousser le code sur GitHub

```bash
# Si pas encore fait
cd C:\Users\MohamedAbidi\PhpstormProjects\AIDAA
git init
git add .
git commit -m "AIDAA v1.0 - Full stack app for autism support"
git remote add origin https://github.com/TON_USERNAME/AIDAA.git
git branch -M main
git push -u origin main
```

**Checklist:**
- [ ] Créer un compte GitHub (gratuit)
- [ ] Créer un nouveau repo "AIDAA" (public)
- [ ] Code pushé avec succès

#### 7.2 — Déployer le Frontend sur Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. "New Project" → sélectionner le repo AIDAA
4. **Framework:** Vite
5. **Root directory:** `frontend`
6. **Build command:** `npm run build`
7. **Output directory:** `dist`
8. Cliquer "Deploy"

**Checklist:**
- [ ] Frontend déployé sur Vercel
- [ ] URL : `https://aidaa-xyz.vercel.app`
- [ ] Peut accéder à la page de login

#### 7.3 — Déployer le Backend sur Railway

1. Aller sur [railway.app](https://railway.app)
2. Sign in with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Sélectionner le repo AIDAA
5. Ajouter une MySQL Database :
   - [ ] Railway Dashboard → "Create" → "Database" → "MySQL"
   - Attendre 2-3 min que la DB soit prête

6. Configurer les variables d'environnement :
```
DB_HOST=containers-us-west-xxx.railway.app (depuis Railway MySQL)
DB_USER=root
DB_PASSWORD=<generated> (copier depuis Railway)
DB_NAME=aidaa_db
JWT_SECRET=aidaa_secret_key_prod_change_me
FRONTEND_URL=https://aidaa-xyz.vercel.app
PORT=3000 (Railway assigné automatiquement)
NODE_ENV=production
```

7. Déployer : cliquer le bouton "Deploy"

**Checklist:**
- [ ] Backend deployer sur Railway
- [ ] URL : `https://railway.app/project/xxx`
- [ ] GET `/health` retourne `{"status": "ok"}`

#### 7.4 — Importer la base de données

```bash
# Via Railway CLI ou terminal SSH
mysql -h <HOST_FROM_RAILWAY> -u root -p<PASSWORD> aidaa_db < setup_complete.sql
mysql -h <HOST_FROM_RAILWAY> -u root -p<PASSWORD> aidaa_db < seed_fix.sql
```

**Checklist:**
- [ ] `setup_complete.sql` importé
- [ ] `seed_fix.sql` importé
- [ ] Requête : `SELECT COUNT(*) FROM users;` → 40

#### 7.5 — Mettre à jour le Frontend pour pointer vers le backend prod

```typescript
// frontend/src/lib/api.ts
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://aidaa-backend-prod.railway.app/api'
  : 'http://localhost:5000/api';
```

Push vers GitHub → Vercel redéploie automatiquement

**Checklist:**
- [ ] Frontend mis à jour
- [ ] Vercel redéployé
- [ ] Pouvoir se connecter depuis Vercel vers Railway backend

---

## 🧪 Tests d'intégration (après déploiement)

### Test 1: Login flow
- [ ] Aller sur l'app Vercel
- [ ] Se connecter avec `parent@aidaa.com` / `parent123`
- [ ] Accéder au dashboard
- [ ] Les données chargent depuis la DB Railway

### Test 2: Filtres sur le cloud
- [ ] Dashboard → Activités → utiliser les filtres
- [ ] Vérifier que le "Grouper par" fonctionne

### Test 3: Accept/Reject invitations en prod
- [ ] Se connecter en professionnel
- [ ] Onglet Invitations → Accepter une invitation
- [ ] Vérifier que ça marche en prod

---

## 📚 Documentation finale à créer

| Document | Contenu | Audience |
|---|---|---|
| `README.md` | Installation locale, lancer le projet | Développeurs |
| `DEPLOYMENT_GUIDE.md` (existe) | Instructions complètes déploiement | DevOps / IT |
| `TEST_ACCOUNTS.md` (existe) | Tous les comptes de test (40 utilisateurs) | Testeurs |
| `API_DOCUMENTATION.md` | Endpoints, formats JSON, auth | Développeurs backend |
| `ARCHITECTURE.md` | Vue d'ensemble tech stack | Tech leads |

---

## ✅ Checklist finale

- [ ] **Backend** démarrage : `npm run dev` OK
- [ ] **Frontend** build : `tsc && vite build` 0 erreur
- [ ] **Filtres** journal d'activités testés (parent + pro)
- [ ] **Grouper par** fonctionne (4 options)
- [ ] **Accept/Reject invitations** fonctionne
- [ ] **Profile page** (GET/PUT) fonctionne
- [ ] **Données seed** importées (40 users, 35 children, 100+ badges)
- [ ] **GitHub** repo créé et code pushé
- [ ] **Vercel** frontend déployé
- [ ] **Railway** backend + DB déployés
- [ ] **Tests prod** de bout en bout réussis

---

## 🚀 Prochain sprint (v1.1)

### High Priority
- [ ] Ajouter statut à `teleconsultations` (scheduled/completed/cancelled)
- [ ] Notifications email pour les invitations acceptées/refusées
- [ ] Room ID unique pour chaque téléconsultation (au lieu de hardcoder)

### Medium Priority
- [ ] Système de rappels automatiques (cron) avant les consultations
- [ ] Export analytics en PDF pour les parents
- [ ] Graphiques de progression temporelle

### Low Priority
- [ ] Intégration vraie Jitsi (au lieu de jitsi.org public)
- [ ] Système de paiement (pour professionnels)
- [ ] App mobile (React Native)

---

## 📞 Contacts / Ressources

| Plateforme | Lien |
|---|---|
| **Railway** | https://railway.app (0€ avec Student Pack) |
| **Vercel** | https://vercel.app (0€ illimité) |
| **GitHub** | https://github.com (0€) |
| **Jitsi Meet** | https://jitsi.org (0€, open-source) |

---

**Dernière mise à jour:** 19 avril 2026  
**Responsable:** Assistant IA  
**Status:** À jour ✅

