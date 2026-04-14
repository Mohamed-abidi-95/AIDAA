# 🎨 AIDAA — Guide de Présentation Canva
> **Thème Canva recommandé :** *"Modern Pitch Deck"* ou *"Tech Startup Presentation"*
> **Palette de couleurs :** Vert émeraude `#10B981` · Orange `#F97316` · Ardoise `#0F172A` · Blanc `#FFFFFF`
> **Police :** Inter (titres en Bold 700, corps en Regular 400)
> **Format :** 16:9 — 1920 × 1080 px

---

## 📋 Table des scénarios

| # | Scénario | Rôle | Pages à capturer |
|---|----------|------|-----------------|
| 1 | Couverture & présentation | — | — |
| 2 | Vue d'ensemble architecture | — | Schéma |
| 3 | Inscription & Connexion | Tous | `/login` · `/signup` |
| 4 | Sélection de rôle | Tous | `/role-selection` |
| 5 | Tableau de bord Parent | Parent 🟢 | `/parent/dashboard` |
| 6 | Gestion des enfants | Parent 🟢 | Dashboard → onglet Résumé |
| 7 | Inviter un professionnel | Parent 🟢 | Dashboard → Mon professionnel |
| 8 | Analytiques enfant | Parent 🟢 | `/progress` |
| 9 | Chatbot IA | Parent 🟢 | Widget chatbot ouvert |
| 10 | Messagerie parent↔pro | Parent 🟢 | Dashboard → Messages |
| 11 | Tableau de bord Professionnel | Pro 🟠 | `/professional/dashboard` |
| 12 | Liste des patients | Pro 🟠 | Dashboard → Mes patients |
| 13 | Notes cliniques | Pro 🟠 | Dashboard → Notes |
| 14 | Analytiques professionnel | Pro 🟠 | Dashboard → Analytiques |
| 15 | Téléconsultation — Liste | Pro 🟠 | `/professionnel/teleconsultation` |
| 16 | Téléconsultation — Planifier | Pro 🟠 | `/professionnel/teleconsultation/planifier` |
| 17 | Téléconsultation — Salle | Pro 🟠 | `/professionnel/teleconsultation/:id` |
| 18 | Espace Enfant — Accueil | Enfant 🔵 | `/child` |
| 19 | Bibliothèque de contenu | Enfant 🔵 | Onglet Bibliothèque |
| 20 | Jeux thérapeutiques | Enfant 🔵 | Onglet Jeux |
| 21 | Jeu EmotionGame | Enfant 🔵 | Jeu ouvert |
| 22 | Communication AAC | Enfant 🔵 | Onglet AAC |
| 23 | Séquences guidées | Enfant 🔵 | Onglet Séquences |
| 24 | Panel Admin — Vue globale | Admin 🔴 | `/admin/dashboard` |
| 25 | Admin — Gestion contenu | Admin 🔴 | Onglet Contenu |
| 26 | Admin — Gestion utilisateurs | Admin 🔴 | Onglet Utilisateurs |
| 27 | Admin — Validations | Admin 🔴 | Onglet Inscriptions |
| 28 | Admin — Relations | Admin 🔴 | Onglet Relations |
| 29 | Architecture technique | — | Schéma stack |
| 30 | Sécurité & API | — | Schéma sécurité |
| 31 | Base de données | — | Schéma BDD |
| 32 | Bilan & chiffres clés | — | — |
| 33 | Conclusion & Perspectives | — | — |

---

## 🖼️ Scénarios détaillés

---

### Slide 1 — Couverture

**Titre principal :**
```
AIDAA
Plateforme Numérique d'Accompagnement des Enfants Autistes
```

**Sous-titre :**
```
Application Web Full-Stack · React · Node.js · MySQL
Année 2025–2026
```

**Éléments visuels :**
- Logo AIDAA centré (grand format)
- Fond dégradé : `#0F172A` → `#1E3A5F`
- Trois icônes flottantes : 🧒 enfant · 👨‍👩‍👦 parent · 🩺 professionnel
- Barre de couleur en bas : vert `#10B981` + orange `#F97316`

