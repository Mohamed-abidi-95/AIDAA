// ============================================================================
// LOGIN PAGE
// ============================================================================
// Page for user authentication with email and password

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import '../styles/LoginPage.css';

// ── SVG Icons ──────────────────────────────────────────────────────────────
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

const CrossLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect x="15" y="4" width="10" height="32" rx="3" fill="white" fillOpacity="0.9"/>
    <rect x="4" y="15" width="32" height="10" rx="3" fill="white" fillOpacity="0.9"/>
  </svg>
);

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

  // email valid indicator (only show after user typed something)
  const emailTouched = email.length > 0;
  const emailValid   = isValidEmail(email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('L\'adresse e-mail est requise'); return; }
    if (!password.trim()) { setError('Le mot de passe est requis'); return; }

    setIsLoading(true);
    try {
      console.log('[Login] Attempting login with email:', email);
      const response = await authLogin(email, password);
      console.log('[Login] Response:', response);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = response as any;

      if (r.mustSetPassword) {
        navigate('/set-password', { state: { userId: r.userId } });
        return;
      }

      // Account pending admin approval
      if (r.pendingApproval) {
        navigate('/pending');
        return;
      }

      const storedUserJson = localStorage.getItem('aidaa_user');
      if (!storedUserJson) { setError('Login failed: User data not saved'); return; }

      const user = JSON.parse(storedUserJson);
      await new Promise(resolve => setTimeout(resolve, 300));

      if (user.role === 'parent')        navigate('/role-selection');
      else if (user.role === 'admin')    navigate('/admin/dashboard');
      else if (user.role === 'professional') navigate('/professional/dashboard');
      else navigate('/role-selection');

    } catch (err) {
      console.error('[Login] Error:', err);
      let msg = 'Connexion échouée. Veuillez réessayer.';
      if (err instanceof Error) {
        if (err.message.includes('Invalid'))  msg = 'Email ou mot de passe incorrect';
        else if (err.message.includes('Network') || err.message.includes('Cannot connect'))
          msg = 'Erreur réseau : impossible de joindre le serveur';
        else if (err.message.includes('timeout')) msg = 'Délai dépassé : serveur inaccessible';
        else msg = err.message;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* ── Panneau branding gauche ── */}
      <div className="login-brand-panel">
        {/* Pattern de croix en fond */}
        <div className="login-brand-pattern" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="brand-cross-dot" />
          ))}
        </div>

        <div className="login-brand-logo">
          <CrossLogo />
        </div>

        <h1 className="login-brand-title">AIDAA</h1>
        <p className="login-brand-subtitle">
          Plateforme de suivi et d'accompagnement<br />pour enfants autistes
        </p>

        <div className="login-brand-features">
          {[
            { icon: '👨‍👩‍👧', text: 'Espace parent & enfant' },
            { icon: '🩺', text: 'Suivi médical professionnel' },
            { icon: '📊', text: 'Activités & progression' },
            { icon: '🎮', text: 'Jeux éducatifs adaptés' },
          ].map((f) => (
            <div className="login-brand-feature" key={f.text}>
              <span className="login-brand-feature-icon">{f.icon}</span>
              <span className="login-brand-feature-text">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Version tag */}
        <div className="login-brand-version">v1.0 — PFE 2026</div>
      </div>

      {/* ── Panneau formulaire droit ── */}
      <div className="login-form-panel">
        <div className="login-card">

          {/* Badge */}
          <div className="login-header-badge">
            <span className="badge-dot" /> Espace sécurisé
          </div>

          <h2 className="login-title">Bon retour&nbsp;!</h2>
          <p className="login-sub">Connectez-vous à votre espace AIDAA</p>

          {/* Erreur */}
          {error && (
            <div className="error-message" role="alert">
              <span className="error-icon">✕</span>
              <span>{error}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="login-form" noValidate>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Adresse e-mail</label>
              <div className={`input-wrap ${emailTouched ? (emailValid ? 'input-valid' : 'input-warn') : ''}`}>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  className="form-input"
                  disabled={isLoading}
                  autoComplete="email"
                />
                {emailTouched && (
                  <span className="input-status-icon">
                    {emailValid ? '✓' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Mot de passe */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password" className="form-label">Mot de passe</label>
                <button
                  type="button"
                  className="forgot-link"
                  tabIndex={-1}
                  onClick={() => navigate('/forgot-password')}
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="form-input input-with-action"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPwd(v => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading
                ? <><span className="btn-spinner" /> Connexion…</>
                : 'Se connecter →'
              }
            </button>
          </form>

          <div className="login-divider"><span>ou</span></div>

          <button
            type="button"
            className="signup-link-button"
            onClick={() => navigate('/signup')}
            disabled={isLoading}
          >
            Créer un compte parent
          </button>

          <button
            type="button"
            className="signup-link-button"
            onClick={() => navigate('/signup/professional')}
            disabled={isLoading}
            style={{ marginTop: '8px' }}
          >
            S'inscrire en tant que professionnel
          </button>

          <p className="login-footer-note">
            © 2026 AIDAA — Application de suivi pour enfants autistes
          </p>
        </div>
      </div>

    </div>
  );
};
