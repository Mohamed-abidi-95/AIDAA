# 🔧 AIDAA - PLAN DE CORRECTION CRUD COMPLET

**Objectif:** Passer de 59% à 100% CRUD  
**Temps Estimé:** 6-8 heures  
**Priorité:** HAUTE

---

## 🎯 PHASE 1: CORRECTION DES COLLISIONS (1h)

### 1.1 Résoudre collision Users/Admin
**Fichiers affectés:**
- backend/src/routes/user.routes.js
- backend/src/routes/admin.routes.js
- backend/src/controllers/user.controller.js
- backend/src/controllers/admin.controller.js

**Action:**
- Déplacer createParent/createProfessional vers user.controller.js
- Garder seulement actions admin-spécifiques dans admin.controller.js
- Routes: POST /api/users avec `role` param

---

### 1.2 Standardiser password handling
**Approche:**
```javascript
// AVANT (2 approches)
// Admin: NULL password → set later
// User: Hash password immédiatement

// APRÈS (1 approche)
// Tous: Hash password immédiatement
```

---

### 1.3 Standardiser naming (Routes)
**Avant:**
```
GET /api/child/mychildren
GET /api/activity-log/child/:id
GET /api/teleconsult/my
```

**Après:**
```
GET /api/children/my
GET /api/activity-logs/child/:id
GET /api/teleconsultations/my
```

---

## 🔨 PHASE 2: IMPLÉMENTER DELETE MANQUANTS (2h)

### 2.1 Users DELETE
**Endpoint:** DELETE /api/users/:id
**Logic:**
```javascript
// Vérifier user existe
// Vérifier permission (admin only)
// Soft delete (set is_active = 0) OU hard delete
// Retourner 200 success
```

**Fichiers:**
- user.model.js → Ajouter deleteUser()
- user.controller.js → Ajouter deleteUser()
- user.routes.js → Ajouter route

---

### 2.2 Notes DELETE
**Endpoint:** DELETE /api/note/:id
**Logic:**
```javascript
// Vérifier note existe
// Vérifier permission (professional only)
// Supprimer la note
// Retourner 200 success
```

**Fichiers:**
- note.controller.js → Ajouter deleteNote()
- note.routes.js → Ajouter route

---

### 2.3 Messages DELETE
**Endpoint:** DELETE /api/message/:id
**Logic:**
```javascript
// Vérifier message existe
// Vérifier permission (sender or admin)
// Supprimer le message
// Retourner 200 success
```

**Fichiers:**
- message.controller.js → Ajouter deleteMessage()
- message.routes.js → Ajouter route

---

### 2.4 Activity Logs DELETE
**Endpoint:** DELETE /api/activity-log/:id
**Logic:**
```javascript
// Vérifier log existe
// Vérifier permission (admin or parent)
// Supprimer le log
// Retourner 200 success
```

**Fichiers:**
- activityLog.model.js → Ajouter deleteLog()
- activityLog.controller.js → Ajouter deleteLog()
- activityLog.routes.js → Ajouter route

---

### 2.5 Teleconsult DELETE
**Endpoint:** DELETE /api/teleconsult/:id
**Logic:**
```javascript
// Vérifier consultation existe
// Vérifier permission
// Soft delete (set status = 'cancelled') OU hard delete
// Retourner 200 success
```

**Fichiers:**
- teleconsult.model.js → Ajouter deleteTeleconsult()
- teleconsult.controller.js → Ajouter deleteTeleconsult()
- teleconsult.routes.js → Ajouter route

---

## ✏️ PHASE 3: IMPLÉMENTER UPDATE MANQUANTS (2h)

### 3.1 Notes UPDATE
**Endpoint:** PUT /api/note/:id
**Body:** { content }
**Logic:**
```javascript
// Vérifier note existe
// Vérifier permission (creator only)
// Mettre à jour contenu
// Update timestamp
// Retourner 200 updated note
```

**Fichiers:**
- note.controller.js → Ajouter updateNote()
- note.routes.js → Ajouter route

---

### 3.2 Messages UPDATE
**Endpoint:** PUT /api/message/:id
**Body:** { content }
**Note:** Rarement utilisé (préférer nouveau message)
**Logic:**
```javascript
// Vérifier message existe
// Vérifier permission (sender only)
// Mettre à jour contenu
// Retourner 200 updated message
```

