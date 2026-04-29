# AIDAA - Arborescence du Projet
> Dernière mise à jour : 2026-04-18

## Vue d'ensemble de la structure

```
AIDAA/
│
├── 📄 Configuration et Documentation Racine
│   ├── .git/                                    # Dépôt Git
│   ├── .gitignore
│   ├── .idea/                                   # Configuration IDE PhpStorm
│   ├── package.json
│   ├── yarn.lock
│   │
│   ├── 📋 Documentation
│   ├── BACKEND_PROGRESS.md
│   ├── COMPREHENSIVE_PROJECT_UNDERSTANDING.md
│   ├── CRUD_COMPLETE_AUDIT.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── ENDPOINTS.md
│   ├── EXECUTIVE_SUMMARY.md
│   ├── GLOBAL_PROJECT_REVIEW.md
│   ├── PERSPECTIVES.md
│   ├── PROJECT_FILE_INDEX.md
│   ├── PROJECT_PROGRESS.md
│   ├── PROJECT_TREE.md                          # ← CE FICHIER
│   ├── QUICK_START_GUIDE.md
│   ├── RELATIONS_AUDIT.md
│   ├── TEST_ACCOUNTS.md
│   │
│   ├── 🗄️  Base de Données
│   ├── aidaa_schema.sql
│   ├── database_updates.sql
│   ├── insert_parent_test.sql
│   ├── setup_complete.sql
│   ├── migration_add_child_interface_fields.sql
│   ├── migration_add_participant_category.sql
│   ├── migration_add_specialite.sql
│   ├── migration_modules_bcd.sql
│   └── migration_professional_invitations.sql
│
├── 🔙 BACKEND/
│   ├── node_modules/
│   ├── uploads/                                 # Fichiers média uploadés
│   ├── .env
│   ├── .env.example
│   │
│   ├── 📦 Scripts utilitaires
│   │   ├── check-db-state.js
│   │   ├── comprehensive-test.ps1
│   │   ├── create-tables.js
│   │   ├── fix-admin-password.js
│   │   ├── fix-schema.js
│   │   ├── inject-all-users.js
│   │   ├── insert-data.js / insert-parent.js / insert-professional.js
│   │   ├── migrate-required.js / migrate-status.js / run-migration-bcd.js
│   │   ├── setup-db.js
│   │   └── test-auth.ps1 / test-login.js
│   │
│   ├── package.json / package-lock.json / yarn.lock
│   │
│   └── 📁 src/
│       ├── app.js                               # Config Express + middlewares
│       ├── server.js                            # Point d'entrée HTTP
│       │
│       ├── 🛠️  config/
│       │   ├── db.js                            # Connexion MySQL
│       │   ├── emergencyKeywords.js             # Mots-clés urgence chatbot
│       │   ├── gemini.js                        # API Google Gemini
│       │   └── mailer.js                        # Nodemailer / Ethereal
│       │
│       ├── 🎮 controllers/
│       │   ├── aac.controller.js                # Communication Augmentée
│       │   ├── activityLog.controller.js
│       │   ├── admin.controller.js
│       │   ├── analyticsController.js
│       │   ├── auth.controller.js               # JWT, login, signup, reset
│       │   ├── chatbot.controller.js            # IA Gemini
│       │   ├── child.controller.js
│       │   ├── content.controller.js
│       │   ├── game.controller.js
│       │   ├── gamification.controller.js       # Badges & récompenses
│       │   ├── message.controller.js
│       │   ├── note.controller.js
│       │   ├── parent.controller.js             # Invitations professionnels
│       │   ├── professional.controller.js
│       │   ├── sequence.controller.js
│       │   ├── teleconsult.controller.js
│       │   └── user.controller.js
│       │
│       ├── 🧠 middlewares/
│       │   ├── auth.js                          # Vérification JWT
│       │   ├── errorHandler.js
│       │   ├── roleCheck.js                     # admin / parent / professional
│       │   └── upload.js                        # Multer
│       │
│       ├── 💾 models/
│       │   ├── aac.model.js / activityLog.model.js / chatbot.model.js
│       │   ├── child.model.js / content.model.js / game.model.js
│       │   ├── gamification.model.js / message.model.js / note.model.js
│       │   ├── sequence.model.js / teleconsult.model.js
│       │   └── user.model.js
│       │
│       ├── 🛣️  routes/
│       │   ├── aac / activityLog / admin / analytics / auth
│       │   ├── chatbot / child / content / game / gamification
│       │   ├── message / note / parent / professional
│       │   └── sequence / teleconsult / user
│       │
│       └── 🌱 seeders/
│
├── 🎨 FRONTEND/
│   ├── node_modules/
│   ├── public/
│   ├── index.html / Login.html / adminIndex.html / child.html
│   ├── package.json
│   ├── postcss.config.js / tailwind.config.js
│   ├── tsconfig.json / tsconfig.node.json
│   ├── vite.config.ts
│   ├── README.md / ARCHITECTURE_MIGRATION_TRACKER.md / FRONTEND_SETUP.md
│   │
│   └── 📁 src/
│       ├── App.tsx                              # Routeur racine
│       ├── main.tsx                             # Point d'entrée React
│       ├── index.css                            # Styles globaux Tailwind
│       ├── PROJECT_TREE.md                      # Arborescence composants
│       │
│       ├── 🧩 components/                       ★ SHARED COMPONENT LIBRARY
│       │   ├── index.ts                         ← MASTER BARREL
│       │   │
│       │   ├── inputs/                          ← Contrôles de saisie
│       │   │   ├── index.ts
│       │   │   ├── text-input/
│       │   │   │   ├── index.tsx               TextInput
│       │   │   │   └── text-input.types.ts
│       │   │   ├── select-input/
│       │   │   │   ├── index.tsx               SelectInput
│       │   │   │   └── select-input.types.ts
│       │   │   ├── file-upload-input/
│       │   │   │   ├── index.tsx               FileUploadInput
│       │   │   │   └── file-upload-input.types.ts
│       │   │   ├── date-input/
│       │   │   │   ├── index.tsx               DateInput
│       │   │   │   └── date-input.types.ts
│       │   │   └── checkbox/
│       │   │       ├── checkbox.types.ts
│       │   │       ├── index.ts
│       │   │       ├── single-checkbox-input/
│       │   │       │   ├── index.tsx           SingleCheckboxInput
│       │   │       │   └── single-checkbox-input.types.ts
│       │   │       └── multiple-checkbox-input/
│       │   │           ├── index.tsx           MultipleCheckboxInput
│       │   │           └── multiple-checkbox-input.types.ts
│       │   │
│       │   ├── ui/                              ← Composants visuels
│       │   │   ├── index.ts
│       │   │   ├── StatCard.tsx                ← existant
│       │   │   ├── ScoreBadge.tsx              ← existant
│       │   │   ├── Spinner.tsx                 ← existant
│       │   │   ├── ModalOverlay.tsx            ← existant
│       │   │   ├── button/
│       │   │   │   ├── index.tsx               Button (5 variants × 4 couleurs)
│       │   │   │   └── button.types.ts
│       │   │   ├── card/
│       │   │   │   ├── index.tsx               Card
│       │   │   │   └── card.types.ts
│       │   │   ├── modal/
│       │   │   │   ├── index.tsx               Modal
│       │   │   │   └── modal.types.ts
│       │   │   ├── badge/
│       │   │   │   ├── index.tsx               Badge (6 variantes)
│       │   │   │   └── badge.types.ts
│       │   │   └── avatar/
│       │   │       ├── index.tsx               Avatar (initiale)
│       │   │       └── avatar.types.ts
│       │   │
│       │   ├── layout/                          ← Mise en page
│       │   │   ├── index.ts
│       │   │   ├── Section.tsx                 ← existant
│       │   │   ├── header/
│       │   │   │   ├── index.tsx               Header
│       │   │   │   └── header.types.ts
│       │   │   ├── sidebar/
│       │   │   │   ├── index.tsx               Sidebar (thème orange/green)
│       │   │   │   └── sidebar.types.ts
│       │   │   └── footer/
│       │   │       ├── index.tsx               Footer
│       │   │       └── footer.types.ts
│       │   │
│       │   ├── feedback/                        ← Notifications & états
│       │   │   ├── index.ts
│       │   │   ├── useToast.ts                 ← existant
│       │   │   ├── ToastStack.tsx              ← existant
│       │   │   ├── alert/
│       │   │   │   ├── index.tsx               Alert (error/success/warning/info)
│       │   │   │   └── alert.types.ts
│       │   │   ├── loader/
│       │   │   │   ├── index.tsx               Loader (alias Spinner)
│       │   │   │   └── loader.types.ts
│       │   │   └── toast/
│       │   │       ├── index.tsx               chemin canonique toast
│       │   │       ├── use-toast.ts
│       │   │       └── toast.types.ts
│       │   │
│       │   └── forms/                           ← Formulaires composés
│       │       ├── index.ts
│       │       ├── formStyles.ts               ← existant (inputCls, labelCls)
│       │       ├── auth-form/
│       │       │   ├── index.tsx               AuthForm
│       │       │   └── auth-form.types.ts
│       │       └── profile-form/
│       │           ├── index.tsx               ProfileForm
│       │           └── profile-form.types.ts
│       │
│       ├── 📊 features/
│       │   ├── admin/
│       │   │   └── components/
│       │   │       ├── ContentCard.tsx
│       │   │       ├── EditContentModal.tsx
│       │   │       └── DeleteContentModal.tsx
│       │   ├── auth/
│       │   │   └── hooks/useAuth.ts
│       │   ├── chatbot/
│       │   │   └── ChatbotWidget.tsx
│       │   ├── child/
│       │   ├── content/
│       │   │   └── types/content.types.ts
│       │   └── games/
│       │
│       ├── 📄 pages/                            # 19 pages
│       │   ├── AdminPanel.tsx                  # Admin — orange theme
│       │   ├── AnalytiquesProfessionnel.tsx
│       │   ├── ChildDashboard.tsx
│       │   ├── ChildSelectionPage.tsx
│       │   ├── ForgotPasswordPage.tsx
│       │   ├── LoginPage.tsx
│       │   ├── MessagerieView.tsx
│       │   ├── ParentDashboard.tsx             # Parent — green theme
│       │   ├── PendingApprovalPage.tsx
│       │   ├── ProfessionalPage.tsx            # Pro — blue theme
│       │   ├── ProfessionalSignupPage.tsx
│       │   ├── ProgressDashboard.tsx
│       │   ├── ResetPasswordPage.tsx
│       │   ├── RoleSelectionPage.tsx
│       │   ├── SetPasswordPage.tsx
│       │   ├── SignupPage.tsx
│       │   ├── TeleconsultationList.tsx
│       │   ├── TeleconsultationRoom.tsx
│       │   └── TeleconsultationSchedule.tsx
│       │
│       ├── 🛣️  routes/                          # React Router config
│       ├── 🛡️  guards/                          # PrivateRoute, RoleGuard
│       ├── 📚 data/                             # Données statiques
│       ├── 🎨 styles/                           # CSS additionnels
│       ├── 🧰 lib/
│       │   └── api.ts                           # Axios + intercepteurs JWT
│       └── 🏷️  types/                           # Types TypeScript globaux
│
└── 📚 docs/
    ├── BACKEND_ENDPOINTS.md
    ├── CHATBOT_API.md
    ├── GUIDE_TELECONSULTATION_TN.md
    ├── PRESENTATION_SCENARIOS.md
    └── archive/2026-04/
```

