// ============================================================================
// TELECONSULTATION ROOM — Salle de vidéo-consultation (Espace Professionnel)
// ============================================================================

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockSessions } from '../data/teleconsultation.mock';

interface ChatMessage {
  from: string;
  text: string;
  time: string;
}

// ── Icon control button ──────────────────────────────────────────────────────
const CtrlBtn = ({
  icon, label, active = true, danger = false, onClick,
}: {
  icon: string; label: string; active?: boolean; danger?: boolean; onClick: () => void;
}) => (
  <button
    title={label}
    onClick={onClick}
    style={{
      width: 48, height: 48,
      borderRadius: '50%',
      background: danger ? '#DC2626' : active ? '#2D2D2D' : '#4B4B4B',
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
      fontSize: 18,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.2s, opacity 0.2s',
      opacity: active ? 1 : 0.65,
      flexShrink: 0,
    }}
  >
    {icon}
  </button>
);

// ============================================================================
export const TeleconsultationRoom = (): JSX.Element => {
  const navigate    = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [micOn,    setMicOn]    = useState(true);
  const [camOn,    setCamOn]    = useState(true);
  const [sharing,  setSharing]  = useState(false);
  const [message,  setMessage]  = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const session = mockSessions.find(s => s.id === parseInt(sessionId ?? '0', 10));

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        from: 'Vous',
        text: message.trim(),
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setMessage('');
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#111',
      fontFamily: "'Inter','Segoe UI',sans-serif",
      overflow: 'hidden',
    }}>

      {/* ══════════════════════════════════════════
          LEFT — Video area + controls
      ══════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top session badge */}
        {session && (
          <div style={{
            position: 'absolute', top: 18, left: 18, zIndex: 10,
            background: 'rgba(15,61,31,0.9)',
            border: '1px solid #22C55E',
            borderRadius: 10,
            padding: '8px 16px',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ background: '#22C55E', borderRadius: '50%', width: 8, height: 8, display: 'inline-block' }} />
            {session.patientName} · Session #{sessionId}
          </div>
        )}

        {/* Main video placeholder */}
        <div style={{
          flex: 1,
          background: '#1C1917',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 14,
          position: 'relative',
        }}>
          <div style={{ fontSize: 72, opacity: 0.25 }}>📷</div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, fontWeight: 500, margin: 0 }}>
            {camOn
              ? `Caméra en attente — ${session?.patientName ?? 'Patient'}`
              : 'Caméra désactivée'}
          </p>

          {/* Self-view mini tile */}
          <div style={{
            position: 'absolute',
            bottom: 20, right: 20,
            width: 160, height: 90,
            background: '#2D2D2D',
            borderRadius: 10,
            border: '2px solid #3D3D3D',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, color: 'rgba(255,255,255,0.3)',
          }}>
            {camOn ? '🙂' : '🚫'}
          </div>
        </div>

        {/* ── Control bar ── */}
        <div style={{
          background: '#1C1917',
          borderTop: '1px solid #2D2D2D',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}>
          <CtrlBtn
            icon={micOn ? '🎙️' : '🔇'}
            label={micOn ? 'Couper le micro' : 'Activer le micro'}
            active={micOn}
            onClick={() => setMicOn(p => !p)}
          />
          <CtrlBtn
            icon={camOn ? '📹' : '🚫'}
            label={camOn ? 'Désactiver la caméra' : 'Activer la caméra'}
            active={camOn}
            onClick={() => setCamOn(p => !p)}
          />
          <CtrlBtn
            icon="🖥️"
            label={sharing ? 'Arrêter le partage' : "Partager l'écran"}
            active={sharing}
            onClick={() => setSharing(p => !p)}
          />

          {/* Terminer */}
          <button
            onClick={() => navigate('/professionnel/teleconsultation')}
            style={{
              padding: '10px 28px',
              background: '#DC2626',
              color: '#fff',
              border: 'none',
              borderRadius: 24,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(220,38,38,.45)',
              transition: 'opacity 0.15s',
              marginLeft: 8,
            }}
          >
            ⬛ Terminer
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT — Patient info + Chat
      ══════════════════════════════════════════ */}
      <div style={{
        width: 320,
        background: '#1C1917',
        borderLeft: '1px solid #2D2D2D',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>

        {/* Patient info card */}
        {session ? (
          <div style={{ padding: '18px 16px', borderBottom: '1px solid #2D2D2D' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#22C55E',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: '#fff', fontSize: 18, flexShrink: 0,
              }}>
                {session.patientName.charAt(0)}
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{session.patientName}</div>
                <div style={{ color: '#4B7A5C', fontSize: 12 }}>
                  {session.patientAge} ans · {session.participantCategory}
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Durée',        value: `${session.duration} min` },
                { label: 'Score préc.', value: `${session.lastScore} / 100` },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: '#2D2D2D',
                  borderRadius: 8,
                  padding: '8px 10px',
                }}>
                  <div style={{
                    fontSize: 10,
                    color: '#4B7A5C',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    marginBottom: 3,
                  }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{value}</div>
                </div>
              ))}
            </div>

            {session.notes && (
              <div style={{
                marginTop: 10,
                background: '#2D2D2D',
                borderRadius: 8,
                padding: '10px 12px',
                borderLeft: '3px solid #22C55E',
              }}>
                <div style={{ fontSize: 10, color: '#4B7A5C', letterSpacing: '0.8px', marginBottom: 4 }}>NOTES</div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                  {session.notes}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            padding: '20px 16px',
            color: '#4B7A5C',
            textAlign: 'center',
            borderBottom: '1px solid #2D2D2D',
            fontSize: 13,
          }}>
            Session #{sessionId} introuvable
          </div>
        )}

        {/* ── Chat panel ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Chat header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #2D2D2D',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            💬 Chat
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            {messages.length === 0 ? (
              <p style={{
                color: '#4B7A5C', fontSize: 12,
                textAlign: 'center', marginTop: 20,
              }}>
                Aucun message pour le moment
              </p>
            ) : (
              messages.map((m, i) => (
                <div key={i} style={{
                  background: '#2D2D2D',
                  borderRadius: 10,
                  padding: '8px 12px',
                  borderLeft: '3px solid #22C55E',
                }}>
                  <div style={{ fontSize: 10, color: '#4B7A5C', marginBottom: 3 }}>
                    {m.from} · {m.time}
                  </div>
                  <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.4 }}>{m.text}</div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #2D2D2D',
            display: 'flex',
            gap: 8,
          }}>
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Saisissez un message…"
              style={{
                flex: 1,
                padding: '9px 12px',
                background: '#2D2D2D',
                border: '1px solid #3D3D3D',
                borderRadius: 8,
                color: '#fff',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                width: 38, height: 38,
                borderRadius: 8,
                background: '#22C55E',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: 16,
                flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

