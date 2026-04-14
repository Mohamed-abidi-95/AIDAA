// ============================================================================
// TELECONSULTATION ROOM — Salle de vidéo-consultation (Espace Professionnel)
// ============================================================================
// Charge les données depuis GET /api/teleconsult/:id (plus de mock)

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';

interface Teleconsult {
  id: number;
  parent_id: number;
  professional_id: number;
  date_time: string;
  meeting_link: string | null;
  notes: string | null;
  parent_name?: string;
  professional_name?: string;
  created_at?: string;
}
interface ApiResult<T> { success: boolean; data: T; message?: string; }

interface ChatMessage {
  from: string;
  text: string;
  time: string;
}

// ── Icon control button (Tailwind) ──────────────────────────────────────────
const CtrlBtn = ({
  icon, label, active = true, danger = false, onClick,
}: {
  icon: string; label: string; active?: boolean; danger?: boolean; onClick: () => void;
}) => (
  <button
    title={label}
    onClick={onClick}
    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg text-white shrink-0 transition-all
      ${danger
        ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/40'
        : active
          ? 'bg-slate-700 hover:bg-slate-600'
          : 'bg-slate-600/60 opacity-65 hover:opacity-100'
      }`}
  >
    <i className={icon} />
  </button>
);

// ============================================================================
export const TeleconsultationRoom = (): JSX.Element => {
  const navigate      = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [session,  setSession]  = useState<Teleconsult | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [micOn,    setMicOn]    = useState(true);
  const [camOn,    setCamOn]    = useState(true);
  const [sharing,  setSharing]  = useState(false);
  const [message,  setMessage]  = useState('');
  const [chatLog,  setChatLog]  = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Fetch session from API ────────────────────────────────────────────────
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<ApiResult<Teleconsult>>(`/api/teleconsult/${sessionId}`);
        if (data.success) {
          setSession(data.data);
        } else {
          setError(data.message || 'Session introuvable');
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) fetchSession();
  }, [sessionId]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setChatLog(prev => [
      ...prev,
      {
        from: 'Vous',
        text: message.trim(),
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setMessage('');
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex h-screen bg-[#111] font-sans overflow-hidden">

      {/* ══ LEFT — Video + Controls ══ */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Session badge */}
        {session && (
          <div className="absolute top-4 left-4 z-10 bg-orange-700/90 border border-orange-500 rounded-xl px-4 py-2 text-white text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400 inline-block animate-pulse" />
            {session.parent_name || `Parent #${session.parent_id}`} · Session #{sessionId}
          </div>
        )}

        {/* Main video placeholder */}
        <div className="flex-1 bg-[#1C1917] flex items-center justify-center flex-col gap-4">
          {loading ? (
            <>
              <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/40 text-sm">Chargement de la session…</p>
            </>
          ) : error ? (
            <>
              <div className="text-5xl opacity-30">❌</div>
              <p className="text-white/50 text-sm font-medium">{error}</p>
              <button
                onClick={() => navigate('/professionnel/teleconsultation')}
                className="mt-2 px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold transition-all"
              >
                <i className="fa-solid fa-arrow-left mr-2" /> Retour aux sessions
              </button>
            </>
          ) : (
            <>
              <div className="text-7xl opacity-20">
                <i className={camOn ? 'fa-solid fa-video' : 'fa-solid fa-video-slash'} />
              </div>
              <p className="text-white/35 text-sm font-medium">
                {camOn
                  ? `Caméra en attente — ${session?.parent_name ?? 'Patient'}`
                  : 'Caméra désactivée'}
              </p>
            </>
          )}

          {/* Self-view mini tile */}
          {!loading && !error && (
            <div className="absolute bottom-24 right-5 w-40 h-[90px] bg-[#2D2D2D] rounded-xl border-2 border-[#3D3D3D] flex items-center justify-center text-2xl text-white/30">
              {camOn ? '🙂' : <i className="fa-solid fa-video-slash" />}
            </div>
          )}
        </div>

        {/* Control bar */}
        {!loading && !error && (
          <div className="bg-[#1C1917] border-t border-[#2D2D2D] py-4 px-8 flex items-center justify-center gap-4 shrink-0">
            <CtrlBtn
              icon={micOn ? 'fa-solid fa-microphone' : 'fa-solid fa-microphone-slash'}
              label={micOn ? 'Couper le micro' : 'Activer le micro'}
              active={micOn}
              onClick={() => setMicOn(p => !p)}
            />
            <CtrlBtn
              icon={camOn ? 'fa-solid fa-video' : 'fa-solid fa-video-slash'}
              label={camOn ? 'Désactiver la caméra' : 'Activer la caméra'}
              active={camOn}
              onClick={() => setCamOn(p => !p)}
            />
            <CtrlBtn
              icon="fa-solid fa-display"
              label={sharing ? "Arrêter le partage" : "Partager l'écran"}
              active={sharing}
              onClick={() => setSharing(p => !p)}
            />
            <button
              onClick={() => navigate('/professionnel/teleconsultation')}
              className="ml-2 px-7 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold text-sm shadow-lg shadow-red-600/40 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-phone-slash" /> Terminer
            </button>
          </div>
        )}
      </div>

      {/* ══ RIGHT — Patient info + Chat ══ */}
      <div className="w-80 bg-[#1C1917] border-l border-[#2D2D2D] flex flex-col shrink-0">

        {/* Patient info */}
        {session ? (
          <div className="p-4 border-b border-[#2D2D2D]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center font-bold text-white text-lg shrink-0">
                {(session.parent_name || 'P').charAt(0)}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{session.parent_name || `Parent #${session.parent_id}`}</p>
                <p className="text-orange-400/70 text-xs">{fmtDate(session.date_time)} · {fmtTime(session.date_time)}</p>
              </div>
            </div>

            {/* Meeting link */}
            {session.meeting_link && (
              <div className="bg-[#2D2D2D] rounded-lg px-3 py-2 mb-2">
                <p className="text-[10px] text-orange-400/60 uppercase tracking-wider mb-1">Lien de réunion</p>
                <a href={session.meeting_link} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-orange-400 hover:text-orange-300 underline truncate block">
                  {session.meeting_link}
                </a>
              </div>
            )}

            {/* Notes */}
            {session.notes && (
              <div className="bg-[#2D2D2D] rounded-lg px-3 py-2 border-l-3 border-orange-500">
                <p className="text-[10px] text-orange-400/60 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-xs text-white/75 leading-relaxed">{session.notes}</p>
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="p-5 text-center border-b border-[#2D2D2D]">
            <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-white/40 text-xs">Chargement…</p>
          </div>
        ) : (
          <div className="p-5 text-orange-400/60 text-center border-b border-[#2D2D2D] text-sm">
            Session #{sessionId} introuvable
          </div>
        )}

        {/* Chat panel */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Chat header */}
          <div className="px-4 py-3 border-b border-[#2D2D2D] text-white text-sm font-semibold flex items-center gap-2">
            <i className="fa-solid fa-comments text-orange-400" /> Chat
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
            {chatLog.length === 0 ? (
              <p className="text-orange-400/40 text-xs text-center mt-5">
                Aucun message pour le moment
              </p>
            ) : (
              chatLog.map((m, i) => (
                <div key={i} className="bg-[#2D2D2D] rounded-xl px-3 py-2 border-l-3 border-orange-500">
                  <div className="text-[10px] text-orange-400/60 mb-0.5">{m.from} · {m.time}</div>
                  <div className="text-sm text-white leading-relaxed">{m.text}</div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-[#2D2D2D] flex gap-2">
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Saisissez un message…"
              className="flex-1 px-3 py-2 bg-[#2D2D2D] border border-[#3D3D3D] rounded-lg text-white text-sm placeholder-white/30 outline-none focus:border-orange-500 transition-colors"
            />
            <button
              onClick={sendMessage}
              className="w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center shrink-0 transition-all"
            >
              <i className="fa-solid fa-paper-plane text-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

