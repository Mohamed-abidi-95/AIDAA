# 📘 AIDAA Project - Comprehensive Understanding Guide

**Last Updated:** April 4, 2026  
**Project Phase:** Authentication System & Core Infrastructure (60% Complete)  
**Target Audience:** Development Team

---

## 🎯 Executive Summary

**AIDAA** est une plateforme web full-stack pour la gestion éducative et le suivi des progrès des enfants. Le projet est structuré avec une **architecture moderne** (Node.js/React), une **sécurité robuste** (JWT + bcrypt), et une **base de données relationnelle** bien organisée.

**État Actuel:**
- ✅ Backend Express server fonctionnel (Port 5000)
- ✅ Frontend React/Vite configuré (Port 5173)
- ✅ MySQL database créée avec schéma complet
- ✅ Système d'authentification JWT implémenté
- ✅ API endpoints validés et testés
- ⚠️ Tableaux de bord (dashboards) en cours de développement

---

## 🏗️ Architecture Globale

### Vue d'ensemble
```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (BROWSER)                        │
│  React 18 + TypeScript + Vite (Port 5173)                  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
                         │ JSON REST API
                         │
┌────────────────────────┴────────────────────────────────────┐
│               EXPRESS SERVER (Port 5000)                    │
│  Node.js + Express + JWT + bcryptjs                        │
└────────────────────────┬────────────────────────────────────┘
                         │ MySQL Connection
                         │ (localhost:3306)
                         │
┌────────────────────────┴────────────────────────────────────┐
│               MYSQL DATABASE                                │
│  aidaa_db (6 tables)                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Base de Données

### Schema Relationnel (6 Tables Principales)

#### 1️⃣ **`users`** - Utilisateurs du système
```javascript
{
  id: INT PRIMARY KEY AUTO_INCREMENT,
  name: VARCHAR(100) NOT NULL,
  email: VARCHAR(150) NOT NULL UNIQUE,
  password: VARCHAR(255) DEFAULT NULL,  // bcrypt hash or NULL for first-time setup
  role: ENUM('admin', 'parent', 'professional') NOT NULL,
  is_active: TINYINT(1) DEFAULT 1,
  created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}
```
**Utilisateurs de Test:**
- Admin: `admin@aidaa.com` / `admin123` ✅
- Parent: `sarah.johnson@example.com` (setup requis)
- Professional: `emily.brown@aidaa.com` (setup requis)

#### 2️⃣ **`children`** - Profils des enfants (liés aux parents)
```javascript
{
  id: INT PRIMARY KEY AUTO_INCREMENT,
  parent_id: INT NOT NULL (FK → users.id),
  name: VARCHAR(100) NOT NULL,
  age: INT,
  FOREIGN KEY(parent_id) → users(id)
}
```

#### 3️⃣ **`content`** - Contenu éducatif
```javascript
{
  id: INT PRIMARY KEY AUTO_INCREMENT,
  title: VARCHAR(200) NOT NULL,
  type: ENUM('video', 'activity'),
  category: VARCHAR(100),
  age_group: VARCHAR(50),
  level: INT DEFAULT 1,
  url: TEXT,
  description: TEXT,
  created_at: TIMESTAMP
}
```

#### 4️⃣ **`activity_logs`** - Historique des activités
```javascript
{
  id: INT PRIMARY KEY AUTO_INCREMENT,
  child_id: INT NOT NULL (FK → children.id),
  content_id: INT NOT NULL (FK → content.id),
  status: ENUM('started', 'completed'),
  date: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}
```

#### 5️⃣ **`notes`** - Notes des professionnels
```javascript
{
  id: INT PRIMARY KEY AUTO_INCREMENT,
  professional_id: INT NOT NULL (FK → users.id),
  child_id: INT NOT NULL (FK → children.id),
  content: TEXT NOT NULL,
  date: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}
```

#### 6️⃣ **`teleconsultations`** - Consultations en ligne
```javascript
{
  id: INT PRIMARY KEY AUTO_INCREMENT,
  parent_id: INT NOT NULL (FK → users.id),
  professional_id: INT NOT NULL (FK → users.id),
  date_time: DATETIME NOT NULL,
  meeting_link: VARCHAR(500),
  notes: TEXT
}
```

---

## 🔐 Système d'Authentification

### Flux d'Authentification

```
1. User remplit email + password
        ↓
