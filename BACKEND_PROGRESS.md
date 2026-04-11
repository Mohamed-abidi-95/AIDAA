# AIDAA — Backend Progress Report
> Generated: 2026-04-11
> Status legend: ✅ Complete | 🔧 Partial | ❌ Not started | 🔒 Auth-protected

---

## 1. Authentication & Sessions

- ✅ `POST /api/auth/login` — Connexion avec email + mot de passe, retourne JWT ou `mustSetPassword:true` — file: `backend/src/controllers/auth.controller.js`
- ✅ `POST /api/auth/set-password` — Définition du mot de passe à la première connexion (compte sans password) — file: `backend/src/controllers/auth.controller.js`
- ✅ `POST /api/auth/signup` — Auto-inscription d'un parent (statut `pending`, en attente de validation admin) — file: `backend/src/controllers/auth.controller.js`
- ✅ `POST /api/auth/signup-professional` — Auto-inscription d'un professionnel (statut `pending`) — file: `backend/src/controllers/auth.controller.js`
- ✅ `POST /api/auth/forgot-password` — Génère un token sécurisé (crypto.randomBytes 32), sauvegarde en DB, envoie email de réinitialisation via Nodemailer — file: `backend/src/controllers/auth.controller.js`
- ✅ `POST /api/auth/reset-password` — Valide le token (expiration vérifiée en DB), hache le nouveau mot de passe, invalide le token — file: `backend/src/controllers/auth.controller.js`
- ✅ **JWT** — Signé avec `process.env.JWT_SECRET`, expiration configurable via `JWT_EXPIRES_IN` (défaut `7d`), payload : `{ id, name, email, role }` — file: `backend/src/middlewares/auth.js`
- ✅ **Password hashing** — bcryptjs, 12 rounds (auth) / 10 rounds (admin) — file: `backend/src/controllers/auth.controller.js`
- ✅ **Reset token** — Stocké dans colonnes `reset_token` + `reset_token_expires` de la table `users`, invalidé après usage — file: `backend/src/models/user.model.js`

---

## 2. User Management

### Rôle Admin (`/api/users` — 🔒 admin)
- ✅ `POST /api/users` — Créer un utilisateur (tout rôle, avec mot de passe) — file: `backend/src/routes/user.routes.js`, `backend/src/controllers/user.controller.js`
- ✅ `GET /api/users` — Lister tous les utilisateurs (filtre optionnel : `role`, `is_active`) — file: `backend/src/controllers/user.controller.js`
- ✅ `PUT /api/users/:id` — Mettre à jour les informations d'un utilisateur — file: `backend/src/controllers/user.controller.js`
- ✅ `DELETE /api/users/:id` — Supprimer définitivement un utilisateur (hard delete) — file: `backend/src/controllers/user.controller.js`

### Routes Admin spécialisées (`/api/admin` — 🔒 admin)
- ✅ `GET /api/admin/stats` — Statistiques agrégées (total users, parents, professionnels, actifs) — file: `backend/src/controllers/admin.controller.js`
- ✅ `GET /api/admin/users` — Lister les utilisateurs avec filtres — file: `backend/src/controllers/admin.controller.js`
- ✅ `POST /api/admin/create-parent` — Créer un parent (password NULL, configuration ultérieure) — file: `backend/src/controllers/admin.controller.js`
- ✅ `POST /api/admin/create-professional` — Créer un professionnel avec mot de passe immédiat — file: `backend/src/controllers/admin.controller.js`
- ✅ `PUT /api/admin/toggle-active/:id` — Activer/désactiver un compte utilisateur — file: `backend/src/controllers/admin.controller.js`
- ✅ `GET /api/admin/pending-registrations` — Lister les inscriptions en attente de validation — file: `backend/src/controllers/admin.controller.js`
- ✅ `POST /api/admin/approve-registration/:id` — Approuver une inscription (`status='approved'`, `is_active=1`) — file: `backend/src/controllers/admin.controller.js`
- ✅ `POST /api/admin/reject-registration/:id` — Rejeter une inscription (`status='rejected'`, `is_active=0`) — file: `backend/src/controllers/admin.controller.js`
- ✅ `GET /api/admin/notification-count` — Nombre d'inscriptions en attente (`COUNT(*) WHERE status='pending'`) — file: `backend/src/controllers/admin.controller.js`