**📸 Pas de screenshot — slide de design pur**

---

### Slide 2 — Vue d'ensemble de l'architecture

**Titre :** `Comment fonctionne AIDAA ?`

**Texte :**
```
4 acteurs, une plateforme unique
• 👨‍👩‍👦 Parent       — Suit la progression, invite un professionnel
• 🩺 Professionnel — Suit les patients, planifie des téléconsultations
• 🧒 Enfant        — Joue, apprend et progresse
• 🔧 Admin         — Gère le contenu et les utilisateurs
```

**Éléments visuels :**
- Diagramme central : 4 boîtes colorées reliées à un hub "AIDAA"
  - Boîte verte → Parent
  - Boîte orange → Professionnel
  - Boîte bleue → Enfant
  - Boîte rouge → Admin
- Flèches bidirectionnelles entre Parent ↔ Professionnel (invitation)
- Flèche Parent → Enfant (suivi)

**📸 Pas de screenshot — créer un diagramme dans Canva**

---

### Slide 3 — Inscription & Connexion

**Titre :** `Accès sécurisé à la plateforme`

**Texte gauche :**
```
✅ Authentification JWT (7 jours)
✅ Inscription parent en libre-service
✅ Inscription professionnelle validée par admin
✅ Réinitialisation mot de passe par email
✅ Rate limiting : 20 tentatives / 15 min
```

**📸 Screenshots à capturer (2 images côte à côte) :**
1. **Page `/login`** — formulaire email + mot de passe, logo AIDAA, bouton vert
2. **Page `/signup`** — formulaire d'inscription avec sélection parent/professionnel

**Disposition Canva :** Image gauche 50% · Texte droit 50%

---

### Slide 4 — Sélection de rôle

**Titre :** `Chaque utilisateur accède à son espace dédié`

**Texte :**
```
Après connexion, redirection automatique selon le rôle :
• Parent     → Tableau de bord vert /parent/dashboard
• Professionnel → Espace orange /professional/dashboard
• Admin      → Panel rouge /admin/dashboard
• Enfant     → Espace jeux bleu /child
```

**📸 Screenshot à capturer :**
- Page `/role-selection` — les 4 cartes de sélection de rôle

**Disposition Canva :** Screenshot plein écran avec texte en overlay

---

### Slide 5 — Tableau de bord Parent

**Titre :** `L'espace parent — Suivi complet`

**Texte :**
```
Dashboard parent (thème vert émeraude)
• Vue résumé : enfants + activités récentes
• Suivi analytique en temps réel
• Messagerie directe avec le professionnel
• Gestion des invitations professionnelles
• Assistant IA intégré (Chatbot)
```

**📸 Screenshots à capturer (2 images) :**
1. **Vue complète** du dashboard parent — sidebar verte, section résumé, cartes statistiques
2. **Onglet activités** — liste des activités récentes de l'enfant

**Disposition Canva :** Grande image à gauche (60%) · Bullets à droite (40%)

---

### Slide 6 — Gestion des enfants

**Titre :** `Profil enfant — Suivi personnalisé`

**Texte :**
```
Chaque enfant a son profil complet :
• Nom, âge, catégorie de participation
  (Enfant / Jeune / Adulte)
• Historique des activités jouées
• Scores et progrès par compétence
• Notes médicales du professionnel
• Accès direct à l'espace enfant
```

**📸 Screenshots à capturer :**
1. **Modal de création / édition d'enfant** dans le dashboard parent
2. **Carte enfant** affichée dans le résumé avec statistiques

**Disposition Canva :** 2 images empilées à droite · Texte à gauche

---

### Slide 7 — Inviter un professionnel

**Titre :** `Collaboration Parent ↔ Professionnel`

**Texte :**
```
Flux d'invitation en 3 étapes :

1️⃣  Parent saisit nom + email du professionnel
2️⃣  Email automatique envoyé avec lien d'activation
3️⃣  Le professionnel crée son mot de passe
     → Invitation activée automatiquement ✅

Statuts : pending → active → revoked
```

