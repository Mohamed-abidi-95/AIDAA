# Revue globale du projet AIDAA (interfaces + CRUD + backend + BDD)

## Cadre de la lecture

- [x] Inspecter toutes les interfaces frontend (`pages`, `components`, routing)
- [x] Inspecter tous les CRUD backend (`routes`, `controllers`, `models`)
- [x] Vérifier l'alignement avec la BDD (`aidaa_schema.sql`, migrations)
- [x] Identifier ce qui est implémenté, partiel, cassé et manquant
- [x] Isoler les collisions techniques à corriger en priorité

## Vue globale (état réel)

- Le projet possède une base solide : authentification, rôles, dashboards principaux et plusieurs CRUD backend.
- Le frontend est bien structuré (login, guards, pages par rôle), mais certaines zones restent en mode prototype.
- Le backend expose de nombreux endpoints, mais avec des incohérences importantes entre `controllers`, `models` et schéma SQL.
- La base SQL initiale est en retard sur le code applicatif actuel : migrations obligatoires.
- Côté TypeScript, les fichiers revus ne montrent pas d'erreurs de compilation actives.

---

## Analyse des interfaces frontend

### 1) Auth + navigation

- Routes centralisées dans `frontend/src/App.tsx` : login, set-password, role-selection, dashboards par rôle.
- Flux login présent dans `frontend/src/pages/LoginPage.tsx`.
- Protection d'accès opérationnelle via `frontend/src/components/ProtectedRoute.tsx` et `frontend/src/components/RoleRoute.tsx`.
- Point d'attention : la redirection par défaut `"/" -> /parent/dashboard` crée du bruit de navigation/logs selon le rôle réel.

### 2) Interface Admin

- Interface principale : `frontend/src/pages/AdminPanel.tsx`.
- Onglets disponibles : `Content List`, `Upload Content`, `Users`.
- CRUD contenu côté UI présent : listing, upload, édition (modal), suppression (modal).
- Composants liés : `frontend/src/components/ContentCard.tsx`, `frontend/src/components/EditContentModal.tsx`, `frontend/src/components/DeleteContentModal.tsx`.
- Risque critique : contrat de props `onDelete` incohérent entre carte et page, pouvant casser le bouton supprimer.

### 3) Interface Parent

- Interface : `frontend/src/pages/ParentDashboard.tsx`.
- Onglets : summary, activities, notes, messages.
- Appels backend branchés sur children, activity logs et notes.
- Messagerie parent encore en placeholder (non branchée au CRUD `messages`).

### 4) Interface Professional

- Interface : `frontend/src/pages/ProfessionalPage.tsx`.
- Lecture des activités/notes et création de note disponibles.
- Bug majeur : appel de `/api/child/mychildren` (route parent-only), donc liste patient potentiellement vide côté professionnel.

### 5) Interface Child

- Interface modernisée dans `frontend/src/pages/ChildDashboard.tsx`.
- Chargement du contenu via `/api/content?type=video|activity`.
- Jeux séparés dans `frontend/src/components/Games.tsx`, pas pleinement intégrés au flux du dashboard enfant.
- Plusieurs éléments restent statiques (étoiles, badges, CTA sans logique métier complète).

---

## Analyse CRUD backend (couverture)

### Entités couvertes

- `users` -> `backend/src/routes/user.routes.js` (admin-only)
- `child` -> `backend/src/routes/child.routes.js`
- `content` -> `backend/src/routes/content.routes.js` (+ upload)
- `activity_logs` -> `backend/src/routes/activityLog.routes.js`
- `notes` -> `backend/src/routes/note.routes.js`
- `messages` -> `backend/src/routes/message.routes.js`
- `games` -> `backend/src/routes/game.routes.js`
- `teleconsultations` -> `backend/src/routes/teleconsult.routes.js`
- `admin ops` -> `backend/src/routes/admin.routes.js`
- `auth` -> `backend/src/routes/auth.routes.js`

### Niveau d'implémentation réel

