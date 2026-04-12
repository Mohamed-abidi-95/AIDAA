# AIDAA — Relations & Synchronisation Audit
> Generated: 2026-04-12
> Status: ✅ Correct | 🔧 Partial | ❌ Missing | 🔴 Security Risk

---

## 1. DATABASE SCHEMA — Relations Found

### Users & Roles

#### Table: `users`
| Field | Type | Notes |
|-------|------|-------|
| id | INT AUTO_INCREMENT | **PK** |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | NOT NULL, UNIQUE |
| password | VARCHAR(255) | NULL (first-time setup) |
| role | ENUM('admin','parent','professional') | NOT NULL |
| is_active | TINYINT(1) | DEFAULT 1 |
| status | ENUM('pending','approved','rejected') | Added via migration |
| reset_token | VARCHAR(255) | Password reset |
| reset_token_expires | DATETIME | Expiry |
| specialite | VARCHAR(100) | Added via migration |
| created_at | TIMESTAMP | |
- FKs: none (no `professional_id` column on this table)
- Relation: 1 user → N children (via children.parent_id)

#### Table: `children`
| Field | Type | Notes |
|-------|------|-------|
| id | INT AUTO_INCREMENT | **PK** |
| parent_id | INT | **FK** → users(id) ON DELETE CASCADE |
| name | VARCHAR(100) | NOT NULL |
| age | INT | |
| participant_category | ENUM('enfant','jeune','adulte') | Added via migration |
- Relation type: **1-to-N** (1 parent → many children)

#### Table: `professional_invitations`
| Field | Type | Notes |
|-------|------|-------|
| id | INT AUTO_INCREMENT | **PK** |
| parent_id | INT | **FK** → users(id) ON DELETE CASCADE |
| professional_id | INT | **FK** → users(id) ON DELETE CASCADE |
| status | ENUM('pending','active','revoked') | |
| invited_at | TIMESTAMP | |
- UNIQUE KEY on `(parent_id, professional_id)` — prevents duplicate pairs
- Relation type: **N-to-N** (one parent can invite multiple professionals, one professional can be invited by multiple parents)
- ⚠️ Business Rule 1 says "1 Parent → exactly 1 Professional" but the DB allows N-N

#### Table: `messages`
| Field | Type | Notes |
|-------|------|-------|
| id | INT AUTO_INCREMENT | **PK** |
| child_id | INT | **FK** → children(id) ON DELETE CASCADE |
| sender_id | INT | **FK** → users(id) |
| receiver_id | INT | **FK** → users(id) |
| content | TEXT | NOT NULL |
| created_at | TIMESTAMP | |
- Relation type: **N-N** between users, pivoted on child_id
- No `is_read` field for unread message tracking

#### Table: `notes`
| Field | Type | Notes |
|-------|------|-------|
| id | INT AUTO_INCREMENT | **PK** |
| professional_id | INT | **FK** → users(id) |
| child_id | INT | **FK** → children(id) ON DELETE CASCADE |
| content | TEXT | NOT NULL |
| date | TIMESTAMP | |
- Relation type: **N-to-N** (professional writes note for child)

#### Table: `teleconsultations`
| Field | Type | Notes |
|-------|------|-------|
| id | INT AUTO_INCREMENT | **PK** |
| parent_id | INT | **FK** → users(id) |
| professional_id | INT | **FK** → users(id) |
| date_time | DATETIME | NOT NULL |
| meeting_link | VARCHAR(500) | |
| notes | TEXT | |
| created_at | TIMESTAMP | Added via migration |
- Relation type: **N-N** between parent and professional (one appointment each time)

#### Table: `activity_logs`
| Field | Type | Notes |
|-------|------|-------|
| id | INT AUTO_INCREMENT | **PK** |
| child_id | INT | **FK** → children(id) ON DELETE CASCADE |
| content_id | INT | **FK** → content(id), nullable after migration |
| status | ENUM('started','completed') | |
| date | TIMESTAMP | |
| score | INT | Added via migration |
| duration_seconds | INT | Added via migration |
| action | VARCHAR(50) | Added via migration |

