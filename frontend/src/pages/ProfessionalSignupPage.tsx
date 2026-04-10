// ============================================================================
// PROFESSIONAL SIGNUP PAGE
// ============================================================================
// Page d'inscription pour les professionnels de santé.
// Le compte est soumis à validation par un administrateur.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

// ── SVG Icons ──────────────────────────────────────────────────────────────
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

export const ProfessionalSignupPage = (): JSX.Element => {
  const navigate = useNavigate();

  const [name, setName]                     = useState('');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPwd, setConfirmPwd]         = useState('');
  const [showPwd, setShowPwd]               = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isLoading, setIsLoading]           = useState(false);
  const [error, setError]                   = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!name.trim())        { setError('Le nom complet est requis.'); return; }
    if (!email.trim())       { setError("L'adresse e-mail est requise."); return; }
    if (!password)           { setError('Le mot de passe est requis.'); return; }
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    if (password !== confirmPwd) { setError('Les mots de passe ne correspondent pas.'); return; }

    setIsLoading(true);
    try {
      const { default: api } = await import('../lib/api');
      const { data } = await api.post('/api/auth/signup-professional', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (data?.pendingApproval || data?.data?.pendingApproval) {
        navigate('/pending');
        return;
      }

      navigate('/login');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosErr = err as any;
        setError(axiosErr.response?.data?.message || "Inscription échouée. Veuillez réessayer.");
      } else if (err instanceof Error) {
        setError(err.message || "Inscription échouée.");
      } else {
        setError("Inscription échouée. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* ── Left brand panel ── */}
      <div className="login-brand-panel">
        <div className="login-brand-pattern" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="brand-cross-dot" />
          ))}
        </div>

        <div className="login-brand-logo"><CrossLogo /></div>
        <h1 className="login-brand-title">AIDAA</h1>
        <p className="login-brand-subtitle">
          Espace dédié aux professionnels<br />de santé et d'accompagnement
        </p>

        <div className="login-brand-features">
          {[
            { icon: '🩺', text: 'Suivi clinique des patients' },
            { icon: '📋', text: 'Notes et observations médicales' },
            { icon: '💬', text: 'Communication avec les familles' },
            { icon: '🔐', text: 'Compte validé par un administrateur' },
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
            <span className="badge-dot" /> Inscription professionnelle
          </div>

          <h2 className="login-title">Créer un compte</h2>
          <p className="login-sub">
            Votre compte sera activé après validation par l'administrateur
          </p>

          {error && (
            <div className="error-message" role="alert">
              <span className="error-icon">✕</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>

            {/* Nom complet */}
            <div className="form-group">
              <label htmlFor="pro-name" className="form-label">Nom complet</label>
              <div className="input-wrap">
                <input
                  id="pro-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="Dr. Prénom Nom"
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="pro-email" className="form-label">Adresse e-mail professionnelle</label>
              <div className="input-wrap">
                <input
                  id="pro-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="exemple@cabinet.com"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="form-group">
              <label htmlFor="pro-password" className="form-label">Mot de passe</label>
              <div className="input-wrap">
                <input
                  id="pro-password"
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
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                >
                  {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Confirmer mot de passe */}
            <div className="form-group">
              <label htmlFor="pro-confirm-pwd" className="form-label">Confirmer le mot de passe</label>
              <div className="input-wrap">
                <input
                  id="pro-confirm-pwd"
                  type={showConfirmPwd ? 'text' : 'password'}
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  className="form-input input-with-action"
                  placeholder="Répétez votre mot de passe"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowConfirmPwd(v => !v)}
                  tabIndex={-1}
                  aria-label={showConfirmPwd ? 'Masquer' : 'Afficher'}
                >
                  {showConfirmPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading
                ? <><span className="btn-spinner" /> Inscription…</>
                : 'Soumettre ma candidature →'
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