- Implémenté et globalement utilisable : auth, content (hors collisions), notes, child.
- Partiel/incohérent : users/admin, activity logs, flow professionnel, messages (UI non connectée), games (UI partielle + table potentiellement absente selon BDD).

---

## Collisions techniques critiques (priorisées)

| # | Problème | Zone | Impact | Effort | Priorité |
|---|---|---|---|---|---|
| 1 | Signature `createUser` incompatible entre `admin.controller` et `user.model` | Backend users | Très élevé | Faible | P0 |
| 2 | Signature `updateUser` incompatible (`dataObject` vs paramètres plats) | Backend users | Très élevé | Faible | P0 |
| 3 | Contrat `onDelete` incohérent (`ContentCard` vs `AdminPanel`) | Front admin | Élevé | Faible | P0 |
| 4 | Route professionnel vers endpoint parent-only (`/api/child/mychildren`) | Front + backend accès | Élevé | Moyen | P1 |
| 5 | `activityLog.create` incohérent (`status` vs `score/duration/action`) | Backend activity logs | Élevé | Moyen | P1 |
| 6 | Schéma SQL incomplet vs code (messages, games, champs content, score/duration logs) | BDD + backend | Très élevé | Faible | P0 |
| 7 | CORS par défaut orienté `localhost:3000` alors que Vite est en `5173` | Backend infra | Moyen | Faible | P1 |

---

## BDD vs code (diagnostic)

- Le noyau SQL initial (6 tables) est cohérent avec une version ancienne du projet.
- Le code actuel vise une version enrichie (messages, games, champs UI child dans `content`, scoring dans `activity_logs`).
- Conclusion : pas de collision de noms majeure, mais collision de versions (schéma non aligné sur le code).

---

## Plan d'exécution concret sur 2 jours (objectif démo PFE)

## Jour 1 (stabilisation critique)

- Corriger les signatures `createUser` et `updateUser` (`admin.controller` <-> `user.model` <-> `user.controller`).
- Corriger le flux suppression contenu (`ContentCard`/`AdminPanel`) et valider suppression effective en UI.
- Appliquer `database_updates.sql` + `migration_add_child_interface_fields.sql` sur `aidaa_db`.
- Vérifier les endpoints clés avec données réelles : auth, content list, upload, delete, users list.
- Aligner CORS (`CORS_ORIGIN`) avec `http://localhost:5173`.

## Jour 2 (cohérence métier + polish démo)

- Corriger le flux professionnel (endpoint dédié pour lister les patients ou adaptation des permissions).
- Corriger la création d'`activity_logs` pour respecter le modèle (`score`, `duration_seconds`, `action`) ou adapter modèle/contrôleur de manière cohérente.
- Brancher au minimum la messagerie parent/professionnel (MVP lisible pour soutenance).
- Ajouter contrôles UX minimaux : états vides, feedback succès/erreur, loaders homogènes.
- Exécuter une passe finale de test manuel multi-rôles : admin / parent / professional / child.

---

## Checklist de validation rapide (avant démo)

- [ ] Login admin, parent, professional fonctionnel
- [ ] Upload contenu visible immédiatement dans admin + affichage enfant
- [ ] Suppression contenu opérationnelle (UI + DB)
- [ ] Liste utilisateurs admin fonctionnelle
- [ ] Parent voit ses enfants + activités + notes
- [ ] Professional voit au moins 1 patient et peut ajouter une note
- [ ] Migrations SQL appliquées sans erreur
- [ ] Aucun blocage CORS sur environnement local

---

## Conclusion opérationnelle

- Le projet n'est pas à 10% : une base significative est déjà en place.
- En revanche, le statut n'est pas "CRUD propre finalisé" tant que les collisions P0/P1 ne sont pas corrigées.
- Priorité immédiate pour sécuriser la démo :
  - alignement `users` (signatures),
  - correction delete admin,
  - synchronisation BDD,
  - correction flux professional.

Une fois ces points verrouillés, le reste devient du renforcement fonctionnel et UX pour soutenance.