#### Other tables (no inter-user relations):
- `content` — educational resources, no user FKs
- `games` — game definitions, no user FKs
- `guided_sequences` / `sequence_steps` — structured exercises, no user FKs
- `aac_symbols` — communication symbols, no user FKs
- `badges` — gamification definitions, no user FKs
- `child_badges` — FK child_id + badge_id (N-N child↔badge)

---

### Expected vs Found

| Relation | Expected | Found in DB | Status |
|----------|----------|-------------|--------|
| Parent → Professional | FK professional_id in parent/user table **OR** single-row join table | N-N join table `professional_invitations` (allows multiple) | 🔧 Partial |
| Professional → Parents | One professional_id referenced by many parents | ✅ via `professional_invitations.professional_id` | ✅ |
| Parent → Children | FK parent_id in children table | ✅ `children.parent_id` → `users(id)` | ✅ |
| Professional → Children | Via parent relationship | ✅ via `professional_invitations` + `children.parent_id` | ✅ |
| Message sender/receiver | FK user_id on both ends + child_id pivot | ✅ `messages.sender_id`, `messages.receiver_id`, `messages.child_id` | ✅ |
| Note → Child + Author | FK child_id + professional_id in notes table | ✅ `notes.professional_id` + `notes.child_id` | ✅ |
| Admin → All | No FK needed, role-based access | ✅ role='admin' in users table, enforced via roleCheck middleware | ✅ |

---

## 2. BACKEND ROUTES — Access Control Audit

### Messages

| Route | Controller | Who can call | Relation enforced? |
|-------|-----------|-------------|-------------------|
| GET /api/message/child/:childId | `getByChildId` | Auth required (any role) | Parent: checks child ownership ✅ ; Professional: NO link check ❌ |
| GET /api/message/conversation/:childId/:otherUserId | `getConversation` | Auth required (any role) | Parent: checks child ownership ✅ ; Professional: NO link check ❌ |
| POST /api/message | `create` | Auth required (any role) | Parent: checks child ownership ✅ ; NO check that receiver is linked professional ❌ |
| PUT /api/message/:id | `updateMessage` | Auth required | Sender only ✅ |
| DELETE /api/message/:id | `deleteMessage` | Auth required | Sender or admin ✅ |

- **Can a Parent message a Professional they are NOT linked to?** ✅ (bug) — `message.controller.js` line 131: `messageModel.create(childId, senderId, receiverId, content)` — `receiverId` is provided by the client with no validation against `professional_invitations`
- **Is sender/receiver relationship enforced?** ❌ — No verification that the receiver is the professional actually linked to the parent

### Notes Cliniques

| Route | Controller | Role restriction | Notes |
|-------|-----------|-----------------|-------|
| GET /api/note/child/:childId | `getByChildId` | `auth` only (no roleCheck) | Parent: checks child ownership ✅ ; Professional: NO link check ❌ |
| GET /api/note/:id | `getById` | `auth` only | Parent: checks child ownership ✅ ; Professional: NO link check ❌ |
| POST /api/note | `create` | `auth` + `roleCheck('professional')` | Role enforced ✅ but NO check if professional is linked to child's parent ❌ |
| PUT /api/note/:id | `update` | `auth` + `roleCheck('professional')` | Checks `note.professional_id === req.user.id` ✅ |
| DELETE /api/note/:id | `deleteNote` | `auth` + `roleCheck('professional')` | Checks `note.professional_id === req.user.id` ✅ |

- **Can a Parent see notes written for another Parent's child?** ❌ (correct) — `child.parent_id !== req.user.id` check in controller
- **Can a Professional see notes outside their patient list?** ✅ (bug) — `note.controller.js` line 27-32: only checks if role==='parent' to restrict; any professional can GET notes for any child without a `professional_invitations` check

### Admin Routes