### Modèle User
- Table `users` — champs : `id`, `name`, `email`, `password` (bcrypt hash ou NULL), `role` (ENUM: admin/parent/professional), `is_active` (TINYINT), `status` (pending/approved/rejected), `reset_token`, `reset_token_expires`, `created_at`
- file: `backend/src/models/user.model.js`

---

## 3. Participant Management

### Enfants / Participants (`/api/child` — 🔒 auth)
- ✅ `GET /api/child/mychildren` — Enfants du parent connecté — 🔒 parent — file: `backend/src/routes/child.routes.js`, `backend/src/controllers/child.controller.js`
- ✅ `GET /api/child/all` — Tous les enfants (accès professionnel/admin) — 🔒 professional|admin — file: `backend/src/controllers/child.controller.js`
- ✅ `GET /api/child/:id` — Récupérer un enfant par ID — 🔒 auth — file: `backend/src/controllers/child.controller.js`
- ✅ `POST /api/child` — Créer un profil enfant (champs : `name`, `age`, `participantCategory`) — 🔒 parent — file: `backend/src/controllers/child.controller.js`
- ✅ `PUT /api/child/:id` — Modifier un profil enfant — 🔒 parent — file: `backend/src/controllers/child.controller.js`
- ✅ `DELETE /api/child/:id` — Supprimer un profil enfant — 🔒 parent — file: `backend/src/controllers/child.controller.js`

### Professionnel → ses parents et enfants (`/api/professional` — 🔒 professional)
- ✅ `GET /api/professional/my-parents` — Parents ayant invité ce professionnel (status ≠ revoked), avec `child_count` — file: `backend/src/controllers/professional.controller.js`
- ✅ `GET /api/professional/my-children` — Enfants des parents inviteurs — file: `backend/src/controllers/professional.controller.js`

### Modèle Child
- Table `children` — champs : `id`, `parent_id` (FK users), `name`, `age`, `participant_category` (ENUM: enfant/jeune/adulte), `created_at`
- file: `backend/src/models/child.model.js`

---

## 4. Activities & Sessions

### Journal d'activité (`/api/activity-log` — 🔒 auth)
- ✅ `GET /api/activity-log/child/:childId` — Logs d'activité d'un enfant (JOIN sur `content`) — file: `backend/src/routes/activityLog.routes.js`, `backend/src/controllers/activityLog.controller.js`
- ✅ `POST /api/activity-log` — Créer un log (champs : `childId`, `contentId`, `score`, `duration_seconds`, `action`) — file: `backend/src/controllers/activityLog.controller.js`
- ✅ `PUT /api/activity-log/:id` — Mettre à jour le statut d'un log (`started`→`completed`) — file: `backend/src/controllers/activityLog.controller.js`
- ✅ `DELETE /api/activity-log/:id` — Supprimer un log — 🔒 admin — file: `backend/src/controllers/activityLog.controller.js`

### Jeux (`/api/games` — public GET, 🔒 admin pour CUD)
- ✅ `GET /api/games` — Lister tous les jeux — file: `backend/src/routes/game.routes.js`, `backend/src/controllers/game.controller.js`
- ✅ `GET /api/games/type/:type` — Jeux par type — file: `backend/src/controllers/game.controller.js`
- ✅ `GET /api/games/:id` — Jeu par ID — file: `backend/src/controllers/game.controller.js`
- ✅ `POST /api/games` — Créer un jeu — 🔒 admin — file: `backend/src/controllers/game.controller.js`
- ✅ `PUT /api/games/:id` — Modifier un jeu — 🔒 admin — file: `backend/src/controllers/game.controller.js`
- ✅ `DELETE /api/games/:id` — Supprimer un jeu — 🔒 admin — file: `backend/src/controllers/game.controller.js`

