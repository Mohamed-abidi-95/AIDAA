# AIDAA Frontend — Shared Components Architecture
> Généré le 2026-04-18 — Migration vers une bibliothèque de composants centralisée

## Structure `src/components/` (cible atteinte)

```
src/components/
│
├── index.ts                          ← MASTER BARREL (re-exporte tout)
│
├── inputs/                           ← Contrôles de saisie
│   ├── index.ts
│   ├── text-input/
│   │   ├── index.tsx                 TextInput — champ texte/email/password/textarea
│   │   └── text-input.types.ts      TextInputProps
│   ├── select-input/
│   │   ├── index.tsx                 SelectInput — dropdown générique
│   │   └── select-input.types.ts    SelectInputProps, SelectOption
│   ├── file-upload-input/
│   │   ├── index.tsx                 FileUploadInput — zone drag & drop
│   │   └── file-upload-input.types.ts
│   ├── date-input/
│   │   ├── index.tsx                 DateInput — datetime-local
│   │   └── date-input.types.ts
│   └── checkbox/
│       ├── checkbox.types.ts         CheckboxOption (partagé)
│       ├── index.ts
│       ├── single-checkbox-input/
│       │   ├── index.tsx             SingleCheckboxInput
│       │   └── single-checkbox-input.types.ts
│       └── multiple-checkbox-input/
│           ├── index.tsx             MultipleCheckboxInput
│           └── multiple-checkbox-input.types.ts
│
├── ui/                               ← Composants visuels primitifs
│   ├── index.ts
│   ├── StatCard.tsx                  ← existant (rétrocompatibilité)
│   ├── ScoreBadge.tsx                ← existant
│   ├── Spinner.tsx                   ← existant
│   ├── ModalOverlay.tsx              ← existant
│   ├── button/
│   │   ├── index.tsx                 Button — primary/secondary/danger/ghost/outline
│   │   └── button.types.ts          ButtonProps, ButtonVariant, ButtonColor, ButtonSize
│   ├── card/
│   │   ├── index.tsx                 Card — conteneur blanc avec titre + badge
│   │   └── card.types.ts
│   ├── modal/
│   │   ├── index.tsx                 Modal — backdrop + centrage (version enrichie)
│   │   └── modal.types.ts
│   ├── badge/
│   │   ├── index.tsx                 Badge — étiquette colorée (statut, rôle…)
│   │   └── badge.types.ts           BadgeProps, BadgeVariant
│   └── avatar/
│       ├── index.tsx                 Avatar — cercle avec initiale utilisateur
│       └── avatar.types.ts          AvatarProps, AvatarSize, AvatarColor
│
├── layout/                           ← Mise en page des dashboards
│   ├── index.ts
│   ├── Section.tsx                   ← existant (rétrocompatibilité)
│   ├── header/
│   │   ├── index.tsx                 Header — barre de titre h-20
│   │   └── header.types.ts
│   ├── sidebar/
│   │   ├── index.tsx                 Sidebar — barre latérale orange/green
│   │   └── sidebar.types.ts         SidebarProps, NavItem, SidebarTheme
│   └── footer/
│       ├── index.tsx                 Footer — pied de page légal
│       └── footer.types.ts
│
├── feedback/                         ← Notifications et états
│   ├── index.ts
│   ├── useToast.ts                   ← existant
│   ├── ToastStack.tsx                ← existant
│   ├── alert/
│   │   ├── index.tsx                 Alert — error/success/warning/info
│   │   └── alert.types.ts           AlertProps, AlertVariant
│   ├── loader/
│   │   ├── index.tsx                 Loader — alias canonique du Spinner
│   │   └── loader.types.ts
│   └── toast/                        ← chemin canonique (re-exporte les plats)
│       ├── index.tsx
│       ├── use-toast.ts
│       └── toast.types.ts
│
└── forms/                            ← Composants de formulaires
    ├── index.ts
    ├── formStyles.ts                 ← existant (inputCls, labelCls)
    ├── auth-form/
    │   ├── index.tsx                 AuthForm — wrapper login/signup/reset
    │   └── auth-form.types.ts
    └── profile-form/
        ├── index.tsx                 ProfileForm — wrapper formulaires métier
        └── profile-form.types.ts
```

## Résumé de la migration

| Catégorie | Composants | Statut |
|-----------|:----------:|--------|
| `inputs/` | 6 | ✅ Nouveaux |
| `ui/`     | 5 nouveaux + 4 existants | ✅ Complet |
| `layout/` | 3 nouveaux + 1 existant | ✅ Complet |
| `feedback/`| 2 nouveaux + 2 existants | ✅ Complet |
| `forms/`  | 2 nouveaux + 1 existant | ✅ Complet |
| **Total** | **18 nouveaux composants** | ✅ **0 erreur** |

## Utilisation

Tout composant s'importe depuis le master barrel :
```typescript
import {
  // inputs
  TextInput, SelectInput, FileUploadInput, DateInput,
  SingleCheckboxInput, MultipleCheckboxInput,
  // ui
  Button, Card, Modal, Badge, Avatar,
  StatCard, ScoreBadge, Spinner, ModalOverlay,
  // layout
  Header, Sidebar, Footer, Section,
  // feedback
  Alert, Loader, useToast, ToastStack,
  // forms
  AuthForm, ProfileForm, inputCls, inputClsGreen, labelCls,
} from '../components';
```

