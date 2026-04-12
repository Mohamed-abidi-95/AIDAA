// ============================================================================
// FORGOT PASSWORD PAGE
// ============================================================================
// Envoie un email de réinitialisation — même design split-screen que Login

import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const ForgotPasswordPage = (): JSX.Element => {
  const [email,      setEmail]      = useState('');
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState('');
  const [sent,       setSent]       = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const emailTouched = email.length > 0;
  const emailValid   = isValidEmail(email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError("L'adresse e-mail est requise"); return; }
    if (!emailValid)   { setError('Adresse e-mail invalide'); return; }
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await api.post<any>('/api/auth/forgot-password', { email: email.trim().toLowerCase() });
      if (res.data?.previewUrl) setPreviewUrl(res.data.previewUrl);
      setSent(true);
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message
        || (err instanceof Error ? err.message : 'Erreur réseau. Vérifiez votre connexion.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: 'fa-solid fa-key',           text: 'Récupération sécurisée'   },
    { icon: 'fa-regular fa-envelope',    text: 'Lien envoyé par e-mail'   },
    { icon: 'fa-regular fa-clock',       text: 'Lien valide 1 heure'      },
    { icon: 'fa-solid fa-shield-halved', text: 'Token à usage unique'      },
  ];

  return (
    <div className="font-sans antialiased text-slate-800 bg-slate-50 h-screen flex overflow-hidden">

      {/* ══════════════════ LEFT BRANDING PANEL ══════════════════ */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative bg-gradient-to-br from-brand-orange to-orange-500 overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-orange-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 pt-4">
          <div className="w-14 h-14 bg-white text-brand-orange rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-orange-900/20 mb-6">
            <i className="fa-solid fa-key" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">AIDAA</h1>
          <p className="text-orange-100 text-lg max-w-md leading-relaxed font-light">
            Plateforme de suivi et d'accompagnement pour enfants autistes.
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-4 max-w-md my-auto">
          {features.map(f => (
            <div key={f.text} className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-white/20">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                <i className={f.icon} />
              </div>
              <span className="text-white font-medium">{f.text}</span>
            </div>
          ))}
        </div>

        <div className="relative z-10 text-orange-200/70 text-xs font-medium uppercase tracking-wider pb-4">
          v1.0 — PFE 2026
        </div>
      </div>

      {/* ══════════════════ RIGHT PANEL ══════════════════════ */}
      <div className="w-full lg:w-7/12 xl:w-1/2 flex flex-col justify-center bg-white relative overflow-y-auto">
        <div className="w-full max-w-[440px] mx-auto px-6 py-12 lg:px-8">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-brand-orange text-white rounded-lg flex items-center justify-center text-xl shadow-lg shadow-orange-500/30">
              <i className="fa-solid fa-key" />
            </div>
            <span className="text-2xl font-bold text-slate-800">AIDAA</span>
          </div>

          {/* ── État : formulaire ─────────────────────────────── */}
          {!sent && (
            <>
              <div className="mb-8">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold uppercase tracking-wide mb-5">
                  <i className="fa-solid fa-rotate-left text-[10px]" /> Récupération de compte
                </span>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Mot de passe oublié ?</h2>
                <p className="text-slate-500 text-sm">
                  Entrez votre adresse e-mail. Vous recevrez un lien sécurisé pour choisir un nouveau mot de passe.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium" role="alert">
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0">✕</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">Adresse e-mail</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <i className="fa-regular fa-envelope" />
                    </div>
                    <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="exemple@email.com" autoComplete="email" disabled={isLoading}
                      className={`block w-full pl-10 pr-9 py-3 border rounded-xl text-slate-900 placeholder-slate-400 bg-white transition-all focus:outline-none focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange
                        ${emailTouched ? (emailValid ? 'border-brand-orange' : 'border-amber-400') : 'border-slate-200'}
                        ${isLoading ? 'opacity-55 cursor-not-allowed' : ''}`}
                    />
                    {emailTouched && emailValid && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-orange font-bold text-sm pointer-events-none">✓</span>
                    )}
                  </div>
                </div>

                <button type="submit" disabled={isLoading || !emailValid}
                  className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-orange-700 disabled:opacity-55 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl shadow-lg shadow-brand-orange/20 transition-all duration-200 hover:-translate-y-0.5">
                  {isLoading
                    ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" /> Envoi en cours…</>
                    : <>Envoyer le lien <i className="fa-solid fa-paper-plane text-sm" /></>
                  }
                </button>
              </form>

              <div className="relative my-7">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-400 text-xs uppercase tracking-wider">ou</span>
                </div>
              </div>

              <Link to="/login"
                className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-xl transition-all shadow-sm">
                <i className="fa-solid fa-arrow-left text-slate-400 text-sm" />
                Retour à la connexion
              </Link>
            </>
          )}

          {/* ── État : e-mail envoyé ───────────────────────────── */}
          {sent && (
            <div className="text-center">
              {/* Icône succès */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                <i className="fa-regular fa-envelope text-white text-3xl" />
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wide mb-4">
                <i className="fa-solid fa-circle-check text-[10px]" /> E-mail envoyé
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Consultez votre boîte mail !</h2>
              <p className="text-slate-500 text-sm mb-6">
                Un lien a été envoyé à <strong className="text-slate-800">{email}</strong>
              </p>

              {/* Instructions */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-left mb-5">
                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-3">Étapes suivantes</p>
                <ol className="text-sm text-emerald-700 space-y-2.5">
                  <li className="flex items-start gap-2.5">
                    <i className="fa-solid fa-inbox mt-0.5 shrink-0" />
                    Consultez votre boîte e-mail
                  </li>
                  <li className="flex items-start gap-2.5">
                    <i className="fa-solid fa-arrow-pointer mt-0.5 shrink-0" />
                    Cliquez sur le lien dans le message AIDAA
                  </li>
                  <li className="flex items-start gap-2.5">
                    <i className="fa-solid fa-key mt-0.5 shrink-0" />
                    Choisissez un nouveau mot de passe
                  </li>
                  <li className="flex items-start gap-2.5">
                    <i className="fa-regular fa-clock mt-0.5 shrink-0" />
                    Le lien est valable <strong>1 heure</strong>
                  </li>
                </ol>
              </div>

              <p className="text-xs text-slate-400 mb-5">
                Vous ne trouvez pas l'e-mail ? Vérifiez vos spams.
              </p>

              {/* Mode démo Ethereal */}
              {previewUrl && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-5">
                  <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                    <i className="fa-solid fa-flask" /> Mode démo — Prévisualisation :
                  </p>
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-emerald-700 font-semibold break-all hover:underline">
                    {previewUrl}
                  </a>
                  <p className="text-[11px] text-slate-400 mt-1">(Aucun vrai email envoyé — Ethereal)</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Link to="/login"
                  className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-orange-700 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-brand-orange/20 transition-all hover:-translate-y-0.5">
                  Retour à la connexion <i className="fa-solid fa-arrow-right text-sm" />
                </Link>
                <button type="button" onClick={() => { setSent(false); setEmail(''); }}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-xl transition-all shadow-sm">
                  <i className="fa-solid fa-rotate-left text-slate-400 text-sm" />
                  Renvoyer avec un autre e-mail
                </button>
              </div>
            </div>
          )}

          <p className="mt-10 text-center text-xs text-slate-400">
            © 2026 AIDAA — Application de suivi pour enfants autistes
          </p>
        </div>
      </div>
    </div>
  );
};