### Gamification (`/api/gamification` — 🔒 auth)
- ✅ `GET /api/gamification/:childId/stats` — Points totaux + badges de l'enfant — file: `backend/src/routes/gamification.routes.js`, `backend/src/controllers/gamification.controller.js`
- ✅ `GET /api/gamification/:childId/badges` — Badges gagnés — file: `backend/src/controllers/gamification.controller.js`
- ✅ `POST /api/gamification/:childId/score` — Enregistrer un score de jeu + auto-attribution de badges — file: `backend/src/controllers/gamification.controller.js`

### Séquences guidées — Module B (`/api/sequences` — 🔒 auth)
- ✅ `GET /api/sequences` — Toutes les séquences (filtre optionnel `?category=`) — file: `backend/src/routes/sequence.routes.js`, `backend/src/controllers/sequence.controller.js`
- ✅ `GET /api/sequences/:id` — Séquence avec ses étapes — file: `backend/src/controllers/sequence.controller.js`

### Modèles
- Table `activity_logs` — `id`, `child_id`, `content_id`, `score`, `duration_seconds`, `action`, `status`, `date`
- Table `games` — `id`, `title`, `description`, `type`, `thumbnail_url`, `instructions`, `created_at`
- Table `guided_sequences` — `id`, `title`, `description`, `emoji`, `duration_minutes`, `difficulty`, `participant_category`, `created_at`
- Table `sequence_steps` — `id`, `sequence_id`, `step_number`, `title`, `description`, `emoji`, `duration_seconds`
- Table `badges` — `id`, `name`, `emoji`, `color`, `condition_type`, `condition_value`
- Table `child_badges` — `child_id`, `badge_id`, `earned_at`

---

## 5. Medical Notes / Notes Cliniques

### Notes (`/api/note` — 🔒 auth)
- ✅ `GET /api/note/child/:childId` — Notes pour un enfant (JOIN sur `users` pour le nom du professionnel) — file: `backend/src/routes/note.routes.js`, `backend/src/controllers/note.controller.js`
- ✅ `GET /api/note/:id` — Note par ID — file: `backend/src/controllers/note.controller.js`
- ✅ `POST /api/note` — Créer une note clinique (champs : `childId`, `content`) — 🔒 professional — file: `backend/src/controllers/note.controller.js`
- ✅ `PUT /api/note/:id` — Modifier le contenu d'une note — 🔒 professional — file: `backend/src/controllers/note.controller.js`
- ✅ `DELETE /api/note/:id` — Supprimer une note — 🔒 professional — file: `backend/src/controllers/note.controller.js`
- ❌ **Pièces jointes** — Aucun support de fichiers attachés aux notes (texte uniquement)

### Modèle Note
- Table `notes` — `id`, `professional_id` (FK users), `child_id` (FK children), `content` (TEXT), `date`
- file: `backend/src/models/note.model.js`

---

## 6. Teleconsultation

### Planification REST (`/api/teleconsult` — 🔒 auth)
- ✅ `GET /api/teleconsult/my` — Consultations de l'utilisateur connecté (parent ou professionnel), avec JOIN users — file: `backend/src/routes/teleconsult.routes.js`, `backend/src/controllers/teleconsult.controller.js`
- ✅ `GET /api/teleconsult/:id` — Consultation par ID avec vérification des permissions — file: `backend/src/controllers/teleconsult.controller.js`
- ✅ `POST /api/teleconsult` — Créer une consultation (champs : `parentId`, `professionalId`, `date_time`, `meeting_link`, `notes`) — file: `backend/src/controllers/teleconsult.controller.js`
- ✅ `PUT /api/teleconsult/:id` — Modifier une consultation — file: `backend/src/controllers/teleconsult.controller.js`
- ✅ `DELETE /api/teleconsult/:id` — Supprimer une consultation — file: `backend/src/controllers/teleconsult.controller.js`
- ❌ **WebRTC / Signaling** — Aucun serveur de signalisation WebRTC (Twilio/Agora/PeerJS/Socket.io) trouvé
- ❌ **Salle de vidéo temps réel** — Le frontend `TeleconsultationRoom.tsx` utilise des données mock (`mockSessions`) et le formulaire `TeleconsultationSchedule.tsx` simule l'appel API (`setTimeout(900ms)`) sans appeler `POST /api/teleconsult`

