import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { DESKTOP_PRIMARY_TABS, DESKTOP_PORTAL_TABS } from '../lib/navigation.ts';

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
  const { currentUser, role } = useAuth();
  const { totalVialsOrKits, setIsOpen: setCartOpen } = useCart();

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

        {/* Account Authentication Buttons */}
        <div className="sidebar-auth-group">
          <button
            type="button"
            onClick={() => onOpenAuth('login')}
            className="sidebar-login-btn cursor-pointer"
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => onOpenAuth('register')}
            className="sidebar-signup-btn cursor-pointer"
          >
            Sign Up
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate('customer-portal')}
        >
          <span>♙</span>
          <span>{currentUser ? currentUser.displayName.split(' ')[0] : 'Profile'}</span>
          {currentUser && (
            <span style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: 'bold', color: 'var(--rose)', textTransform: 'uppercase' }}>
              {role === 'ADMIN' ? 'Admin' : role === 'PARTNER_OWNER' ? 'Partner' : 'Member'}
            </span>
          )}
        </button>

        <button type="button" onClick={() => setCartOpen(true)}>
          <span>♧</span>
          Cart <b>{totalVialsOrKits}</b>
        </button>

        <button type="button" onClick={onOpenPerks}>
          <span>◇</span>
          Perks &amp; Rewards
        </button>

        {DESKTOP_PORTAL_TABS.map(tab => {
          const isActive =
            tab.id === 'partner-portal'
              ? currentPath === 'partner-portal' || currentPath === 'partners' || currentPath === 'partner-page'
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
        <p>Create your complimentary profile to unlock checkout, member offers, order tracking and faster reordering.</p>
        <button type="button" onClick={onOpenPerks}>
          Create your profile →
        </button>
      </section>
    </aside>
  );
};
