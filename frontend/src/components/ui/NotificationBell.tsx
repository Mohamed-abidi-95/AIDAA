// ============================================================================
// NotificationBell — cloche avec dropdown de notifications
// ============================================================================
import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../features/notifications/useNotifications';

const typeIcon: Record<string, string> = {
  consultation: '🗓️',
  message:      '💬',
  note:         '📝',
  info:         'ℹ️',
};

const NotificationBell = ({ variant = 'dark' }: { variant?: 'dark' | 'light' }): React.ReactElement => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = async (n: any) => {
    if (!n.is_read) await markAsRead(n.id);
    if (n.link) window.open(n.link, '_blank');
  };

  const btnCls = variant === 'light'
    ? 'relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 transition-all'
    : 'relative p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all';

  return (
    <div ref={ref} className="relative inline-block">
      {/* Bouton cloche */}
      <button
        onClick={() => setOpen(v => !v)}
        className={btnCls}
        title="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {/* Header dropdown */}
          <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border-b border-slate-100">
            <span className="font-semibold text-slate-700 text-sm">🔔 Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-emerald-600 hover:underline font-medium"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">
                <p className="text-2xl mb-2">🔕</p>
                Aucune notification
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-emerald-50/60' : ''}`}
                  onClick={() => handleClick(n)}
                >
                  {/* Icône type */}
                  <span className="text-xl shrink-0 mt-0.5">
                    {typeIcon[n.type] || '🔔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold text-slate-800 truncate ${!n.is_read ? 'text-emerald-800' : ''}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(n.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                  {/* Bouton supprimer */}
                  <button
                    onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                    className="text-slate-300 hover:text-red-400 shrink-0 transition-colors"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {/* Point non lu */}
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

