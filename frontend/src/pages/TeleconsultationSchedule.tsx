// ============================================================================
// TELECONSULTATION SCHEDULE — Formulaire de planification d'une session
// ============================================================================
// Appelle POST /api/teleconsult pour créer une vraie session en BDD.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useToast, ToastStack } from '../components';
import api from '../lib/api';

interface Patient {
  id: number;
  name: string;
  age: number;
  parent_id: number;
  parent_name?: string;
  participant_category?: string;
}

interface ApiResult<T> { success: boolean; data: T; message?: string; }

interface FormState {
  patientId: string;
  date: string;
  time: string;
  duration: '30' | '45' | '60';
  notes: string;
}

// ============================================================================
export const TeleconsultationSchedule = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toasts, add: toast, remove: removeToast } = useToast();

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
  const [error,    setError]    = useState('');

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

  // ── Submit — real API ─────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const selectedPatient = patients.find(p => p.id === Number(form.patientId));
    if (!selectedPatient) { setError('Veuillez sélectionner un patient.'); return; }

    const parentId = selectedPatient.parent_id;
    const professionalId = user?.id;
    if (!professionalId) { setError('Utilisateur non authentifié.'); return; }

    const date_time = `${form.date}T${form.time}:00`;
    const meeting_link = `https://meet.aidaa.tn/session-${Date.now()}`;

    setLoading(true);
    try {
      const { data } = await api.post<ApiResult<{ id: number }>>('/api/teleconsult', {
        parentId,
        professionalId,
        date_time,
        meeting_link,
        notes: form.notes || `Session de ${form.duration} min`,
      });

      if (data.success) {
        setSuccess(true);
        toast('Session planifiée avec succès !', 'success');
        setTimeout(() => navigate('/professionnel/teleconsultation'), 2000);
      } else {
        setError(data.message || 'Erreur lors de la création.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erreur serveur. Veuillez réessayer.';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const durations: FormState['duration'][] = ['30', '45', '60'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 font-sans flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-orange-100 w-full max-w-xl overflow-hidden">

        {/* ── Card header ── */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-7 py-6 text-white">
          <button
            type="button"
            onClick={() => navigate('/professionnel/teleconsultation')}
            className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-semibold mb-4 transition-all"
          >
            <i className="fa-solid fa-arrow-left text-[10px]" /> Retour
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <i className="fa-solid fa-calendar-plus" /> Planifier une session
          </h1>
          <p className="text-sm text-white/80 mt-1">Choisissez un patient et un créneau horaire</p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="p-7">

          {/* Success banner */}
          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-5 text-emerald-700 font-semibold text-sm">
              <i className="fa-solid fa-circle-check" /> Session planifiée avec succès ! Redirection…
            </div>
          )}

          {/* Error banner */}
          {error && !success && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-red-700 font-semibold text-sm">
              <i className="fa-solid fa-circle-exclamation" /> {error}
            </div>
          )}

          <div className="flex flex-col gap-5">

            {/* Patient */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Patient *</label>
              <select
                required
                value={form.patientId}
                onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
                className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Date *</label>
                <input
                  type="date"
                  required
                  min={today}
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Heure *</label>
                <input
                  type="time"
                  required
                  value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Durée — button group */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Durée</label>
              <div className="flex gap-2">
                {durations.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, duration: d }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      form.duration === d
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600'
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Notes (optionnel)</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Objectifs de la session, points à aborder…"
                rows={3}
                className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-y leading-relaxed"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success || !form.patientId || !form.date || !form.time}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-[15px] rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
            >
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin" /> Planification en cours…</>
                : <><i className="fa-solid fa-check" /> Confirmer la session</>}
            </button>
          </div>

          {/* Cancel */}
          <p className="text-center mt-5 mb-0">
            <button
              type="button"
              onClick={() => navigate('/professionnel/teleconsultation')}
              className="text-slate-400 hover:text-slate-600 text-sm underline transition-colors"
            >
              Annuler
            </button>
          </p>
        </form>
      </div>

      {/* ── Toasts ── */}
      <ToastStack toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

