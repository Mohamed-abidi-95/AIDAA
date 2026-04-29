# 🎥 AIDAA — Implémentation Complète de la Téléconsultation

**Date:** 19 avril 2026  
**Objectif:** Améliorer le système de téléconsultation avec statuts, room IDs uniques, notifications et rappels  
**Durée estimée totale:** 4-5 heures  

---

## 📋 Vue d'ensemble des problèmes à résoudre

| Problème | Impact | Priorité | Solution |
|----------|--------|----------|----------|
| Pas de statut (passé/futur/annulé) | Toutes les séances s'affichent ensemble | 🔴 Haute | Ajouter colonne `status` ENUM |
| Room IDs hardcodés | Pas d'unicité, lien Jitsi statique | 🔴 Haute | UUID unique par séance |
| Pas de notification email | Parents/pros ne savent pas quand ils sont invités | 🟡 Moyenne | Intégrer Brevo/Ethereal |
| Pas de rappels automatiques | Utilisateurs oublient les séances | 🟡 Moyenne | Cron job avec Node.js |
| Pas d'historique des séances | Aucune trace passée | 🟢 Basse | Filtrer par statut |

---

## 🗄️ ÉTAPE 1 — Migration Base de Données

**Objectif:** Enrichir la table `teleconsultations` avec les colonnes manquantes

### 1.1 — Créer le fichier migration

**Fichier:** `backend/migrations/add_teleconsultation_fields.sql`

```sql
-- Migration: Ajouter status, room_id et created_at à teleconsultations
-- Date: 2026-04-19

USE aidaa_db;

-- Ajouter la colonne status
ALTER TABLE teleconsultations 
ADD COLUMN status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled'
AFTER notes;

-- Ajouter la colonne room_id (UUID unique)
ALTER TABLE teleconsultations 
ADD COLUMN room_id VARCHAR(100) UNIQUE NOT NULL 
AFTER status;

-- Ajouter l'index pour les recherches par room_id
CREATE INDEX idx_teleconsultations_room_id ON teleconsultations(room_id);

-- Ajouter created_at si absent (par défaut CURRENT_TIMESTAMP)
ALTER TABLE teleconsultations 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
AFTER room_id;

-- Mettre à jour les room_ids existants avec des UUIDs
UPDATE teleconsultations 
SET room_id = CONCAT(
  'room_', 
  LOWER(HEX(UNHEX(REPLACE(UUID(), '-', '')))),
  '_',
  id
)
WHERE room_id IS NULL;

-- Marquer les séances passées comme "completed" (date_time dans le passé)
UPDATE teleconsultations 
SET status = 'completed' 
WHERE status = 'scheduled' AND date_time < NOW();

COMMIT;
SELECT 'Migration completed successfully' AS status;
```

### 1.2 — Exécuter la migration

**Option A: phpMyAdmin**
1. Ouvrir phpMyAdmin → `aidaa_db` → Onglet "SQL"
2. Copier le contenu du fichier ci-dessus
3. Cliquer "Exécuter"

**Option B: Terminal**
```bash
cd backend
mysql -u root aidaa_db < migrations/add_teleconsultation_fields.sql
```

### 1.3 — Vérification

```sql
-- Vérifier la structure
DESCRIBE teleconsultations;

-- Vérifier que tous les room_ids sont uniques
SELECT COUNT(DISTINCT room_id) FROM teleconsultations;
-- Doit être égal au COUNT(*)

-- Vérifier les statuts
SELECT status, COUNT(*) FROM teleconsultations GROUP BY status;
```

---

## 🔧 ÉTAPE 2 — Modifications Backend

### 2.1 — Mettre à jour le modèle Teleconsultation

**Fichier:** `backend/src/models/teleconsult.model.js`

```javascript
// ...existing code...

// Générer un room_id unique
const generateRoomId = () => {
  const uuid = require('crypto').randomUUID();
  const timestamp = Date.now().toString(36);
  return `room_${uuid}_${timestamp}`.substring(0, 100);
};

// Créer une teleconsultation avec room_id auto-généré
const createTeleconsultation = (parentId, professionalId, dateTime, meetingLink, notes) => {
  const roomId = generateRoomId();
  return query(
    `INSERT INTO teleconsultations (parent_id, professional_id, date_time, meeting_link, notes, room_id, status)
     VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
    [parentId, professionalId, dateTime, meetingLink || `https://meet.jitsi.si/${roomId}`, notes, roomId]
  );
};

