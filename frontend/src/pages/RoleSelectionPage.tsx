// ============================================================================
// ROLE SELECTION PAGE — Pharmacy Green Design
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RoleSelection.css';

const CROSS_COUNT = 30; // 6 cols × 5 rows

export const RoleSelectionPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'parent' | 'child' | null>(null);

  const handleRoleSelect = (role: 'parent' | 'child'): void => {
    setSelectedRole(role);
    setTimeout(() => {
      if (role === 'parent') {
        navigate('/parent/dashboard');
      } else {
        navigate('/child-selection');
      }
    }, 300);
  };

  return (
    <div className="rs-page">
      {/* Decorative cross pattern */}
      <div className="rs-pattern" aria-hidden="true">
        {Array.from({ length: CROSS_COUNT }).map((_, i) => (
          <div key={i} className="rs-cross" />
        ))}
      </div>

      {/* Back button */}
      <button type="button" className="rs-back" onClick={() => navigate('/login')}>
        ← Retour
      </button>

      {/* Brand header */}
      <div className="rs-brand">
        <div className="rs-logo">🧩</div>
        <h1 className="rs-title">AIDAA</h1>
        <p className="rs-subtitle">Choisissez votre profil pour continuer</p>
      </div>

      {/* Role cards */}
      <div className="rs-cards">

        {/* ── Parent card ── */}
        <div
          className={`rs-card${selectedRole === 'parent' ? ' rs-card--selected' : ''}`}
          onClick={() => handleRoleSelect('parent')}
        >
          <div className="rs-card__badge">
            <span className="rs-badge-dot" />
            Espace parent
          </div>

          <span className="rs-card__icon">👨‍👩‍👧</span>

          <h2 className="rs-card__title">Mode Parent</h2>
          <p className="rs-card__tagline">Suivez le progrès de votre enfant</p>

          <ul className="rs-card__features">
            <li className="rs-card__feature">
              <span className="rs-feature-check">✓</span>
              Tableau de bord de suivi
            </li>
            <li className="rs-card__feature">
              <span className="rs-feature-check">✓</span>
              Notes médicales & activités
            </li>
            <li className="rs-card__feature">
              <span className="rs-feature-check">✓</span>
              Communication avec les pros
            </li>
          </ul>

          <button className="rs-card__btn" onClick={(e) => { e.stopPropagation(); handleRoleSelect('parent'); }}>
            Continuer en tant que Parent →
          </button>
        </div>

        {/* ── Child card ── */}
        <div
          className={`rs-card${selectedRole === 'child' ? ' rs-card--selected' : ''}`}
          onClick={() => handleRoleSelect('child')}
        >
          <div className="rs-card__badge">
            <span className="rs-badge-dot" />
            Espace enfant
          </div>

          <span className="rs-card__icon">👧</span>

          <h2 className="rs-card__title">Mode Enfant</h2>
          <p className="rs-card__tagline">Jeux, vidéos et apprentissage</p>

          <ul className="rs-card__features">
            <li className="rs-card__feature">
              <span className="rs-feature-check">✓</span>
              Jeux interactifs et éducatifs
            </li>
            <li className="rs-card__feature">
              <span className="rs-feature-check">✓</span>
              Vidéos et contenus adaptés
            </li>
            <li className="rs-card__feature">
              <span className="rs-feature-check">✓</span>
              Interface simple et amusante
            </li>
          </ul>

          <button className="rs-card__btn" onClick={(e) => { e.stopPropagation(); handleRoleSelect('child'); }}>
            Continuer en tant qu'Enfant →
          </button>
        </div>

      </div>

      {/* Loading overlay */}
      {selectedRole && (
        <div className="rs-loading">
          <div className="rs-spinner" />
        </div>
      )}
    </div>
  );
};

