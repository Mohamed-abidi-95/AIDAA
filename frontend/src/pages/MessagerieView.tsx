// ============================================================================
// MESSAGERIE VIEW — Chat parent ↔ professionnel (Tailwind + FA)
// ============================================================================
// Usage :
//   <MessagerieView role="parent"       myId={user.id} accent="green"  />
//   <MessagerieView role="professional" myId={user.id} accent="orange" />
// ============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../lib/api';

// ── Types ──────────────────────────────────────────────────────────────────
interface Contact {
  id: number;
  name: string;
  email: string;
  status?: string;
}

interface Child {
  id: number;
  name: string;
  age: number;
  parent_id: number;
}

interface Message {
  id: number;
  child_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  sender_name: string;
  sender_role: string;
}

interface ApiResult<T> { success: boolean; data: T; message?: string; }

interface Props {
  role: 'parent' | 'professional';
  myId: number;
  accent?: 'green' | 'orange';
}

// ── Helpers ────────────────────────────────────────────────────────────────
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return 'À l\'instant';
  if (diff < 3_600_000) return `Il y a ${Math.floor(diff / 60_000)} min`;
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

// ── Component ──────────────────────────────────────────────────────────────
export const MessagerieView = ({ role, myId, accent = 'green' }: Props): JSX.Element => {
  const isGreen  = accent === 'green';
  const accentBg = isGreen ? 'bg-brand-green' : 'bg-brand-orange';
  const accentTx = isGreen ? 'text-brand-green' : 'text-brand-orange';
  const accentRing = isGreen ? 'focus:ring-brand-green/20 focus:border-brand-green' : 'focus:ring-brand-orange/20 focus:border-brand-orange';
  const accentBtn  = isGreen ? 'bg-brand-green hover:bg-emerald-700 shadow-brand-green/20' : 'bg-brand-orange hover:bg-orange-700 shadow-brand-orange/20';

  // ── State ─────────────────────────────────────────────────────────────────
  const [contacts, setContacts]               = useState<Contact[]>([]);
  const [children, setChildren]               = useState<Child[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedChild, setSelectedChild]     = useState<Child | null>(null);
  const [messages, setMessages]               = useState<Message[]>([]);
  const [newMsg, setNewMsg]                   = useState('');
  const [contactsLoading, setContactsLoading] = useState(true);
  const [msgLoading, setMsgLoading]           = useState(false);
  const [sending, setSending]                 = useState(false);
  const [error, setError]                     = useState('');
  const [editingId, setEditingId]             = useState<number | null>(null);
  const [editContent, setEditContent]         = useState('');

  const bottomRef   = useRef<HTMLDivElement>(null);
  const pollRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Fetch contacts ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setContactsLoading(true);
        if (role === 'parent') {
          const { data } = await api.get<ApiResult<Contact[]>>('/api/parent/my-professionals');
          if (data.success) {
            const active = data.data.filter((c: any) => c.status !== 'revoked');
            setContacts(active);
            if (active.length > 0) setSelectedContact(active[0]);
          }
        } else {
          const { data } = await api.get<ApiResult<Contact[]>>('/api/professional/my-parents');
          if (data.success) {
            setContacts(data.data);
            if (data.data.length > 0) setSelectedContact(data.data[0]);
          }
        }
      } catch { /* silent */ }
      finally { setContactsLoading(false); }
    };
    fetchContacts();
  }, [role]);

  // ── Fetch children when contact changes ───────────────────────────────
  useEffect(() => {
    if (!selectedContact) { setChildren([]); setSelectedChild(null); return; }
    const fetchChildren = async () => {
      try {
        if (role === 'parent') {
          // Parent fetches their own children
          const { data } = await api.get<ApiResult<Child[]>>('/api/child/mychildren');
          if (data.success) {
            setChildren(data.data);
            setSelectedChild(data.data[0] ?? null);
          }
        } else {
          // Professional fetches all assigned children, filters by selected parent
          const { data } = await api.get<ApiResult<Child[]>>('/api/professional/my-children');
          if (data.success) {
            const filtered = data.data.filter((c: any) => c.parent_id === selectedContact.id);
            setChildren(filtered);
            setSelectedChild(filtered[0] ?? null);
          }
        }
      } catch { /* silent */ }
    };
    fetchChildren();
  }, [selectedContact, role]);

  // ── Load messages ─────────────────────────────────────────────────────
  const loadMessages = useCallback(async (childId: number, otherId: number, silent = false) => {
    try {
      if (!silent) setMsgLoading(true);
      const { data } = await api.get<ApiResult<Message[]>>(
        `/api/message/conversation/${childId}/${otherId}`
      );
      if (data.success) setMessages(data.data);
    } catch { /* silent */ }
    finally { if (!silent) setMsgLoading(false); }
  }, []);

  useEffect(() => {
    if (!selectedChild || !selectedContact) { setMessages([]); return; }
    loadMessages(selectedChild.id, selectedContact.id);

    // ── Poll every 5 s ─────────────────────────────────────────────────
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      loadMessages(selectedChild.id, selectedContact.id, true);
    }, 5000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedChild, selectedContact, loadMessages]);

  // ── Auto-scroll to bottom ─────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send message ──────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!newMsg.trim() || !selectedChild || !selectedContact) return;
    setError('');
    try {
      setSending(true);
      const { data } = await api.post<ApiResult<Message>>('/api/message', {
        childId: selectedChild.id,
        receiverId: selectedContact.id,
        content: newMsg.trim(),
      });
      if (data.success) {
        setNewMsg('');
        await loadMessages(selectedChild.id, selectedContact.id, true);
        textareaRef.current?.focus();
      } else {
        setError(data.message || 'Erreur lors de l\'envoi');
      }
    } catch { setError('Erreur réseau. Veuillez réessayer.'); }
    finally { setSending(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Edit message ──────────────────────────────────────────────────────
  const handleEdit = async (msgId: number) => {
    if (!editContent.trim()) return;
    try {
      const { data } = await api.put<ApiResult<any>>(`/api/message/${msgId}`, { content: editContent.trim() });
      if (data.success) {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: editContent.trim() } : m));
        setEditingId(null);
      }
    } catch { /* silent */ }
  };

  // ── Delete message ─────────────────────────────────────────────────────
  const handleDelete = async (msgId: number) => {
    if (!window.confirm('Supprimer ce message ?')) return;
    try {
      const { data } = await api.delete<ApiResult<any>>(`/api/message/${msgId}`);
      if (data.success) setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch { /* silent */ }
  };

  // ── Derived ────────────────────────────────────────────────────────────
  const contactLabel  = role === 'parent' ? 'Professionnels' : 'Familles';
  const emptyContacts = role === 'parent'
    ? 'Invitez d\'abord un professionnel depuis la section "Mon professionnel".'
    : 'Aucune famille ne vous a encore invité.';

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-80px)] gap-6 animate-fade-in">

      {/* ══ LEFT PANEL — Contacts ══ */}
      <div className="w-72 shrink-0 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className={`px-5 py-4 border-b border-slate-100`}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{contactLabel}</p>
          <p className="text-base font-bold text-slate-900">{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
          {contactsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
              <span className={`w-7 h-7 rounded-full border-4 border-slate-200 ${isGreen ? 'border-t-brand-green' : 'border-t-brand-orange'} animate-spin`} />
              <p className="text-xs">Chargement…</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400 px-3">
              <i className={`fa-solid fa-user-slash text-4xl ${accentTx} opacity-40`} />
              <p className="text-xs text-center leading-relaxed">{emptyContacts}</p>
            </div>
          ) : (
            contacts.map(c => {
              const isActive = selectedContact?.id === c.id;
              return (
                <button key={c.id} onClick={() => { setSelectedContact(c); setSelectedChild(null); }}
                  className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-left transition-all border
                    ${isActive
                      ? `${isGreen ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`
                      : 'border-transparent hover:bg-slate-50'}`}
                >
                  <div className={`w-10 h-10 rounded-full ${accentBg} flex items-center justify-center font-bold text-white text-sm shrink-0`}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-semibold text-sm truncate ${isActive ? (isGreen ? 'text-emerald-800' : 'text-orange-800') : 'text-slate-800'}`}>
                      {c.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{c.email}</p>
                  </div>
                  {isActive && (
                    <i className={`fa-solid fa-chevron-right text-xs ml-auto shrink-0 ${accentTx}`} />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ══ RIGHT PANEL — Chat ══ */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {!selectedContact ? (
          /* Empty state — no contact selected */
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
            <i className={`fa-solid fa-comments text-6xl ${accentTx} opacity-30`} />
            <div className="text-center">
              <p className="font-semibold text-slate-600 text-lg">Sélectionnez un contact</p>
              <p className="text-sm mt-1">Choisissez un {role === 'parent' ? 'professionnel' : 'parent'} dans la liste à gauche.</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Chat header ── */}
            <div className="px-7 py-4 border-b border-slate-100 flex items-center gap-4 shrink-0">
              <div className={`w-10 h-10 rounded-full ${accentBg} flex items-center justify-center font-bold text-white shrink-0`}>
                {selectedContact.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{selectedContact.name}</p>
                <p className="text-xs text-slate-400 truncate">{selectedContact.email}</p>
              </div>

              {/* ── Child tabs ── */}
              {children.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {children.map(child => (
                    <button key={child.id}
                      onClick={() => setSelectedChild(child)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border
                        ${selectedChild?.id === child.id
                          ? `${accentBg} text-white border-transparent shadow-sm`
                          : `border-slate-200 text-slate-600 hover:border-slate-300 bg-slate-50`}`}
                    >
                      <i className="fa-solid fa-child text-[10px]" />
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── No children ── */}
            {children.length === 0 && !contactsLoading && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                <i className={`fa-solid fa-baby text-4xl ${accentTx} opacity-30`} />
                <p className="text-sm font-medium">Aucun enfant associé à ce contact.</p>
              </div>
            )}

            {/* ── Messages area ── */}
            {selectedChild && (
              <>
                <div className="flex-1 overflow-y-auto px-7 py-5 flex flex-col gap-3">

                  {/* Child context banner */}
                  <div className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl self-center
                    ${isGreen ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                    <i className="fa-solid fa-child" />
                    Conversation concernant <strong>{selectedChild.name}</strong> · {selectedChild.age} ans
                  </div>

                  {/* Loading messages */}
                  {msgLoading && (
                    <div className="flex justify-center py-8">
                      <span className={`w-8 h-8 rounded-full border-4 border-slate-200 ${isGreen ? 'border-t-brand-green' : 'border-t-brand-orange'} animate-spin`} />
                    </div>
                  )}

                  {/* No messages */}
                  {!msgLoading && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                      <i className="fa-regular fa-comment-dots text-5xl opacity-30" />
                      <p className="text-sm font-medium">Aucun message pour le moment.</p>
                      <p className="text-xs text-center max-w-xs">Commencez la conversation ci-dessous.</p>
                    </div>
                  )}

                  {/* Message bubbles */}
                  {messages.map(msg => {
                    const isMine = msg.sender_id === myId;
                    const isEditing = editingId === msg.id;
                    return (
                      <div key={msg.id} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'} group`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-1
                          ${isMine
                            ? `${accentBg} text-white`
                            : 'bg-slate-200 text-slate-600'}`}>
                          {msg.sender_name?.charAt(0).toUpperCase() ?? '?'}
                        </div>

                        {/* Bubble */}
                        <div className={`max-w-[65%] flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 px-1">
                            <span className="text-[11px] text-slate-400 font-medium">{msg.sender_name}</span>
                            <span className="text-[10px] text-slate-300">{fmtDate(msg.created_at)}</span>
                          </div>

                          {isEditing ? (
                            <div className="flex flex-col gap-2 w-full">
                              <textarea
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                rows={2}
                                className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ${accentRing}`}
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button onClick={() => handleEdit(msg.id)}
                                  className={`px-3 py-1 rounded-lg ${accentBg} text-white text-xs font-semibold`}>
                                  Enregistrer
                                </button>
                                <button onClick={() => setEditingId(null)}
                                  className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                                  Annuler
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words
                              ${isMine
                                ? `${accentBg} text-white rounded-tr-sm`
                                : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                              {msg.content}
                            </div>
                          )}

                          {/* Actions on hover */}
                          {isMine && !isEditing && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingId(msg.id); setEditContent(msg.content); }}
                                className="text-[10px] text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded flex items-center gap-1">
                                <i className="fa-solid fa-pen" /> Modifier
                              </button>
                              <button onClick={() => handleDelete(msg.id)}
                                className="text-[10px] text-red-400 hover:text-red-600 px-2 py-0.5 rounded flex items-center gap-1">
                                <i className="fa-solid fa-trash" /> Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* ── Input area ── */}
                <div className="px-7 py-4 border-t border-slate-100 shrink-0">
                  {error && (
                    <div className="mb-3 text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center gap-2">
                      <i className="fa-solid fa-circle-xmark" /> {error}
                    </div>
                  )}
                  <div className="flex gap-3 items-end">
                    <textarea
                      ref={textareaRef}
                      value={newMsg}
                      onChange={e => setNewMsg(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={2}
                      placeholder={`Message à ${selectedContact.name} concernant ${selectedChild.name}… (Entrée pour envoyer)`}
                      className={`flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-white resize-none focus:outline-none focus:ring-4 ${accentRing} transition-all`}
                    />
                    <button
                      onClick={handleSend}
                      disabled={sending || !newMsg.trim()}
                      className={`${accentBtn} text-white font-semibold px-5 py-3 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 shrink-0 self-end`}
                    >
                      {sending
                        ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        : <i className="fa-solid fa-paper-plane" />
                      }
                      <span className="hidden sm:inline">Envoyer</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-right">
                    Maj+Entrée pour saut de ligne · Entrée pour envoyer
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

