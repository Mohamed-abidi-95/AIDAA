// ============================================================================
// CHILD SELECTION PAGE — Pharmacy Green Design
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import api from '../lib/api';
import '../styles/ChildSelectionPage.css';

interface Child {
  id: number;
  name: string;
  age: number;
  participant_category: 'enfant' | 'jeune' | 'adulte';
}

interface ApiResult<T> {
  success: boolean;
  data: T;
  message?: string;
}

const CROSS_COUNT = 30; // 6 cols × 5 rows

export const ChildSelectionPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  // Fetch children on mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<ApiResult<Child[]>>('/api/child/mychildren');
        if (data.success && data.data.length > 0) {
          setChildren(data.data);
        }
      } catch (err) {
        console.error('Error fetching children:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  const handleSelectChild = (child: Child) => {
    setSelectedChildId(child.id);
    // Store both child ID and participant_category for ChildDashboard
    localStorage.setItem('selected_child_id', child.id.toString());
    localStorage.setItem('selected_child_name', child.name);
    localStorage.setItem('selected_child_category', child.participant_category || 'enfant');
    // Navigate to child mode dashboard
    setTimeout(() => navigate('/child'), 300);
  };

  const handleLogout = () => {
    localStorage.removeItem('selected_child_id');
    localStorage.removeItem('selected_child_name');
    localStorage.removeItem('selected_child_category');
    logout();
  };

  return (
    <div className="cs-page">
      {/* Decorative cross pattern */}
      <div className="cs-pattern" aria-hidden="true">
        {Array.from({ length: CROSS_COUNT }).map((_, i) => (
          <div key={i} className="cs-cross" />
        ))}
      </div>

      {/* Top bar: Back + Logout */}
      <div className="cs-topbar">
        <button type="button" className="cs-back-btn" onClick={() => navigate('/role-selection')}>
          ← Retour
        </button>
        <button type="button" className="cs-logout-btn" onClick={handleLogout}>
          ⎋ Déconnexion
        </button>
      </div>

      {/* Brand header */}
      <div className="cs-brand">
        <div className="cs-logo">🧩</div>
        <h1 className="cs-title">AIDAA</h1>
        <p className="cs-subtitle">Sélectionnez un enfant pour continuer</p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="cs-state">
          <div className="cs-spinner" />
          <p className="cs-state__title">Chargement…</p>
          <p className="cs-state__desc">Récupération de la liste des enfants</p>
        </div>
      ) : children.length > 0 ? (
        <>
          <p className="cs-instruction">Quel participant souhaitez-vous accompagner aujourd'hui ?</p>
          <div className="cs-grid">
            {children.map((child) => {
              const catEmoji = child.participant_category === 'adulte' ? '🧑' : child.participant_category === 'jeune' ? '👦' : '🧒';
              const catLabel = child.participant_category === 'adulte' ? 'Adulte' : child.participant_category === 'jeune' ? 'Jeune' : 'Enfant';
              return (
                <div
                  key={child.id}
                  className={`cs-card${selectedChildId === child.id ? ' cs-card--selected' : ''}`}
                  onClick={() => handleSelectChild(child)}
                >
                  <div className="cs-avatar">{catEmoji}</div>
                  <h2 className="cs-child-name">{child.name}</h2>
                  <span className="cs-child-age">🎂 {child.age} ans</span>
                  <span className="cs-child-age" style={{ marginLeft: 6 }}>🏷️ {catLabel}</span>
                  <button
                    className="cs-select-btn"
                    style={{ marginTop: 16 }}
                    onClick={(e) => { e.stopPropagation(); handleSelectChild(child); }}
                  >
                    Commencer →
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="cs-state">
          <span className="cs-state__icon">🔍</span>
          <p className="cs-state__title">Aucun enfant trouvé</p>
          <p className="cs-state__desc">
            Vous n'avez aucun enfant enregistré pour le moment.<br />
            Veuillez contacter un administrateur.
          </p>
        </div>
      )}
    </div>
  );
};

export default ChildSelectionPage;