// Récupérer les teleconsultations par statut
const getTeleconsultationsByStatus = (userId, status = null) => {
  let sql = `
    SELECT t.*, u_parent.name AS parent_name, u_prof.name AS professional_name
    FROM teleconsultations t
    JOIN users u_parent ON u_parent.id = t.parent_id
    JOIN users u_prof ON u_prof.id = t.professional_id
    WHERE (t.parent_id = ? OR t.professional_id = ?)
  `;
  const params = [userId, userId];

  if (status) {
    sql += ` AND t.status = ?`;
    params.push(status);
  }

  sql += ` ORDER BY t.date_time DESC`;

  return query(sql, params);
};

// Mettre à jour le statut d'une téléconsultation
const updateTeleconsultationStatus = (consultationId, newStatus) => {
  const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }
  return query(
    'UPDATE teleconsultations SET status = ? WHERE id = ?',
    [newStatus, consultationId]
  );
};

// Récupérer une téléconsultation par room_id (pour accéder au lien de réunion)
const getTeleconsultationByRoomId = (roomId) => {
  return query(
    `SELECT * FROM teleconsultations WHERE room_id = ? LIMIT 1`,
    [roomId]
  );
};

module.exports = {
  // ...existing exports...
  createTeleconsultation,
  getTeleconsultationsByStatus,
  updateTeleconsultationStatus,
  getTeleconsultationByRoomId,
  generateRoomId,
};
```

### 2.2 — Mettre à jour le contrôleur Teleconsultation

**Fichier:** `backend/src/controllers/teleconsult.controller.js`

```javascript
const { query } = require('../config/db');
const teleconsultModel = require('../models/teleconsult.model');
const { sendTeleconsultationEmail } = require('../config/mailer');

