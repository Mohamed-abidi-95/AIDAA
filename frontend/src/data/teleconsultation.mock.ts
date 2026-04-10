// ============================================================================
// TELECONSULTATION — Mock data (remplacé par API réelle en production)
// ============================================================================

export type SessionStatus = 'planned' | 'ongoing' | 'done';

export interface MockSession {
  id: number;
  patientName: string;
  patientAge: number;
  participantCategory: string;
  date: string;          // ISO date string YYYY-MM-DD
  time: string;          // HH:mm
  duration: number;      // minutes
  status: SessionStatus;
  lastScore: number;     // 0-100
  notes: string;
}

export const mockSessions: MockSession[] = [
  {
    id: 1,
    patientName: 'Adam Benali',
    patientAge: 7,
    participantCategory: 'enfant',
    date: '2026-04-15',
    time: '10:00',
    duration: 45,
    status: 'planned',
    lastScore: 78,
    notes: 'Séance de suivi mensuel – travail sur la communication',
  },
  {
    id: 2,
    patientName: 'Meryem Karim',
    patientAge: 12,
    participantCategory: 'jeune',
    date: '2026-04-17',
    time: '14:30',
    duration: 30,
    status: 'planned',
    lastScore: 64,
    notes: 'Évaluation des séquences guidées',
  },
  {
    id: 3,
    patientName: 'Youssef Amrani',
    patientAge: 9,
    participantCategory: 'enfant',
    date: '2026-04-10',
    time: '11:00',
    duration: 60,
    status: 'done',
    lastScore: 85,
    notes: 'Bilan mensuel de progression – très bonne séance',
  },
  {
    id: 4,
    patientName: 'Sara Mokhtar',
    patientAge: 14,
    participantCategory: 'jeune',
    date: '2026-04-10',
    time: '15:00',
    duration: 45,
    status: 'ongoing',
    lastScore: 71,
    notes: 'Session en cours – communication augmentative',
  },
];

export const STATUS_CONFIG: Record<SessionStatus, { label: string; bg: string; color: string }> = {
  planned: { label: 'Planifiée',  bg: '#DBEAFE', color: '#1D4ED8' },
  ongoing: { label: 'En cours',  bg: '#22C55E', color: '#fff'     },
  done:    { label: 'Terminée',  bg: '#E5E7EB', color: '#6B7280'  },
};

