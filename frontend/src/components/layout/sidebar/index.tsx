// ============================================================================
// SIDEBAR — Barre latérale des dashboards (admin, parent, professionnel)
// Extrait de AdminPanel.tsx et ParentDashboard.tsx
// ============================================================================
import React from 'react';
import { SidebarProps, SidebarTheme } from './sidebar.types';

const THEME: Record<SidebarTheme, {
  bg: string; shadow: string;
  iconBg: string; avatarText: string;
  activeBtn: string; hoverBtn: string;
}> = {
  orange: {
    bg:         '#F97316',
    shadow:     'rgba(249,115,22,0.2)',
    iconBg:     'bg-white text-brand-orange',
    avatarText: 'text-brand-orange',
    activeBtn:  'bg-white text-brand-orange',
    hoverBtn:   'hover:bg-white/15 hover:border-white/20',
  },
  green: {
    bg:         '#10b981',
    shadow:     'rgba(16,185,129,0.2)',
    iconBg:     'bg-white text-brand-green',
    avatarText: 'text-brand-green',
    activeBtn:  'bg-white text-brand-green',
    hoverBtn:   'hover:bg-white/15 hover:border-white/20',
  },
};

export const Sidebar: React.FC<SidebarProps> = ({
  title, subtitle, navItems, activeKey, onNavigate,
  userInitial, userName, userRole, onLogout,
  theme = 'orange', children,
}) => {
  const t = THEME[theme];
  return (
    <aside
      className="w-[280px] flex flex-col z-10 shrink-0 overflow-y-auto"
      style={{
        background:      t.bg,
        backgroundImage: 'linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px)',
        backgroundSize:  '20px 20px',
        boxShadow:       `4px 0 15px ${t.shadow}`,
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-4 px-6 py-8 shrink-0">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0 ${t.iconBg}`}>
          <i className="fa-solid fa-puzzle-piece" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight leading-none">{title}</h2>
          <span className="text-[11px] text-white/80 font-medium uppercase tracking-widest">{subtitle}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-5 flex flex-col gap-2">
        {navItems.map(n => (
          <button
            key={n.key}
            onClick={() => onNavigate(n.key)}
            className={[
              'flex items-center w-full px-5 py-3.5 rounded-xl font-semibold text-[15px] border transition-all',
              activeKey === n.key
                ? `${t.activeBtn} shadow-md border-transparent`
                : `text-white border-transparent ${t.hoverBtn}`,
            ].join(' ')}
          >
            <i className={`${n.fa} w-6 mr-3 text-lg ${activeKey === n.key ? '' : 'opacity-80'}`} />
            {n.label}
            {n.badge !== undefined && n.badge > 0 && (
              <span className="ml-auto w-5 h-5 rounded-full bg-white text-brand-orange text-[11px] font-bold flex items-center justify-center">
                {n.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Slot libre (liste enfants, etc.) */}
      {children}

      {/* Footer utilisateur */}
      <div className="p-6 shrink-0">
        <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl p-3 mb-4">
          <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-base shrink-0 ${t.avatarText}`}>
            {userInitial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-white/80">{userRole}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-black/15 hover:bg-black/25 text-white font-semibold py-3 rounded-lg transition-all text-sm"
        >
          Se déconnecter <i className="fa-solid fa-arrow-right-from-bracket" />
        </button>
      </div>
    </aside>
  );
};