// GET /api/teleconsult/my-consultations
const getMyConsultations = async (req, res) => {
  try {
    const userId = req.user.id;
    const status = req.query.status; // 'scheduled', 'completed', 'cancelled', etc.

    const consultations = await teleconsultModel.getTeleconsultationsByStatus(userId, status);
    return res.status(200).json({ success: true, data: consultations });
  } catch (error) {
    console.error('[teleconsult.controller] getMyConsultations:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// POST /api/teleconsult/create
const createConsultation = async (req, res) => {
  try {
    const { professionalId, dateTime, notes } = req.body;
    const parentId = req.user.id;

    if (!professionalId || !dateTime) {
      return res.status(400).json({ success: false, message: 'Données manquantes.' });
    }

    // Générer le room_id automatiquement
    const roomId = teleconsultModel.generateRoomId();
    const jitsiLink = `https://meet.jitsi.si/${roomId}`;

    const result = await query(
      `INSERT INTO teleconsultations (parent_id, professional_id, date_time, meeting_link, notes, room_id, status)
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
      [parentId, professionalId, dateTime, jitsiLink, notes, roomId]
    );

    const consultationId = result.insertId;

    // Récupérer les infos pour l'email
    const [consultation] = await query(
      `SELECT t.*, u_parent.email AS parent_email, u_parent.name AS parent_name,
              u_prof.email AS prof_email, u_prof.name AS prof_name
       FROM teleconsultations t
       JOIN users u_parent ON u_parent.id = t.parent_id
       JOIN users u_prof ON u_prof.id = t.professional_id
       WHERE t.id = ?`,
      [consultationId]
    );

    // Envoyer les emails de notification
    try {
      await sendTeleconsultationEmail(
        consultation.prof_email,
        consultation.prof_name,
        consultation.parent_name,
        new Date(dateTime).toLocaleDateString('fr-FR'),
        jitsiLink
      );
    } catch (mailErr) {
      console.warn('[teleconsult.controller] Email error (non-bloquant):', mailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Téléconsultation planifiée.',
      data: { id: consultationId, roomId, jitsiLink }
    });
  } catch (error) {
    console.error('[teleconsult.controller] createConsultation:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// PUT /api/teleconsult/:consultationId/status
const updateStatus = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Vérifier que l'utilisateur a le droit de modifier ce statut
    const [consultation] = await query(
      'SELECT parent_id, professional_id FROM teleconsultations WHERE id = ?',
      [consultationId]
    );

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Téléconsultation introuvable.' });
    }

    if (consultation.parent_id !== userId && consultation.professional_id !== userId) {
      return res.status(403).json({ success: false, message: 'Vous n\'avez pas accès à cette ressource.' });
    }

    await teleconsultModel.updateTeleconsultationStatus(consultationId, status);
    return res.status(200).json({ success: true, message: `Statut mis à jour en "${status}".` });
  } catch (error) {
    console.error('[teleconsult.controller] updateStatus:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/teleconsult/room/:roomId
// Récupérer le lien Jitsi d'une salle (appelé depuis la page de réunion)
const getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;
    const [consultation] = await teleconsultModel.getTeleconsultationByRoomId(roomId);

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Salle introuvable.' });
    }

    // Mettre à jour le statut à "in_progress" si c'était "scheduled"
    if (consultation.status === 'scheduled') {
      await teleconsultModel.updateTeleconsultationStatus(consultation.id, 'in_progress');
    }

    return res.status(200).json({
      success: true,
      data: {
        id: consultation.id,
        roomId: consultation.room_id,
        jitsiLink: consultation.meeting_link,
        parentName: consultation.parent_name,
        professionalName: consultation.professional_name,
        dateTime: consultation.date_time,
        status: consultation.status
      }
    });
  } catch (error) {
    console.error('[teleconsult.controller] getRoomDetails:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

module.exports = {
  getMyConsultations,
  createConsultation,
  updateStatus,
  getRoomDetails,
  // ...existing exports...
};
```

### 2.3 — Ajouter les routes

**Fichier:** `backend/src/routes/teleconsult.routes.js`

```javascript
const express = require('express');
const teleconsultController = require('../controllers/teleconsult.controller');
const auth = require('../middlewares/auth');

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(auth);

// GET /api/teleconsult/my-consultations?status=scheduled
router.get('/my-consultations', teleconsultController.getMyConsultations);

// POST /api/teleconsult/create
router.post('/create', teleconsultController.createConsultation);

// PUT /api/teleconsult/:consultationId/status
router.put('/:consultationId/status', teleconsultController.updateStatus);

// GET /api/teleconsult/room/:roomId (public accessible pour la salle Jitsi)
router.get('/room/:roomId', teleconsultController.getRoomDetails);

module.exports = router;
```

### 2.4 — Ajouter fonction d'email dans le mailer

**Fichier:** `backend/src/config/mailer.js`

```javascript
// ...existing code...

const sendTeleconsultationEmail = async (professionalEmail, professionalName, parentName, dateTime, jitsiLink) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@aidaa.app',
    to: professionalEmail,
    subject: `📹 Nouvelle téléconsultation — ${parentName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F97316;">Nouvelle téléconsultation prévue</h2>
        
        <p>Bonjour Dr. <strong>${professionalName}</strong>,</p>
        
        <p><strong>${parentName}</strong> a planifié une téléconsultation avec vous.</p>
        
        <div style="background-color: #FEF3E7; border-left: 4px solid #F97316; padding: 15px; margin: 20px 0;">
          <p><strong>📅 Date et heure :</strong> ${dateTime}</p>
          <p><strong>👤 Parent :</strong> ${parentName}</p>
        </div>
        
        <p>
          <a href="${jitsiLink}" 
             style="background-color: #F97316; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Accéder à la salle de consultation
          </a>
        </p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Cet email a été envoyé par AIDAA. Ne répondez pas à cet email.
        </p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  // ...existing exports...
  sendTeleconsultationEmail
};
```

---

## 🎨 ÉTAPE 3 — Modifications Frontend

### 3.1 — Créer une page pour lister les téléconsultations

**Fichier:** `frontend/src/pages/TeleconsultationListNew.tsx`

```typescriptreact
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import api from '../lib/api';
import { Section, useToast, ToastStack } from '../components';

interface Consultation {
  id: number;
  date_time: string;
  parent_name: string;
  professional_name: string;
  meeting_link: string;
  room_id: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface ApiResult<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const TeleconsultationListNew = (): JSX.Element => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toasts, add: toast, remove: removeToast } = useToast();

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchConsultations();
  }, [filter]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const { data } = await api.get<ApiResult<Consultation[]>>(
        `/api/teleconsult/my-consultations${params}`
      );
      if (data.success) setConsultations(data.data);
    } catch {
      toast('Erreur lors du chargement des téléconsultations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '📅', label: 'Prévue' },
      in_progress: { bg: 'bg-green-100', text: 'text-green-700', icon: '📹', label: 'En cours' },
      completed: { bg: 'bg-slate-100', text: 'text-slate-700', icon: '✅', label: 'Terminée' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: '❌', label: 'Annulée' },
    };
    const badge = badges[status as keyof typeof badges] || badges.scheduled;
    return (
      <span className={`inline-flex items-center gap-1.5 ${badge.bg} ${badge.text} px-3 py-1.5 rounded-full text-xs font-bold`}>
        {badge.icon} {badge.label}
      </span>
    );
  };

  return (
    <div className="font-sans antialiased min-h-screen bg-slate-50 p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">📹 Mes Téléconsultations</h1>

        {/* Filtres */}
        <div className="flex gap-3 mb-8">
          {['all', 'scheduled', 'in_progress', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === status
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {status === 'all' ? 'Toutes' : status === 'scheduled' ? 'Prévues' : status === 'in_progress' ? 'En cours' : status === 'completed' ? 'Terminées' : 'Annulées'}
            </button>
          ))}
        </div>

        {/* Liste des consultations */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600" />
          </div>
        ) : consultations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <i className="fa-solid fa-video text-5xl text-slate-400 mb-4" />
            <p className="text-slate-600 font-medium">Aucune téléconsultation trouvée.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {consultations.map(consultation => (
              <div key={consultation.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {user?.role === 'parent' ? consultation.professional_name : consultation.parent_name}
                      </h3>
                      {getStatusBadge(consultation.status)}
                    </div>
                    <p className="text-sm text-slate-500">
                      <i className="fa-solid fa-calendar mr-1" />
                      {new Date(consultation.date_time).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Boutons d'action */}
                  {consultation.status === 'scheduled' && new Date(consultation.date_time) > new Date() && (
                    <button
                      onClick={() => navigate(`/teleconsultation/${consultation.room_id}`)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all"
                    >
                      <i className="fa-solid fa-arrow-right" /> Accéder
                    </button>
                  )}
                  {consultation.status === 'in_progress' && (
                    <button
                      onClick={() => navigate(`/teleconsultation/${consultation.room_id}`)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all"
                    >
                      <i className="fa-solid fa-video" /> Rejoindre
                    </button>
                  )}
                  {consultation.status === 'completed' && (
                    <span className="text-slate-500 text-sm font-medium">Consultée</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ToastStack toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
```

### 3.2 — Mettre à jour la page de salle Jitsi

**Fichier:** `frontend/src/pages/TeleconsultationRoom.tsx`

```typescriptreact
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';

interface RoomDetails {
  roomId: string;
  jitsiLink: string;
  parentName: string;
  professionalName: string;
  dateTime: string;
}

interface ApiResult<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const TeleconsultationRoom = (): JSX.Element => {
  const { roomId } = useParams<{ roomId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const { data } = await api.get<ApiResult<any>>(`/api/teleconsult/room/${roomId}`);
        if (data.success) {
          setRoomDetails(data.data);
        } else {
          setError(data.message || 'Salle introuvable.');
        }
      } catch {
        setError('Erreur lors de la connexion à la salle.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4" />
          <p className="text-white">Connexion à la salle...</p>
        </div>
      </div>
    );
  }

  if (error || !roomDetails) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="bg-red-900/20 border border-red-700 text-red-200 px-8 py-6 rounded-xl text-center">
          <p className="font-semibold mb-2">❌ Erreur</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-slate-900">
      {/* Barre d'informations */}
      <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Téléconsultation</h2>
          <p className="text-sm text-slate-300">
            {roomDetails.parentName} — {roomDetails.professionalName}
          </p>
        </div>
        <div className="text-sm text-slate-400">
          {new Date(roomDetails.dateTime).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {/* Iframe Jitsi */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={roomDetails.jitsiLink}
          title="Jitsi Conference"
          allow="camera; microphone; display-capture"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
};
```

### 3.3 — Ajouter les routes

**Fichier:** `frontend/src/routes/routes-config.tsx`

```typescriptreact
// ...existing imports...
import { TeleconsultationListNew } from '../pages/TeleconsultationListNew';
import { TeleconsultationRoom } from '../pages/TeleconsultationRoom';

export const routeConfig = (
  <>
    {/* ...existing routes... */}
    
    {/* Téléconsultations */}
    <Route path="teleconsult" element={<ProtectedRoute><TeleconsultationListNew /></ProtectedRoute>} />
    <Route path="teleconsultation/:roomId" element={<ProtectedRoute><TeleconsultationRoom /></ProtectedRoute>} />
  </>
);
```

---

## ⏰ ÉTAPE 4 — Système de rappels automatiques (Cron Job)

### 4.1 — Créer le service de rappels

**Fichier:** `backend/src/services/reminderService.js`

```javascript
const { query } = require('../config/db');
const { sendReminderEmail } = require('../config/mailer');

/**
 * Envoyer des rappels pour les téléconsultations dans 1 heure
 * À appeler via cron job toutes les 15 minutes
 */
const sendUpcomingConsultationReminders = async () => {
  try {
    console.log('[reminderService] Recherche des téléconsultations prévues dans ~60 min...');

    // Consulter dans 45-75 minutes (intervalle de 15 min)
    const now = new Date();
    const start = new Date(now.getTime() + 45 * 60000);
    const end = new Date(now.getTime() + 75 * 60000);

    const consultations = await query(
      `SELECT t.*, u_parent.email AS parent_email, u_parent.name AS parent_name,
              u_prof.email AS prof_email, u_prof.name AS prof_name
       FROM teleconsultations t
       JOIN users u_parent ON u_parent.id = t.parent_id
       JOIN users u_prof ON u_prof.id = t.professional_id
       WHERE t.status = 'scheduled'
         AND t.date_time BETWEEN ? AND ?
         AND t.reminder_sent = 0`,
      [start, end]
    );

    console.log(`[reminderService] ${consultations.length} rappels à envoyer`);

    for (const consultation of consultations) {
      try {
        // Envoyer rappel au parent
        await sendReminderEmail(
          consultation.parent_email,
          consultation.parent_name,
          consultation.professional_name,
          new Date(consultation.date_time).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          consultation.meeting_link
        );

        // Envoyer rappel au professionnel
        await sendReminderEmail(
          consultation.prof_email,
          consultation.prof_name,
          consultation.parent_name,
          new Date(consultation.date_time).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          consultation.meeting_link
        );

        // Marquer comme rappel envoyé
        await query(
          'UPDATE teleconsultations SET reminder_sent = 1 WHERE id = ?',
          [consultation.id]
        );

        console.log(`[reminderService] ✅ Rappel envoyé pour consultation #${consultation.id}`);
      } catch (err) {
        console.error(`[reminderService] ❌ Erreur pour consultation #${consultation.id}:`, err.message);
      }
    }
  } catch (error) {
    console.error('[reminderService] Erreur globale:', error);
  }
};

module.exports = { sendUpcomingConsultationReminders };
```

### 4.2 — Ajouter le cron job au démarrage du serveur

**Fichier:** `backend/src/server.js`

```javascript
// ...existing code...
const { sendUpcomingConsultationReminders } = require('./services/reminderService');

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Cron job: Vérifier les rappels toutes les 15 minutes
  setInterval(() => {
    sendUpcomingConsultationReminders().catch(err => {
      console.error('[cron] Erreur lors de l\'envoi des rappels:', err);
    });
  }, 15 * 60 * 1000); // 15 minutes

  console.log('[cron] Service de rappels de téléconsultation démarré (chaque 15 min)');
});
```

### 4.3 — Ajouter la fonction d'email de rappel

**Fichier:** `backend/src/config/mailer.js`

```javascript
const sendReminderEmail = async (userEmail, userName, otherPersonName, consultationTime, jitsiLink) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@aidaa.app',
    to: userEmail,
    subject: `⏰ Rappel: Téléconsultation à ${consultationTime}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">⏰ Rappel de téléconsultation</h2>
        
        <p>Bonjour <strong>${userName}</strong>,</p>
        
        <p>Votre téléconsultation avec <strong>${otherPersonName}</strong> commence dans <strong>1 heure</strong>.</p>
        
        <div style="background-color: #DBEAFE; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
          <p><strong>⏱️ Heure :</strong> ${consultationTime}</p>
        </div>
        
        <p>
          <a href="${jitsiLink}" 
             style="background-color: #3b82f6; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Accéder à la consultation
          </a>
        </p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Ne répondez pas à cet email.
        </p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  // ...existing exports...
  sendReminderEmail
};
```

### 4.4 — Ajouter la colonne reminder_sent à la DB

```sql
ALTER TABLE teleconsultations 
ADD COLUMN reminder_sent TINYINT DEFAULT 0 
AFTER status;

-- Réinitialiser lors d'une mise à jour de date_time
CREATE TRIGGER reset_reminder_on_update
BEFORE UPDATE ON teleconsultations
FOR EACH ROW
BEGIN
  IF NEW.date_time != OLD.date_time THEN
    SET NEW.reminder_sent = 0;
  END IF;
END;
```

---

## ✅ ÉTAPE 5 — Tests d'intégration

### 5.1 — Tests unitaires backend

**Fichier:** `backend/tests/teleconsult.test.js` (Optionnel - Utiliser Jest si vous avez configuré)

```javascript
// Tests pour vérifier que tout fonctionne
// - generateRoomId() génère des IDs uniques
// - createTeleconsultation insère avec status='scheduled'
// - updateStatus valide les statuts
// - getRoomDetails retourne les infos correctes
```

### 5.2 — Tests manuels (Frontend)

**Checklist de test:**

1. **Créer une téléconsultation**
   - [ ] Parent peut planifier une séance avec un professionnel
   - [ ] L'email est reçu par le professionnel
   - [ ] Room ID unique est généré
   - [ ] Jitsi link est créé automatiquement

2. **Lister les téléconsultations**
   - [ ] Filtrer par statut: scheduled, completed, cancelled
   - [ ] Affichage correct des dates/heures
   - [ ] Bouton "Accéder" disponible pour les séances prévues

3. **Accéder à la salle Jitsi**
   - [ ] Cliquer "Accéder" → redirection vers room/:roomId
   - [ ] Iframe Jitsi se charge correctement
   - [ ] Audio/vidéo fonctionne
   - [ ] Statut passe à "in_progress" automatiquement

4. **Rappels automatiques**
   - [ ] ~1 heure avant la séance, emails de rappel envoyés
   - [ ] Les 2 participants (parent + pro) reçoivent le rappel
   - [ ] Rappel ne s'envoie qu'une fois (reminder_sent = 1)

---

## 🚀 ÉTAPE 6 — Déploiement

### 6.1 — Deploy sur Railway (Backend)

```bash
# 1. Commit les changements
git add -A
git commit -m "feat: Implement full teleconsultation system with room IDs, statuses, emails, and reminders"
git push origin main

# 2. Railway redéploie automatiquement
# 3. Exécuter la migration
# Rails Dashboard → MySQL → SQL Client → Copier le contenu de migration
```

### 6.2 — Deploy sur Vercel (Frontend)

```bash
# Automatique lors du push vers main
# Vercel redéploie le frontend
```

---

## 📊 Résumé des changements

| Composant | Changements | Fichiers affectés |
|-----------|-------------|------------------|
| **Database** | +3 colonnes (status, room_id, reminder_sent, created_at) | Migration SQL |
| **Backend Model** | +4 fonctions (generateRoomId, getTeleconsultationsByStatus, updateStatus, getTeleconsultationByRoomId) | `teleconsult.model.js` |
| **Backend Controller** | +4 endpoints (getMyConsultations, createConsultation, updateStatus, getRoomDetails) | `teleconsult.controller.js` |
| **Backend Routes** | +4 routes avec middlewares | `teleconsult.routes.js` |
| **Backend Services** | Cron job pour rappels | `reminderService.js` |
| **Frontend** | 2 nouvelles pages (Liste, Salle Jitsi) | 2 nouveaux fichiers .tsx |
| **Email Service** | +2 fonctions (sendTeleconsultationEmail, sendReminderEmail) | `mailer.js` |

---

## 🎯 Résultat final

✅ **Système de téléconsultation complet avec :**
- Room IDs uniques et reproductibles
- Statuts (scheduled → in_progress → completed)
- Notifications email (invitation + rappel 1h avant)
- Interface utilisateur intuitive avec filtres
- Cron job pour les rappels automatiques

---

**Prochaines étapes :** Intégration Jitsi custom (si besoin d'auto-hébergement) ou amélioration des permissions.