**📸 Screenshots à capturer :**
1. **Formulaire d'invitation** dans le dashboard parent — champs nom + email
2. **Carte professionnel** après invitation — badge statut "Actif" ou "En attente"

**Disposition Canva :** Flèche entre les 2 screenshots (flux gauche → droite)

---

  ### Slide 8 — Analytiques enfant

**Titre :** `Tableau de bord de progression`

**Texte :**
```
4 indicateurs clés en temps réel :
📊 Sessions jouées     — total cumulé
⏱️  Temps total         — en heures
⭐  Score moyen / 100   — toutes activités
🔥  Jours consécutifs  — streak actif

+ 3 graphiques Chart.js :
  • Courbe temporelle (minutes/session)
  • Camembert répartition des activités
  • Barres scores par catégorie
```

**📸 Screenshots à capturer :**
1. **Page `/progress`** — vue d'ensemble avec les 4 KPI cards
2. **Zoom sur les 3 graphiques** (ligne + donut + barres)

**Disposition Canva :** Plein écran screenshot avec callouts flottants

---

### Slide 9 — Chatbot IA

**Titre :** `Assistant IA parental — Support 24/7`

**Texte :**
```
Widget chatbot intégré au dashboard parent
• FAQ autisme & ressources spécialisées
• Recommandations de contenu personnalisées
• Détection des situations d'urgence 🚨
• Support bilingue Français / Arabe 🇫🇷 🇹🇳
• Flux : Consentement RGPD → Session → Chat
```

**📸 Screenshots à capturer :**
1. **Bouton flottant** en bas à droite avec pastille verte "En ligne"
2. **Panneau chat ouvert** avec une conversation exemple

**Disposition Canva :** 2 mockups mobile côte à côte sur fond sombre

---

### Slide 10 — Messagerie parent↔professionnel

**Titre :** `Communication directe & sécurisée`

**Texte :**
```
Messagerie intégrée temps réel
• Chat parent ↔ professionnel par enfant
• Historique complet des échanges
• Badge messages non lus
• Expéditeur identifié (nom + rôle)
• Horodatage de chaque message
```

**📸 Screenshots à capturer :**
1. **Vue MessagerieView** — liste des conversations + chat ouvert
2. **Bulle de message** en détail (envoi/réception)

**Disposition Canva :** Grande image centrée avec cadre arrondi

---

### Slide 11 — Tableau de bord Professionnel

**Titre :** `L'espace professionnel — Gestion des patients`

**Texte :**
```
Dashboard professionnel (thème orange)
• Sidebar avec 6 sections de navigation
• Vue patients avec sélecteur actif
• 4 statistiques globales en temps réel
• Accès direct aux dossiers patients
• Téléconsultation intégrée
```

**📸 Screenshots à capturer :**
1. **Vue complète** du dashboard pro — sidebar orange, stats, liste patients
2. **Sidebar** en détail — navigation + liste des patients

**Disposition Canva :** Image plein écran + zoom callout sur la sidebar

---

### Slide 12 — Liste des patients

**Titre :** `Suivi multi-patients centralisé`

**Texte :**
```
Pour chaque patient :
• Nom, âge, catégorie de participation
• Dernières activités & scores
• Accès aux notes cliniques
• Visualisation de la progression
• Liaison via invitation parent
```

**📸 Screenshots à capturer :**
1. **Panel patients** — liste avec cartes patients sélectionnables
2. **Détail activités** d'un patient — tableau avec scores

**Disposition Canva :** 2 colonnes égales

---

### Slide 13 — Notes cliniques

**Titre :** `Documentation médicale structurée`

**Texte :**
```
Notes cliniques par enfant
• Rédaction libre par le professionnel
• Horodatage automatique
• Visible par le parent dans son dashboard
• Historique complet consultable
• Saisie rapide depuis le dashboard
```

**📸 Screenshots à capturer :**
1. **Formulaire de saisie** de note clinique
2. **Liste des notes** dans le dashboard parent (vue lecture)

**Disposition Canva :** Avant (pro écrit) → Après (parent lit) — flèche centrale

---

### Slide 14 — Analytiques professionnel

