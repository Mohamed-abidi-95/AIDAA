import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import api from '../lib/api';
import type { SignupRequest } from '../types';

export const SignupPage = (): JSX.Element => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const auth = useAuth() as any;

  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Nom, email et mot de passe sont requis');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setIsLoading(true);
    try {
      const payload: SignupRequest = {
        name:     name.trim(),
        email:    email.trim().toLowerCase(),
        password,
      };
      let response;
      if (typeof auth.signup === 'function') {
        response = await auth.signup(payload);
      } else {
        const { data } = await api.post('/api/auth/signup', payload);
        response = data;
      }
      if (response?.pendingApproval || response?.data?.pendingApproval) {
        navigate('/pending');
        return;
      }
      navigate('/role-selection');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inscription échouée');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: 'fa-solid fa-users',         text: 'Espace dédié aux parents'           },
    { icon: 'fa-solid fa-shield-halved', text: "Compte validé par l'administrateur" },
    { icon: 'fa-solid fa-chart-line',    text: 'Suivi des activités en temps réel'  },
    { icon: 'fa-solid fa-gamepad',       text: 'Jeux éducatifs adaptés'             },
  ];

  const inputCls = `block w-full py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 bg-white
    transition-all focus:outline-none focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange
    ${isLoading ? 'opacity-55 cursor-not-allowed' : ''}`;

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
            <i className="fa-solid fa-puzzle-piece" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">AIDAA</h1>
          <p className="text-orange-100 text-lg max-w-md leading-relaxed font-light">
            Rejoignez la plateforme de suivi et d'accompagnement pour enfants autistes.
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

          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold uppercase tracking-wide mb-5">
              <i className="fa-solid fa-user-plus text-[10px]" /> Compte parent
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Créer mon compte</h2>
            <p className="text-slate-500 text-sm">Votre compte sera activé après validation par l'administrateur.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium" role="alert">
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0">✕</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Nom */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nom complet</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <i className="fa-regular fa-user" />
                </div>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Votre nom complet" autoComplete="name" disabled={isLoading}
                  className={`${inputCls} pl-10 pr-4`} />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Adresse e-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <i className="fa-regular fa-envelope" />
                </div>
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="exemple@email.com" autoComplete="email" disabled={isLoading}
                  className={`${inputCls} pl-10 pr-4`} />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <i className="fa-solid fa-lock" />
                </div>
                <input id="password" type={showPwd ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Au moins 6 caractères"
                  minLength={6} autoComplete="new-password" disabled={isLoading}
                  className={`${inputCls} pl-10 pr-10`} />
                <button type="button" tabIndex={-1} onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                  <i className={showPwd ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'} />
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-orange-700 disabled:opacity-65 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl shadow-lg shadow-brand-orange/20 transition-all duration-200 hover:-translate-y-0.5">
              {isLoading
                ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" /> Inscription…</>
                : <>Créer mon compte <i className="fa-solid fa-arrow-right text-sm" /></>
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
            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-xl transition-all duration-200 shadow-sm">
            <i className="fa-solid fa-arrow-left text-slate-400 text-sm" />
            Retour à la connexion
          </Link>

          <p className="mt-10 text-center text-xs text-slate-400">
            © 2026 AIDAA — Application de suivi pour enfants autistes
          </p>
        </div>
      </div>
    </div>
  );
};