2. Frontend envoie POST /api/auth/login
        ↓
3. Backend valide l'email
        ↓
4. Si password NULL → Retour { mustSetPassword: true, userId }
   Sinon → Vérification bcrypt
        ↓
5. Si succès → Génération JWT token
   JWT.sign({ id, name, email, role }, SECRET, { expiresIn: '7d' })
        ↓
6. Token + User stockés en localStorage
   localStorage.setItem('aidaa_token', token)
   localStorage.setItem('aidaa_user', JSON.stringify(user))
        ↓
7. Redirection selon le rôle
   admin → /admin/dashboard
   parent → /parent/dashboard
   professional → /professional/dashboard
```

### Endpoints d'Authentification

#### POST `/api/auth/login`
```javascript
// Request
{
  "email": "admin@aidaa.com",
  "password": "admin123"
}

// Response (Login succès)
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@aidaa.com",
      "role": "admin"
    }
  }
}

// Response (First-time setup requis)
{
  "success": true,
  "mustSetPassword": true,
  "userId": 2,
  "message": "Password not set. Please set your password first."
}

// Response (Erreur)
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### POST `/api/auth/set-password`
```javascript
// Request
{
  "userId": 2,
  "password": "newPassword123"
}

// Response (Succès)
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 2,
      "name": "Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "role": "parent"
    }
  }
}
```

---

## 🔧 Backend - Structure Détaillée

### 📂 Hiérarchie des fichiers

```
backend/
├── server.js                      # Point d'entrée, démarre Express
├── app.js                         # Configuration Express, middlewares, routes
├── package.json                   # Dépendances: express, mysql2, jwt, bcryptjs
├── .env                           # Variables d'environnement
│
├── config/
│   └── db.js                      # Pool MySQL2 avec fonction query() async
│
├── routes/
│   ├── auth.routes.js             # POST /api/auth/login, /api/auth/set-password
│   ├── user.routes.js             # GET/POST users
│   ├── child.routes.js            # Gestion enfants
│   ├── content.routes.js          # Contenu éducatif
│   ├── activityLog.routes.js      # Logs d'activités
│   ├── note.routes.js             # Notes professionnelles
│   ├── teleconsult.routes.js      # Téléconsultations
│   └── admin.routes.js            # Fonctions administrateur
│
├── controllers/
│   ├── auth.controller.js         # login(), setPassword()
│   ├── user.controller.js         # createUser(), getAllUsers()
│   ├── child.controller.js        # CRUD enfants
│   ├── content.controller.js      # CRUD contenu
│   ├── activityLog.controller.js  # CRUD activity logs
│   ├── note.controller.js         # CRUD notes
│   ├── teleconsult.controller.js  # CRUD consultations
│   └── admin.controller.js        # Fonctions admin
│
├── models/
│   ├── user.model.js              # DB queries: findByEmail, findById, createUser, etc.
│   ├── child.model.js             # DB queries pour children
│   ├── content.model.js           # DB queries pour content
│   ├── activityLog.model.js       # DB queries pour activity_logs
│   ├── note.model.js              # DB queries pour notes
│   └── teleconsult.model.js       # DB queries pour teleconsultations
│
├── middlewares/
│   ├── auth.js                    # JWT verification middleware
│   ├── roleCheck.js               # Role-based authorization
│   └── errorHandler.js            # Global error handling
│
└── setup-db.js                    # Script: Create DB + insert sample data
```

### 🔄 Flux de Requête Backend

```
REQUEST (HTTP)
    ↓
Express Router → routes/*.js (Match endpoint)
    ↓
Middleware: CORS, JSON parsing
    ↓
Route Handler → controller/*.js (Business logic)
    ↓
Middleware: auth.js (JWT verification)
    ↓
Middleware: roleCheck.js (Authorization)
    ↓
Model: model/*.js (Database queries)
    ↓
Query: db.js pool (MySQL execution)
    ↓
Response: JSON (200, 201, 400, 401, 500, etc.)
```