### Modèle Teleconsultation
- Table `teleconsultations` — `id`, `parent_id`, `professional_id`, `date_time`, `meeting_link`, `notes`, `created_at`
- file: `backend/src/models/teleconsult.model.js`

---

## 7. Messaging / Chat

### Messages REST (`/api/message` — 🔒 auth)
- ✅ `GET /api/message/child/:childId` — Messages liés à un enfant (sender/receiver JOIN) — file: `backend/src/routes/message.routes.js`, `backend/src/controllers/message.controller.js`
- ✅ `GET /api/message/conversation/:childId/:otherUserId` — Conversation entre deux utilisateurs pour un enfant — file: `backend/src/controllers/message.controller.js`
- ✅ `POST /api/message` — Envoyer un message (champs : `childId`, `receiverId`, `content`) — file: `backend/src/controllers/message.controller.js`
- ✅ `PUT /api/message/:id` — Modifier un message (expéditeur seulement) — file: `backend/src/controllers/message.controller.js`
- ✅ `DELETE /api/message/:id` — Supprimer un message — file: `backend/src/controllers/message.controller.js`
- ❌ **Temps réel** — Aucun WebSocket / Socket.io. REST uniquement.
- ❌ **Utilisé par le frontend** — Le `ParentDashboard.tsx` affiche un onglet "Messages" dans le nav mais aucun appel `api.get/post` vers `/api/message` n'est présent dans le code frontend.

### Modèle Message
- Table `messages` — `id`, `child_id`, `sender_id`, `receiver_id`, `content`, `created_at`
- file: `backend/src/models/message.model.js`

---

## 8. Analytics & Reporting

- ✅ `GET /api/admin/stats` — Statistiques globales : total users, parents, professionnels, admins, actifs — 🔒 admin — file: `backend/src/controllers/admin.controller.js`
- ✅ `GET /api/gamification/:childId/stats` — Points totaux + total activités par enfant (agrégation sur `activity_logs`) — 🔒 auth — file: `backend/src/controllers/gamification.controller.js`
- 🔧 **Statistiques d'activité par enfant** — La fonction `activityLogModel.getStats(childId)` existe dans le modèle (total, avg score, total time, last activity) mais n'est exposée via **aucun endpoint REST dédié** — file: `backend/src/models/activityLog.model.js`
- ❌ **Tableau de bord analytique** — Le `ParentDashboard.tsx` affiche des graphiques (Chart.js) avec des données **hard-codées** (`labels`, `data` statiques), pas de données issues d'une API analytics

---

## 9. File Uploads & Media

- ✅ `POST /api/content/upload` — Upload de fichier + création de contenu — 🔒 admin — file: `backend/src/routes/content.routes.js`, `backend/src/controllers/content.controller.js`
- ✅ **Middleware Multer** — Stockage local dans `backend/uploads/`, suffix `timestamp-random`, limite 100 MB — file: `backend/src/middlewares/upload.js`
- ✅ **Types autorisés** — video/mp4, video/webm, audio/mpeg, audio/wav, audio/webm, image/jpeg, image/png, image/gif (+ extensions .mp4 .webm .mp3 .wav .jpg .jpeg .png .gif)
- ✅ **Serving** — Fichiers servis via `app.use('/uploads', express.static(...))` — file: `backend/src/app.js`
- ❌ **Cloud storage** — Pas de S3/Cloudinary. Stockage local uniquement.

