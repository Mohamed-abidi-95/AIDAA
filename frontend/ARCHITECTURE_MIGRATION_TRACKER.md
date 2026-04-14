# AIDAA Frontend - Architecture Migration Tracker

## Objectif
Mettre en place une architecture modulaire claire avec:
- `src/components/` pour les composants UI partages et reutilisables
- `src/features/*/components/` pour les composants metier specifiques

## Nom de l'architecture
**Feature-Based Modular Architecture** (inspiree FSD)

## Regles de placement
- `src/components/`: composants generiques (Button, Modal, Input, EmptyState, Loader)
- `src/features/<feature>/components/`: composants lies a un domaine metier
- `src/guards/`: gardes de routes (auth/roles)
- `src/pages/`: pages de composition et entry points de routes

## Etat actuel de migration

### Termines
- [x] Deplacer `src/components/ContentCard.tsx` -> `src/features/admin/components/ContentCard.tsx`
- [x] Deplacer `src/components/EditContentModal.tsx` -> `src/features/admin/components/EditContentModal.tsx`
- [x] Deplacer `src/components/DeleteContentModal.tsx` -> `src/features/admin/components/DeleteContentModal.tsx`
- [x] Deplacer `src/components/Games.tsx` -> `src/features/child/components/Games.tsx`
- [x] Mettre a jour les imports de `src/pages/AdminPanel.tsx`
- [x] Deplacer `src/components/ProtectedRoute.tsx` -> `src/guards/ProtectedRoute.tsx`
- [x] Deplacer `src/components/RoleRoute.tsx` -> `src/guards/RoleRoute.tsx`
- [x] Deplacer `src/services/api.ts` -> `src/lib/api.ts`
- [x] Deplacer `src/services/auth.service.ts` -> `src/features/auth/services/auth.service.ts`
- [x] Deplacer `src/hooks/useAuth.ts` -> `src/features/auth/hooks/useAuth.ts`
- [x] Mettre a jour les imports `useAuth` dans pages + guards
- [x] Nettoyer les doublons dans `src/components`, `src/hooks`, `src/services`
- [x] Build frontend valide (`npm run build`)
- [x] Centraliser le routing dans `src/routes/routes-config.tsx`
- [x] Deplacer `src/types/content.types.ts` -> `src/features/content/types/content.types.ts`
- [x] Mettre a jour les imports content types (pages + composants feature)
- [x] Ajouter un menu lateral (toggle) dans `src/pages/ParentDashboard.tsx`
- [x] Ajouter les styles scopes du parent dashboard dans `src/styles/ParentDashboard.css`
- [x] Reformuler les labels/sections de la vue parent pour une meilleure lisibilite UX
- [x] Nettoyer les dossiers frontend inutilisables/vides (`src/services`, `src/config`, `src/helpers`, `src/icons`, `src/layouts`, `src/locales`, `src/store`, `src/Images`, etc.)
- [x] Verifier la stabilite apres nettoyage et redesign (build OK)
- [x] Faire un audit de collisions CSS frontend (classes generiques + styles globaux)
- [x] Isoler `ParentDashboard` des CSS globaux (`DashboardEnhanced.css`, `ProgressDashboard.css`) en passant aux classes `parent-dashboard__*`
- [x] Remplacer les balises/classes generiques dans `src/pages/ParentDashboard.tsx` (header/content/cards/analytics/notes/messages)
- [x] Renforcer le scope dans `src/styles/ParentDashboard.css` pour eviter les collisions cross-page

## Notes - Audit collisions design (2026-04-08)
- Cause principale: `src/styles/DashboardEnhanced.css` applique des classes globales partagees (`.dashboard-container`, `.dashboard-header`, `.dashboard-content`, `.logout-button`, `.tab`).
- Collision majeure: `src/styles/ProgressDashboard.css` contient des selecteurs globaux (`*`, `body`, `:root`) pouvant impacter d'autres pages.
- Conflit de surcharge: `src/pages/ParentDashboard.tsx` importe plusieurs CSS (`DashboardEnhanced.css`, `ProgressDashboard.css`, `ParentDashboard.css`) avec des priorites d'ordre.
- Theming bleu force par: `src/styles/DashboardEnhanced.css` + override local `src/styles/ParentDashboard.css`.

### A faire (prochain lot)
- [ ] Ranger les types metier vers `src/features/*/types` quand utile
- [ ] Decoupler les classes globales dashboard en classes scopees par page/feature

### Termines (2026-04-13 — Téléconsultation + Sécurité backend)
- [x] Réécrire `TeleconsultationSchedule.tsx` : mock `setTimeout` → appel réel `POST /api/teleconsult` + migration inline CSS → Tailwind orange
- [x] Réécrire `TeleconsultationList.tsx` : `mockSessions` → appel réel `GET /api/teleconsult/my` + dérivation du statut depuis `date_time`
- [x] Réécrire `TeleconsultationRoom.tsx` : `mockSessions.find()` → appel réel `GET /api/teleconsult/:id` + Tailwind + FontAwesome
- [x] Ajouter `helmet` au backend Express (`app.js`) — en-têtes de sécurité HTTP
- [x] Ajouter `express-rate-limit` au backend — rate limiting global (200 req/15min) + auth strict (20 req/15min)
- [x] Installer les packages npm `helmet` et `express-rate-limit` dans `backend/package.json`
- [x] Réécrire `ProgressDashboard.tsx` : données mock hard-codées → API réelles (`overview`, `sessions-timeline`, `activity-breakdown`, `scores-by-category`, `activity-log`)
- [x] Supprimer `src/styles/ProgressDashboard.css` — remplacé par Tailwind dans le composant
- [x] Supprimer `src/data/teleconsultation.mock.ts` — plus aucun import

## Mapping rapide
- `Admin content UI` -> `src/features/admin/components/`
- `Child games UI` -> `src/features/child/components/`
- `Generic shared UI` -> `src/components/`

## Definition of Done
- [x] Aucun composant metier dans `src/components/`
- [ ] Chaque feature expose ses composants via `src/features/<feature>/components/`
- [ ] Les imports cross-feature restent limites et explicites
- [x] Build frontend passe sans erreur



