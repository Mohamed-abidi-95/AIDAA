import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import type { SignupRequest } from '../types';
import '../styles/LoginPage.css';

// SVG cross logo (reuse from LoginPage)
const CrossLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect x="15" y="4" width="10" height="32" rx="3" fill="white" fillOpacity="0.9"/>
    <rect x="4" y="15" width="32" height="10" rx="3" fill="white" fillOpacity="0.9"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export const SignupPage = (): JSX.Element => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const auth = useAuth() as any;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      };

      // Try signup via authService directly if hook doesn't have signup
      let response;
      if (typeof auth.signup === 'function') {
        response = await auth.signup(payload);
      } else {
        // Fallback: direct API call
        const { default: api } = await import('../lib/api');
        const { data } = await api.post('/api/auth/signup', payload);
        response = data;
      }

      // If pending approval, redirect to waiting page
      if (response?.pendingApproval || response?.data?.pendingApproval) {
        navigate('/pending');
        return;
      }

      navigate('/role-selection');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Inscription échouée');
      } else {
        setError('Inscription échouée');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* ── Left brand panel ── */}
      <div className="login-brand-panel">
        <div className="login-brand-logo"><CrossLogo /></div>
        <h1 className="login-brand-title">AIDAA</h1>
        <p className="login-brand-subtitle">
          Rejoignez la plateforme de suivi<br />pour enfants autistes
        </p>
        <div className="login-brand-features">
          {[
            { icon: '👨‍👩‍👧', text: 'Espace dédié aux parents' },
            { icon: '🔐', text: 'Compte validé par l\'admin' },
            { icon: '📊', text: 'Suivi des activités en temps réel' },
            { icon: '🎮', text: 'Jeux éducatifs adaptés' },
          ].map((f) => (
            <div className="login-brand-feature" key={f.text}>
              <span className="login-brand-feature-icon">{f.icon}</span>
              <span className="login-brand-feature-text">{f.text}</span>
            </div>
          ))}
        </div>
        <div className="login-brand-version">v1.0 — PFE 2026</div>
      </div>

      {/* ── Right form panel ── */}
      <div className="login-form-panel">
        <div className="login-card">

          <div className="login-header-badge">
            <span className="badge-dot" /> Créer un compte parent
          </div>

          <h2 className="login-title">Inscription</h2>
          <p className="login-sub">Votre compte sera activé après validation par l'administrateur</p>

          {error && (
            <div className="error-message" role="alert">
              <span className="error-icon">✕</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Nom complet</label>
              <div className="input-wrap">
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="Votre nom complet"
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Adresse e-mail</label>
              <div className="input-wrap">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="exemple@email.com"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Mot de passe</label>
              <div className="input-wrap">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input input-with-action"
                  placeholder="Au moins 6 caractères"
                  minLength={6}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPwd(v => !v)}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading
                ? <><span className="btn-spinner" /> Inscription…</>
                : 'Créer mon compte →'
              }
            </button>
          </form>

          <div className="login-divider"><span>ou</span></div>

          <button
            type="button"
            className="signup-link-button"
            onClick={() => navigate('/login')}
            disabled={isLoading}
          >
            ← Retour à la connexion
          </button>

          <p className="login-footer-note">
            © 2026 AIDAA — Application de suivi pour enfants autistes
          </p>
        </div>
      </div>
    </div>
  );
};