| Route | Data exposed | Admin middleware |
|-------|-------------|-----------------|
| GET /api/admin/stats | User counts by role | ✅ auth + roleCheck('admin') |
| GET /api/admin/users | All users (id, name, email, role, is_active, status, created_at) | ✅ auth + roleCheck('admin') |
| POST /api/admin/create-parent | Creates parent with null password | ✅ auth + roleCheck('admin') |
| POST /api/admin/create-professional | Creates professional with hashed password | ✅ auth + roleCheck('admin') |
| PUT /api/admin/toggle-active/:id | Sets is_active flag | ✅ auth + roleCheck('admin') |
| GET /api/admin/notification-count | Count of pending registrations | ✅ auth + roleCheck('admin') |
| GET /api/admin/pending-registrations | Pending users list | ✅ auth + roleCheck('admin') |
| POST /api/admin/approve-registration/:id | Sets status=approved, is_active=1 | ✅ auth + roleCheck('admin') |
| POST /api/admin/reject-registration/:id | Sets status=rejected, is_active=0 | ✅ auth + roleCheck('admin') |
| ❌ GET /api/admin/relations | **MISSING** — no view of professional_invitations | — |
| ❌ GET /api/admin/messages | **MISSING** — no view of all messages | — |
| ❌ GET /api/admin/notes | **MISSING** — no view of all notes | — |

Also note: `GET /api/users` and `DELETE /api/users/:id` are in **user.routes.js** (also admin-only), duplicating some admin functionality.

---

## 3. PROFESSIONAL ↔ PARENT RELATION MANAGEMENT

### Current state

| Feature | Verdict | Route if found |
|---------|---------|---------------|
| Endpoint to ASSIGN a professional to a parent | ✅ | POST /api/parent/invite-professional |
| Endpoint to REMOVE/CHANGE a professional | ✅ (revoke only) | DELETE /api/parent/invitation/:professionalId |
| Endpoint to RE-SEND invitation | ✅ | POST /api/parent/resend-invitation/:professionalId |
| Get professional of a parent | ✅ | GET /api/parent/my-professionals |
| Get parents of a professional | ✅ | GET /api/professional/my-parents |
| Get children of linked parents | ✅ | GET /api/professional/my-children |
| UI in ParentDashboard to see/manage professional | ✅ | "Mon professionnel" view in `ParentDashboard.tsx` |
| UI in ProfessionalPage to see linked parents list | ✅ | "Invitations" view in `ProfessionalPage.tsx` |
| Invitation system (parent invites professional by email) | ✅ | POST /api/parent/invite-professional → sends email via nodemailer |

**Critical design note:** The business rule says "1 Parent → exactly 1 Professional" but the implementation allows **N-N** (a parent can invite multiple professionals with different statuses). There is no constraint preventing a parent from having 2 active professionals simultaneously.

### Missing endpoints to create

- ❌ GET /api/admin/relations — admin view of all professional_invitations with parent and professional names
- ❌ GET /api/admin/messages — admin view of all messages with user names
- ❌ GET /api/admin/notes — admin view of all clinical notes
- ❌ GET /api/relations/parent/:id/professional — explicit scoped endpoint (current GET /api/parent/my-professionals serves this for the authenticated parent only)
- ❌ PUT /api/admin/relations/:id/status — admin ability to manually change invitation status
- ❌ GET /api/message/unread-count — unread message count for notification badge

---

## 4. MESSAGING SYNCHRONISATION

### Flow audit

1. **Parent sends message →** POST /api/message `{ childId, receiverId, content }` → stored in `messages` table (child_id, sender_id = parent_id, receiver_id, content) → Professional receives via GET /api/message/child/:childId or GET /api/message/conversation/:childId/:professionalId
2. **Professional sends message →** same POST /api/message endpoint → same table → Parent receives via same GET endpoints
3. **Admin reads messages →** ❌ **No endpoint exists** — admin cannot view messages

### Issues found

