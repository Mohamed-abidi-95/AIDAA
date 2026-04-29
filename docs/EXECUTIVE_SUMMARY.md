# 🚀 AIDAA — Résumé Exécutif

**Date:** 9 avril 2026
**Version:** 0.9.0-beta
**Statut:** 88% complet — UI/UX finalisée, APIs opérationnelles

---

## 🎯 Qu'est-ce qu'AIDAA ?

**AIDAA** (Aide Interactive pour le Développement des enfants Autistes et Atypiques) est une plateforme web complète destinée à :

- 👨‍👩‍👧 **Parents** — Suivre les progrès de leur enfant, lire les notes médicales, accéder à l'espace enfant
- 🩺 **Professionnels** — Gérer les patients, ajouter des notes cliniques, communiquer avec les familles
- 🛡️ **Administrateurs** — Gérer les utilisateurs, importer du contenu éducatif, approuver les inscriptions
- 🧒 **Enfants** — Accéder à des jeux interactifs, vidéos et activités adaptés

---

## 🏗️ Architecture Technique

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  React 18 + TypeScript + Vite                               │
│  Design : Thème vert pharmacie · Inter · CSS Modules        │
│  Auth : JWT (localStorage) + Axios intercepteur             │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST API
┌──────────────────────────▼──────────────────────────────────┐
│                        BACKEND                              │
│  Node.js + Express.js                                       │
│  JWT Auth · bcryptjs · Multer · Nodemailer/Ethereal         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                       DATABASE                              │
│  MySQL 8 · 8 tables · Foreign keys · Indexes                │
│  users · children · content · activity_logs                 │
│  notes · messages · teleconsultations · games               │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Ce qui est fonctionnel aujourd'hui

### 🔐 Authentification complète
| Fonctionnalité | Détail |
|----------------|--------|
| Connexion JWT | Tokens 7 jours, refresh automatique |
| Inscription | Flux d'approbation admin |
| Premier login | Setup mot de passe (parents créés par admin) |
| Mot de passe oublié | Email avec lien sécurisé (Ethereal en démo) |
| Réinitialisation | Token 1h, hash bcrypt, nettoyage automatique |

### 🎨 Interface utilisateur
Toutes les pages partagent un **design system cohérent** : dégradé vert pharmacie, police Inter, composants glassmorphism.

| Page | URL | Description |
|------|-----|-------------|
| Connexion | `/login` | Split-panel avec branding AIDAA |
| Mot de passe oublié | `/forgot-password` | Formulaire email |
| Réinitialisation | `/reset-password` | Nouveau MDP + barre de force |
| Choix de rôle | `/role-selection` | 2 cartes animées Parent / Enfant |
| Sélection enfant | `/child-selection` | Grille avec cartes vertes |
| Tableau de bord admin | `/admin/dashboard` | Sidebar fixe + topbar sticky |
| Tableau de bord parent | `/parent/dashboard` | Sidebar fixe + analytiques Chart.js |

### 🛡️ Espace Administration
- Bibliothèque de contenu (vidéos, audio, activités)
- Import de contenu avec upload de fichier
- Gestion complète des utilisateurs (CRUD + suppression définitive)
- Validation des demandes d'inscription
- Système de toast (remplace les `alert()`)
- Badge de notifications en temps réel (polling 30s)

### 👨‍👩‍👧 Espace Parent
- Sélection et gestion des participants (CRUD inline dans sidebar)
- Vue Résumé : statistiques d'activités
- Vue Analytiques : KPI + graphiques Chart.js + barres de compétences
- Vue Notes médicales : notes des professionnels
- Navigation responsive avec sidebar fixe

---

## 📡 APIs Backend disponibles

```
Auth:
  POST   /api/auth/login
  POST   /api/auth/signup
  POST   /api/auth/set-password
  POST   /api/auth/forgot-password
  POST   /api/auth/reset-password

Utilisateurs (admin):
  GET    /api/users
  POST   /api/users
  PUT    /api/users/:id
  DELETE /api/users/:id

Administration:
  GET    /api/admin/pending-registrations
  POST   /api/admin/approve-registration/:id
  POST   /api/admin/reject-registration/:id

Enfants:
  GET    /api/child/mychildren
  POST   /api/child
  PUT    /api/child/:id
  DELETE /api/child/:id

Contenu:
  GET    /api/content
  POST   /api/content   (multipart/form-data)
  PUT    /api/content/:id
  DELETE /api/content/:id

Activités & Notes:
  GET    /api/activity-log/child/:id
  POST   /api/activity-log
  GET    /api/note/child/:id
  POST   /api/note
```

---

## 🔐 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@aidaa.com | admin123 |
| Parent | parent@aidaa.com | parent123 |
| Professionnel | professional@aidaa.com | professional123 |

---

## 🗺️ Prochaines étapes

1. **ProfessionalPage** — Refonte UI identique à ParentDashboard
2. **ChildDashboard** — Interface enfant (jeux, vidéos, activités)
3. **Messagerie** — Chat parent ↔ professionnel
4. **Tests unitaires** — Jest (backend) + Vitest (frontend)
5. **Déploiement** — Docker + variables d'environnement production

---

## ⚡ Démarrage rapide

```bash
# 1. Backend
cd backend && npm install && npm run dev

# 2. Frontend (nouveau terminal)
cd frontend && npm install && npm run dev

# 3. Ouvrir http://localhost:5173
# Connexion : admin@aidaa.com / admin123
```

---

**Projet:** AIDAA — PFE 2026
**Dernière mise à jour:** 9 avril 2026

