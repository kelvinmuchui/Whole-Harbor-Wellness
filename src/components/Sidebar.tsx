import React from 'react';
import { LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import {
  DESKTOP_PRIMARY_TABS,
  getVisiblePortalTabs,
  getPrimaryDashboardPath,
  getRoleDisplayLabel
} from '../lib/navigation.ts';

interface SidebarProps {
  currentPath: string;
  navigate: (path: string, param?: string) => void;
  onOpenPerks: () => void;
  onOpenGoals?: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  navigate,
  onOpenPerks,
  onOpenAuth
}) => {
  const { currentUser, role, logout } = useAuth();
  const { totalVialsOrKits, setIsOpen: setCartOpen } = useCart();

  const visiblePortalTabs = getVisiblePortalTabs(currentUser, role);
  const primaryDashboard = getPrimaryDashboardPath(currentUser, role);
  const firstName = currentUser?.displayName ? currentUser.displayName.split(' ')[0] : '';
  const initial = firstName ? firstName.charAt(0).toUpperCase() : 'W';

  return (
    <aside className="sidebar" aria-label="Main navigation">
      {/* Brand Logo */}
      <img
        src="/images/whw-logo.png"
        alt="Whole Harbor Wellness"
        width={470}
        height={220}
        className="brand-logo"
        onClick={() => navigate('home')}
        style={{ cursor: 'pointer' }}
      />

      {/* Side Navigation */}
      <nav className="side-nav" aria-label="Main navigation">
        {DESKTOP_PRIMARY_TABS.map(tab => {
          const isActive = tab.matchPaths.includes(currentPath);
          const isEcosystem = tab.id === 'ecosystem';
          const ecosystemActive = isEcosystem && (currentPath === 'partners' || currentPath === 'partner-portal');
          return (
            <a
              key={tab.id}
              href={`#${tab.path}`}
              className={
                ecosystemActive
                  ? 'active font-bold text-[#c5a059]'
                  : isActive
                  ? 'active'
                  : ''
              }
              onClick={(e) => {
                e.preventDefault();
                navigate(tab.path);
              }}
              title={isEcosystem ? 'Whole Harbor Wellness Ecosystem & Community Infrastructure' : tab.label}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </a>
          );
        })}

        {/* Authentication Controls: Sign In/Up when logged out; User Identity & Sign Out when signed in */}
        {!currentUser ? (
          <div className="sidebar-auth-group">
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="sidebar-login-btn cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#c5a059] shrink-0" strokeWidth={2.2} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="sidebar-signup-btn cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#c5a059] shrink-0" strokeWidth={2.2} />
              <span>Sign Up</span>
            </button>
          </div>
        ) : (
          <div className="sidebar-user-card">
            <button
              type="button"
              onClick={() => navigate(primaryDashboard)}
              className="sidebar-profile-btn cursor-pointer"
              title={`Open ${getRoleDisplayLabel(role)} Dashboard`}
            >
              <span
                className="w-7 h-7 rounded-full bg-[#0c2340] text-[#c5a059] border border-[#c5a059]/60 text-[11px] font-bold flex items-center justify-center shrink-0"
                style={{ width: '28px', height: '28px', fontSize: '11px' }}
              >
                {initial}
              </span>
              <span className="truncate text-[#0c2340] text-xs font-bold" style={{ width: 'auto', color: '#0c2340', fontSize: '12px' }}>
                {firstName}
              </span>
              <span
                className="ml-auto px-2 py-0.5 rounded-full bg-[#f6f4ee] border border-[#dfd7c7] text-[9px] font-bold uppercase tracking-wider text-[#c5a059]"
                style={{ width: 'auto', fontSize: '9px' }}
              >
                {getRoleDisplayLabel(role)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="sidebar-signout-btn cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#c5a059] shrink-0" strokeWidth={2.2} />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        <button type="button" onClick={() => setCartOpen(true)}>
          <span>♧</span>
          Cart <b>{totalVialsOrKits}</b>
        </button>

        <button type="button" onClick={onOpenPerks}>
          <span>◇</span>
          Perks &amp; Rewards
        </button>

        {visiblePortalTabs.map(tab => {
          const isActive =
            tab.id === 'partner-portal'
              ? currentPath === 'partner-portal' || currentPath === 'partner-page'
              : tab.matchPaths.includes(currentPath);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`${tab.id === 'admin' ? 'administrator-menu-link ' : ''}${isActive ? 'active' : ''}`}
            >
              <span style={{ fontSize: tab.id === 'partner-portal' ? '16px' : tab.id === 'admin' ? '15px' : undefined }}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Perks Card */}
      <section className="perks-card">
        <div className="perks-crown">⚓</div>
        <h3>Whole Harbor Perks</h3>
        <p>
          {currentUser
            ? 'Member perks, cold-chain tracking, and volume savings are active on your account.'
            : 'Create your complimentary profile to unlock checkout, member offers, order tracking and faster reordering.'}
        </p>
        <button
          type="button"
          onClick={() => (currentUser ? onOpenPerks() : onOpenAuth('register'))}
        >
          {currentUser ? 'View Member Perks →' : 'Create your profile →'}
        </button>
      </section>
    </aside>
  );
};