### Contenu (`/api/content` — public GET, 🔒 admin CUD)
- ✅ `GET /api/content` — Lister le contenu (filtres : `type`, `category`, `age_group`, `level`, `participant_category`) — file: `backend/src/routes/content.routes.js`, `backend/src/controllers/content.controller.js`
- ✅ `GET /api/content/:id` — Contenu par ID — file: `backend/src/controllers/content.controller.js`
- ✅ `POST /api/content/upload` — Upload + création — 🔒 admin — file: `backend/src/controllers/content.controller.js`
- ✅ `POST /api/content` — Créer du contenu sans upload — 🔒 admin — file: `backend/src/controllers/content.controller.js`
- ✅ `PUT /api/content/:id` — Modifier un contenu (tous les champs avancés) — 🔒 admin — file: `backend/src/controllers/content.controller.js`
- ✅ `DELETE /api/content/:id` — Supprimer un contenu — 🔒 admin — file: `backend/src/controllers/content.controller.js`

### Modèle Content
- Table `content` — `id`, `title`, `type` (video/activity/audio), `category`, `category_color`, `emoji`, `duration`, `steps`, `minutes`, `emoji_color`, `age_group`, `level`, `url`, `description`, `participant_category`, `created_at`
- file: `backend/src/models/content.model.js`

---

## 10. Middleware & Security

- ✅ **Auth middleware** (`auth.js`) — Vérifie le header `Authorization: Bearer <token>`, décode le JWT via `jwt.verify`, attache `req.user = { id, name, email, role }` — file: `backend/src/middlewares/auth.js`
- ✅ **Role Check middleware** (`roleCheck.js`) — Factory `roleCheck(...roles)`, retourne 403 si `req.user.role` n'est pas dans les rôles autorisés — file: `backend/src/middlewares/roleCheck.js`
- ✅ **CORS** — Configuré dans `app.js` : whitelist configurable via `CORS_ORIGIN`, accepte localhost dynamiquement (regex sur ports), `credentials: true`, méthodes GET/POST/PUT/DELETE/OPTIONS — file: `backend/src/app.js`
- ✅ **Global error handler** — Middleware d'erreur Express en dernière position, retourne `{ success: false, message, error }` avec le bon `statusCode` — file: `backend/src/middlewares/errorHandler.js`
- ✅ **Upload middleware** — Multer avec filtrage MIME + extension, limite 100 MB — file: `backend/src/middlewares/upload.js`
- ✅ **JSON parsing** — `express.json()` — file: `backend/src/app.js`
- ❌ **Rate limiting** — Aucun middleware de limitation de débit (express-rate-limit ou équivalent) trouvé
- ❌ **Input validation** — Pas de bibliothèque de validation (Joi, Zod, express-validator). Validations manuelles dans les contrôleurs.
- ❌ **Helmet** — Pas de middleware de sécurité HTTP headers (helmet)

---

## 11. Database

- **ORM/ODM** : Aucun ORM — SQL brut via `mysql2/promise`, pool de connexions (10 connexions max)
- **Database** : MySQL (défaut : `aidaa_db`, port 3306)
- **Connection** : Pool configuré dans `backend/src/config/db.js`, wrapper `query(sql, values)` async

### Schémas / Tables détectés

| Table | Champs clés |
|-------|-------------|
| `users` | id, name, email, password, role, is_active, status, reset_token, reset_token_expires, created_at |
| `children` | id, parent_id, name, age, participant_category, created_at |
| `content` | id, title, type, category, category_color, emoji, duration, steps, minutes, emoji_color, age_group, level, url, description, participant_category, created_at |
| `activity_logs` | id, child_id, content_id, score, duration_seconds, action, status, date |
| `notes` | id, professional_id, child_id, content, date |
| `messages` | id, child_id, sender_id, receiver_id, content, created_at |
| `teleconsultations` | id, parent_id, professional_id, date_time, meeting_link, notes, created_at |
| `games` | id, title, description, type, thumbnail_url, instructions, created_at |
| `guided_sequences` | id, title, description, emoji, duration_minutes, difficulty, participant_category, created_at |
| `sequence_steps` | id, sequence_id, step_number, title, description, emoji, duration_seconds |
| `aac_symbols` | id, label, emoji, category, color, participant_category, sort_order |
| `badges` | id, name, emoji, color, condition_type, condition_value |
| `child_badges` | child_id, badge_id, earned_at |
| `professional_invitations` | id, parent_id, professional_id, status (pending/active/revoked), invited_at |

