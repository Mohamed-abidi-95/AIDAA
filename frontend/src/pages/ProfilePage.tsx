// ============================================================================
// PROFILE PAGE — Modifier son profil (nom, spécialité, mot de passe)
// Accessible depuis tous les dashboards via /profile
// Thème : adaptatif (vert pour parent/admin, orange pour professionnel)
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import api from '../lib/api';

interface ApiResult<T> { success: boolean; data: T; message?: string; }
interface ProfileData {
  id: number; name: string; email: string; role: string;
  specialite?: string | null; created_at: string;
}

const ROLE_BACK: Record<string, string> = {
  parent:       '/parent/dashboard',
  professional: '/professional/dashboard',
  admin:        '/admin/dashboard',
};

const ROLE_COLOR: Record<string, { accent: string; btn: string; ring: string; bg: string }> = {
  parent:       { accent: 'text-brand-green', btn: 'bg-brand-green hover:bg-emerald-700', ring: 'focus:ring-brand-green/20 focus:border-brand-green', bg: 'from-green-600 via-emerald-500 to-teal-500' },
  professional: { accent: 'text-brand-orange', btn: 'bg-brand-orange hover:bg-orange-700', ring: 'focus:ring-brand-orange/20 focus:border-brand-orange', bg: 'from-orange-600 via-orange-500 to-amber-500' },
  admin:        { accent: 'text-purple-600', btn: 'bg-purple-600 hover:bg-purple-700', ring: 'focus:ring-purple-600/20 focus:border-purple-600', bg: 'from-purple-700 via-purple-600 to-indigo-600' },
};

const inputCls = (ring: string) =>
  `w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 bg-white text-sm focus:outline-none focus:ring-4 ${ring} transition-all`;

export const ProfilePage = (): JSX.Element => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const role  = user?.role || 'parent';
  const theme = ROLE_COLOR[role] ?? ROLE_COLOR['parent'];
  const back  = ROLE_BACK[role] ?? '/';

  const [profile, setProfile]               = useState<ProfileData | null>(null);
  const [loading, setLoading]               = useState(true);
  const [saving,  setSaving]                = useState(false);
  const [success, setSuccess]               = useState('');
  const [error,   setError]                 = useState('');

  // Form fields
  const [name,            setName]            = useState('');
  const [specialite,      setSpecialite]      = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd,         setShowPwd]         = useState(false);

  // ── Load profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get<ApiResult<ProfileData>>('/api/auth/me');
        if (data.success) {
          setProfile(data.data);
          setName(data.data.name || '');
          setSpecialite(data.data.specialite || '');
        }
      } catch { setError('Impossible de charger le profil.'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      setSaving(true);
      const payload: Record<string, string> = { name, specialite };
      if (newPassword) { payload.currentPassword = currentPassword; payload.newPassword = newPassword; }

      const { data } = await api.put<ApiResult<ProfileData>>('/api/auth/me', payload);
      if (data.success) {
        setProfile(data.data);
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        setSuccess('Profil mis à jour avec succès !');
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(data.message || 'Erreur lors de la mise à jour.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur serveur.');
    } finally {
      setSaving(false);
    }
  };

  const initial = name.charAt(0).toUpperCase() || '?';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} font-sans flex items-center justify-center p-6`}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className={`bg-gradient-to-r ${theme.bg} px-7 py-6 text-white`}>
          <button
            type="button"
            onClick={() => navigate(back)}
            className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-semibold mb-5 transition-all"
          >
            <i className="fa-solid fa-arrow-left text-[10px]" /> Retour
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {initial}
            </div>
            <div>
              <h1 className="text-xl font-bold">{loading ? '…' : (profile?.name || user?.name)}</h1>
              <p className="text-sm text-white/80 capitalize">{role}</p>
              {profile?.email && <p className="text-xs text-white/60 mt-0.5">{profile.email}</p>}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-7">

          {loading && (
            <div className="flex justify-center py-12">
              <span className={`w-10 h-10 rounded-full border-4 border-slate-200 ${role === 'professional' ? 'border-t-brand-orange' : 'border-t-brand-green'} animate-spin`} />
            </div>
          )}

          {!loading && (
            <form onSubmit={handleSave} className="flex flex-col gap-5">

              {/* Success / Error */}
              {success && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-semibold">
                  <i className="fa-solid fa-circle-check" /> {success}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
                  <i className="fa-solid fa-circle-exclamation" /> {error}
                </div>
              )}

              {/* ── Informations générales ── */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Informations générales</p>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom complet</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className={inputCls(theme.ring)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-400 bg-slate-50 text-sm cursor-not-allowed"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">L'email ne peut pas être modifié.</p>
                  </div>

                  {role === 'professional' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Spécialité</label>
                      <input
                        type="text"
                        value={specialite}
                        onChange={e => setSpecialite(e.target.value)}
                        placeholder="Ex : Orthophonie, Psychomotricité…"
                        className={inputCls(theme.ring)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ── Changer le mot de passe ── */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Changer le mot de passe</p>
                  <span className="text-xs text-slate-400">(optionnel)</span>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mot de passe actuel</label>
                    <div className="relative">
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="Votre mot de passe actuel"
                        className={inputCls(theme.ring) + ' pr-11'}
                      />
                      <button type="button" onClick={() => setShowPwd(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                        <i className={`fa-solid ${showPwd ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nouveau mot de passe</label>
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="≥ 6 caractères"
                        className={inputCls(theme.ring)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirmer</label>
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Répéter le mot de passe"
                        className={inputCls(theme.ring)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Member since ── */}
              {profile?.created_at && (
                <p className="text-xs text-slate-400 text-center">
                  <i className="fa-regular fa-calendar mr-1" />
                  Membre depuis le {new Date(profile.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              )}

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-3.5 ${theme.btn} disabled:opacity-60 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2`}
              >
                {saving
                  ? <><i className="fa-solid fa-spinner fa-spin" /> Enregistrement…</>
                  : <><i className="fa-solid fa-floppy-disk" /> Enregistrer les modifications</>
                }
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