| Issue | Status |
|-------|--------|
| Messages scoped to Parent↔Professional relation | ❌ — messages require a `child_id` pivot; no direct parent↔professional channel without a child |
| Real-time (WebSocket/SSE) | ❌ — None detected; client-side polling only |
| Unread message count endpoint | ❌ — No `is_read` field in `messages` table, no unread count endpoint |
| Message history endpoint | ✅ — GET /api/message/child/:childId and GET /api/message/conversation/:childId/:otherUserId |
| Receiver validation (is the receiver actually linked?) | ❌ — `message.controller.js` line 100-131: only validates child ownership for parents; never validates that `receiverId` is the linked professional |

---

## 5. NOTES SYNCHRONISATION

### Flow audit

1. **Professional writes note for child →** POST /api/note `{ childId, content }` → stored in `notes` (professional_id, child_id, content) → Parent can read via GET /api/note/child/:childId (if they own the child)
2. **Admin reads all notes →** ❌ No endpoint exists
3. **Note visibility filtered by professional_id + child_id?** ❌ — `note.model.js` line 11-19: `getByChildId` filters only by `child_id`, returns notes written by ALL professionals for that child. A parent who reads notes sees ALL professionals' notes, not only their own professional's.

### Issues found

- 🔴 **Any professional can write notes for any child** — `note.controller.js` POST /api/note line 78: `noteModel.create(professionalId, childId, content)` — no check that `professional_invitations` links this professional to the child's parent — file: `backend/src/controllers/note.controller.js`
- 🔴 **Any professional can read notes for any child** — `note.routes.js` GET /api/note/child/:childId applies `auth` but no `roleCheck` on GET; `note.controller.js` lines 26-32 only restricts parent role; any professional can reach `noteModel.getByChildId(childId)` — file: `backend/src/controllers/note.controller.js`
- 🟡 **A parent can see notes from professionals they've revoked** — notes are not filtered by `professional_invitations.status`; once a note exists it remains visible even after invitation revocation — file: `backend/src/models/note.model.js`

---

## 6. ADMIN CAPABILITIES AUDIT

| Capability | Endpoint exists | Protected by admin middleware | Status |
|-----------|----------------|-------------------------------|--------|
| View all users | GET /api/admin/users + GET /api/users | ✅ both routes | ✅ |
| View all relations (professional_invitations) | ❌ | N/A | ❌ |
| View all messages | ❌ | N/A | ❌ |
| View all notes | ❌ | N/A | ❌ |
| Manage professional assignments | POST /api/admin/create-professional (creates user, not assigns) | ✅ | 🔧 Partial |
| Approve/reject registrations | POST /api/admin/approve-registration/:id + reject | ✅ | ✅ |
| Suspend user | PUT /api/admin/toggle-active/:id | ✅ | ✅ |
| Delete user (hard) | DELETE /api/users/:id | ✅ (user.routes.js) | ✅ |
| View pending registrations | GET /api/admin/pending-registrations | ✅ | ✅ |
| Dashboard statistics | GET /api/admin/stats | ✅ | ✅ |

---

## 7. SECURITY RISKS

- 🔴 **CRITICAL: Any professional can see ALL children** — `GET /api/child/all` is protected by `roleCheck('professional', 'admin')` but returns the entire `children` table with no relation filter. Any authenticated professional can enumerate every child in the system. — file: `backend/src/routes/child.routes.js` line 28 / `backend/src/controllers/child.controller.js` line 37-54 — fix: join with `professional_invitations` to restrict to linked parents' children

- 🔴 **CRITICAL: Any professional can create notes for any child** — `POST /api/note` checks `role === 'professional'` but does NOT verify that a `professional_invitations` record links this professional to the child's parent. A professional can pollute any parent's child record. — file: `backend/src/controllers/note.controller.js` line 56-98 — fix: add `SELECT 1 FROM professional_invitations WHERE professional_id=? AND parent_id=? AND status!='revoked'` before `noteModel.create()`

