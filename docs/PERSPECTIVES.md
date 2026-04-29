# 🚀 AIDAA — Perspectives & Roadmap Projet

**Date de rédaction :** Avril 2026  
**Phase actuelle :** MVP v1.0

---

## 🎯 Vision du Projet

AIDAA est une plateforme numérique d'accompagnement des familles d'enfants avec Troubles du Spectre Autistique (TSA) en Tunisie, combinant outils éducatifs adaptés, communication parent-professionnel et assistance IA bienveillante.

---

## ✅ MVP v1.0 — Fonctionnalités Livrées

### Core Platform
- [x] Authentification JWT multi-rôles (parent, professionnel, admin)
- [x] Gestion des profils enfants (catégorie participant, âge)
- [x] Bibliothèque de contenus adaptés (vidéo, activité, audio)
- [x] Journal d'activités et système de score
- [x] Gamification (badges, récompenses)

### Communication
- [x] Messagerie parent ↔ professionnel
- [x] Notes médicales professionnelles
- [x] Invitation de professionnels par email
- [x] Téléconsultation (planification + salle WebRTC)

### Espace Enfant
- [x] Interface enfant adaptée (AAC, séquences guidées, jeux)
- [x] Symboles AAC par catégorie et profil
- [x] Séquences guidées étape par étape
- [x] Tableau de bord enfant avec gamification

### Analytiques
- [x] Vue d'ensemble parent (sessions, minutes, score, streak)
- [x] Timeline des sessions, répartition par catégorie, scores par catégorie
- [x] Dashboard analytiques professionnel
- [x] Statistiques globales admin

### 🤖 Module IA Chatbot (MVP)
- [x] Chatbot FAQ bilingue FR/AR (18 entrées validées, 7 catégories)
- [x] Pipeline IA : urgence → salutation → recommandation → FAQ → Gemini → fallback
- [x] Garde-fou urgence (50+ mots-clés FR/AR/dialecte TN, numéros secours TN)
- [x] Recommandation de contenus (rule-based, profil enfant)
- [x] IA explicable (champ `explainability` sur chaque réponse)
- [x] Intégration Gemini 1.5 Flash (optionnel, gratuit, un seul token)
- [x] Consentement parental RGPD + audit log
- [x] Anonymisation données enfant dans l'historique
- [x] Widget flottant frontend (React + Tailwind)

---

## 🔮 v1.1 — Améliorations Court Terme (2-3 mois)

### Chatbot IA
- [ ] **ASR (Reconnaissance vocale)** : endpoint `POST /api/chatbot/voice` avec transcription via Whisper (OpenAI gratuit ou local)
- [ ] **TTS (Synthèse vocale)** : lecture audio des réponses du chatbot (Web Speech API côté frontend)
- [ ] **Mémoire conversationnelle** : résumé de session pour continuité entre sessions
- [ ] **Admin FAQ** : interface CRUD pour gérer les entrées FAQ sans redéploiement
- [ ] **Score FAQ amélioré** : TF-IDF ou embeddings légers (sentence-transformers.js)
- [ ] **Détection langue automatique** : détecter FR/AR automatiquement sans paramètre `lang`
- [ ] **Historique multi-sessions** : `GET /api/chatbot/sessions` pour voir toutes les sessions parent

### Plateforme
- [ ] **Notifications push** : alertes pour nouveaux messages, nouvelles notes, téléconsultations
- [ ] **Mode hors-ligne** : PWA avec cache des contenus fréquents (Service Worker)
- [ ] **Export PDF** : rapport de suivi enfant téléchargeable
- [ ] **Recherche contenu** : recherche fulltext dans les contenus
- [ ] **Playlist d'activités** : séquencer plusieurs contenus en une session

### Enfant
- [ ] **TTS pour l'interface enfant** : lecture des symboles AAC à voix haute
- [ ] **Pictogrammes personnalisés** : upload de photos pour les symboles AAC
- [ ] **Mode sombre/contraste élevé** : accessibilité visuelle
- [ ] **Feedback haptique** (mobile) : vibration sur interactions

---

## 🌟 v2.0 — Évolutions Moyen Terme (6-12 mois)

### IA Avancée
- [ ] **Modèle de recommandation ML** : collaborative filtering basé sur les interactions
  - Technologies : TensorFlow.js, scikit-learn (microservice Python/Flask)