**Titre :** `Analyse des performances thérapeutiques`

**Texte :**
```
Vue analytique du professionnel :
• Vue d'ensemble : patients actifs, sessions,
  score moyen, heures totales
• Progression individuelle par patient
• Scores comparatifs entre patients
• Fréquence des sessions dans le temps
• Export visuel Chart.js
```

**📸 Screenshots à capturer :**
1. **Page AnalytiquesProfessionnel** — KPIs en haut
2. **Graphiques** progression patient + comparaison

**Disposition Canva :** Screenshot large avec annotations colorées

---

### Slide 15 — Téléconsultation — Liste des sessions

**Titre :** `Téléconsultation — Gestion des sessions`

**Texte :**
```
4 statuts de session :
🔵 Planifiée  — date future > 1h
🟢 En cours   — dans la fenêtre d'1 heure
✅ Terminée   — session passée

Statistiques en temps réel :
• Sessions totales · Planifiées · En cours · Terminées
```

**📸 Screenshots à capturer :**
1. **Page TeleconsultationList** — tableau des sessions avec badges de statut
2. **Cartes statistiques** en haut (4 KPIs)

**Disposition Canva :** Grande capture avec zoom sur les badges de statut

---

### Slide 16 — Planifier une session

**Titre :** `Planification en quelques clics`

**Texte :**
```
Formulaire de planification :
1️⃣  Sélectionner le patient (liste déroulante)
2️⃣  Choisir la date (calendrier)
3️⃣  Définir l'heure
4️⃣  Durée : 30 / 45 / 60 minutes
5️⃣  Notes optionnelles
→ Lien Meet généré automatiquement ✅
```

**📸 Screenshots à capturer :**
1. **Page TeleconsultationSchedule** — formulaire complet
2. **Boutons durée** en détail (30/45/60 min sélecteur)

**Disposition Canva :** Formulaire centré sur fond orange dégradé

---

### Slide 17 — Salle de téléconsultation

**Titre :** `Salle virtuelle de consultation`

**Texte :**
```
Interface de la salle de réunion :
🎥 Zone vidéo principale (patient)
📷 Aperçu caméra locale (médecin)
🎤 Contrôle micro ON/OFF
📷 Contrôle caméra ON/OFF
🖥️  Partage d'écran
💬 Chat en temps réel intégré
📋 Infos patient + lien réunion + notes
```

**📸 Screenshots à capturer :**
1. **Page TeleconsultationRoom** — vue complète salle sombre
2. **Panneau latéral** — infos patient + chat

**Disposition Canva :** Image sombre large avec callouts lumineux

---

### Slide 18 — Espace Enfant — Accueil

**Titre :** `Un espace conçu pour les enfants autistes`

**Texte :**
```
Interface enfant adaptée :
• Design simple, intuitif et coloré
• 4 modules principaux accessibles
• Navigation par grandes tuiles cliquables
• Retour parental possible à tout moment
• Adapté aux différents niveaux (enfant/jeune/adulte)
```

**📸 Screenshots à capturer :**
1. **Page `/child`** — vue d'ensemble avec les 4 modules
2. **Tuiles de navigation** en gros plan

**Disposition Canva :** Screenshot + 4 icônes modules en overlay

---

### Slide 19 — Bibliothèque de contenu

**Titre :** `Ressources thérapeutiques multimédia`

**Texte :**
```
Bibliothèque de contenu :
📹 Vidéos éducatives
🎯 Activités interactives
🔍 Filtrage par catégorie
📊 Progression enregistrée automatiquement
✅ Contenu validé par les professionnels
   (via panel admin)
```

**📸 Screenshots à capturer :**
1. **Onglet Bibliothèque** dans l'espace enfant
2. **Carte de contenu** en détail — miniature + titre + catégorie

**Disposition Canva :** Grille de cartes avec fond bleu clair

---

### Slide 20 — Jeux thérapeutiques

**Titre :** `Apprentissage par le jeu — 8 mini-jeux`

