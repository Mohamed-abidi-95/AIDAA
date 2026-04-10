// ============================================================================
// FORGOT PASSWORD PAGE
// ============================================================================
// Envoie un email de réinitialisation — même design split-screen que Login

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import '../styles/LoginPage.css';

const CrossLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect x="15" y="4" width="10" height="32" rx="3" fill="white" fillOpacity="0.9"/>
    <rect x="4" y="15" width="32" height="10" rx="3" fill="white" fillOpacity="0.9"/>
  </svg>
);

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const ForgotPasswordPage = (): JSX.Element => {
  const navigate = useNavigate();

  const [email, setEmail]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const [sent, setSent]           = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // mode démo Ethereal

  const emailTouched = email.length > 0;
  const emailValid   = isValidEmail(email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!email.trim())  { setError("L'adresse e-mail est requise"); return; }
    if (!emailValid)    { setError('Adresse e-mail invalide'); return; }

    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await api.post<any>('/api/auth/forgot-password', { email: email.trim().toLowerCase() });
      if (res.data?.previewUrl) setPreviewUrl(res.data.previewUrl); // mode Ethereal
      setSent(true);
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message
        || (err instanceof Error ? err.message : 'Erreur réseau. Vérifiez votre connexion.');
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
            { icon: '🔑', text: 'Récupération sécurisée' },
            { icon: '📧', text: 'Lien envoyé par e-mail' },
            { icon: '⏰', text: 'Lien valide 1 heure' },
            { icon: '🔒', text: 'Token à usage unique' },
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

          {/* ── État : formulaire ── */}
          {!sent && (
            <>
              <div className="login-header-badge">
                <span className="badge-dot" /> Récupération de compte
              </div>
              <h2 className="login-title">Mot de passe oublié ?</h2>
              <p className="login-sub">
                Entrez votre adresse e-mail. Vous recevrez un lien sécurisé
                pour choisir un nouveau mot de passe.
              </p>

              {error && (
                <div className="error-message" role="alert">
                  <span className="error-icon">✕</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form" noValidate>
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
                    {emailTouched && <span className="input-status-icon">{emailValid ? '✓' : ''}</span>}
                  </div>
                </div>

                <button type="submit" className="submit-button" disabled={isLoading || !emailValid}>
                  {isLoading
                    ? <><span className="btn-spinner" /> Envoi en cours…</>
                    : 'Envoyer le lien de réinitialisation →'
                  }
                </button>
              </form>

              <div className="login-divider"><span>ou</span></div>
              <button type="button" className="signup-link-button" onClick={() => navigate('/login')}>
                ← Retour à la connexion
              </button>
            </>
          )}

          {/* ── État : email envoyé ── */}
          {sent && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              {/* Icône succès */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #007A3A, #00A651)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px', fontSize: 36, color: 'white',
                boxShadow: '0 8px 24px rgba(0,166,81,.35)',
              }}>📧</div>

              <h2 className="login-title" style={{ color: '#007A3A' }}>E-mail envoyé !</h2>
              <p className="login-sub">
                Un lien de réinitialisation a été envoyé à <br/>
                <strong style={{ color: '#0f2318' }}>{email}</strong>
              </p>

              {/* Encart instructions */}
              <div style={{
                background: '#E6F7EE', border: '1px solid #C2EAD4',
                borderRadius: 12, padding: '16px 20px', margin: '20px 0',
                textAlign: 'left',
              }}>
                <p style={{ margin: 0, fontSize: 13, color: '#005C26', lineHeight: 1.7 }}>
                  <strong>Étapes suivantes :</strong><br/>
                  1️⃣ &nbsp;Consultez votre boîte e-mail<br/>
                  2️⃣ &nbsp;Cliquez sur le lien dans le message AIDAA<br/>
                  3️⃣ &nbsp;Choisissez un nouveau mot de passe<br/>
                  ⏰ &nbsp;Le lien est valable <strong>1 heure</strong>
                </p>
              </div>

              {/* Note spam */}
              <p style={{ fontSize: 12, color: '#7A9485', marginBottom: 24 }}>
                Vous ne trouvez pas l'e-mail ? Vérifiez vos spams ou relancez la demande.
              </p>

              {/* Lien de prévisualisation Ethereal (mode démo sans SMTP configuré) */}
              {previewUrl && (
                <div style={{
                  background: '#FFF8E1', border: '1px solid #FFE082',
                  borderRadius: 10, padding: '14px 16px', marginBottom: 20,
                  textAlign: 'left',
                }}>
                  <p style={{ margin: '0 0 8px', fontSize: 13, color: '#7A4F00', fontWeight: 700 }}>
                    🧪 Mode démo — Prévisualisation de l'email :
                  </p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#007A3A', fontSize: 12, wordBreak: 'break-all',
                      fontWeight: 600,
                    }}
                  >
                    {previewUrl}
                  </a>
                  <p style={{ margin: '8px 0 0', fontSize: 11, color: '#B0C4BA' }}>
                    (Ouvre l'email dans Ethereal — aucun vrai email envoyé)
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
                <button
                  type="button"
                  className="submit-button"
                  onClick={() => navigate('/login')}
                >
                  Retour à la connexion →
                </button>
                <button
                  type="button"
                  className="signup-link-button"
                  onClick={() => { setSent(false); setEmail(''); }}
                >
                  ↺ Renvoyer avec un autre e-mail
                </button>
              </div>
            </div>
          )}

          <p className="login-footer-note">
            © 2026 AIDAA — Application de suivi pour enfants autistes
          </p>
        </div>
      </div>

    </div>
  );
};