- [ ] **Analyse prédictive** : prédire les périodes de difficulté enfant selon les patterns d'activité
- [ ] **Chatbot multimodal** : accepter images (photos de l'enfant dans une situation) pour conseil contextuel
- [ ] **IA émotionnelle** : détection du sentiment dans les messages parent → adapter le ton
- [ ] **Personnalisation automatique** : adapter les contenus recommandés selon le taux de completion et les scores

### Accessibilité & Inclusion
- [ ] **Langue berbère (Tamazight)** : 3ème langue de l'interface
- [ ] **Interface FALC** (Facile À Lire et à Comprendre) : version simplifiée pour parents peu alphabétisés
- [ ] **Support lecteur d'écran** : conformité WCAG 2.1 AA complète
- [ ] **Application mobile native** : React Native (iOS + Android)

### Fonctionnalités Thérapeutiques
- [ ] **Bilan sensoriel numérique** : questionnaire interactif pour identifier les sensibilités de l'enfant
- [ ] **Objectifs thérapeutiques** : SMART goals parent-professionnel avec suivi de progression
- [ ] **Plan d'accompagnement personnalisé (PAP)** : génération automatique basée sur le profil
- [ ] **Partage avec l'école** : export du PAP au format standard éducation nationale TN
- [ ] **Suivi multi-professionnels** : coordination orthophoniste + psychologue + ergothérapeute

### Infrastructure
- [ ] **Architecture microservices** : séparer IA, notifications, analytiques en services indépendants
- [ ] **Cache Redis** : performance des requêtes analytiques et FAQ
- [ ] **Stockage cloud** : AWS S3 / Cloudinary pour les médias (remplace stockage local)
- [ ] **CDN** : accélération livraison contenus vidéo
- [ ] **Tests automatisés** : Jest + Supertest (backend), Vitest + Testing Library (frontend)

---

## 🏛️ v3.0 — Vision Long Terme (12-24 mois)

### Écosystème AIDAA
- [ ] **Réseau de professionnels** : annuaire certifié des thérapeutes tunisiens compatibles AIDAA
- [ ] **Marketplace de contenus** : professionnels peuvent publier leurs propres exercices
- [ ] **Communauté parents** : forum modéré et groupes de soutien
- [ ] **API publique** : permettre aux établissements spécialisés d'intégrer AIDAA

### IA de Recherche
- [ ] **Dataset anonymisé** : contribuer à la recherche sur l'autisme en Afrique du Nord (avec consentement explicite)
- [ ] **Fine-tuning modèle** : entraîner un LLM spécialisé autisme/Maghreb sur les données anonymisées
- [ ] **Détection précoce** : modèle de screening M-CHAT numérique (avec validation médicale)

### Partenariats Institutionnels
- [ ] **Intégration CNAM** : remboursement sessions téléconsultation
- [ ] **Ministère de l'Éducation TN** : pilot écoles inclusives
- [ ] **INPE** : intégration signalement et suivi cases
- [ ] **Expansion régionale** : Maroc, Algérie (adaptation dialecte, contexte culturel)

---

## 🔧 Dette Technique à Adresser

| Priorité | Item | Impact |
|----------|------|--------|
| 🔴 Haute | Ajouter tests unitaires (coverage ≥ 70%) | Qualité, CI/CD |
| 🔴 Haute | Validation Joi/Zod sur tous les endpoints | Sécurité |
| 🟡 Moyenne | Rate limiting (express-rate-limit) | Protection API |
| 🟡 Moyenne | Helmet.js + CSRF protection | Sécurité prod |
| 🟡 Moyenne | Migrations DB versionnées (flyway/knex) | Maintenabilité |
| 🟢 Basse | Swagger/OpenAPI auto-généré | Documentation |
| 🟢 Basse | Logging structuré (Winston + ELK) | Observabilité |
| 🟢 Basse | Docker Compose (dev + prod) | Déploiement |

---

## 📊 KPIs de Succès MVP

| Indicateur | Cible 6 mois |
|-----------|-------------|
| Parents inscrits | > 200 |
| Enfants profilés | > 150 |
| Sessions chatbot | > 500 |
| Taux résolution FAQ | > 70% |
| NPS parents | > 7/10 |
| Professionnels actifs | > 30 |
| Contenus disponibles | > 100 |

---

## 🌍 Impact Social Attendu

- Réduire l'isolement des familles d'enfants TSA en Tunisie
- Démocratiser l'accès à l'information validée sur l'autisme en langue arabe
- Faciliter la coordination entre parents et professionnels de santé
- Contribuer à la détection précoce par l'information accessible
- Modèle réplicable pour l'Afrique du Nord et le monde arabe

---

*Document vivant — mis à jour à chaque release*  
*Contact équipe : aidaa@project.tn*