**Texte :**
```
8 mini-jeux thérapeutiques :
🎭 Devine l'émotion       → intelligence émotionnelle
🔤 Jeu de mots            → vocabulaire & langage
🎨 Tri des couleurs        → discrimination visuelle
🔢 Séquences numériques   → logique & mémoire
🐾 Mémoire animaux         → concentration
🟦 Formes géométriques    → reconnaissance spatiale
🔊 Écoute & réponds        → compréhension auditive
⚡ Réaction rapide          → motricité & réflexes

Système de score + streak + badges 🏅
```

**📸 Screenshots à capturer :**
1. **Grille des 8 jeux** — tuiles colorées dans l'espace enfant
2. **Un jeu en cours** — interface de jeu active

**Disposition Canva :** 2 colonnes — liste à gauche, screenshot à droite

---

### Slide 21 — EmotionGame en détail

**Titre :** `"Devine l'émotion" — Cas d'usage`

**Texte :**
```
Déroulement d'une partie :
1️⃣  Lecture d'une situation ("Ton ami te fait un câlin")
2️⃣  Choix parmi 4 émotions avec emojis
3️⃣  Feedback immédiat ✅ ou ❌
4️⃣  Bonus série si 2+ bonnes réponses consécutives
5️⃣  Score final + message d'encouragement

8 tours · 12 scénarios · Score max 120 pts
```

**📸 Screenshots à capturer :**
1. **EmotionGame en cours** — scenario affiché + 4 choix d'émojis
2. **Écran de fin** — score final + "Super travail !"

**Disposition Canva :** Les 2 captures côte à côte en mockup téléphone

---

### Slide 22 — Communication AAC

**Titre :** `Communication Augmentative & Alternative`

**Texte :**
```
Outil AAC pour les enfants non-verbaux :
🖼️  Pictogrammes illustrés par catégorie
👆  Sélection tactile simple
🔊  Synthèse vocale des symboles
📁  Organisation par catégories thématiques
✏️  Symboles personnalisables par l'admin
```

**📸 Screenshots à capturer :**
1. **Grille AAC** — pictogrammes organisés par catégorie
2. **Symbole sélectionné** — mise en évidence + phrase construite

**Disposition Canva :** Grande capture avec fond très clair

---

### Slide 23 — Séquences guidées

**Titre :** `Routines structurées — Apprentissage progressif`

**Texte ️:**
```
Séquences d'activités guidées :
📋 Liste d'étapes ordonnées
▶️  Navigation pas à pas
✅  Validation de chaque étape
📈  Progression sauvegardée en BDD
🎯  Objectifs thérapeutiques définis par le pro
```

**📸 Screenshots à capturer :**
1. **Liste des séquences** disponibles
2. **Séquence en cours** — étape active avec bouton "Suivant"

**Disposition Canva :** Flèche de progression entre les 2 états

---

### Slide 24 — Panel Admin — Vue globale

**Titre :** `Administration centralisée de la plateforme`

**Texte :**
```
Tableau de bord admin :
👥  Total utilisateurs inscrits
✅  Comptes approuvés
⏳  Inscriptions en attente
👨‍👩‍👦  Nombre de parents actifs
🩺  Nombre de professionnels actifs
🧒  Nombre d'enfants enregistrés

Accès complet à toutes les données
```

**📸 Screenshots à capturer :**
1. **Page AdminPanel** — vue globale avec les 6 cartes statistiques
2. **Barre de navigation** des onglets admin en gros plan

**Disposition Canva :** Screenshot plein écran avec highlight sur les stats

---

### Slide 25 — Admin — Gestion du contenu

**Titre :** `Gestion du contenu éducatif`

**Texte :**
```
CRUD complet du contenu :
➕  Créer vidéo ou activité
✏️  Modifier titre, description, catégorie
🎬  Upload vidéo (stockage local)
🗑️  Supprimer le contenu
🔍  Filtrer par type et catégorie
📎  Prévisualisation intégrée
```

**📸 Screenshots à capturer :**
1. **Onglet Contenu** de l'admin — liste des contenus avec actions
2. **Modal de création** de contenu — formulaire avec upload

**Disposition Canva :** 2 captures empilées verticalement

