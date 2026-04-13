# 📡 AIDAA — Documentation Complète des Endpoints Backend

**Version :** MVP · **Date :** Avril 2026
**Base URL :** `http://localhost:5000`
**Auth :** `Bearer <JWT>` (header `Authorization`)

---

## 🗂️ Table des matières

| # | Module | Base Path | Rôles concernés |
|---|--------|-----------|-----------------|
| 1 | [🏥 Health Check](#1-health-check) | `/health` | Public |
| 2 | [🔐 Authentification](#2-authentification) | `/api/auth` | Public |
| 3 | [👤 Utilisateurs](#3-utilisateurs-admin) | `/api/users` | Admin |
| 4 | [👧 Enfants](#4-enfants) | `/api/child` | Parent, Pro, Admin |
| 5 | [📚 Contenu](#5-contenu) | `/api/content` | Public / Admin |
| 6 | [📋 Logs d'activité](#6-logs-dactivité) | `/api/activity-log` | Auth |
| 7 | [📝 Notes cliniques](#7-notes-cliniques) | `/api/note` | Auth / Pro |
| 8 | [💬 Messagerie](#8-messagerie) | `/api/message` | Auth |
| 9 | [🎮 Jeux](#9-jeux) | `/api/games` | Public / Admin |
| 10 | [📹 Téléconsultations](#10-téléconsultations) | `/api/teleconsult` | Auth |
| 11 | [🛡️ Administration](#11-administration) | `/api/admin` | Admin |
| 12 | [👨‍👩‍👧 Parent](#12-parent) | `/api/parent` | Parent |
| 13 | [🩺 Professionnel](#13-professionnel) | `/api/professional` | Pro |
| 14 | [🔵 Séquences guidées](#14-séquences-guidées) | `/api/sequences` | Auth |
| 15 | [🗣️ AAC — Communication](#15-aac--communication-alternative) | `/api/aac` | Auth |
| 16 | [🏅 Gamification](#16-gamification) | `/api/gamification` | Auth |
| 17 | [📊 Analytics](#17-analytics) | `/api/analytics` | Auth |
| 18 | [🤖 Chatbot IA](#18-chatbot-ia) | `/api/chatbot` | Parent |

---

## Légende

| Icône | Signification |
|-------|--------------|
| 🔓 | Public — aucune authentification requise |
| 🔒 | JWT requis |
| 👤 | Rôle `parent` uniquement |
| 🩺 | Rôle `professional` uniquement |
| 🛡️ | Rôle `admin` uniquement |
| 🩺🛡️ | Rôles `professional` ou `admin` |

---

## 1. Health Check

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/health` | 🔓 | Vérifier que le serveur fonctionne |

**Response 200 :**
```json
{ "success": true, "message": "Server is running" }
```

---

## 2. Authentification

**Base :** `/api/auth`

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/auth/login` | 🔓 | Connexion avec email + mot de passe |
| `POST` | `/api/auth/signup` | 🔓 | Inscription d'un parent (auto-signup) |
| `POST` | `/api/auth/signup-professional` | 🔓 | Inscription d'un professionnel |
| `POST` | `/api/auth/set-password` | 🔓 | Définir le mot de passe (premier accès) |
| `POST` | `/api/auth/forgot-password` | 🔓 | Demande de réinitialisation du mot de passe |
| `POST` | `/api/auth/reset-password` | 🔓 | Réinitialiser le mot de passe via token |

### POST `/api/auth/login`
**Body :**
```json
{ "email": "parent@example.com", "password": "motdepasse" }
```
**Response 200 (compte avec mot de passe) :**
```json
{ "success": true, "token": "<jwt>", "user": { "id": 1, "name": "Sara", "email": "...", "role": "parent" } }
```
**Response 200 (premier accès, pas de mot de passe) :**
```json
{ "success": true, "mustSetPassword": true, "userId": 1 }
```

### POST `/api/auth/signup`
**Body :**
```json
{ "name": "Sara Ben Ali", "email": "sara@example.com", "password": "secret123" }
```

### POST `/api/auth/set-password`
**Body :**
```json
{ "userId": 1, "password": "nouveauMotDePasse" }
```

### POST `/api/auth/forgot-password`
**Body :** `{ "email": "sara@example.com" }`

### POST `/api/auth/reset-password`
**Body :** `{ "token": "<reset_token>", "password": "nouveauMDP" }`

---

## 3. Utilisateurs (Admin)

**Base :** `/api/users` · 🛡️ Admin uniquement

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/users` | Lister tous les utilisateurs |
| `POST` | `/api/users` | Créer un utilisateur |
| `PUT` | `/api/users/:id` | Modifier un utilisateur |
| `DELETE` | `/api/users/:id` | Désactiver un utilisateur (soft delete) |

**Query params GET :** `role` (admin/parent/professional) · `is_active` (1/0)

**Body POST/PUT :**
```json
{
  "name": "Sara Ben Ali",
  "email": "sara@example.com",
  "password": "secret123",
  "role": "parent",
  "is_active": 1
}
```

---

## 4. Enfants

**Base :** `/api/child` · 🔒 JWT requis

| Méthode | Endpoint | Rôle | Description |
|---------|----------|------|-------------|
| `GET` | `/api/child/mychildren` | 👤 Parent | Mes enfants |
| `GET` | `/api/child/all` | 🩺🛡️ Pro/Admin | Tous les enfants |
| `GET` | `/api/child/:id` | 🔒 | Détail d'un enfant |
| `POST` | `/api/child` | 👤 Parent | Créer un enfant |
| `PUT` | `/api/child/:id` | 👤 Parent | Modifier un enfant |
| `DELETE` | `/api/child/:id` | 👤 Parent | Supprimer un enfant |

**Body POST/PUT :**
```json
{
  "name": "Mohamed",
  "age": 6,
  "diagnosis": "TSA",
  "participant_category": "enfant",
  "notes": "Informations complémentaires"
}
```
`participant_category` : `"enfant"` | `"jeune"` | `"adulte"`

---

## 5. Contenu

**Base :** `/api/content`

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/api/content` | 🔓 | Lister tous les contenus |
| `GET` | `/api/content/:id` | 🔓 | Détail d'un contenu |
| `POST` | `/api/content/upload` | 🛡️ Admin | Upload d'un fichier (vidéo/audio/image) |
| `POST` | `/api/content` | 🛡️ Admin | Créer un contenu |
| `PUT` | `/api/content/:id` | 🛡️ Admin | Modifier un contenu |
| `DELETE` | `/api/content/:id` | 🛡️ Admin | Supprimer un contenu |

**Query params GET :** `type` · `category` · `age_group` · `level` · `participant_category`

**Body POST (création) :**
```json
{
  "title": "Activité sensorielle",
  "description": "...",
  "type": "activity",
  "category": "Communication",
  "age_group": "3-6",
  "level": 1,
  "url": "https://...",
  "emoji": "🎯",
  "participant_category": "enfant"
}
```

**Upload :** `POST /api/content/upload` — `multipart/form-data`, champ `file`

---

## 6. Logs d'activité

**Base :** `/api/activity-log` · 🔒 JWT requis

| Méthode | Endpoint | Rôle | Description |
|---------|----------|------|-------------|
| `GET` | `/api/activity-log/child/:childId` | 🔒 | Logs d'un enfant |
| `POST` | `/api/activity-log` | 🔒 | Créer un log d'activité |
| `PUT` | `/api/activity-log/:id` | 🔒 | Mettre à jour le statut |
| `DELETE` | `/api/activity-log/:id` | 🛡️ Admin | Supprimer un log |

**Body POST :**
```json
{
  "child_id": 4,
  "content_id": 2,
  "action": "content_accessed",
  "score": 85,
  "duration_seconds": 120
}
```
`action` : `"content_accessed"` | `"game_played"` | `"chatbot_consent"` | `"chatbot_emergency_triggered"` | ...

---

## 7. Notes cliniques

**Base :** `/api/note` · 🔒 JWT requis

| Méthode | Endpoint | Rôle | Description |
|---------|----------|------|-------------|
| `GET` | `/api/note/child/:childId` | 🔒 | Notes d'un enfant |
| `GET` | `/api/note/:id` | 🔒 | Détail d'une note |
| `POST` | `/api/note` | 🩺 Pro | Créer une note clinique |
| `PUT` | `/api/note/:id` | 🩺 Pro | Modifier une note |
| `DELETE` | `/api/note/:id` | 🩺 Pro | Supprimer une note |

**Body POST/PUT :**
```json
{
  "child_id": 4,
  "content": "Séance du 12/04 — bon engagement sur les pictogrammes.",
  "session_date": "2026-04-12"
}
```

---

## 8. Messagerie

**Base :** `/api/message` · 🔒 JWT requis

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/message/unread-count` | Nombre de messages non lus |
| `GET` | `/api/message/child/:childId` | Tous les messages liés à un enfant |
| `GET` | `/api/message/conversation/:childId/:otherUserId` | Conversation entre deux utilisateurs |
| `POST` | `/api/message` | Envoyer un message |
| `PUT` | `/api/message/:id` | Modifier un message (expéditeur seulement) |
| `DELETE` | `/api/message/:id` | Supprimer un message (expéditeur ou admin) |

**Body POST :**
```json
{
  "childId": 4,
  "receiverId": 7,
  "content": "Bonjour, avez-vous eu les résultats de la séance ?"
}
```

---

## 9. Jeux

**Base :** `/api/games`

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/api/games` | 🔓 | Lister tous les jeux |
| `GET` | `/api/games/type/:type` | 🔓 | Jeux par type |
| `GET` | `/api/games/:id` | 🔓 | Détail d'un jeu |
| `POST` | `/api/games` | 🛡️ Admin | Créer un jeu |
| `PUT` | `/api/games/:id` | 🛡️ Admin | Modifier un jeu |
| `DELETE` | `/api/games/:id` | 🛡️ Admin | Supprimer un jeu |

**Body POST/PUT :**
```json
{
  "title": "Jeu des émotions",
  "description": "Associer des expressions faciales aux émotions.",
  "type": "matching",
  "thumbnail_url": "https://...",
  "instructions": "Glisse chaque visage sur la bonne émotion."
}
```

---

## 10. Téléconsultations

**Base :** `/api/teleconsult` · 🔒 JWT requis

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/teleconsult/my` | Mes consultations (selon rôle) |
| `GET` | `/api/teleconsult/:id` | Détail d'une consultation |
| `POST` | `/api/teleconsult` | Planifier une consultation |
| `PUT` | `/api/teleconsult/:id` | Modifier une consultation |
| `DELETE` | `/api/teleconsult/:id` | Annuler une consultation |

**Body POST :**
```json
{
  "professional_id": 7,
  "child_id": 4,
  "scheduled_at": "2026-04-20T10:00:00",
  "duration_minutes": 45,
  "notes": "Première séance de bilan"
}
```

---

## 11. Administration

**Base :** `/api/admin` · 🛡️ Admin uniquement

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/admin/stats` | Statistiques globales du tableau de bord |
| `GET` | `/api/admin/users` | Lister tous les utilisateurs |
| `POST` | `/api/admin/create-parent` | Créer un compte parent |
| `POST` | `/api/admin/create-professional` | Créer un compte professionnel |
| `PUT` | `/api/admin/toggle-active/:id` | Activer / désactiver un utilisateur |
| `GET` | `/api/admin/notification-count` | Nombre de notifications en attente |
| `GET` | `/api/admin/pending-registrations` | Inscriptions en attente d'approbation |
| `POST` | `/api/admin/approve-registration/:id` | Approuver une inscription |
| `POST` | `/api/admin/reject-registration/:id` | Rejeter une inscription |
| `GET` | `/api/admin/relations` | Toutes les liaisons parent ↔ professionnel |
| `DELETE` | `/api/admin/relations/:id` | Supprimer une liaison |
| `GET` | `/api/admin/messages` | Tous les messages de la plateforme |
| `GET` | `/api/admin/notes` | Toutes les notes cliniques |

**Query params GET /users :** `role` · `is_active`

**Body POST create-parent :**
```json
{ "name": "Sara Ben Ali", "email": "sara@example.com" }
```
**Body POST create-professional :**
```json
{ "name": "Dr. Khalil", "email": "khalil@example.com", "specialite": "Orthophonie" }
```

---

## 12. Parent

**Base :** `/api/parent` · 👤 Parent uniquement

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/parent/invite-professional` | Inviter un professionnel par email |
| `GET` | `/api/parent/my-professionals` | Mes professionnels liés |
| `DELETE` | `/api/parent/invitation/:professionalId` | Révoquer une invitation |
| `DELETE` | `/api/parent/invitation/:professionalId/delete` | Supprimer définitivement une liaison |
| `POST` | `/api/parent/resend-invitation/:professionalId` | Renvoyer l'email d'invitation |

**Body POST invite-professional :**
```json
{ "name": "Dr. Khalil Mansouri", "email": "khalil@example.com" }
```

---

## 13. Professionnel

**Base :** `/api/professional` · 🩺 Professionnel uniquement

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/professional/my-parents` | Parents qui ont invité ce professionnel |
| `GET` | `/api/professional/my-children` | Enfants des parents liés |

---

## 14. Séquences guidées

**Base :** `/api/sequences` · 🔒 JWT requis

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/sequences` | Lister toutes les séquences |
| `GET` | `/api/sequences/:id` | Détail d'une séquence avec ses étapes |

**Response GET /:id :**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Routine du matin",
    "emoji": "🌅",
    "duration_minutes": 10,
    "difficulty": "facile",
    "participant_category": "enfant",
    "steps": [
      { "step_number": 1, "title": "Se lever", "emoji": "🛏️", "duration_seconds": 60 },
      { "step_number": 2, "title": "Se laver les dents", "emoji": "🪥", "duration_seconds": 120 }
    ]
  }
}
```

---

## 15. AAC — Communication alternative

**Base :** `/api/aac` · 🔒 JWT requis

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/aac/categories` | Catégories de symboles disponibles |
| `GET` | `/api/aac/symbols` | Symboles AAC (filtrables) |

**Query params GET /symbols :**
- `category` : ex. `Besoins`, `Émotions`, `Actions`
- `participant_category` : `enfant` | `jeune` | `adulte`

**Response GET /symbols :**
```json
{
  "success": true,
  "data": [
    { "id": 1, "label": "Manger", "emoji": "🍽️", "category": "Besoins", "color": "#f59e0b" },
    { "id": 2, "label": "Boire", "emoji": "🥤", "category": "Besoins", "color": "#3b82f6" }
  ]
}
```

---

## 16. Gamification

**Base :** `/api/gamification` · 🔒 JWT requis

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/gamification/:childId/stats` | Statistiques de jeu d'un enfant |
| `GET` | `/api/gamification/:childId/badges` | Badges obtenus par un enfant |
| `POST` | `/api/gamification/:childId/score` | Enregistrer un score |

**Body POST score :**
```json
{ "gameId": 3, "score": 950, "duration_seconds": 180 }
```

**Response GET /stats :**
```json
{
  "success": true,
  "data": {
    "totalSessions": 12,
    "totalScore": 4800,
    "avgScore": 400,
    "topGame": "Jeu des émotions"
  }
}
```

---

## 17. Analytics

**Base :** `/api/analytics` · 🔒 JWT requis

### Analytics enfant

> Accès : **Parent** (ses propres enfants) · **Professionnel** (enfants liés) · **Admin** (tous)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/analytics/child/:childId/overview` | Vue d'ensemble de l'enfant |
| `GET` | `/api/analytics/child/:childId/sessions-timeline` | Historique des sessions dans le temps |
| `GET` | `/api/analytics/child/:childId/activity-breakdown` | Répartition des activités |
| `GET` | `/api/analytics/child/:childId/scores-by-category` | Scores par catégorie |

### Analytics professionnel

> Accès : **Professionnel** (ses propres données) · **Admin** (tous)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/analytics/doctor/:doctorId/overview` | Vue d'ensemble du professionnel |
| `GET` | `/api/analytics/doctor/:doctorId/patients-scores` | Scores de tous ses patients |
| `GET` | `/api/analytics/doctor/:doctorId/patient/:patientId/progression` | Progression d'un patient |
| `GET` | `/api/analytics/doctor/:doctorId/session-frequency` | Fréquence des sessions |
| `GET` | `/api/analytics/doctor/:doctorId/patients-table` | Tableau complet des patients |

---

## 18. Chatbot IA

**Base :** `/api/chatbot` · 👤 Parent uniquement
> Voir documentation complète : [`CHATBOT_API.md`](./CHATBOT_API.md)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/chatbot/consent` | Enregistrer le consentement RGPD |
| `GET` | `/api/chatbot/consent/status` | Vérifier son consentement |
| `POST` | `/api/chatbot/session` | Démarrer une session chatbot |
| `POST` | `/api/chatbot/message` | Envoyer un message (intent IA) |
| `GET` | `/api/chatbot/session/:sessionId/history` | Historique (anonymisé RGPD) |
| `DELETE` | `/api/chatbot/session/:sessionId` | Clôturer une session |
| `GET` | `/api/chatbot/faq/categories` | Liste des catégories FAQ |
| `GET` | `/api/chatbot/recommend/:childId` | Recommandations directes pour un enfant |

**Pipeline d'intent :** `emergency` → `greeting` → `recommendation` → `faq` → `unknown`

**Intents possibles :** `faq` · `emergency` · `recommendation` · `greeting` · `unknown`

---

## 🗄️ Résumé des tables de base de données

| Table | Module | Description |
|-------|--------|-------------|
| `users` | Auth / Admin | Comptes utilisateurs (parent, pro, admin) |
| `children` | Enfants | Profils des enfants |
| `professional_invitations` | Parent / Pro | Liaisons parent ↔ professionnel |
| `content` | Contenu | Ressources pédagogiques |
| `activity_logs` | Logs | Historique des interactions |
| `notes` | Notes | Notes cliniques des professionnels |
| `messages` | Messagerie | Messages parent ↔ professionnel |
| `games` | Jeux | Catalogue de jeux éducatifs |
| `teleconsultations` | Téléconsult | RDV de consultation à distance |
| `guided_sequences` | Séquences | Séquences d'activités guidées |
| `sequence_steps` | Séquences | Étapes des séquences |
| `aac_symbols` | AAC | Symboles de communication alternative |
| `badges` | Gamification | Catalogue de badges |
| `child_badges` | Gamification | Badges obtenus par enfant |
| `chatbot_consent_log` | Chatbot | Audit RGPD consentements |
| `chatbot_sessions` | Chatbot | Sessions chatbot |
| `chatbot_messages` | Chatbot | Messages chatbot (anonymisés) |
| `faq_entries` | Chatbot | Base de connaissances FAQ FR/AR |

---

## 🔐 Récapitulatif des accès par rôle

| Rôle | Modules accessibles |
|------|---------------------|
| **Public** | `GET /content`, `GET /games`, `POST /auth/*` |
| **Parent** 👤 | Enfants (ses enfants), Messagerie, Chatbot IA, Logs, Téléconsult, Séquences, AAC, Gamification, Analytics (ses enfants) |
| **Professionnel** 🩺 | Notes cliniques, Messagerie, Téléconsult, Séquences, AAC, Gamification, Analytics (ses patients) |
| **Admin** 🛡️ | Tout — gestion complète des utilisateurs, contenus, relations |

---

*Généré automatiquement le 13 avril 2026 — AIDAA Backend v1.0 MVP*