- 🔴 **CRITICAL: Any professional can read notes for any child** — `GET /api/note/child/:childId` only restricts the *parent* role (must own child); for the professional role there is no ownership check at all. — file: `backend/src/controllers/note.controller.js` line 26-32 — fix: same join check as above

- 🔴 **CRITICAL: A parent can message an unlinked professional** — `POST /api/message` validates that a parent owns the child but does NOT validate that `receiverId` corresponds to a professional linked via `professional_invitations`. Any professional user ID can be used as receiver. — file: `backend/src/controllers/message.controller.js` line 100-151 — fix: verify `SELECT 1 FROM professional_invitations WHERE parent_id=? AND professional_id=? AND status!='revoked'`

- 🔴 **CRITICAL: ProfessionalPage.tsx fallback fetches all children** — `ProfessionalPage.tsx` line 119-120: if `/api/professional/my-children` returns empty, falls back to `GET /api/child/all` which returns every child in the DB. — file: `frontend/src/pages/ProfessionalPage.tsx` line 118-120 — fix: remove the fallback entirely; return an empty state if no linked children

- 🟡 **WARNING: Any authenticated user can view any child's analytics** — `GET /api/analytics/child/:childId/*` routes only require `auth` (JWT) with no child ownership or professional-link check. Any logged-in user (even another parent) can query analytics for a child they don't own. — file: `backend/src/routes/analyticsRoutes.js` lines 20-29 — fix: add ownership/professional-link verification in analytics controller

- 🟡 **WARNING: Any professional or admin can view any doctor's analytics** — `GET /api/analytics/doctor/:doctorId/*` checks `roleCheck('professional', 'admin')` but does NOT check that `doctorId === req.user.id`. Professional A can read Professional B's patient overview. — file: `backend/src/routes/analyticsRoutes.js` lines 34-61 — fix: add `if (req.user.role === 'professional' && req.user.id !== parseInt(doctorId)) return 403`

- 🟡 **WARNING: Rule 1 violated at DB level** — `professional_invitations` has UNIQUE(parent_id, professional_id) but no UNIQUE(parent_id). A parent can accumulate multiple active professional records. If the business rule is strictly "1 parent → 1 doctor", add `UNIQUE KEY (parent_id)` or enforce it at application level. — file: `migration_professional_invitations.sql`

- 🟡 **WARNING: Teleconsultation creation does not check professional linkage** — `POST /api/teleconsult` validates user roles but does NOT verify a `professional_invitations` record exists between the parent and professional. — file: `backend/src/controllers/teleconsult.controller.js` line 84-150 — fix: add professional_invitations check before creating appointment

---

## 8. WHAT NEEDS TO BE BUILT — Priority List

### Database changes needed
- [ ] Add `is_read TINYINT(1) DEFAULT 0` column to `messages` table — enables unread count
- [ ] (Optional, if Rule 1 strict) Add `UNIQUE KEY unique_parent (parent_id)` to `professional_invitations` — enforces 1-to-1

### Backend endpoints to create / fix

| Priority | Action | File |
|----------|--------|------|
| 🔴 FIX | `GET /api/child/all` — scope to professional's linked parents via JOIN on `professional_invitations` | `child.controller.js` |
| 🔴 FIX | `POST /api/note` — verify `professional_invitations` link before writing | `note.controller.js` |
| 🔴 FIX | `GET /api/note/child/:childId` — for professional role, verify link via `professional_invitations` | `note.controller.js` |
| 🔴 FIX | `POST /api/message` — verify receiver is the linked professional via `professional_invitations` | `message.controller.js` |
| 🟡 CREATE | `GET /api/admin/relations` — list all professional_invitations with user names (admin only) | new in `admin.routes.js` + `admin.controller.js` |
| 🟡 CREATE | `GET /api/admin/messages` — list all messages with sender/receiver names (admin only) | new in `admin.routes.js` + `admin.controller.js` |
| 🟡 CREATE | `GET /api/admin/notes` — list all clinical notes with professional and child names (admin only) | new in `admin.routes.js` + `admin.controller.js` |
| 🟡 FIX | Analytics child routes — add child ownership / professional-link check | `analyticsRoutes.js` + `analyticsController.js` |
| 🟡 FIX | Analytics doctor routes — restrict to `req.user.id === doctorId` (or admin) | `analyticsRoutes.js` |
| 🟡 CREATE | `GET /api/message/unread-count` — count unread messages for authenticated user | new in `message.routes.js` + `message.controller.js` |
| 🟡 FIX | `POST /api/teleconsult` — verify professional_invitations link | `teleconsult.controller.js` |

