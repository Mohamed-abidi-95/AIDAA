// ============================================================================
// CHATBOT WIDGET — ChatbotWidget.tsx
// ============================================================================
// Widget flottant de chatbot IA pour le dashboard parent.
// Flux : Consentement → Session → Chat (FAQ + Recommandations + Urgence)
// ============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { chatbotApi, ChatMessage, ContentReco } from './chatbot.api';

interface Props {
  childId?: number;
  childName?: string;
  lang?: 'fr' | 'ar';
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const SUGGESTIONS_FR = [
  'Comment utiliser les pictogrammes AAC ?',
  'Mon enfant fait des crises, que faire ?',
  'Quelles activités pour mon enfant ?',
  'Droits scolaires en Tunisie ?',
];

const SUGGESTIONS_AR = [
  'كيف أستخدم الصور التواصلية؟',
  'طفلي يصاب بنوبات، ماذا أفعل؟',
  'ما الأنشطة المناسبة لطفلي؟',
];

const formatTime = (iso?: string) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' });
};

// ── Bubble Component ─────────────────────────────────────────────────────────
const Bubble = ({
  msg,
  onSuggestion,
}: {
  msg: ChatMessage & { suggestions?: string[]; data?: ContentReco[] };
  onSuggestion?: (s: string) => void;
}) => {
  const isBot = msg.sender === 'bot';
  const isEmergency = msg.intent === 'emergency';

  return (
    <div className={`flex gap-2 mb-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
            isEmergency ? 'bg-red-500' : 'bg-emerald-500'
          }`}
        >
          {isEmergency ? '🚨' : '🤖'}
        </div>
      )}

      <div className={`max-w-[80%] ${isBot ? '' : 'items-end flex flex-col'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isEmergency
              ? 'bg-red-50 border-2 border-red-300 text-red-800 font-medium'
              : isBot
              ? 'bg-slate-100 text-slate-800'
              : 'bg-emerald-500 text-white'
          }`}
        >
          {msg.message_text}
        </div>

        {/* Cartes de recommandation */}
        {isBot && msg.data && msg.data.length > 0 && (
          <div className="mt-2 space-y-2 w-full">
            {msg.data.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex items-start gap-2.5 shadow-sm"
              >
                <span className="text-xl shrink-0">{c.emoji || '📌'}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{c.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{c.description}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                    {c.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {isBot && msg.suggestions && msg.suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {msg.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestion?.(s)}
                className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <span className="text-[10px] text-slate-400 mt-1 px-1">
          {formatTime(msg.created_at)}
        </span>
      </div>

      {!isBot && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm">
          👤
        </div>
      )}
    </div>
  );
};

// ── Typing Indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex gap-2 mb-3 justify-start">
    <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm text-white">
      🤖
    </div>
    <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  </div>
);

// ── Main Widget ──────────────────────────────────────────────────────────────
export const ChatbotWidget = ({ childId, childName, lang: initialLang = 'fr' }: Props) => {
  const [open, setOpen]               = useState(false);
  const [lang, setLang]               = useState<'fr' | 'ar'>(initialLang);
  const [step, setStep]               = useState<'loading' | 'consent' | 'chat'>('loading');
  const [sessionId, setSessionId]     = useState<number | null>(null);
  const [messages, setMessages]       = useState<(ChatMessage & { suggestions?: string[]; data?: ContentReco[] })[]>([]);
  const [input, setInput]             = useState('');
  const [sending, setSending]         = useState(false);
  const [error, setError]             = useState('');
  const [consentLoading, setConsentLoading] = useState(false);
  const [unread, setUnread]           = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Scroll to bottom
  const scrollBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  // Init — vérifier le consentement
  useEffect(() => {
    if (!open) return;
    const init = async () => {
      setStep('loading');
      try {
        const r = await chatbotApi.getConsentStatus();
        if (r.data.consented) {
          await startSession();
        } else {
          setStep('consent');
        }
      } catch {
        setStep('consent');
      }
    };
    init();
  }, [open]);

  const startSession = async () => {
    try {
      const r = await chatbotApi.startSession(childId);
      const sid = r.data.data.sessionId;
      setSessionId(sid);
      setStep('chat');

      // Message d'accueil
      const welcome: ChatMessage & { suggestions?: string[] } = {
        sender: 'bot',
        message_text: lang === 'ar'
          ? `مرحباً! 👋 أنا مساعد AIDAA الذكي.${childName ? ` أنا هنا لمساعدتك مع ${childName}.` : ''}\n\nكيف يمكنني مساعدتك اليوم؟`
          : `Bonjour ! 👋 Je suis l'assistant IA d'AIDAA.${childName ? ` Je suis là pour vous aider avec ${childName}.` : ''}\n\nComment puis-je vous aider aujourd'hui ?`,
        intent: 'greeting',
        created_at: new Date().toISOString(),
        suggestions: lang === 'ar' ? SUGGESTIONS_AR : SUGGESTIONS_FR,
      };
      setMessages([welcome]);
      scrollBottom();
    } catch (e: any) {
      setError(lang === 'ar' ? 'خطأ في بدء الجلسة' : 'Erreur lors du démarrage de la session.');
      setStep('consent');
    }
  };

  const handleConsent = async () => {
    setConsentLoading(true);
    try {
      await chatbotApi.giveConsent();
      await startSession();
    } catch {
      setError(lang === 'ar' ? 'خطأ في تسجيل الموافقة' : "Erreur lors de l'enregistrement du consentement.");
    } finally {
      setConsentLoading(false);
    }
  };

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || !sessionId || sending) return;

    setInput('');
    setSending(true);
    setError('');

    // Optimistic UI
    const userMsg: ChatMessage = {
      sender: 'user',
      message_text: msg,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    scrollBottom();

    try {
      const r = await chatbotApi.sendMessage(sessionId, msg, lang);
      const res = r.data;

      const botMsg: ChatMessage & { suggestions?: string[]; data?: ContentReco[] } = {
        sender: 'bot',
        message_text: res.response,
        intent: res.intent as any,
        created_at: new Date().toISOString(),
        suggestions: res.suggestions,
        data: res.data,
      };
      setMessages(prev => [...prev, botMsg]);

      if (!open) setUnread(u => u + 1);
      scrollBottom();
    } catch (e: any) {
      const errMsg = lang === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'Erreur lors de l\'envoi. Réessayez.';
      setMessages(prev => [...prev, {
        sender: 'bot',
        message_text: errMsg,
        intent: 'unknown',
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
      scrollBottom();
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setUnread(0);
  };

  const handleClose = () => {
    setOpen(false);
    if (sessionId) chatbotApi.endSession(sessionId).catch(() => {});
  };

  const toggleLang = () => setLang(l => l === 'fr' ? 'ar' : 'fr');

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-[300] w-14 h-14 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all"
        title={lang === 'ar' ? 'المساعد الذكي' : 'Assistant IA'}
        aria-label="Ouvrir le chatbot"
      >
        <i className="fa-solid fa-robot" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* Panneau chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[300] w-[370px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col animate-slide-up"
          style={{ height: '520px' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-emerald-500 rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">Assistant AIDAA</p>
                <p className="text-emerald-100 text-[11px] mt-0.5">
                  {lang === 'ar' ? 'مساعد ذكي للآباء' : 'IA · Chatbot parental'}
                  {' '}
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
                    {childName || (lang === 'ar' ? 'عام' : 'Général')}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleLang}
                className="text-white/80 hover:text-white text-xs font-bold bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition"
                title="Changer de langue"
              >
                {lang === 'fr' ? 'عر' : 'FR'}
              </button>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white text-lg w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition"
              >
                ×
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">

            {/* Loading */}
            {step === 'loading' && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm">{lang === 'ar' ? 'جاري التحميل...' : 'Chargement...'}</p>
              </div>
            )}

            {/* Consent */}
            {step === 'consent' && (
              <div className="flex flex-col h-full justify-center px-2">
                <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
                  <div className="text-3xl mb-3 text-center">🔒</div>
                  <h3 className="font-bold text-slate-800 text-center mb-2 text-sm">
                    {lang === 'ar' ? 'موافقة مطلوبة' : 'Consentement requis'}
                  </h3>
                  <p className="text-xs text-slate-600 text-center leading-relaxed mb-4">
                    {lang === 'ar'
                      ? 'باستخدام هذا المساعد، توافق على معالجة بيانات جلستك بشكل مجهول وفق سياسة الخصوصية لـ AIDAA.'
                      : "En utilisant cet assistant, vous acceptez que vos échanges soient traités de façon anonymisée conformément à la politique de confidentialité AIDAA."}
                  </p>
                  {error && (
                    <p className="text-xs text-red-600 text-center mb-3">{error}</p>
                  )}
                  <button
                    onClick={handleConsent}
                    disabled={consentLoading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
                  >
                    {consentLoading
                      ? (lang === 'ar' ? 'جاري...' : 'En cours...')
                      : (lang === 'ar' ? 'أوافق وأبدأ' : "J'accepte et je commence")}
                  </button>
                </div>
              </div>
            )}

            {/* Chat */}
            {step === 'chat' && (
              <>
                {messages.map((msg, i) => (
                  <Bubble key={i} msg={msg} onSuggestion={sendMessage} />
                ))}
                {sending && <TypingIndicator />}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Footer — Input */}
          {step === 'chat' && (
            <div className="px-3 py-3 border-t border-slate-100">
              {error && (
                <p className="text-[11px] text-red-500 mb-1.5 px-1">{error}</p>
              )}
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 pr-1 pl-3 py-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={lang === 'ar' ? 'اكتب رسالتك...' : 'Votre message...'}
                  disabled={sending}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none py-2 min-w-0"
                  maxLength={1000}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || sending}
                  className="shrink-0 w-8 h-8 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-lg flex items-center justify-center transition-all"
                >
                  <i className="fa-solid fa-paper-plane text-xs" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-1.5">
                {lang === 'ar'
                  ? 'مساعد ذكي — ليس بديلاً عن الطبيب'
                  : 'IA éducative — Ne remplace pas un professionnel de santé'}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;