### Principaux Middlewares

#### `auth.js` - JWT Verification
```javascript
// Extrait token de header Authorization: Bearer <token>
// Vérifie signature et expiration
// Attache req.user = { id, name, email, role }
// Si invalide → 401 Unauthorized
```

#### `roleCheck.js` - Role-based Authorization
```javascript
// Middleware factory: roleCheck(['admin', 'professional'])
// Vérifie req.user.role contre allowed roles
// Si non autorisé → 403 Forbidden
```

#### `errorHandler.js` - Global Error Handling
```javascript
// Middleware terminal pour toutes les erreurs non gérées
// Formate les erreurs en réponse JSON
// Logs les erreurs en console
```

---

## 🎨 Frontend - Structure Détaillée

### 📂 Hiérarchie des fichiers

```
frontend/
├── src/
│   ├── App.tsx                    # Main component avec React Router
│   ├── main.tsx                   # Entrée ReactDOM, rendu App
│   ├── index.css                  # Styles globaux
│   ├── vite-env.d.ts              # TypeScript types pour Vite
│   │
│   ├── components/
│   │   ├── ProtectedRoute.tsx     # Route guard (requiert auth)
│   │   └── RoleRoute.tsx          # Route guard par rôle
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx          # Page de connexion
│   │   ├── SetPasswordPage.tsx    # Setup password (first-time)
│   │   ├── ParentDashboard.tsx    # Dashboard parent
│   │   ├── AdminPanel.tsx         # Dashboard admin
│   │   └── ProfessionalPage.tsx   # Dashboard professionnel
│   │
│   ├── services/
│   │   ├── api.ts                 # Axios instance avec interceptors
│   │   └── auth.service.ts        # Auth API calls + localStorage
│   │
│   ├── hooks/
│   │   └── useAuth.ts             # Custom hook: auth state management
│   │
│   ├── context/
│   │   └── (context providers if needed)
│   │
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces/types
│   │
│   └── styles/
│       ├── LoginPage.css
│       ├── SetPasswordPage.css
│       └── Dashboard.css
│
├── index.html                     # HTML entry point
├── package.json                   # Dépendances: react, react-router-dom, axios
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite build configuration
└── README.md                      # Frontend documentation
```

### 🔄 Flux de Requête Frontend

```
USER ACTION (Click, Form Submit)
    ↓
Event Handler (onClick, onSubmit)
    ↓
React State Update (useState)
    ↓
Service Call: auth.service.ts
    ↓
API Request: Axios instance (api.ts)
    ↓
Request Interceptor: Add JWT token
    ↓
HTTP Request → Backend (localhost:5000)
    ↓
Response Interceptor: Handle 401
    ↓
localStorage Update (token, user)
    ↓
State Update: useAuth hook
    ↓
Component Re-render + Navigation
```

### 📄 Pages Principales

#### **LoginPage.tsx**
- Input: email + password
- State: email, password, error, isLoading
- Action: Submit → auth.service.login()
- Flow:
  - Si mustSetPassword → Redirect to /set-password
  - Si succès → Redirect selon rôle
  - Si erreur → Show error message

#### **SetPasswordPage.tsx**
- Input: password (first-time setup)
- State: password, confirmPassword, error, isLoading
- Action: Submit → auth.service.setPassword()
- Flow:
  - Si succès → Redirect à dashboard selon rôle

#### **Dashboards** (ParentDashboard, AdminPanel, ProfessionalPage)
- Affichent le contenu selon le rôle
- Protégés par ProtectedRoute + RoleRoute
- À développer avec données du backend

### 🔑 Type Definitions (types/index.ts)

```typescript
// User types
type UserRole = 'admin' | 'parent' | 'professional';

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

// Activity types
type ActivityStatus = 'started' | 'completed';
type ContentType = 'video' | 'activity';

interface Child {
  id: number;
  parent_id: number;
  name: string;
  age: number;
}

interface Content {
  id: number;
  title: string;
  type: ContentType;
  category: string;
  age_group: string;
  level: number;
  url: string;
  description: string;
}

interface ActivityLog {
  id: number;
  child_id: number;
  content_id: number;
  status: ActivityStatus;
  date: string;
}
```