### Frontend changes needed
- [ ] `ProfessionalPage.tsx` — Remove fallback to `/api/child/all` (line 118-120); show empty state instead
- [ ] `AdminPanel / adminIndex.html` — Add "Relations" tab showing all professional_invitations
- [ ] `AdminPanel / adminIndex.html` — Add "Messages" tab showing all messages
- [ ] `AdminPanel / adminIndex.html` — Add "Notes" tab showing all clinical notes
- [ ] `ParentDashboard.tsx` / `ProfessionalPage.tsx` — Add unread message badge once unread-count endpoint exists

### Priority order (do this first → last)
1. 🔴 Fix `GET /api/child/all` — most exploitable: any professional can enumerate all children
2. 🔴 Fix `POST /api/note` & `GET /api/note/child/:childId` — clinical data leak between unlinked professionals
3. 🔴 Fix `POST /api/message` — messaging to unlinked professionals
4. 🔴 Remove frontend fallback to `/api/child/all` in `ProfessionalPage.tsx`
5. 🟡 Fix analytics ownership checks (child + doctor endpoints)
6. 🟡 Create `GET /api/admin/relations` — admin visibility of relations
7. 🟡 Create `GET /api/admin/messages` + `GET /api/admin/notes` — admin visibility of content
8. 🟡 Add `is_read` column + `GET /api/message/unread-count` endpoint
9. 🟡 Fix teleconsultation professional-linkage check
10. 🟡 Decide and enforce Rule 1 (1-to-1 vs N-N) at DB level if needed

---

## 9. SUMMARY

| Area | Status | Critical Issues |
|------|--------|----------------|
| DB Relations | 🔧 Partial | 1 — Rule 1 (1 parent → 1 pro) not enforced; N-N join table used instead |
| Message Sync | 🔧 Partial | 2 — no unread tracking, no receiver-link validation |
| Notes Sync | 🔴 Security Risk | 2 — any professional can read/write notes for any child |
| Admin Access | 🔧 Partial | 3 — missing admin views for relations, messages, notes |
| Pro↔Parent Mgmt | ✅ | 0 — invitation system implemented; UIs present on both sides |
| Security | 🔴 Security Risk | 5 — child enumeration, note data leak, analytics ownership, message relay |

---

### Business Rules Verdict

| Rule | Description | Status |
|------|-------------|--------|
| Rule 1 | 1 Parent → exactly 1 Professional | ❌ DB allows N-N; no UNIQUE(parent_id) constraint |
| Rule 2 | 1 Professional → many Parents | ✅ Implemented via professional_invitations |
| Rule 3 | Admin can see/manage ALL relations, messages, notes | ❌ No admin endpoints for messages/notes/relations |
| Rule 4 | Parent ↔ Professional can exchange messages | 🔧 Works but unlinked professionals can also be messaged |
| Rule 5 | Parent receives notes from Professional about child | ✅ GET /api/note/child/:childId with parent ownership check |
| Rule 6 | Professional writes clinical notes visible to linked Parent only | 🔴 Any professional can write/read any child's notes |
| Rule 7 | Parent can ONLY see their own Professional's data | 🔧 Mostly correct except analytics endpoints lack ownership check |
| Rule 8 | Professional can ONLY see their own linked Parents' data | 🔴 GET /api/child/all exposes all children; analytics unscoped |

