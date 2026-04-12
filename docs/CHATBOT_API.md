# 🤖 AIDAA — Module Chatbot IA Parent

**Version MVP** · **Date :** Avril 2026  
**Base URL :** `http://localhost:5000/api/chatbot`  
**Auth :** `Bearer <JWT>` · **Rôle requis :** `parent`

---

## Résumé des endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/consent` | Enregistrer le consentement parental (RGPD) |
| `GET` | `/consent/status` | Vérifier le consentement |
| `POST` | `/session` | Démarrer une session chatbot |
| `POST` | `/message` | Envoyer un message, obtenir une réponse IA |
| `GET` | `/session/:id/history` | Historique de session (anonymisé) |
| `DELETE` | `/session/:id` | Clôturer une session |
| `GET` | `/faq/categories` | Liste des catégories FAQ |
| `GET` | `/recommend/:childId` | Recommandations directes pour un enfant |

---

## Pipeline de traitement des messages

```
message utilisateur
       │
       ▼
 ┌─────────────┐
 │ 1. URGENCE  │──── mots-clés danger/urgence/au secours/... ──► réponse urgence + numéros TN
 └─────────────┘     (guardrail, stop pipeline)
       │
       ▼
 ┌─────────────┐
 │ 2. SALUTATION│──── bonjour/مرحبا/hello ──────────────────► message d'accueil + suggestions
 └─────────────┘
       │
       ▼
 ┌──────────────────┐
 │ 3. RECOMMANDATION│──── activité/vidéo/jeu/exercice/... ──► top 3 contenus du profil enfant
 └──────────────────┘     (filtrés par participant_category, exclusion déjà-vus)
       │
       ▼
 ┌───────────────┐
 │ 4. FAQ MATCH  │──── keyword scoring sur faq_entries ──────► réponse validée + source
 └───────────────┘
       │
       ▼
 ┌─────────────┐
 │ 5. FALLBACK │──────────────────────────────────────────────► catégories disponibles
 └─────────────┘
```

---

## Détail des endpoints

### 1. POST `/consent`

Enregistre le consentement parental (obligatoire avant toute utilisation du chatbot).  
Idempotent — peut être appelé plusieurs fois sans effet.

**Headers :** `Authorization: Bearer <token>`

**Response 201 :**
```json
{
  "success": true,
  "message": "Consentement enregistré. Vous pouvez utiliser le chatbot.",
  "alreadyConsented": false
}
```

---

### 2. GET `/consent/status`

**Response 200 :**
```json
{ "success": true, "consented": true }
```

---

### 3. POST `/session`

Démarre une session chatbot. Vérifie le consentement et optionnellement l'enfant associé.

**Body :**
```json
{ "child_id": 4 }
```
`child_id` est optionnel. Si fourni, doit appartenir au parent authentifié.

**Response 201 :**
```json
{
  "success": true,
  "message": "Session démarrée.",
  "data": { "sessionId": 3 }
}
```

**Errors :**
- `403` : consentement non donné (`requiresConsent: true`)
- `404` : enfant non trouvé ou non autorisé

---

### 4. POST `/message`

Envoie un message et reçoit une réponse du chatbot.

**Body :**
```json
{
  "sessionId": 3,
  "message": "comment utiliser les pictogrammes avec mon enfant ?",
  "lang": "fr"
}
```

`lang` : `"fr"` (défaut) ou `"ar"`  
`message` : max 1000 caractères

**Response 200 — intent: `faq` :**
```json
{
  "success": true,
  "intent": "faq",
  "response": "Les pictogrammes AAC...",
  "source": {
    "category": "Communication & AAC",
    "question": "Comment utiliser les pictogrammes avec mon enfant autiste ?",
    "matchScore": 2
  },
  "explainability": {
    "reason": "Correspondance FAQ trouvée dans la catégorie \"Communication & AAC\" avec un score de 2 mot(s)-clé(s) commun(s).",
    "algorithm": "keyword-matching"
  }
}
```

**Response 200 — intent: `emergency` :**
```json
{
  "success": true,
  "intent": "emergency",
  "response": "⚠️ Situation d'urgence détectée\n\n...\n• SAMU : 190\n• Aide enfants (INPE) : 71 391 666",
  "explainability": {
    "reason": "Mots-clés d'urgence détectés. Refus automatique — redirection vers secours.",
    "guardrail": true
  }
}
```