- **Migrations présentes** : ✅ — Scripts SQL à la racine du projet (`migration_add_child_interface_fields.sql`, `migration_add_participant_category.sql`, `migration_add_specialite.sql`, `migration_modules_bcd.sql`, `migration_professional_invitations.sql`, `database_updates.sql`, `aidaa_schema.sql`)
- **Auto-migration** : ✅ — `autoMigrate()` dans `app.js` crée la table `professional_invitations` si absente au démarrage

---

## 12. External Integrations

- ✅ **Nodemailer** — Intégré pour emails de réinitialisation de mot de passe et d'invitation de professionnel — file: `backend/src/config/mailer.js`
  - Mode **Ethereal** (test) par défaut si `SMTP_USER`/`SMTP_PASS` absents — retourne un `previewUrl` dans la réponse
  - Mode **SMTP réel** (Gmail etc.) si `SMTP_USER` + `SMTP_PASS` définis
  - Templates HTML intégrés (responsive, bilingual FR)
- ❌ **WebRTC** — Aucun service Twilio/Agora/Jitsi/PeerJS/mediasoup détecté
- ❌ **SMS** — Aucune intégration SMS détectée
- ❌ **Paiement** — Aucune intégration de paiement (Stripe, Flouci, etc.)
- ❌ **Socket.io / WebSocket** — Aucune communication temps réel côté backend

---

## 13. Environment & Config

Variables d'environnement référencées dans le code (clés uniquement) :

| Variable | Usage |
|----------|-------|
| `DB_HOST` | Hôte MySQL (défaut: localhost) |
| `DB_PORT` | Port MySQL (défaut: 3306) |
| `DB_USER` | Utilisateur MySQL (défaut: root) |
| `DB_PASSWORD` | Mot de passe MySQL |
| `DB_DATABASE` | Nom de la base (défaut: aidaa_db) |
| `JWT_SECRET` | Clé secrète de signature JWT |
| `JWT_EXPIRES_IN` | Durée de validité du token (défaut: 7d) |
| `PORT` | Port du serveur Express (défaut: 5000) |
| `NODE_ENV` | Environnement (development/production) |
| `CORS_ORIGIN` | Origines CORS autorisées (séparées par virgule, `*` = wildcard) |
| `FRONTEND_URL` | URL du frontend pour les liens d'email (défaut: http://localhost:5173) |
| `SMTP_USER` | Utilisateur SMTP pour Nodemailer |
| `SMTP_PASS` | Mot de passe SMTP |
| `SMTP_HOST` | Hôte SMTP (défaut: smtp.gmail.com) |
| `SMTP_PORT` | Port SMTP (défaut: 587) |
| `SMTP_SECURE` | TLS stricte SMTP (true/false) |
| `EMAIL_FROM` | Adresse expéditeur (défaut: AIDAA <noreply@aidaa.com>) |
| `VITE_API_URL` | (frontend) URL de l'API en production |

---

## 14. What Is Missing (Gap Analysis)