---

## 🛣️ API Routes Complètes

### Authentication
```
POST   /api/auth/login              Public
POST   /api/auth/set-password       Public
```

### Users (Admin only)
```
GET    /api/users                   Admin
POST   /api/users                   Admin
PUT    /api/users/:id               Admin
DELETE /api/users/:id               Admin
```

### Children (Parent access their children)
```
GET    /api/child                   Auth required
POST   /api/child                   Auth required
GET    /api/child/:id               Auth required
PUT    /api/child/:id               Auth required
DELETE /api/child/:id               Auth required
```

### Content (All authenticated users)
```
GET    /api/content                 Auth required
GET    /api/content/:id             Auth required
POST   /api/content                 Admin only
PUT    /api/content/:id             Admin only
DELETE /api/content/:id             Admin only
```

### Activity Logs (Parents track their children)
```
GET    /api/activity-log            Auth required
POST   /api/activity-log            Auth required
GET    /api/activity-log/:id        Auth required
PUT    /api/activity-log/:id        Auth required
```

### Notes (Professionals)
```
GET    /api/note                    Professional
POST   /api/note                    Professional
GET    /api/note/:id                Professional
PUT    /api/note/:id                Professional
DELETE /api/note/:id                Professional
```

### Teleconsultations
```
GET    /api/teleconsult             Auth required
POST   /api/teleconsult             Auth required
GET    /api/teleconsult/:id         Auth required
PUT    /api/teleconsult/:id         Auth required
```

---

## 🔌 Ports & URLs

| Service | Port | URL | Status |
|---------|------|-----|--------|
| Frontend (Vite) | 5173 | http://localhost:5173 | ✅ Dev Server |
| Backend (Express) | 5000 | http://localhost:5000 | ✅ API Server |
| MySQL | 3306 | localhost:3306 | ✅ Database |
| Health Check | 5000 | http://localhost:5000/health | ✅ Available |

---

## 🚀 Commandes de Développement

### Backend
```bash
cd backend

# Installer dépendances
npm install

# Mode développement (auto-reload avec nodemon)
npm run dev

# Mode production
npm start

# Créer/Re-initialiser la base de données
node setup-db.js

# Corriger les hashs de password (si besoin)
node fix-admin-password.js

# Tester l'API
node test-login.js
```

### Frontend
```bash
cd frontend

# Installer dépendances
npm install

# Mode développement (Vite dev server)
npm run dev

# Build pour production
npm build

# Lancer le preview de production
npm run preview

# Linting
npm run lint
```

---

## 🧪 Test de Connexion

### Via cURL (si disponible)
```bash
# Health check
curl http://localhost:5000/health

# Admin login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aidaa.com",
    "password": "admin123"
  }'
```

### Via Frontend
1. Ouvrir http://localhost:5173
2. Entrer: admin@aidaa.com / admin123
3. Cliquer Login
4. Redirection automatique vers /admin/dashboard

### Via Script Node
```bash
node backend/test-login.js
```

---

## 📋 Checklist Développement

### Phase 1: Infrastructure ✅ (100%)
- [x] Backend Express setup
- [x] Frontend React setup
- [x] MySQL database création
- [x] Environment variables configuration
- [x] CORS configuration

### Phase 2: Authentication ✅ (100%)
- [x] JWT token generation
- [x] bcryptjs password hashing
- [x] Login endpoint
- [x] Set-password endpoint
- [x] Auth middleware
- [x] Auth service (frontend)
- [x] useAuth hook
- [x] ProtectedRoute component
- [x] RoleRoute component

### Phase 3: Frontend Pages ⚠️ (30%)
- [x] LoginPage
- [x] SetPasswordPage
- [ ] ParentDashboard (skeleton only)
- [ ] AdminPanel (skeleton only)
- [ ] ProfessionalPage (skeleton only)

### Phase 4: API Endpoints ⚠️ (50%)
- [x] Auth endpoints
- [ ] User management endpoints
- [ ] Child management endpoints
- [ ] Content endpoints
- [ ] Activity log endpoints
- [ ] Notes endpoints
- [ ] Teleconsultation endpoints