**Response 200 — intent: `recommendation` :**
```json
{
  "success": true,
  "intent": "recommendation",
  "response": "Voici 3 contenu(s) recommandé(s)...",
  "data": [
    { "id": 1, "title": "Activité sensorielle", "type": "activity", "emoji": "🎯", "url": "...", "description": "..." },
    { "id": 2, "title": "Vidéo communication", "type": "video", "emoji": "📹", "url": "...", "description": "..." }
  ],
  "explainability": {
    "reason": "Recommandation basée sur : profil \"enfant\", contenus non encore consultés, niveau croissant.",
    "algorithm": "rule-based-profile-filter"
  }
}
```

**Response 200 — intent: `greeting` :**
```json
{
  "success": true,
  "intent": "greeting",
  "response": "Bonjour ! 👋 Je suis l'assistant IA d'AIDAA...",
  "suggestions": [
    "Comment utiliser les pictogrammes AAC ?",
    "Suggère-moi une activité",
    "Droits scolaires de mon enfant"
  ]
}
```

**Intents possibles :** `faq` · `emergency` · `recommendation` · `greeting` · `unknown`

---

### 5. GET `/session/:sessionId/history`

Retourne l'historique des messages de la session.  
**Anonymisé** : le `child_id` n'est jamais exposé (conformité RGPD).

**Response 200 :**
```json
{
  "success": true,
  "data": {
    "sessionId": 3,
    "startedAt": "2026-04-12T10:30:00.000Z",
    "endedAt": null,
    "messages": [
      { "id": 1, "sender": "user", "message_text": "comment utiliser les pictogrammes ?", "intent": "faq", "created_at": "..." },
      { "id": 2, "sender": "bot",  "message_text": "Les pictogrammes AAC...", "intent": "faq", "created_at": "..." }
    ]
  }
}
```

---

### 6. DELETE `/session/:sessionId`

Clôture la session (marque `ended_at`).

**Response 200 :**
```json
{ "success": true, "message": "Session clôturée." }
```

---

### 7. GET `/faq/categories`

**Response 200 :**
```json
{
  "success": true,
  "data": [
    "Activités quotidiennes",
    "Application AIDAA",
    "Communication & AAC",
    "Droits et scolarisation",
    "Gestion des comportements",
    "Ressources thérapeutiques",
    "Santé et bien-être"
  ]
}
```

---

### 8. GET `/recommend/:childId?limit=5`

Recommandations directes sans session.

**Response 200 :**
```json
{
  "success": true,
  "data": {
    "child": { "id": 4, "name": "Mohamed", "category": "enfant", "age": 6 },
    "recommendations": [
      { "id": 1, "title": "Activité sensorielle", "type": "activity", ... }
    ],
    "algorithm": {
      "type": "rule-based-profile-filter",
      "description": "Contenus filtrés par catégorie de participant, non encore consultés, triés par niveau croissant."
    }
  }
}
```

---

## Tables de base de données

| Table | Rôle |
|-------|------|
| `chatbot_consent_log` | Audit RGPD — consentement parental (ip, user-agent, date) |
| `chatbot_sessions` | Sessions chatbot (parent → enfant, consent_verified, timestamps) |
| `chatbot_messages` | Messages individuels avec intent classifié, anonymisés |
| `faq_entries` | Base de connaissances validée bilingue FR/AR (18 entrées) |

---

## Contraintes de sécurité (1.7)

| Contrainte | Implémentation |
|-----------|---------------|
| **Consentement parental obligatoire** | `POST /consent` requis → 403 sinon |
| **Anonymisation enfant** | `child_id` jamais retourné dans l'historique |
| **Audit trail** | `chatbot_consent_log` + `activity_logs` (actions `chatbot_consent`, `chatbot_emergency_triggered`) |
| **Garde-fou urgence** | Détection multilingue FR/AR/dialecte TN → refus + numéros secours |
| **IA explicable** | Champ `explainability` dans chaque réponse (raison, algorithme, score) |
| **Validation JWT + rôle** | `auth` + `roleCheck('parent')` sur toutes les routes |
| **Rate-limiting messages** | max 1000 caractères par message |

---

## Seeder FAQ

```bash
# Insérer les 18 entrées FAQ bilingues
cd backend
npm run seed:faq
```

**Catégories (7) :**
1. Communication & AAC
2. Gestion des comportements
3. Activités quotidiennes
4. Ressources thérapeutiques
5. Droits et scolarisation
6. Santé et bien-être
7. Application AIDAA

---

## Roadmap post-MVP

- [ ] **ASR/TTS** : `POST /api/chatbot/voice` → transcription Whisper → même pipeline
- [ ] **Score FAQ amélioré** : TF-IDF ou embeddings légers (sentence-transformers)
- [ ] **Historique multi-sessions** parent : `GET /api/chatbot/sessions`
- [ ] **Admin FAQ** : CRUD sur `faq_entries` via panel admin
- [ ] **Langue automatique** : détection automatique FR/AR sans paramètre `lang`