---

### Slide 26 — Admin — Gestion des utilisateurs

**Titre :** `Contrôle total des accès`

**Texte :**
```
Gestion des utilisateurs :
👁️  Voir tous les comptes (parents + pros + admins)
✅  Activer / désactiver un compte
🔑  Réinitialiser un mot de passe
🗑️  Supprimer définitivement un compte
🔍  Recherche par nom ou email
📊  Filtrage par rôle et statut
```

**📸 Screenshots à capturer :**
1. **Onglet Utilisateurs** — tableau avec les colonnes nom/email/rôle/statut
2. **Actions utilisateur** — boutons activer/désactiver/supprimer

**Disposition Canva :** Tableau large avec highlight sur les boutons d'action

---

### Slide 27 — Admin — Validation des inscriptions

**Titre :** `Validation des comptes professionnels`

**Texte :**
```
Processus d'approbation :

1️⃣  Professionnel s'inscrit → statut "pending"
2️⃣  Admin reçoit la demande dans le panel
3️⃣  Admin vérifie les informations
4️⃣  Admin approuve ✅ ou rejette ❌
5️⃣  Professionnel peut accéder à sa session

Sécurité : aucun professionnel non approuvé
           n'accède à la plateforme
```

**📸 Screenshots à capturer :**
1. **Onglet Inscriptions** — liste des demandes en attente avec badges
2. **Boutons Approuver/Rejeter** en gros plan

**Disposition Canva :** Flux en 5 étapes avec icônes + screenshot

---

### Slide 28 — Admin — Relations parent↔professionnel

**Titre :** `Supervision des relations thérapeutiques`

**Texte :**
```
Vue des relations actives :
• Tableau parent ↔ professionnel ↔ enfants
• Statut de chaque lien (active / pending / revoked)
• Date de création de la relation
• Nombre d'enfants suivis par lien
• Possibilité de révoquer depuis l'admin
```

**📸 Screenshots à capturer :**
1. **Onglet Relations** dans l'admin — tableau des liaisons
2. **Détail d'une relation** — parent + pro + enfants

**Disposition Canva :** Tableau avec lignes colorées selon statut

---

### Slide 29 — Architecture technique

**Titre :** `Stack technique — Full-Stack moderne`

**Texte :**
```
Frontend                    Backend
────────────────────────    ──────────────────────
⚛️  React 18 + TypeScript   🟢 Node.js + Express
⚡  Vite (build)             🔐 JWT Authentication
🎨 Tailwind CSS             📦 Multer (upload)
📊 Chart.js (graphiques)    📧 Nodemailer (email)
🔤 FontAwesome (icônes)     🛡️ Helmet + Rate Limit
🧭 React Router v6

Base de données             Infrastructure
────────────────────────    ──────────────────────
🗄️  MySQL 8                  🏠 Localhost (dev)
14 tables auto-migrées      📁 Uploads locaux
Joins optimisés             🔄 Auto-migration
```

**Éléments visuels :**
- Diagramme 3 couches : Frontend → API REST → MySQL
- Badges technologiques colorés
- Flèches HTTP et JWT

**📸 Pas de screenshot — créer un diagramme dans Canva**

---

### Slide 30 — Sécurité & API

**Titre :** `Sécurité multicouche`

**Texte :**
```
Protections implémentées :

🛡️  Helmet.js
    En-têtes HTTP sécurisés (XSS, clickjacking…)

⏱️  Rate Limiting (express-rate-limit)
    • 200 requêtes / 15 min — routes générales
    • 20 tentatives / 15 min — authentification

🔐 JWT (JSON Web Token)
    Expiration 7 jours · Signature secrète

🔑  bcryptjs
    Hash des mots de passe (12 rounds)

🔒 CORS configuré
    Origines autorisées explicites
```

**Éléments visuels :**
- 5 boucliers colorés avec icônes
- Fond sombre avec lignes de code en filigrane

**📸 Pas de screenshot — slide design**

---

### Slide 31 — Schéma de base de données

**Titre :** `Base de données — 14 tables interconnectées`

