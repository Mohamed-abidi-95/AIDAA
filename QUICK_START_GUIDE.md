# 🎯 AIDAA — Guide de démarrage rapide

**Dernière mise à jour:** 9 avril 2026  
**Statut du projet:** 88% complet  
**Version:** 0.9.0-beta

---

## ⚡ Démarrer en 3 commandes

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev

# Navigateur : http://localhost:5173
```

---

## 🌐 URLs importantes

| Service | URL |
|---------|-----|
| Application | http://localhost:5173 |
| API Backend | http://localhost:5000 |
| Santé API | http://localhost:5000/health |
| Admin Panel | http://localhost:5173/admin/dashboard |
| Parent Dashboard | http://localhost:5173/parent/dashboard |
| Choix de rôle | http://localhost:5173/role-selection |
| Sélection enfant | http://localhost:5173/child-selection |
| Mot de passe oublié | http://localhost:5173/forgot-password |

---

## 🔐 Comptes de test

```
ADMIN
  Email:    admin@aidaa.com
  Password: admin123
  Accès:    /admin/dashboard

PARENT
  Email:    parent@aidaa.com
  Password: parent123
  Accès:    /role-selection → /parent/dashboard ou /child

PROFESSIONNEL
  Email:    professional@aidaa.com
  Password: professional123
  Accès:    /professional/dashboard
```

---

## 🛠️ Setup initial (première fois)

```bash
# 1. Installer les dépendances
cd backend && npm install
cd ../frontend && npm install

# 2. Créer backend/.env (copier depuis backend/.env.example)
# Remplir : DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET

# 3. Initialiser la base de données
cd backend
node setup-db.js

# 4. Démarrer les serveurs
npm run dev            # backend (terminal 1)
cd ../frontend && npm run dev  # frontend (terminal 2)
```

---

## 🗄️ Configuration base de données

```env
# backend/.env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=aidaa_db
JWT_SECRET=votre_secret_jwt_ici

# Email (laisser vide → mode Ethereal automatique)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

FRONTEND_URL=http://localhost:5173
```

> 💡 Si `SMTP_USER` et `SMTP_PASS` sont vides, le système utilise automatiquement **Ethereal** pour les emails de test. L'URL de prévisualisation est retournée dans la réponse API.

---

## 🖥️ Pages de l'application

### Authentification
| Route | Description | Accès |
|-------|-------------|-------|
| `/login` | Connexion | Public |
| `/forgot-password` | Demande reset MDP | Public |
| `/reset-password?token=...` | Nouveau mot de passe | Public (lien email) |
| `/set-password` | Premier setup parent | Public (lien admin) |

### Espaces utilisateurs
| Route | Description | Rôle requis |
|-------|-------------|-------------|
| `/admin/dashboard` | Gestion complète | Admin |
| `/role-selection` | Choix Parent / Enfant | Parent |
| `/child-selection` | Sélection de l'enfant | Parent |
| `/parent/dashboard` | Suivi enfant + notes | Parent |
| `/professional/dashboard` | Patients + notes | Professional |
| `/child` | Espace enfant | Parent |

---

## 🎨 Design System

Toutes les pages partagent le même thème vert pharmacie :

```css
--green:       #00A651   /* Vert principal */
--green-dark:  #007A3A   /* Vert foncé */
--green-deep:  #00572A   /* Vert très foncé */
--green-light: #E6F7EE   /* Fond vert clair */
--sidebar-bg:  #013D1C   /* Fond sidebar */
Font: Inter (Google Fonts)
```

### Préfixes CSS par page
| Page | Préfixe |
|------|---------|
| AdminPanel | `adm-` |
| ParentDashboard | `pd-` |
| RoleSelection | `rs-` |
| ChildSelection | `cs-` |

---

## 🔌 API — Points d'entrée principaux

```bash
# Test de santé
GET http://localhost:5000/health

# Connexion
POST http://localhost:5000/api/auth/login
Body: { "email": "admin@aidaa.com", "password": "admin123" }

# Liste du contenu (authentifié)
GET http://localhost:5000/api/content
Header: Authorization: Bearer <token>

# Créer un utilisateur (admin uniquement)
POST http://localhost:5000/api/users
Header: Authorization: Bearer <token_admin>
Body: { "name": "...", "email": "...", "password": "...", "role": "parent" }
```

---

## 🐛 Problèmes courants

### "Invalid email or password"
```bash
node backend/fix-admin-password.js
```

### Port 5000 occupé
```powershell
Get-Process node | Stop-Process -Force
```

### BDD vide ou manquante
```bash
cd backend && node setup-db.js
```

### Emails non reçus
> En mode développement, laisser `SMTP_USER` et `SMTP_PASS` vides dans `.env`.
> L'URL Ethereal est renvoyée directement dans la réponse de l'API.

### Erreurs TypeScript PhpStorm
> Redémarrer le service TypeScript : `Ctrl+Shift+A` → "Restart TypeScript Service"

---

## 📁 Fichiers clés à connaître

```
backend/src/
  app.js                    ← Configuration Express
  config/db.js              ← Connexion MySQL
  config/mailer.js          ← Email + Ethereal
  controllers/auth.controller.js   ← Login, signup, reset MDP
  models/user.model.js      ← Modèle utilisateur (avec reset token)

frontend/src/
  App.tsx                   ← Racine de l'application
  routes/routes-config.tsx  ← Toutes les routes
  types/index.ts            ← Interfaces TypeScript
  features/auth/hooks/useAuth.ts   ← Hook d'authentification
  pages/AdminPanel.tsx      ← Interface admin complète
  pages/ParentDashboard.tsx ← Tableau de bord parent
  styles/AdminPanel.css     ← CSS admin (adm-*)
  styles/ParentDashboard.css ← CSS parent (pd-*)
```

---

## ✅ Checklist de vérification

- [ ] MySQL en cours d'exécution sur le port 3306
- [ ] `backend/.env` configuré avec les bonnes credentials DB
- [ ] `node backend/setup-db.js` exécuté au moins une fois
- [ ] Backend démarré : `http://localhost:5000/health` répond `{"status":"OK"}`
- [ ] Frontend démarré : `http://localhost:5173` charge la page de connexion
- [ ] Connexion admin fonctionne : admin@aidaa.com / admin123

---

**Projet:** AIDAA — PFE 2026  
**Dernière mise à jour:** 9 avril 2026
