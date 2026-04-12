// ============================================================================
// LOGIN PAGE — Design matching Login.html (Tailwind v3 + FontAwesome)
// ============================================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

// ── Helpers ────────────────────────────────────────────────────────────────
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const LoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [email, setEmail]           = useState<string>('');
  const [password, setPassword]     = useState<string>('');
  const [showPassword, setShowPwd]  = useState<boolean>(false);
  const [error, setError]           = useState<string>('');
  const [isLoading, setIsLoading]   = useState<boolean>(false);

  const emailTouched = email.length > 0;
  const emailValid   = isValidEmail(email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    if (!email.trim())    { setError("L'adresse e-mail est requise"); return; }
    if (!password.trim()) { setError('Le mot de passe est requis');   return; }
    setIsLoading(true);
    try {
      const response = await authLogin(email, password);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = response as any;
      if (r.mustSetPassword)  { navigate('/set-password', { state: { userId: r.userId } }); return; }
      if (r.pendingApproval)  { navigate('/pending'); return; }
      // Read role from response data directly (avoids localStorage timing issues)
      const userRole: string = r.data?.user?.role ?? JSON.parse(localStorage.getItem('aidaa_user') ?? '{}')?.role ?? '';
      if (userRole === 'parent')           navigate('/role-selection');
      else if (userRole === 'admin')       navigate('/admin/dashboard');
      else if (userRole === 'professional') navigate('/professional/dashboard');
      else                                 navigate('/role-selection');
    } catch (err) {
      let msg = 'Connexion échouée. Veuillez réessayer.';
      if (err instanceof Error) {
        if (err.message.includes('Invalid'))                                          msg = 'Email ou mot de passe incorrect';
        else if (err.message.includes('Network') || err.message.includes('Cannot connect')) msg = 'Erreur réseau : impossible de joindre le serveur';
        else if (err.message.includes('timeout'))                                    msg = 'Délai dépassé : serveur inaccessible';
        else msg = err.message;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans antialiased text-slate-800 bg-slate-50 h-screen flex overflow-hidden">

      {/* ══════════════════ LEFT BRANDING PANEL ══════════════════ */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative bg-gradient-to-br from-brand-orange to-orange-500 overflow-hidden flex-col justify-between p-12">

        {/* Decorative blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-orange-700/20 rounded-full blur-3xl pointer-events-none" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Top: logo + title */}
        <div className="relative z-10 pt-4">
          <div className="w-14 h-14 bg-white text-brand-orange rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-orange-900/20 mb-6">
            <i className="fa-solid fa-puzzle-piece" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">AIDAA</h1>
          <p className="text-orange-100 text-lg max-w-md leading-relaxed font-light">
            Plateforme de suivi et d'accompagnement pour enfants autistes.
          </p>
        </div>

        {/* Middle: feature cards */}
        <div className="relative z-10 flex flex-col gap-4 max-w-md my-auto">
          {[
            { icon: 'fa-solid fa-users',       text: 'Espace parent & enfant'      },
            { icon: 'fa-solid fa-user-doctor', text: 'Suivi médical professionnel' },
            { icon: 'fa-solid fa-chart-line',  text: 'Activités & progression'     },
            { icon: 'fa-solid fa-gamepad',     text: 'Jeux éducatifs adaptés'      },
          ].map(f => (
            <div key={f.text} className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-white/20">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                <i className={f.icon} />
              </div>
              <span className="text-white font-medium">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Bottom: version */}
        <div className="relative z-10 text-orange-200/70 text-xs font-medium uppercase tracking-wider pb-4">
          v1.0 — PFE 2026
        </div>
      </div>

      {/* ══════════════════ RIGHT FORM PANEL ══════════════════════ */}
      <div className="w-full lg:w-7/12 xl:w-1/2 flex flex-col justify-center bg-white relative overflow-y-auto">
        <div className="w-full max-w-[440px] mx-auto px-6 py-12 lg:px-8">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-brand-orange text-white rounded-lg flex items-center justify-center text-xl shadow-lg shadow-orange-500/30">
              <i className="fa-solid fa-puzzle-piece" />
            </div>
            <span className="text-2xl font-bold text-slate-800">AIDAA</span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold uppercase tracking-wide mb-5">
              <i className="fa-solid fa-shield-halved text-[10px]" /> Espace sécurisé
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Bon retour !</h2>
            <p className="text-slate-500 text-sm">Connectez-vous à votre espace AIDAA pour continuer.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium animate-[slideDown_0.25s_ease]" role="alert">
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0">✕</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Adresse e-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <i className="fa-regular fa-envelope" />
                </div>
                <input
                  id="email" type="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  autoComplete="email"
                  disabled={isLoading}
                  className={`block w-full pl-10 pr-9 py-3 border rounded-xl text-slate-900 placeholder-slate-400 bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange
                    ${emailTouched ? (emailValid ? 'border-brand-orange' : 'border-amber-400') : 'border-slate-200'}
                    ${isLoading ? 'opacity-55 cursor-not-allowed' : ''}`}
                />
                {emailTouched && emailValid && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-orange font-bold text-sm pointer-events-none">✓</span>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">Mot de passe</label>
                <Link to="/forgot-password"
                  className="text-xs font-medium text-brand-orange hover:text-orange-700 transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <i className="fa-solid fa-lock" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className={`block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange ${isLoading ? 'opacity-55 cursor-not-allowed' : ''}`}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPwd(v => !v)}
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                  <i className={showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-orange-700 disabled:opacity-65 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl shadow-lg shadow-brand-orange/20 transition-all duration-200 hover:-translate-y-0.5">
              {isLoading
                ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" /> Connexion…</>
                : <>Se connecter <i className="fa-solid fa-arrow-right text-sm" /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400 text-xs uppercase tracking-wider">ou</span>
            </div>
          </div>

          {/* Sign-up links */}
          <div className="space-y-3">
            <Link to="/signup"
              className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-xl transition-all duration-200 shadow-sm">
              <i className="fa-regular fa-user text-slate-400" />
              Créer un compte parent
            </Link>
            <Link to="/signup/professional"
              className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-xl transition-all duration-200 shadow-sm">
              <i className="fa-solid fa-stethoscope text-slate-400" />
              S'inscrire en tant que professionnel
            </Link>
          </div>

          <p className="mt-12 text-center text-xs text-slate-400">
            © 2026 AIDAA — Application de suivi pour enfants autistes
          </p>
        </div>
      </div>

    </div>
  );
};