**Fichiers:**
- message.controller.js → Ajouter updateMessage()
- message.routes.js → Ajouter route

---

### 3.3 Users UPDATE
**Endpoint:** PUT /api/users/:id
**Body:** { name, email, role, is_active }
**Logic:**
```javascript
// Vérifier user existe
// Vérifier permission (admin only)
// Valider données
// Vérifier email unique
// Mettre à jour user
// Retourner 200 updated user
```

**Fichiers:**
- user.model.js → Ajouter updateUser()
- user.controller.js → Ajouter updateUser()
- user.routes.js → Ajouter route

---

## 🎮 PHASE 4: GAMES MODULE COMPLET (2h)

### 4.1 Games Model
**Fichier:** backend/src/models/game.model.js

```javascript
// Fonctions nécessaires:
getAll()           // GET all games
getById()          // GET single game
create()           // CREATE game
update()           // UPDATE game
deleteGame()       // DELETE game
getByType()        // Filter by type
```

---

### 4.2 Games Controller
**Fichier:** backend/src/controllers/game.controller.js

```javascript
// Endpoints:
getAll()           // GET /api/games
getById()          // GET /api/games/:id
create()           // POST /api/games (admin)
update()           // PUT /api/games/:id (admin)
deleteGame()       // DELETE /api/games/:id (admin)
getByType()        // GET /api/games?type=color_match
```

---

### 4.3 Games Routes
**Fichier:** backend/src/routes/game.routes.js

```javascript
router.get('/')                    // List all
router.get('/:id')                 // Get single
router.post('/', auth, admin)      // Create
router.put('/:id', auth, admin)    // Update
router.delete('/:id', auth, admin) // Delete
router.get('/type/:type')          // Filter
```

---

### 4.4 Games Table Verification
```sql
-- Vérifier que la table games existe:
SHOW TABLES LIKE 'games';

-- Vérifier les colonnes:
DESCRIBE games;

-- Vérifier les données:
SELECT * FROM games;
```

---

## 📋 CHECKLIST AVANT IMPLÉMENTATION

- [ ] Lire tous les fichiers de routes
- [ ] Vérifier les middlewares auth/roleCheck
- [ ] Vérifier les modèles existants
- [ ] Identifier les patterns utilisés
- [ ] Préparer les templates

---

## 🚀 ORDRE D'IMPLÉMENTATION RECOMMANDÉ

### Jour 1 (4h)
1. Corriger les collisions (1h)
2. Implémenter 5 DELETE (2h)
3. Tester les DELETE (1h)

### Jour 2 (4h)
1. Implémenter 3 UPDATE (1.5h)
2. Implémenter Games CRUD (2h)
3. Tester les nouveaux endpoints (0.5h)

---

## 📊 RÉSULTAT FINAL ATTENDU

```
Users:         UPDATE + DELETE ajoutés → 100% ✅
Notes:         UPDATE + DELETE ajoutés → 100% ✅
Messages:      UPDATE + DELETE ajoutés → 100% ✅
Activity Logs: DELETE ajouté → 100% ✅
Teleconsult:   DELETE ajouté → 100% ✅
Games:         CRUD complet créé → 100% ✅
GLOBAL:        100% CRUD ✅
```

---

## 🎯 COMMANDES À EXÉCUTER

```bash
# Vérifier database
mysql -u root aidaa_db -e "SHOW TABLES;"
mysql -u root aidaa_db -e "DESCRIBE games;"

# Créer nouveaux fichiers
touch backend/src/models/game.model.js
touch backend/src/controllers/game.controller.js
touch backend/src/routes/game.routes.js

# Tester après chaque changement
cd backend && npm run dev
```

---

## ✨ NOTES IMPORTANTES

1. **Permissions:** Vérifier qui peut faire quoi
2. **Soft vs Hard Delete:** Décider approche
3. **Timestamps:** Ajouter updated_at
4. **Validations:** Input validation stricte
5. **Errors:** Messages d'erreur clairs

---

**Prêt à commencer la correction?** 🚀

