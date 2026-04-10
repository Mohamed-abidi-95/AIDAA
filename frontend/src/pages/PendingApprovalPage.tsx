import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import '../styles/PendingApproval.css';

export const PendingApprovalPage = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="pending-container">
      {/* Left green panel */}
      <div className="login-brand-panel">
        <div className="login-brand-logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="15" y="4" width="10" height="32" rx="3" fill="white" fillOpacity="0.9"/>
            <rect x="4" y="15" width="32" height="10" rx="3" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>
        <h1 className="login-brand-title">AIDAA</h1>
        <p className="login-brand-subtitle">
          Plateforme de suivi et d'accompagnement<br />pour enfants autistes
        </p>
        <div className="login-brand-features">
          <div className="login-brand-feature">
            <span className="login-brand-feature-icon">🔐</span>
            <span className="login-brand-feature-text">Accès sécurisé et contrôlé</span>
          </div>
          <div className="login-brand-feature">
            <span className="login-brand-feature-icon">🩺</span>
            <span className="login-brand-feature-text">Validation par un administrateur</span>
          </div>
          <div className="login-brand-feature">
            <span className="login-brand-feature-icon">📧</span>
            <span className="login-brand-feature-text">Notification par e-mail</span>
          </div>
        </div>
        <div className="login-brand-version">v1.0 — PFE 2026</div>
      </div>

      {/* Right panel */}
      <div className="login-form-panel">
        <div className="pending-card">

          {/* Animated clock icon */}
          <div className="pending-icon-wrap">
            <div className="pending-icon-ring" />
            <div className="pending-icon">⏳</div>
          </div>

          <div className="pending-header-badge">
            <span className="badge-dot" /> En attente
          </div>

          <h2 className="pending-title">Inscription envoyée !</h2>
          <p className="pending-sub">
            Votre demande d'inscription a bien été reçue.<br />
            Un administrateur doit valider votre compte avant que vous puissiez vous connecter.
          </p>

          {/* Steps */}
          <div className="pending-steps">
            <div className="pending-step pending-step--done">
              <div className="step-circle">✓</div>
              <div>
                <div className="step-label">Inscription soumise</div>
                <div className="step-desc">Votre compte a été créé avec succès</div>
              </div>
            </div>
            <div className="pending-step pending-step--active">
              <div className="step-circle step-circle--pulse">2</div>
              <div>
                <div className="step-label">En attente de validation</div>
                <div className="step-desc">L'administrateur examine votre demande</div>
              </div>
            </div>
            <div className="pending-step pending-step--upcoming">
              <div className="step-circle step-circle--muted">3</div>
              <div>
                <div className="step-label">Accès accordé</div>
                <div className="step-desc">Vous pourrez vous connecter</div>
              </div>
            </div>
          </div>

          <div className="pending-info-box">
            <span>💡</span>
            <p>Vous recevrez une confirmation dès que votre compte sera activé. Vous pouvez revenir tenter de vous connecter ultérieurement.</p>
          </div>

          <button
            className="pending-back-btn"
            onClick={() => navigate('/login')}
          >
            ← Retour à la connexion
          </button>

        </div>
      </div>
    </div>
  );
};

