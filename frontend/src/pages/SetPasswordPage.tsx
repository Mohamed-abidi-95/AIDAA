// ============================================================================
// SET PASSWORD PAGE — Fix: lire userId depuis l'URL (?userId=X) + Tailwind
// ============================================================================

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

export const SetPasswordPage = (): JSX.Element => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { setPassword, isLoading } = useAuth();

  // ── Lire userId depuis ?userId=X (lien email) OU location.state (navigation interne) ──
  const params      = new URLSearchParams(location.search);
  const queryUserId = params.get('userId');
  const stateUserId = (location.state as { userId?: number } | null)?.userId;
  const userId      = stateUserId ?? (queryUserId ? parseInt(queryUserId, 10) : undefined);

  const [password, setPasswordInput]       = useState('');
  const [confirmPassword, setConfirmInput] = useState('');
  const [showPwd, setShowPwd]              = useState(false);
  const [showConfirm, setShowConfirm]      = useState(false);
  const [error, setError]                  = useState('');

  if (!userId || isNaN(userId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-10 text-center max-w-md">
          <i className="fa-solid fa-link-slash text-4xl text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Lien invalide</h2>
          <p className="text-slate-500 text-sm mb-6">
            Ce lien d'invitation est invalide ou expiré.<br/>
            Demandez à votre contact de vous renvoyer une invitation.
          </p>
          <button onClick={() => navigate('/login')}
            className="bg-brand-green hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-all">
            Aller à la connexion
          </button>
        </div>
      </div>
    );
  }

  const strength = (() => {
    if (password.length === 0) return 0;
    let s = 0;
    if (password.length >= 6)  s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'][strength];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!password.trim())    { setError('Le mot de passe est requis.'); return; }
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
    try {
      const user = await setPassword(userId, password);
      switch (user.role) {
        case 'admin':        navigate('/admin/dashboard');        break;
        case 'professional': navigate('/professional/dashboard'); break;
        default:             navigate('/parent/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la configuration du mot de passe.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans px-4 py-12">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">

          {/* Header */}
          <div className="px-8 py-7 border-b border-slate-100 bg-gradient-to-br from-emerald-50 to-white">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-brand-green flex items-center justify-center text-white text-lg">
                <i className="fa-solid fa-key" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">Créez votre mot de passe</h1>
                <p className="text-sm text-slate-500">Espace professionnel AIDAA</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-7">
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Bienvenue sur <strong>AIDAA</strong> ! Définissez un mot de passe sécurisé pour accéder à votre espace professionnel.
            </p>

            {error && (
              <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl animate-slide-up">
                <i className="fa-solid fa-circle-xmark shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Nouveau mot de passe *
                </label>
                <div className="relative">
                  <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="Minimum 6 caractères"
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green transition-all"
                    required
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    <i className={`fa-solid ${showPwd ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                  </button>
                </div>
                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 h-1.5">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-slate-100'}`} />
                      ))}
                    </div>
                    <p className={`text-[11px] mt-1 font-medium ${strength <= 2 ? 'text-red-500' : strength <= 3 ? 'text-amber-500' : 'text-emerald-600'}`}>
                      {strengthLabel}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Confirmer le mot de passe *
                </label>
                <div className="relative">
                  <i className="fa-solid fa-lock-open absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmInput(e.target.value)}
                    placeholder="Répétez votre mot de passe"
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green transition-all"
                    required
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    <i className={`fa-solid ${showConfirm ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <p className={`text-[11px] mt-1.5 font-medium flex items-center gap-1.5
                    ${password === confirmPassword ? 'text-emerald-600' : 'text-red-500'}`}>
                    <i className={`fa-solid ${password === confirmPassword ? 'fa-check' : 'fa-xmark'}`} />
                    {password === confirmPassword ? 'Les mots de passe correspondent' : 'Ne correspondent pas'}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={isLoading || password.length < 6 || password !== confirmPassword}
                className="w-full flex items-center justify-center gap-2 bg-brand-green hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md shadow-brand-green/20 transition-all mt-1">
                {isLoading
                  ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Configuration en cours…</>
                  : <><i className="fa-solid fa-check" /> Créer mon mot de passe et accéder à l'espace</>
                }
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          © 2026 AIDAA — Plateforme de suivi pour enfants autistes
        </p>
      </div>
    </div>
  );
};