**Texte :**
```
Tables principales :
users               → tous les comptes (4 rôles)
children            → profils enfants
professional_invitations → liens parent↔pro
content             → vidéos & activités
activity_logs       → historique des sessions
messages            → messagerie interne
notes               → notes cliniques
teleconsultations   → sessions vidéo
guided_sequences    → routines structurées
aac_symbols         → pictogrammes
games               → définitions des jeux
badges + child_badges → gamification
chatbot_sessions + chatbot_messages → IA
```

**📸 Pas de screenshot — créer ERD dans Canva ou exporter depuis MySQL Workbench**

---

### Slide 32 — Bilan & Chiffres clés

**Titre :** `AIDAA en chiffres`

**Texte :**
```
📂  Fichiers de code              ~85 fichiers
📝  Lignes de code              ~12 000 lignes
🗄️  Tables en base de données       14 tables
🔗  Endpoints API REST              40+ routes
⚛️  Composants React               25+ composants
🎮  Mini-jeux thérapeutiques          8 jeux
🤖  Intents chatbot IA              10+ intents
🔐  Middlewares de sécurité          3 couches

Fonctionnalités complètes :
✅ CRUD complet sur tous les modèles
✅ Authentification JWT sécurisée
✅ Système d'invitation par email
✅ Analytics temps réel avec Chart.js
✅ Chatbot IA bilingue FR/AR
✅ Téléconsultation planifiée
✅ Communication AAC pour enfants
✅ Gamification avec badges
```

**Éléments visuels :**
- 4 grandes cartes de chiffres clés (animées si possible)
- Checklist verte en dessous

---

### Slide 33 — Conclusion & Perspectives

**Titre :** `AIDAA — Une plateforme au service des familles`

**Texte principal :**
```
Un outil complet pour accompagner les enfants autistes
en Tunisie et dans le monde arabe francophone.
```

**Perspectives d'évolution :**
```
🚀  Court terme
    • Application mobile React Native
    • Notifications push en temps réel
    • Intégration WebRTC pour vraie vidéo

📈  Moyen terme
    • IA adaptative selon le profil enfant
    • Tableau de bord pour les établissements scolaires
    • Export PDF des rapports de suivi

🌍  Long terme
    • Déploiement cloud (AWS / Azure)
    • Support multi-langues étendu • Partenariat avec ministère de la santé TN
```

**Éléments visuels :**
- Grande image d'une famille avec enfant
- Logo AIDAA + tagline
- Remerciements en bas
- Lien GitHub (si public)

---

## 🎨 Guide de style Canva

### Palette de couleurs

| Usage | Couleur | Code HEX |
|-------|---------|----------|
| Fond principal | Ardoise sombre | `#0F172A` |
| Fond secondaire | Ardoise clair | `#1E293B` |
| Accent Parent | Vert émeraude | `#10B981` |
| Accent Pro | Orange | `#F97316` |
| Accent Admin | Rouge rose | `#E11D48` |
| Accent Enfant | Bleu | `#3B82F6` |
| Texte principal | Blanc | `#FFFFFF` |
| Texte secondaire | Gris clair | `#94A3B8` |
| Bordures | Gris slate | `#334155` |

### Typographie

| Élément | Police | Taille | Style |
|---------|--------|--------|-------|
| Titre slide | Inter | 48–60 px | Bold 700 |
| Sous-titre | Inter | 24–32 px | SemiBold 600 |
| Corps texte | Inter | 16–18 px | Regular 400 |
| Code / technique | Fira Code | 14 px | Regular |
| Légendes | Inter | 12 px | Medium 500 |

### Icônes recommandées dans Canva
Rechercher : **Font Awesome**, **Flaticon**, ou utiliser les emojis directement

### Mise en page type
- **Slide titre de section :** fond couleur plein + titre centré grand format
- **Slide contenu :** 60% image/screenshot + 40% texte bullet points
- **Slide technique :** fond sombre + blocs colorés
- **Slide chiffres :** 4 cartes KPI centrées sur fond clair

---

*Document généré le 14 avril 2026 — Projet AIDAA*

