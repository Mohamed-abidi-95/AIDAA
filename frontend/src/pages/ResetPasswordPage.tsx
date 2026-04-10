// ============================================================================
// RESET PASSWORD PAGE
// ============================================================================
// Page accessible via le lien envoyé par email : /reset-password?token=xxx
// Permet à l'utilisateur de choisir un nouveau mot de passe

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import '../styles/LoginPage.css';

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

export const ResetPasswordPage = (): JSX.Element => {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const token          = searchParams.get('token');

  const [password,        setPassword]     = useState('');
  const [confirmPassword, setConfirmPwd]   = useState('');
  const [showPassword,    setShowPwd]      = useState(false);
  const [showConfirm,     setShowConfirm]  = useState(false);
  const [isLoading,       setIsLoading]    = useState(false);
  const [error,           setError]        = useState('');
  const [success,         setSuccess]      = useState(false);

  // Vérifier la présence du token dès le chargement
  useEffect(() => {
    if (!token) {
      setError('Lien invalide. Veuillez refaire une demande de réinitialisation.');
    }
  }, [token]);

  // Indicateur de force du mot de passe
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
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'][strength];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!token) { setError('Token manquant.'); return; }
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }

    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await api.post<any>('/api/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message
        || (err instanceof Error ? err.message : 'Erreur réseau.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* ── Panneau branding gauche ── */}
      <div className="login-brand-panel">
        <div className="login-brand-pattern" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => <div key={i} className="brand-cross-dot" />)}
        </div>
        <div className="login-brand-logo"><CrossLogo /></div>
        <h1 className="login-brand-title">AIDAA</h1>
        <p className="login-brand-subtitle">
          Plateforme de suivi et d'accompagnement<br />pour enfants autistes
        </p>
        <div className="login-brand-features">
          {[
            { icon: '🔒', text: 'Lien sécurisé à usage unique' },
            { icon: '⚡', text: 'Réinitialisation instantanée' },
            { icon: '🛡️', text: 'Chiffrement bcrypt' },
            { icon: '✅', text: 'Connexion immédiate après' },
          ].map((f) => (
            <div className="login-brand-feature" key={f.text}>
              <span className="login-brand-feature-icon">{f.icon}</span>
              <span className="login-brand-feature-text">{f.text}</span>
            </div>
          ))}
        </div>
        <div className="login-brand-version">v1.0 — PFE 2026</div>
      </div>

      {/* ── Panneau formulaire droit ── */}
      <div className="login-form-panel">
        <div className="login-card">

          {/* ── État : succès ── */}
          {success && (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #007A3A, #00A651)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px', fontSize: 36,
                boxShadow: '0 8px 24px rgba(0,166,81,.35)',
              }}>✓</div>
              <h2 className="login-title" style={{ color: '#007A3A' }}>
                Mot de passe réinitialisé !
              </h2>
              <p className="login-sub">
                Votre mot de passe a été mis à jour avec succès.<br/>
                Vous pouvez maintenant vous connecter.
              </p>
              <button
                type="button"
                className="submit-button"
                style={{ marginTop: 24 }}
                onClick={() => navigate('/login')}
              >
                Se connecter →
              </button>
            </div>
          )}

          {/* ── État : token invalide ── */}
          {!success && !token && (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
              <h2 className="login-title">Lien invalide</h2>
              <p className="login-sub">
                Ce lien de réinitialisation est invalide ou a expiré.<br/>
                Veuillez refaire une demande.
              </p>
              <button
                type="button"
                className="submit-button"
                style={{ marginTop: 24 }}
                onClick={() => navigate('/forgot-password')}
              >
                Nouvelle demande →
              </button>
            </div>
          )}

          {/* ── État : formulaire ── */}
          {!success && token && (
            <>
              <div className="login-header-badge">
                <span className="badge-dot" /> Nouveau mot de passe
              </div>
              <h2 className="login-title">Choisissez un mot de passe</h2>
              <p className="login-sub">
                Créez un nouveau mot de passe sécurisé pour votre compte AIDAA.
              </p>

              {error && (
                <div className="error-message" role="alert">
                  <span className="error-icon">✕</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form" noValidate>

                {/* Nouveau mot de passe */}
                <div className="form-group">
                  <label htmlFor="password" className="form-label">Nouveau mot de passe</label>
                  <div className="input-wrap">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 caractères"
                      className="form-input input-with-action"
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="eye-toggle"
                      onClick={() => setShowPwd(v => !v)}
                      tabIndex={-1}
                      aria-label="Afficher/masquer"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>

                  {/* Barre de force */}
                  {password.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{
                        height: 4, borderRadius: 2, background: '#E6F7EE',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${(strength / 5) * 100}%`,
                          background: strengthColor,
                          transition: 'width 0.3s, background 0.3s',
                          borderRadius: 2,
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: strengthColor, fontWeight: 600 }}>
                        {strengthLabel}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirmation */}
                <div className="form-group">
                  <label htmlFor="confirm" className="form-label">Confirmer le mot de passe</label>
                  <div className={`input-wrap ${confirmPassword.length > 0
                    ? (confirmPassword === password ? 'input-valid' : 'input-warn')
                    : ''}`}>
                    <input
                      id="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      placeholder="Répétez le mot de passe"
                      className="form-input input-with-action"
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="eye-toggle"
                      onClick={() => setShowConfirm(v => !v)}
                      tabIndex={-1}
                      aria-label="Afficher/masquer"
                    >
                      {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && confirmPassword !== password && (
                    <span style={{ fontSize: 12, color: '#ef4444' }}>
                      Les mots de passe ne correspondent pas
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading || password.length < 6 || password !== confirmPassword}
                >
                  {isLoading
                    ? <><span className="btn-spinner" /> Réinitialisation…</>
                    : 'Réinitialiser mon mot de passe →'
                  }
                </button>
              </form>

              <div className="login-divider"><span>ou</span></div>
              <button
                type="button"
                className="signup-link-button"
                onClick={() => navigate('/login')}
              >
                ← Retour à la connexion
              </button>
            </>
          )}

          <p className="login-footer-note">
            © 2026 AIDAA — Application de suivi pour enfants autistes
          </p>
        </div>
      </div>
    </div>
  );
};

