# 🌿 AIDAA — Application de suivi pour enfants autistes
> Plateforme PFE 2026 — Esprit School of Engineering

---

## 📋 Prérequis

| Outil | Version | Lien |
|---|---|---|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| XAMPP (MySQL) | ≥ 8.0 | [apachefriends.org](https://www.apachefriends.org) |
| Git | any | [git-scm.com](https://git-scm.com) |

---

## 🚀 Installation en 5 étapes

### 1️⃣ Cloner le repo

```bash
git clone https://github.com/Mohamed-abidi-95/AIDAA.git
cd AIDAA
```

### 2️⃣ Configurer la base de données

1. **Démarrer XAMPP** → Lancer **Apache** et **MySQL**
2. Ouvrir **phpMyAdmin** : [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
3. Cliquer sur **"Importer"** → Choisir le fichier `setup_complete.sql` à la racine du projet
4. Cliquer **"Exécuter"**

✅ La base `aidaa_db` sera créée avec toutes les tables et données de test.

### 3️⃣ Configurer le backend

```bash
cd backend
```

Créer le fichier **`.env`** dans `backend/` avec ce contenu :

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_DATABASE=aidaa_db
JWT_SECRET=aidaa_secret_pfe_2026
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
FRONTEND_URL=http://localhost:5173

# Email (optionnel — laisser vide pour mode test)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=
EMAIL_FROM=AIDAA <noreply@aidaa.com>

# Gemini AI (optionnel)
GEMINI_API_KEY=
```

> 💡 **Sans SMTP_PASS** : les emails fonctionnent en mode fictif (Ethereal), le lien s'affiche dans la console.

Installer les dépendances et démarrer :

```bash
npm install
npm run dev
```

✅ Le serveur démarre sur **http://localhost:5000**

### 4️⃣ Configurer le frontend

```bash
cd ../frontend
npm install
npm run dev
```

✅ L'interface démarre sur **http://localhost:5173**

### 5️⃣ Tester l'application 🎉

Ouvrir [http://localhost:5173](http://localhost:5173) dans le navigateur.

---

## 🔑 Comptes de test

| Rôle | Email | Mot de passe |
|---|---|---|
| **Admin** | admin@aidaa.com | admin123 |
| **Parent** | parent@aidaa.com | parent123 |
| **Parent** | mohamed@aidaa.com | mohamed123 |
| **Professionnel** | professional@aidaa.com | professional123 |
| **Professionnel** | abderrahman@aidaa.com | abderrahman123 |

---

## 🗺️ Pages de l'application

| URL | Description | Accès |
|---|---|---|
| `/` | Page de connexion | Public |
| `/parent/dashboard` | Dashboard parent (enfants, activités, analytics) | Parent |
| `/child` | Espace enfant (jeux, AAC, séquences) | Parent |
| `/professional/dashboard` | Dashboard professionnel | Professionnel |
| `/admin/dashboard` | Panneau d'administration | Admin |
| `/professionnel/teleconsultation` | Liste des consultations | Professionnel |

---

## 🏗️ Architecture

```
AIDAA/
├── backend/               # API Express.js (Node.js)
│   ├── src/
│   │   ├── app.js         # Configuration Express + auto-migration BDD
│   │   ├── controllers/   # Logique métier
│   │   ├── models/        # Requêtes BDD
│   │   ├── routes/        # Endpoints API
│   │   ├── config/
│   │   │   ├── db.js      # Connexion MySQL
│   │   │   └── mailer.js  # Nodemailer (emails consultation)
│   │   └── middlewares/
│   └── .env               # Variables d'environnement (à créer)
│
├── frontend/              # React + TypeScript + Tailwind CSS + Vite
│   ├── src/
│   │   ├── pages/         # Dashboards (Parent, Pro, Admin, Child)
│   │   ├── features/
│   │   │   ├── auth/      # Authentification JWT
│   │   │   ├── games/     # Jeux éducatifs
│   │   │   ├── chatbot/   # Chatbot IA (Gemini)
│   │   │   └── notifications/ # Cloche notifications
│   │   ├── components/    # UI réutilisables
│   │   └── i18n/          # Traductions (FR, EN, AR, DE, ES, IT, TR)
│
└── setup_complete.sql     # Script BDD complet (tables + données)
```

---

## ✨ Fonctionnalités principales

- 🔐 **Auth** JWT (parent, professionnel, admin)
- 👶 **Suivi enfants** — profils, activités, scores
- 🎮 **Jeux éducatifs** — mémoire, couleurs, émotions, séquences, AAC
- 📊 **Analytics** — graphiques progression, timeline, répartition
- 🗓️ **Téléconsultation** — planification + **email réel au parent** + notification 🔔
- 💬 **Messagerie** — parent ↔ professionnel
- 🤖 **Chatbot IA** — FAQ + Gemini API
- 🌍 **7 langues** — FR, EN, AR, DE, ES, IT, TR
- 📱 **Responsive** — mobile + desktop

---

## 🔧 En cas de problème

### MySQL ne démarre pas
→ Vérifier que le port 3306 n'est pas utilisé par autre chose.

### Erreur `Cannot connect to database`
→ Vérifier que XAMPP MySQL est bien démarré et que `.env` contient les bons paramètres.

### Port 5000 déjà utilisé
```powershell
# Windows — trouver et tuer le process
netstat -ano | findstr :5000
taskkill /PID <le_pid> /F
```

### Frontend ne se connecte pas au backend
→ Vérifier que le backend tourne sur le port 5000 et que `CORS_ORIGIN=*` est dans le `.env`.

---

## 👥 Équipe PFE

**Mohamed ABIDI** — Développement Full Stack  
Esprit School of Engineering — 2025/2026

---

*Application développée dans le cadre d'un Projet de Fin d'Études pour accompagner les enfants autistes et leurs familles.*