| Feature | Référencé dans le frontend | Statut backend |
|---------|---------------------------|----------------|
| Salle vidéo temps réel | `TeleconsultationRoom.tsx` — utilise `mockSessions` statiques | ❌ Aucun signaling WebRTC, aucun endpoint de salle |
| Planification de session (submit) | `TeleconsultationSchedule.tsx` — `handleSubmit` simule l'API avec `setTimeout(900ms)` au lieu d'appeler `POST /api/teleconsult` | ❌ Appel API non branché dans le frontend |
| Chat en temps réel | `TeleconsultationRoom.tsx` — chat local in-memory (`chatLog` state) | ❌ Aucun WebSocket/Socket.io backend |
| API messages (frontend) | `ParentDashboard.tsx` — onglet "Messages" visible dans le nav | ❌ Aucun appel `api.get/post` vers `/api/message` dans le frontend malgré le backend complet |
| Statistiques analytiques dynamiques | `ParentDashboard.tsx` — graphiques Chart.js avec données hard-codées | ❌ Pas d'endpoint analytics retournant des séries temporelles par enfant |
| Endpoint stats activité par enfant | Affiché dans `ParentDashboard` (score moyen, temps total) calculé localement | ❌ `activityLogModel.getStats()` existe mais aucun endpoint REST ne l'expose |
| Administration AAC/Séquences | Aucune page admin pour créer/modifier des symboles AAC ou des séquences | ❌ Aucune route CRUD admin pour `aac_symbols`, `guided_sequences`, `sequence_steps` |
| Administration Jeux (frontend) | Jeux affichés dans `ChildDashboard` | ❌ Aucune interface d'administration des jeux dans le frontend admin |
| Profil utilisateur (edit self) | Non implémenté côté frontend | ❌ Pas d'endpoint `GET/PUT /api/auth/profile` ou `/api/me` |
| Logout côté serveur / token blacklist | `auth.service.ts` supprime le token localStorage | ❌ Pas de révocation de token JWT côté serveur |

---

## 15. Summary Table

| Area | Status | Files |
|------|--------|-------|
| Authentication | ✅ Complete | `routes/auth.routes.js`, `controllers/auth.controller.js`, `middlewares/auth.js`, `models/user.model.js`, `config/mailer.js` |
| User Management | ✅ Complete | `routes/user.routes.js`, `routes/admin.routes.js`, `controllers/user.controller.js`, `controllers/admin.controller.js`, `models/user.model.js` |
| Participants (Children) | ✅ Complete | `routes/child.routes.js`, `routes/professional.routes.js`, `controllers/child.controller.js`, `controllers/professional.controller.js`, `models/child.model.js` |
| Activities & Games | ✅ Complete | `routes/activityLog.routes.js`, `routes/game.routes.js`, `routes/sequence.routes.js`, `controllers/activityLog.controller.js`, `controllers/game.controller.js`, `controllers/sequence.controller.js` |
| Medical Notes | ✅ Complete | `routes/note.routes.js`, `controllers/note.controller.js`, `models/note.model.js` |
| Teleconsultation | 🔧 Partial | `routes/teleconsult.routes.js`, `controllers/teleconsult.controller.js`, `models/teleconsult.model.js` — REST complet mais pas de WebRTC ni branchement frontend |
| Messaging | 🔧 Partial | `routes/message.routes.js`, `controllers/message.controller.js`, `models/message.model.js` — Backend complet, non utilisé dans le frontend |
| Gamification | ✅ Complete | `routes/gamification.routes.js`, `controllers/gamification.controller.js`, `models/gamification.model.js` |
| AAC — Module C | 🔧 Partial | `routes/aac.routes.js`, `controllers/aac.controller.js`, `models/aac.model.js` — Lecture seule (pas de CRUD admin) |
| Analytics | 🔧 Partial | `controllers/admin.controller.js` (stats basiques), `models/activityLog.model.js` (`getStats` non exposé via REST) |
| File Uploads | ✅ Complete | `routes/content.routes.js`, `controllers/content.controller.js`, `middlewares/upload.js` |
| Security / Middleware | 🔧 Partial | `middlewares/auth.js`, `middlewares/roleCheck.js`, `middlewares/errorHandler.js` — Pas de rate limiting ni Helmet |
| Database | ✅ Complete | `config/db.js`, tous les fichiers `models/*.model.js`, scripts SQL en racine |
| External Integrations | 🔧 Partial | `config/mailer.js` (Nodemailer) — Pas de WebRTC, SMS, ou paiement |

