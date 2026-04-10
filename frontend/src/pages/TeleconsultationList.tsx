// ============================================================================
// TELECONSULTATION LIST — Liste des sessions planifiées (Espace Professionnel)
// ============================================================================

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { mockSessions, STATUS_CONFIG } from '../data/teleconsultation.mock';
import '../styles/ProfessionalDashboard.css';

// ── Nav items (mirrors ProfessionalPage) ────────────────────────────────────
const NAV_ITEMS = [
  { icon: '👥', label: 'Mes patients',    path: '/professional/dashboard' },
  { icon: '📊', label: 'Activités',       path: '/professional/dashboard' },
  { icon: '📝', label: 'Notes cliniques', path: '/professional/dashboard' },
  { icon: '📨', label: 'Mes invitations', path: '/professional/dashboard' },
  { icon: '🎥', label: 'Téléconsultation',path: '/professionnel/teleconsultation', active: true },
];
// ============================================================================
export const TeleconsultationList = (): JSX.Element => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const profInitial = user?.name?.charAt(0).toUpperCase() ?? 'P';

  return (
    <div className="prof-layout">

      {/* ── SIDEBAR ── */}
      <aside className="prof-sidebar">

        {/* Brand */}
        <div className="prof-sidebar__brand">
          <div className="prof-sidebar__logo">🩺</div>
          <div className="prof-sidebar__brand-text">
            <h2>AIDAA</h2>
            <span>Espace Professionnel</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="prof-sidebar__nav">
          <div className="prof-nav__label">Navigation</div>
          {NAV_ITEMS.map(n => (
            <button
              key={n.label}
              className={`prof-nav__item ${n.active ? 'active' : ''}`}
              onClick={() => navigate(n.path)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="prof-sidebar__footer">
          <div className="prof-sidebar__user">
            <div className="prof-sidebar__avatar">{profInitial}</div>
            <div className="prof-sidebar__user-info">
              <div className="prof-sidebar__user-name">{user?.name ?? 'Professionnel'}</div>
              <div className="prof-sidebar__user-role">Professionnel de santé</div>
            </div>
          </div>
          <button className="prof-logout-btn" onClick={logout}>
            <span>🚪</span> Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="prof-main">

        {/* Topbar */}
        <header className="prof-topbar">
          <div className="prof-topbar__left">
            <div className="prof-topbar__breadcrumb">Professionnel / Téléconsultation</div>
            <h1>🎥 Téléconsultations</h1>
          </div>
          <div className="prof-topbar__right">
            <button
              onClick={() => navigate('/professionnel/teleconsultation/planifier')}
              style={{
                padding: '10px 22px',
                background: '#E07820',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(224,120,32,.3)',
                transition: 'opacity 0.15s',
              }}
            >
              + Planifier une session
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="prof-content">
          {mockSessions.length === 0 ? (

            /* ── Empty state ── */
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#FEF3E7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 16px',
              }}>🎥</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#1A0D00', marginBottom: 8 }}>
                Aucune téléconsultation planifiée
              </p>
              <p style={{ fontSize: 13, color: '#8C6840', marginBottom: 24 }}>
                Planifiez votre première session avec un patient.
              </p>
              <button
                onClick={() => navigate('/professionnel/teleconsultation/planifier')}
                style={{
                  padding: '11px 28px',
                  background: '#E07820',
                  color: '#fff', border: 'none',
                  borderRadius: 10, fontWeight: 700,
                  fontSize: 14, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(224,120,32,.3)',
                }}
              >
                + Planifier une session
              </button>
            </div>

          ) : (

            /* ── Session table ── */
            <div className="prof-section">
              <div className="prof-section__head">
                <h2>📅 Mes sessions</h2>
                <span className="prof-section__count">{mockSessions.length} session(s)</span>
              </div>

              <div className="prof-section__body" style={{ padding: 0 }}>
                <div className="prof-table-wrap">
                  <table className="prof-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Date</th>
                        <th>Heure</th>
                        <th>Durée</th>
                        <th>Statut</th>
                        <th>Score préc.</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockSessions.map(session => {
                        const cfg = STATUS_CONFIG[session.status];
                        return (
                          <tr key={session.id}>

                            {/* Patient cell */}
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 34, height: 34, borderRadius: '50%',
                                  background: 'linear-gradient(135deg,#C45E0A,#E07820)', color: '#fff',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontWeight: 700, fontSize: 14, flexShrink: 0,
                                }}>
                                  {session.patientName.charAt(0)}
                                </div>
                                <div>
                                  <strong style={{ display: 'block', fontSize: 14, color: '#1A0D00' }}>
                                    {session.patientName}
                                  </strong>
                                  <small style={{ color: '#8C6840', fontSize: 11 }}>
                                    {session.patientAge} ans · {session.participantCategory}
                                  </small>
                                </div>
                              </div>
                            </td>

                            <td>
                              {new Date(session.date).toLocaleDateString('fr-FR', {
                                day: '2-digit', month: 'long', year: 'numeric',
                              })}
                            </td>
                            <td style={{ fontWeight: 600 }}>{session.time}</td>
                            <td>{session.duration} min</td>

                            {/* Status badge */}
                            <td>
                              <span style={{
                                background: cfg.bg,
                                color: cfg.color,
                                borderRadius: 999,
                                padding: '4px 12px',
                                fontSize: 11,
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                              }}>
                                {cfg.label}
                              </span>
                            </td>

                            {/* Score */}
                            <td>
                              <span className={`prof-score-badge ${
                                session.lastScore >= 70 ? 'prof-score-badge--good'
                                : session.lastScore >= 40 ? 'prof-score-badge--mid'
                                : 'prof-score-badge--low'
                              }`}>
                                {session.lastScore} / 100
                              </span>
                            </td>

                            {/* Action */}
                            <td>
                              <button
                                onClick={() => navigate(`/professionnel/teleconsultation/${session.id}`)}
                                style={{
                                  padding: '7px 16px',
                                  borderRadius: 8,
                                  border: `1.5px solid ${session.status === 'ongoing' ? '#E07820' : '#F0E6D8'}`,
                                  background: session.status === 'ongoing' ? '#FEF3E7' : '#fff',
                                  color: '#C45E0A',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s',
                                }}
                              >
                                {session.status === 'planned'
                                  ? '▶ Démarrer'
                                  : session.status === 'ongoing'
                                    ? '🟢 Rejoindre'
                                    : '👁 Voir'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};







