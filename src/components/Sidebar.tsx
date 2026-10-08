import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';

interface SidebarProps {
  currentPath: string;
  navigate: (path: string, param?: string) => void;
  onOpenPerks: () => void;
  onOpenGoals?: () => void;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  navigate,
  onOpenPerks,
  onOpenAuth
}) => {
  const { currentUser, role } = useAuth();
  const { totalVialsOrKits, setIsOpen: setCartOpen } = useCart();

  const isShopActive = currentPath === 'shop' || currentPath === 'home' || currentPath === 'product-detail';
  const isProgramsActive = currentPath === 'wellness-programs';
  const isApproachActive = currentPath === 'approach';
  const isAboutActive = currentPath === 'about';
  const isFaqActive = currentPath === 'faq';
  const isContactActive = currentPath === 'contact';
  const isLearnActive = currentPath === 'learn';
  const isOrdersActive = currentPath === 'customer-portal';
  const isPartnerActive = currentPath === 'partner-portal' || currentPath === 'partners' || currentPath === 'partner-page';
  const isAdminActive = currentPath === 'admin';

  return (
    <aside className="sidebar" aria-label="Main navigation">
      {/* Brand Logo */}
      <img
        src="/images/princess-logo.png"
        alt="The Princess of Peptides"
        width={470}
        height={220}
        className="brand-logo"
        onClick={() => navigate('home')}
        style={{ cursor: 'pointer' }}
      />

      {/* Side Navigation */}
      <nav className="side-nav" aria-label="Main navigation">
        <a
          href="#best-sellers"
          className={isShopActive ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            navigate('shop');
          }}
        >
          <span>♔</span>
          Shop
        </a>

        <a
          href="#wellness-programs"
          className={isProgramsActive ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            navigate('wellness-programs');
          }}
        >
          <span>🌿</span>
          Wellness Programs
        </a>

        <a
          href="#approach"
          className={isApproachActive ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            navigate('approach');
          }}
        >
          <span>🔬</span>
          Our Approach
        </a>

        <a
          href="#about"
          className={isAboutActive ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            navigate('about');
          }}
        >
          <span>🏛</span>
          About Us
        </a>

        <a
          href="#faq"
          className={isFaqActive ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            navigate('faq');
          }}
        >
          <span>❓</span>
          FAQ
        </a>

        <a
          href="#contact"
          className={isContactActive ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            navigate('contact');
          }}
        >
          <span>✉</span>
          Contact Concierge
        </a>

        <a
          href="#learn"
          className={isLearnActive ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            navigate('learn');
          }}
        >
          <span>▤</span>
          Learn
        </a>

        <button
          onClick={() => {
            if (currentUser) {
              navigate('customer-portal');
            } else {
              onOpenAuth();
            }
          }}
        >
          <span>♙</span>
          <span>{currentUser ? currentUser.displayName.split(' ')[0] : 'Profile'}</span>
          {currentUser && (
            <span style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: 'bold', color: 'var(--rose)', textTransform: 'uppercase' }}>
              {role === 'ADMIN' ? 'Admin' : role === 'PARTNER_OWNER' ? 'Partner' : 'Member'}
            </span>
          )}
        </button>

        <button onClick={() => setCartOpen(true)}>
          <span>♧</span>
          Cart <b>{totalVialsOrKits}</b>
        </button>

        <button onClick={onOpenPerks}>
          <span>◇</span>
          Perks &amp; Rewards
        </button>

        <button
          onClick={() => {
            if (currentUser) {
              navigate('customer-portal');
            } else {
              onOpenAuth();
            }
          }}
          className={isOrdersActive ? 'active' : ''}
        >
          <span>□</span>
          My Orders
        </button>

        <button
          onClick={() => navigate('partner-portal')}
          className={isPartnerActive ? 'active' : ''}
        >
          <span style={{ fontSize: '16px' }}>🤝</span>
          Partner Portal
        </button>

        <button
          onClick={() => navigate('admin')}
          className={`administrator-menu-link ${isAdminActive ? 'active' : ''}`}
        >
          <span style={{ fontSize: '15px' }}>🔒</span>
          Admin Center
        </button>
      </nav>

      {/* Perks Card */}
      <section className="perks-card">
        <div className="perks-crown">♕</div>
        <h3>Princess Perks</h3>
        <p>Create your complimentary profile to unlock checkout, member offers, order tracking and faster reordering.</p>
        <button onClick={onOpenPerks}>
          Create your profile →
        </button>
      </section>
    </aside>
  );
};
