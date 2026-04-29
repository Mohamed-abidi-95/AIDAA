# 📋 AIDAA — Référentiel des Endpoints Backend

**Version :** 1.0-MVP · **Date :** Avril 2026  
**Base URL :** `http://localhost:5000`  
**Auth :** `Authorization: Bearer <JWT>` sauf routes publiques

---

## Légende

| Symbole | Signification |
|---------|--------------|
| 🔓 | Route publique (pas d'auth) |
| 🔐 | JWT requis |
| 👤 | Rôle `parent` requis |
| 🩺 | Rôle `professional` requis |
| 🛡️ | Rôle `admin` requis |
| ✅ | Implémenté et testé |

---

## 1. Health

| Méthode | Endpoint | Auth | Description | Status |
|---------|----------|------|-------------|--------|
| GET | `/health` | 🔓 | Vérification serveur | ✅ |

---

## 2. Authentification — `/api/auth`

| Méthode | Endpoint | Auth | Description | Status |
|---------|----------|------|-------------|--------|
| POST | `/api/auth/register` | 🔓 | Inscription parent | ✅ |
| POST | `/api/auth/login` | 🔓 | Connexion → JWT | ✅ |
| POST | `/api/auth/forgot-password` | 🔓 | Demande reset mot de passe | ✅ |
| POST | `/api/auth/reset-password` | 🔓 | Réinitialisation avec token | ✅ |
| POST | `/api/auth/set-password` | 🔓 | Définir mdp (invitation prof) | ✅ |
| GET | `/api/auth/me` | 🔐 | Profil utilisateur courant | ✅ |

---

## 3. Utilisateurs — `/api/users`

| Méthode | Endpoint | Auth | Description | Status |
|---------|----------|------|-------------|--------|
| GET | `/api/users` | 🛡️ | Liste tous les utilisateurs | ✅ |
| GET | `/api/users/:id` | 🔐 | Détail utilisateur | ✅ |
| PUT | `/api/users/:id` | 🔐 | Modifier profil | ✅ |
| DELETE | `/api/users/:id` | 🛡️ | Supprimer utilisateur | ✅ |

---

## 4. Enfants — `/api/child`

| Méthode | Endpoint | Auth | Description | Status |
|---------|----------|------|-------------|--------|
| GET | `/api/child` | 👤 | Liste enfants du parent | ✅ |
| POST | `/api/child` | 👤 | Créer un enfant | ✅ |
| GET | `/api/child/:id` | 🔐 | Détail enfant | ✅ |
| PUT | `/api/child/:id` | 👤 | Modifier enfant | ✅ |
| DELETE | `/api/child/:id` | 👤 | Supprimer enfant | ✅ |

---

## 5. Contenu — `/api/content`

| Méthode | Endpoint | Auth | Description | Status |
|---------|----------|------|-------------|--------|
| GET | `/api/content` | 🔐 | Liste contenus (filtres: type, category, age_group, level, participant_category) | ✅ |
| GET | `/api/content/:id` | 🔐 | Détail contenu | ✅ |
| POST | `/api/content` | 🛡️ | Créer contenu | ✅ |
| PUT | `/api/content/:id` | 🛡️ | Modifier contenu | ✅ |
| DELETE | `/api/content/:id` | 🛡️ | Supprimer contenu | ✅ |
| POST | `/api/content/upload` | 🛡️ | Upload fichier média (multer) | ✅ |

---

## 6. Journal d'activités — `/api/activity-log`

| Méthode | Endpoint | Auth | Description | Status |
|---------|----------|------|-------------|--------|
| GET | `/api/activity-log` | 🔐 | Logs filtrables (child_id, date) | ✅ |
| POST | `/api/activity-log` | 🔐 | Créer un log | ✅ |
| GET | `/api/activity-log/child/:childId` | 🔐 | Logs d'un enfant | ✅ |

---

## 7. Notes médicales — `/api/note`

| Méthode | Endpoint | Auth | Description | Status |
|---------|----------|------|-------------|--------|
| GET | `/api/note/child/:childId` | 🔐 | Notes d'un enfant | ✅ |
| POST | `/api/note` | 🩺 | Créer une note | ✅ |
| PUT | `/api/note/:id` | 🩺 | Modifier une note | ✅ |
| DELETE | `/api/note/:id` | 🩺 | Supprimer une note | ✅ |

---

## 8. Messagerie — `/api/message`

| Méthode | Endpoint | Auth | Description | Status |
|---------|----------|------|-------------|--------|
| GET | `/api/message/conversations` | 🔐 | Liste des conversations | ✅ |
| GET | `/api/message/:childId/:userId` | 🔐 | Messages d'une conversation | ✅ |
| POST | `/api/message` | 🔐 | Envoyer un message | ✅ |
| PUT | `/api/message/read/:childId/:userId` | 🔐 | Marquer comme lus | ✅ |

---

## 9. Jeux — `/api/games`

| Méthode | Endpoint | Auth | Description | Status |
|---------|----------|------|-------------|--------|
| GET | `/api/games` | 🔐 | Liste des jeux | ✅ |
| GET | `/api/games/:id` | 🔐 | Détail jeu | ✅ |
| POST | `/api/games` | 🛡️ | Créer jeu | ✅ |

---

## 10. Téléconsultations — `/api/teleconsult`

| Méthode | Endpoint | Auth | Description | Status |
|---------|----------|------|-------------|--------|
| GET | `/api/teleconsult` | 🔐 | Liste téléconsultations | ✅ |
| POST | `/api/teleconsult` | 🩺 | Créer une téléconsultation | ✅ |
| GET | `/api/teleconsult/:id` | 🔐 | Détail (token WebRTC) | ✅ |
| PUT | `/api/teleconsult/:id/status` | 🔐 | Changer statut | ✅ |
| DELETE | `/api/teleconsult/:id` | 🩺 | Annuler | ✅ |

---

## 11. Admin — `/api/admin`

| Méthode | Endpoint | Auth | Description | Status |
|---------|----------|------|-------------|--------|
| GET | `/api/admin/users` | 🛡️ | Liste utilisateurs avec statut | ✅ |
| PUT | `/api/admin/users/:id/approve` | 🛡️ | Approuver un professionnel | ✅ |
| PUT | `/api/admin/users/:id/reject` | 🛡️ | Rejeter inscription | ✅ |
| DELETE | `/api/admin/users/:id` | 🛡️ | Supprimer compte | ✅ |
| GET | `/api/admin/stats` | 🛡️ | Statistiques globales | ✅ |

---

## 12. Parent — `/api/parent`

| Méthode | Endpoint | Auth | Description | Status |
|---------|----------|------|-------------|--------|
| POST | `/api/parent/invite-professional` | 👤 | Inviter un professionnel | ✅ |
| GET | `/api/parent/my-professionals` | 👤 | Mes professionnels | ✅ |
| DELETE | `/api/parent/invitation/:professionalId` | 👤 | Révoquer accès | ✅ |
| DELETE | `/api/parent/invitation/:professionalId/delete` | 👤 | Supprimer invitation | ✅ |
| POST | `/api/parent/resend-invitation/:professionalId` | 👤 | Renvoyer invitation | ✅ |

---

## 13. Professionnel — `/api/professional`

| Méthode | Endpoint | Auth | Description | Status |
|---------|----------|------|-------------|--------|
| GET | `/api/professional/my-parents` | 🩺 | Familles associées | ✅ |
| GET | `/api/professional/children` | 🩺 | Enfants suivis | ✅ |
| GET | `/api/professional/child/:childId/details` | 🩺 | Détail complet enfant | ✅ |

---

## 14. Séquences guidées — `/api/sequences`

| Méthode | Endpoint | Auth | Description | Status |
|---------|----------|------|-------------|--------|
| GET | `/api/sequences` | 🔐 | Liste séquences | ✅ |
| GET | `/api/sequences/:id` | 🔐 | Détail avec étapes | ✅ |
| POST | `/api/sequences` | 🛡️ | Créer séquence | ✅ |
| PUT | `/api/sequences/:id` | 🛡️ | Modifier | ✅ |
| DELETE | `/api/sequences/:id` | 🛡️ | Supprimer | ✅ |

---

## 15. AAC — `/api/aac`

| Méthode | Endpoint | Auth | Description | Status |
|---------|----------|------|-------------|--------|
| GET | `/api/aac/symbols` | 🔐 | Symboles AAC (filtres: category, participant_category) | ✅ |
| GET | `/api/aac/symbols/:id` | 🔐 | Détail symbole | ✅ |
| POST | `/api/aac/symbols` | 🛡️ | Créer symbole | ✅ |
| PUT | `/api/aac/symbols/:id` | 🛡️ | Modifier | ✅ |
| DELETE | `/api/aac/symbols/:id` | 🛡️ | Supprimer | ✅ |

---

## 16. Gamification — `/api/gamification`

| Méthode | Endpoint | Auth | Description | Status |
|---------|----------|------|-------------|--------|
| GET | `/api/gamification/badges` | 🔐 | Liste badges | ✅ |
| GET | `/api/gamification/child/:childId/badges` | 🔐 | Badges d'un enfant | ✅ |
| POST | `/api/gamification/child/:childId/award` | 🔐 | Attribuer un badge | ✅ |
| GET | `/api/gamification/child/:childId/score` | 🔐 | Score total enfant | ✅ |

---

## 17. Analytiques — `/api/analytics`

| Méthode | Endpoint | Auth | Description | Status |
|---------|----------|------|-------------|--------|
| GET | `/api/analytics/child/:id/overview` | 🔐 | Vue d'ensemble (sessions, minutes, score, streak) | ✅ |
| GET | `/api/analytics/child/:id/sessions-timeline` | 🔐 | Timeline quotidienne | ✅ |
| GET | `/api/analytics/child/:id/activity-breakdown` | 🔐 | Répartition par catégorie | ✅ |
| GET | `/api/analytics/child/:id/scores-by-category` | 🔐 | Scores par catégorie | ✅ |
| GET | `/api/analytics/admin/global-stats` | 🛡️ | Stats globales plateforme | ✅ |

---

## 18. 🤖 Chatbot IA — `/api/chatbot`

| Méthode | Endpoint | Auth | Description | Status |
|---------|----------|------|-------------|--------|
| POST | `/api/chatbot/consent` | 👤 | Enregistrer consentement RGPD | ✅ |
| GET | `/api/chatbot/consent/status` | 👤 | Vérifier consentement | ✅ |
| POST | `/api/chatbot/session` | 👤 | Démarrer une session | ✅ |
| POST | `/api/chatbot/message` | 👤 | Envoyer message → réponse IA | ✅ |
| GET | `/api/chatbot/session/:id/history` | 👤 | Historique anonymisé | ✅ |
| DELETE | `/api/chatbot/session/:id` | 👤 | Clôturer session | ✅ |
| GET | `/api/chatbot/faq/categories` | 👤 | Catégories FAQ disponibles | ✅ |
| GET | `/api/chatbot/recommend/:childId` | 👤 | Recommandations directes | ✅ |

### Pipeline de traitement du message :
```
1. Garde-fou urgence  → intent: emergency (guardrail)
2. Salutation         → intent: greeting
3. Recommandation     → intent: recommendation (rule-based-profile-filter)
4. FAQ keyword-match  → intent: faq (keyword-matching)
5. Gemini AI*         → intent: faq (gemini-1.5-flash) [si GEMINI_API_KEY configurée]
6. Fallback           → intent: unknown
```
*Gemini 1.5 Flash — modèle gratuit via Google AI Studio

---

## Résumé

| Module | Endpoints | Auth types |
|--------|-----------|-----------|
| Auth | 6 | Public + JWT |
| Enfants/Contenu/Activités | 18 | JWT + rôles |
| Messagerie/Téléconsult | 9 | JWT |
| Notes/Jeux/Gamification | 8 | JWT + rôles |
| Analytiques | 5 | JWT + admin |
| AAC/Séquences | 10 | JWT + admin |
| Admin | 5 | Admin only |
| Parent/Pro | 8 | Rôles |
| **Chatbot IA** | **8** | **Parent** |
| **TOTAL** | **≈ 77** | |

---

*Fichier généré automatiquement — Mise à jour : Avril 2026*

