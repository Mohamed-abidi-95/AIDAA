// ============================================================================
// TELECONSULTATION SCHEDULE — Formulaire de planification d'une session
// ============================================================================

import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

interface Patient {
  id: number;
  name: string;
  age: number;
  participant_category?: string;
}

interface ApiResult<T> { success: boolean; data: T; }

interface FormState {
  patientId: string;
  date: string;
  time: string;
  duration: '30' | '45' | '60';
  notes: string;
}

const FIELD_LABEL: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#8C6840',
  textTransform: 'uppercase',
  letterSpacing: '0.9px',
  marginBottom: 7,
};

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  border: '1.5px solid #F0E6D8',
  borderRadius: 10,
  fontSize: 14,
  fontFamily: 'inherit',
  color: '#1A0D00',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.2s',
};

// ============================================================================
export const TeleconsultationSchedule = (): JSX.Element => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm]         = useState<FormState>({
    patientId: '',
    date:      '',
    time:      '',
    duration:  '45',
    notes:     '',
  });
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  // ── Load patients ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get<ApiResult<Patient[]>>('/api/professional/my-children');
        if (data.success && data.data.length > 0) {
          setPatients(data.data);
          setForm(f => ({ ...f, patientId: String(data.data[0].id) }));
          return;
        }
      } catch { /* fallback */ }
      try {
        const { data: d2 } = await api.get<ApiResult<Patient[]>>('/api/child/all');
        if (d2.success && d2.data.length > 0) {
          setPatients(d2.data);
          setForm(f => ({ ...f, patientId: String(d2.data[0].id) }));
        }
      } catch { /* silent */ }
    };
    load();
  }, []);

  // ── Submit (mock) ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900)); // simulate API
    setLoading(false);
    setSuccess(true);
    setTimeout(() => navigate('/professionnel/teleconsultation'), 2000);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #9E4000 0%, #C45E0A 50%, #E07820 100%)',
      fontFamily: "'Inter','Segoe UI',sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 28px rgba(224,120,32,.18)',
        border: '1px solid #F0E6D8',
        width: '100%',
        maxWidth: 520,
        overflow: 'hidden',
      }}>

        {/* ── Card header ── */}
        <div style={{
          background: 'linear-gradient(135deg, #9E4000 0%, #C45E0A 60%, #E07820 100%)',
          padding: '26px 28px 24px',
          color: '#fff',
        }}>
          <button
            type="button"
            onClick={() => navigate('/professionnel/teleconsultation')}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              padding: '5px 12px',
              fontSize: 12,
              cursor: 'pointer',
              marginBottom: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'inherit',
              fontWeight: 600,
            }}
          >
            ← Retour
          </button>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>🗓️ Planifier une session</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, opacity: 0.82 }}>
            Choisissez un patient et un créneau horaire
          </p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} style={{ padding: '28px' }}>

          {/* Success banner */}
          {success && (
            <div style={{
              background: '#FEF3E7',
              border: '1px solid #F5A94E',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 20,
              color: '#C45E0A',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              ✅ Session planifiée avec succès ! Redirection…
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Patient */}
            <div>
              <label style={FIELD_LABEL}>Patient *</label>
              <select
                required
                value={form.patientId}
                onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
                style={INPUT_STYLE}
              >
                {patients.length === 0
                  ? <option value="">Aucun patient disponible</option>
                  : patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.age} ans{p.participant_category ? ` · ${p.participant_category}` : ''})
                      </option>
                    ))
                }
              </select>
            </div>

            {/* Date + Heure */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={FIELD_LABEL}>Date *</label>
                <input
                  type="date"
                  required
                  min={today}
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  style={INPUT_STYLE}
                />
              </div>
              <div>
                <label style={FIELD_LABEL}>Heure *</label>
                <input
                  type="time"
                  required
                  value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  style={INPUT_STYLE}
                />
              </div>
            </div>

            {/* Durée */}
            <div>
              <label style={FIELD_LABEL}>Durée</label>
              <select
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: e.target.value as FormState['duration'] }))}
                style={INPUT_STYLE}
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label style={FIELD_LABEL}>Notes (optionnel)</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Objectifs de la session, points à aborder…"
                rows={3}
                style={{ ...INPUT_STYLE, resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success || !form.patientId || !form.date || !form.time}
              style={{
                width: '100%',
                padding: '14px',
                background: '#E07820',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(224,120,32,.3)',
                opacity: (loading || success || !form.patientId || !form.date || !form.time) ? 0.65 : 1,
                transition: 'opacity 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {loading ? '⏳ Planification en cours…' : '✅ Confirmer la session'}
            </button>
          </div>

          {/* Cancel */}
          <p style={{ textAlign: 'center', marginTop: 18, marginBottom: 0 }}>
            <button
              type="button"
              onClick={() => navigate('/professionnel/teleconsultation')}
              style={{
                background: 'none',
                border: 'none',
              color: '#8C6840',
              cursor: 'pointer',
              fontSize: 13,
              textDecoration: 'underline',
              fontFamily: 'inherit',
              }}
            >
              Annuler
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};