---

## 🧩 Shared Component Library — Résumé

| Catégorie | Composants créés | Total fichiers |
|-----------|:----------------:|:--------------:|
| `inputs/`  | TextInput, SelectInput, FileUploadInput, DateInput, SingleCheckboxInput, MultipleCheckboxInput | 14 |
| `ui/`      | Button, Card, Modal, Badge, Avatar (+4 existants) | 12 |
| `layout/`  | Header, Sidebar, Footer (+Section existant) | 8 |
| `feedback/`| Alert, Loader (+useToast, ToastStack existants) | 8 |
| `forms/`   | AuthForm, ProfileForm (+formStyles existant) | 5 |
| **Total**  | **18 nouveaux composants** | **47 fichiers** |

## 📦 Import depuis n'importe quelle page

```typescript
import {
  TextInput, SelectInput, FileUploadInput, DateInput,
  SingleCheckboxInput, MultipleCheckboxInput,
  Button, Card, Modal, Badge, Avatar,
  StatCard, ScoreBadge, Spinner, ModalOverlay,
  Header, Sidebar, Footer, Section,
  Alert, Loader, useToast, ToastStack,
  AuthForm, ProfileForm, inputCls, inputClsGreen, labelCls,
} from '../components';
```

## 🔗 Technologies

| Couche | Stack |
|--------|-------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + React Router |
| **Backend**  | Node.js + Express + MySQL + JWT + Nodemailer + Gemini API |
| **Outils**   | PostCSS, Multer, Axios, FontAwesome |

## 🗄️ Tables principales en base de données

`users` · `children` · `professional_invitations` · `teleconsultations` · `messages` · `activity_logs` · `games` · `content` · `sequences` · `notes` · `aac_symbols`