### Phase 5: Data Management 🔄 (0%)
- [ ] Parent view children
- [ ] Admin create/manage users
- [ ] Upload content
- [ ] Track activities
- [ ] Professional notes

### Phase 6: Testing 🔄 (0%)
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

### Phase 7: Deployment 🔄 (0%)
- [ ] Docker configuration
- [ ] Production build
- [ ] Server deployment
- [ ] Database backup

---

## 🔍 Debugging Tips

### Backend Logs
```bash
# Affiche les logs en console
# npm run dev affiche automatiquement les logs Express

# Vérifier la connexion MySQL
node -e "require('./src/config/db').query('SELECT 1')"
```

### Frontend Logs
```javascript
// Ouvrir la console du navigateur (F12)
// Les logs utilisent le pattern [Component Name] pour tracer les opérations
// Exemples:
// [auth.service] Login response: ...
// [Login] Attempting login with email: ...
// [ProtectedRoute] Not authenticated, redirecting to /login
```

### Network Debugging
```bash
# Vérifier les ports en écoute
# Windows PowerShell:
netstat -ano | findstr "5000\|5173"

# Vérifier les processus Node
Get-Process node
```

---

## ⚠️ Problèmes Connus & Solutions

### ❌ "Invalid email or password" (même avec admin credentials)
**Cause:** Hash bcryptjs incompatible (schéma initial utilisait `$2y$`)  
**Solution:** Exécuter `node backend/fix-admin-password.js`

### ❌ CORS error lors du login
**Cause:** Frontend et backend sur ports différents, CORS non configuré  
**Solution:** Vérifier `backend/src/app.js` → `cors({ origin: '*' })`

### ❌ "Cannot connect to database"
**Cause:** MySQL non démarré ou credentials incorrects  
**Solution:** Vérifier `.env` → DB_HOST, DB_USER, DB_PASSWORD

### ❌ Token expired error
**Cause:** JWT token expiré après 7 jours  
**Solution:** Re-login pour obtenir nouveau token

### ❌ "Route not found" 404 error
**Cause:** Endpoint URL incorrecte ou méthode HTTP incorrecte  
**Solution:** Vérifier les routes dans `backend/src/routes/`

---

## 📚 Références & Documentation

### Backend Stack
- **Express.js:** https://expressjs.com
- **MySQL2:** https://github.com/sidorares/node-mysql2
- **JWT:** https://jwt.io
- **bcryptjs:** https://github.com/dcodeIO/bcrypt.js

### Frontend Stack
- **React 18:** https://react.dev
- **React Router v6:** https://reactrouter.com
- **TypeScript:** https://www.typescriptlang.org
- **Vite:** https://vitejs.dev
- **Axios:** https://axios-http.com

### Sécurité
- **JWT Best Practices:** https://tools.ietf.org/html/rfc7519
- **bcryptjs Standards:** https://en.wikipedia.org/wiki/Bcrypt
- **CORS Details:** https://enable-cors.org

---

## 👥 Rôles & Permissions

### Admin
- Créer/modifier/supprimer utilisateurs
- Voir tous les enfants et progrès
- Gérer le contenu éducatif
- Voir tous les logs d'activités

### Parent
- Voir ses propres enfants
- Suivre le progrès de ses enfants
- Communiquer avec les professionnels
- Voir les notes des professionnels

### Professional
- Voir les enfants assignés
- Ajouter/modifier les notes
- Tracker le progrès
- Planifier téléconsultations

---

## 🎓 Prochaines Étapes de Développement

1. **Compléter les dashboards** (ParentDashboard, AdminPanel, ProfessionalPage)
2. **Implémenter les endpoints API** manquants
3. **Ajouter une gestion des fichiers** (uploads de contenu)
4. **Implémenter les notifications** (email, SMS)
5. **Ajouter des tests** (unit, integration, E2E)
6. **Optimiser les performances** (caching, pagination)
7. **Déployer en production** (Docker, CI/CD, Monitoring)

---

**End of Document**  
_For questions or updates, please contact the development team._

