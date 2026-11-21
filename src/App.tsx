import React, { useState, useEffect } from 'react';
import { Menu, X, Search, LogIn, UserPlus, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { testFirestoreConnection } from './lib/firebase.ts';
import {
  DESKTOP_PRIMARY_TABS,
  getVisiblePortalTabs,
  getPrimaryDashboardPath,
  getRoleDisplayLabel
} from './lib/navigation.ts';
import { updatePageSeo } from './services/seoService.ts';
import { analyticsService } from './services/analyticsService.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { MobileNav } from './components/MobileNav.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { GoalsModal } from './components/GoalsModal.tsx';
import { PerksModal } from './components/PerksModal.tsx';
import { AskWHWDrawer } from './components/AskWHWDrawer.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Views
import { HomeView } from './views/HomeView.tsx';
import { ShopView } from './views/ShopView.tsx';
import { ProductDetailView } from './views/ProductDetailView.tsx';
import { ProgramsView } from './views/ProgramsView.tsx';
import { ApproachView } from './views/ApproachView.tsx';
import { PartnersView } from './views/PartnersView.tsx';
import { PartnerLandingView } from './views/PartnerLandingView.tsx';
import { PartnerDashboardView } from './views/PartnerDashboardView.tsx';
import { CustomerPortalView } from './views/CustomerPortalView.tsx';
import { AdminDashboardView } from './views/AdminDashboardView.tsx';
import { LearnView } from './views/LearnView.tsx';
import { AboutView } from './views/AboutView.tsx';
import { ArchitectureView } from './views/ArchitectureView.tsx';
import { FAQView } from './views/FAQView.tsx';
import { ContactView } from './views/ContactView.tsx';

function MainApp() {
  const { currentUser, role, isAdmin, isPartner, logout } = useAuth();
  const { totalVialsOrKits, setIsOpen: setCartOpen } = useCart();
  const [currentPath, setCurrentPath] = useState<string>('home');
  const [currentParam, setCurrentParam] = useState<string | undefined>(undefined);

  // Modals & Mobile Drawer state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [perksOpen, setPerksOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visiblePortalTabs = getVisiblePortalTabs(currentUser, role);
  const primaryDashboard = getPrimaryDashboardPath(currentUser, role);
  const userFirstName = currentUser?.displayName ? currentUser.displayName.split(' ')[0] : '';
  const userInitial = userFirstName ? userFirstName.charAt(0).toUpperCase() : 'W';

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    testFirestoreConnection().catch(() => {});
  }, []);

  useEffect(() => {
    updatePageSeo(currentPath, currentParam);
    analyticsService.trackPageView(currentPath, currentParam);
  }, [currentPath, currentParam]);

  // Handle URL hash changes (preserving optional ?src=... query strings cleanly)
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '');
      const cleanHash = rawHash.split('?')[0];
      if (!cleanHash) {
        setCurrentPath('home');
        setCurrentParam(undefined);
        return;
      }

      const parts = cleanHash.split('/');
      const primary = parts[0] || 'home';
      const secondary = parts[1];

      // Handle #best-sellers or #catalog
      if (primary === 'best-sellers' || primary === 'catalog') {
        setCurrentPath('shop');
        setCurrentParam(undefined);
        setTimeout(() => {
          const el = document.getElementById(primary);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return;
      }

      // Handle /partner/:slug
      if (primary === 'partner' && secondary) {
        setCurrentPath('partner-page');
        setCurrentParam(secondary);
      } else if (primary === 'product' && secondary) {
        setCurrentPath('product-detail');
        setCurrentParam(secondary);
      } else {
        setCurrentPath(primary);
        setCurrentParam(secondary);
      }
      window.scrollTo(0, 0);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string, param?: string) => {
    let newHash = '';
    if (path === 'home') {
      newHash = '';
    } else if (path === 'partner-page' && param) {
      newHash = `#/partner/${param}`;
    } else if (path === 'product-detail' && param) {
      newHash = `#/product/${param}`;
    } else if (param) {
      newHash = `#/${path}/${param}`;
    } else {
      newHash = `#/${path}`;
    }

    window.location.hash = newHash;
    setCurrentPath(path);
    setCurrentParam(param);
    window.scrollTo(0, 0);
  };

  const mobileMenuDrawer = mobileMenuOpen ? (
    <div
      className="md:hidden fixed inset-0 z-50 flex justify-end bg-[#0c2340]/45 backdrop-blur-xs"
      onClick={() => setMobileMenuOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation drawer"
    >
      <div
        className="w-[min(340px,90vw)] h-full bg-[#fffdfb] border-l border-[#dfd7c7] shadow-2xl flex flex-col overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#dfd7c7]">
          <div
            onClick={() => {
              navigate('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-[#dfd7c7] p-1 flex items-center justify-center">
              <img
                src="/images/whw-logo.png"
                alt="Whole Harbor Wellness"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-serif font-bold text-base text-[#0c2340]">Whole Harbor</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#c5a059] font-bold">Wellness</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
            className="w-11 h-11 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7] text-[#0c2340] flex items-center justify-center cursor-pointer hover:bg-[#dfd7c7]/40 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Account / Auth Section */}
        <div className="p-5 bg-[#f6f4ee] border-b border-[#dfd7c7] space-y-3">
          {!currentUser ? (
            <>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0c2340]">
                  Member &amp; Partner Access
                </p>
                <p className="text-[11px] text-[#5a6b7c]">
                  Sign in for order tracking, wholesale kits &amp; perks
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuth('login');
                  }}
                  className="h-11 px-3 rounded-xl bg-white border border-[#d5cab6] text-[#0c2340] hover:border-[#c5a059] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuth('register');
                  }}
                  className="h-11 px-3 rounded-xl bg-gradient-to-br from-[#0c2340] to-[#17365d] border border-[#c5a059]/60 text-white hover:from-[#c5a059] hover:to-[#a98338] text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Sign Up</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0c2340] text-[#c5a059] border border-[#c5a059]/60 font-bold text-sm flex items-center justify-center shrink-0">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-[#0c2340] truncate">
                      {currentUser.displayName}
                    </p>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-[#dfd7c7] text-[9px] font-bold uppercase tracking-wider text-[#c5a059] shrink-0">
                      {getRoleDisplayLabel(role)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5a6b7c] truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(primaryDashboard);
                  }}
                  className="h-10 px-3 rounded-xl bg-[#0c2340] text-white hover:bg-[#c5a059] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors whitespace-nowrap"
                >
                  <span>My Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="h-10 px-3 rounded-xl bg-white border border-[#dfd7c7] text-[#5a6b7c] hover:text-[#0c2340] hover:border-[#0c2340] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Quick Search & Primary Navigation Tabs (Matches Desktop Sidebar) */}
        <div className="p-4 space-y-1 flex-1">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setSearchOpen(true);
            }}
            className="w-full min-h-[44px] mb-3 px-3.5 py-2.5 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7] flex items-center gap-2.5 text-xs font-semibold text-[#5a6b7c] hover:text-[#0c2340] hover:border-[#c5a059] cursor-pointer transition-colors"
          >
            <Search className="w-4 h-4 text-[#c5a059]" />
            <span>Search formulations, peptides &amp; kits...</span>
          </button>

          <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#5a6b7c]">
            Navigation
          </p>
          {DESKTOP_PRIMARY_TABS.map(tab => {
            const isActive = tab.matchPaths.includes(currentPath);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  navigate(tab.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0c2340] text-white shadow-xs'
                    : 'text-[#0c2340] hover:bg-[#f6f4ee]'
                }`}
              >
                <span className="w-6 text-center text-base text-[#c5a059]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="my-3 border-t border-[#dfd7c7]" />

          <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#5a6b7c]">
            Portals &amp; Account
          </p>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setCartOpen(true);
            }}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center justify-between text-sm font-semibold text-[#0c2340] hover:bg-[#f6f4ee] cursor-pointer"
          >
            <span className="flex items-center gap-3">
              <span className="w-6 text-center text-base text-[#c5a059]">♧</span>
              <span>Cart</span>
            </span>
            <span className="min-w-6 h-6 px-1.5 rounded-full bg-[#c5a059] text-white text-xs font-bold flex items-center justify-center">
              {totalVialsOrKits}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setPerksOpen(true);
            }}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-sm font-semibold text-[#0c2340] hover:bg-[#f6f4ee] cursor-pointer"
          >
            <span className="w-6 text-center text-base text-[#c5a059]">◇</span>
            <span>Perks &amp; Rewards</span>
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
                onClick={() => {
                  navigate(tab.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0c2340] text-white shadow-xs'
                    : tab.id === 'admin'
                    ? 'text-[#c5a059] hover:bg-[#f6f4ee]'
                    : 'text-[#0c2340] hover:bg-[#f6f4ee]'
                }`}
              >
                <span className="w-6 text-center text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  ) : null;

  const mobileTopHeader = (
    <header className="topbar">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          onClick={() => navigate('home')}
          className="md:hidden flex items-center gap-2.5 cursor-pointer py-1 min-w-0"
          title="Whole Harbor Wellness Home"
        >
          <div className="w-9 h-9 rounded-xl bg-white border border-[#dfd7c7] shadow-xs p-1 flex items-center justify-center shrink-0 transition-transform active:scale-95">
            <img
              src="/images/whw-logo.png"
              alt="Whole Harbor Wellness"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="font-serif font-bold text-base text-[var(--deep)] tracking-tight truncate">
              Whole Harbor
            </span>
            <span className="font-sans text-[9px] uppercase tracking-[0.18em] text-[#c5a059] font-bold">
              Wellness
            </span>
          </div>
        </div>
        <p className="hidden md:block whitespace-nowrap">Wellness · Recovery · Optimization</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Desktop-only top bar actions */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="whw-btn-search hidden md:inline-flex cursor-pointer"
          title="Search formulations"
          aria-label="Search formulations"
        >
          <Search className="w-3.5 h-3.5 text-[#5a6b7c]" strokeWidth={2} />
          <span>Search</span>
        </button>

        {!currentUser ? (
          <>
            <button
              type="button"
              onClick={() => openAuth('login')}
              className="whw-btn-login hidden md:inline-flex cursor-pointer"
              title="Sign in to your account"
            >
              <LogIn className="w-3.5 h-3.5 text-[#c5a059]" strokeWidth={2.2} />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => openAuth('register')}
              className="whw-btn-signup hidden md:inline-flex cursor-pointer"
              title="Create a new account"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#c5a059]" strokeWidth={2.2} />
              <span>Sign Up</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="whw-btn-profile hidden md:inline-flex cursor-pointer"
              onClick={() => navigate(primaryDashboard)}
              title={`Open ${getRoleDisplayLabel(role)} dashboard`}
            >
              <span className="avatar">{userInitial}</span>
              <span>{userFirstName}</span>
              <span className="px-2 py-0.5 rounded-full bg-white border border-[#dfd7c7] text-[9px] font-bold uppercase tracking-wider text-[#c5a059]">
                {getRoleDisplayLabel(role)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => logout()}
              className="whw-btn-signout hidden md:inline-flex cursor-pointer"
              title="Sign out of your account"
            >
              <LogOut className="w-3.5 h-3.5 text-[#c5a059]" strokeWidth={2.2} />
              <span>Sign Out</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => navigate('contact')}
          className="topbar-contact hidden lg:inline-flex cursor-pointer"
          title="Support & Inquiries"
        >
          Contact
        </button>

        {/* Mobile-only Hamburger Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="whw-btn-hamburger md:hidden cursor-pointer"
          aria-label="Open navigation menu"
          aria-expanded={mobileMenuOpen}
          title="Open menu"
        >
          <Menu className="w-5 h-5" strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );

  // Dedicated Education Studio View (self-contained desktop layout + unified mobile header & drawer)
  if (currentPath === 'learn') {
    return (
      <div className="min-h-screen bg-[var(--ivory)] text-[var(--ink)] font-sans pb-20 md:pb-0">
        <div className="md:hidden px-4 border-b border-[#dfd7c7]/70 bg-[#fffdfb]">
          {mobileTopHeader}
        </div>

        <LearnView initialTab={currentParam} navigate={navigate} />

        <MobileNav
          currentPath={currentPath}
          navigate={navigate}
          onOpenPerks={() => setPerksOpen(true)}
          onOpenGoals={() => setGoalsOpen(true)}
        />
        {mobileMenuDrawer}

        <CartDrawer
          onOpenCheckout={() => setCheckoutOpen(true)}
          navigate={navigate}
        />
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          navigate={navigate}
        />
        <SearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          navigate={navigate}
        />
        <AuthModal
          isOpen={authOpen}
          initialMode={authMode}
          onClose={() => setAuthOpen(false)}
          navigate={navigate}
        />
        <PerksModal
          isOpen={perksOpen}
          onClose={() => setPerksOpen(false)}
          navigate={navigate}
        />
        <GoalsModal
          isOpen={goalsOpen}
          onClose={() => setGoalsOpen(false)}
          navigate={navigate}
        />
        <AskWHWDrawer
          currentPath={currentPath}
          navigate={navigate}
        />
      </div>
    );
  }

  // Dedicated Admin Operations Console (self-contained dark-navy sidebar + top utility bar)
  if (currentPath === 'admin' && currentUser && isAdmin) {
    return (
      <div className="min-h-screen bg-[#f9f8f4] text-[var(--ink)] font-sans selection:bg-[var(--rose)] selection:text-white pb-20 md:pb-0">
        <AdminDashboardView navigate={navigate} />

        <MobileNav
          currentPath={currentPath}
          navigate={navigate}
          onOpenPerks={() => setPerksOpen(true)}
          onOpenGoals={() => setGoalsOpen(true)}
        />
        {mobileMenuDrawer}

        <CartDrawer
          onOpenCheckout={() => setCheckoutOpen(true)}
          navigate={navigate}
        />
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          navigate={navigate}
        />
        <SearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          navigate={navigate}
        />
        <AuthModal
          isOpen={authOpen}
          initialMode={authMode}
          onClose={() => setAuthOpen(false)}
          navigate={navigate}
        />
        <GoalsModal
          isOpen={goalsOpen}
          onClose={() => setGoalsOpen(false)}
          navigate={navigate}
        />
        <PerksModal
          isOpen={perksOpen}
          onClose={() => setPerksOpen(false)}
          navigate={navigate}
        />
        <AskWHWDrawer
          currentPath={currentPath}
          navigate={navigate}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--ivory)] text-[var(--ink)] font-sans selection:bg-[var(--rose)] selection:text-white">
      <div className="site-shell">
        {/* Left Sticky Sidebar */}
        <Sidebar
          currentPath={currentPath}
          navigate={navigate}
          onOpenPerks={() => setPerksOpen(true)}
          onOpenGoals={() => setGoalsOpen(true)}
          onOpenAuth={openAuth}
        />

        {/* Right Content Area */}
        <section className="content">
          {/* Top Header Bar */}
          {mobileTopHeader}

          {/* Main View Area */}
          <main className="min-w-0">
            {currentPath === 'home' && (
              <HomeView navigate={navigate} />
            )}

            {currentPath === 'shop' && (
              <ShopView initialCategory={currentParam} navigate={navigate} />
            )}

            {currentPath === 'product-detail' && currentParam && (
              <ProductDetailView slug={currentParam} navigate={navigate} />
            )}

            {currentPath === 'wellness-programs' && (
              <ProgramsView navigate={navigate} />
            )}

            {currentPath === 'approach' && (
              <ApproachView navigate={navigate} />
            )}

            {currentPath === 'partners' && (
              <PartnersView navigate={navigate} />
            )}

            {currentPath === 'partner-page' && currentParam && (
              <PartnerLandingView slug={currentParam} navigate={navigate} />
            )}

            {currentPath === 'partner-portal' && (
              !currentUser ? (
                <div className="max-w-xl mx-auto my-16 bg-white border border-[#dfd7c7] rounded-3xl p-8 text-center space-y-4 shadow-xs">
                  <span className="material-symbols-outlined text-[36px] text-[#c5a059]">lock</span>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Partner Portal Sign-In Required</h2>
                  <p className="text-xs text-[#5a6b7c]">
                    Sign in with your partner credentials to manage your clinic storefront, wholesale 10-vial kits, and commission ledger.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button
                      onClick={() => openAuth('login')}
                      className="px-5 py-2.5 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
                    >
                      Sign In to Portal
                    </button>
                    <button
                      onClick={() => navigate('partners')}
                      className="px-5 py-2.5 rounded-xl border border-[#dfd7c7] text-[#0c2340] text-xs font-semibold hover:bg-[#f6f4ee] cursor-pointer"
                    >
                      Apply to Become a Partner
                    </button>
                  </div>
                </div>
              ) : (!isPartner && !isAdmin) ? (
                <div className="max-w-xl mx-auto my-16 bg-white border border-[#dfd7c7] rounded-3xl p-8 text-center space-y-4 shadow-xs">
                  <span className="material-symbols-outlined text-[36px] text-[#c5a059]">verified_user</span>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Partner Account Required</h2>
                  <p className="text-xs text-[#5a6b7c]">
                    You are currently signed in as a Member ({getRoleDisplayLabel(role)}). Only approved clinic or studio partners can access the Partner Portal.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button
                      onClick={() => navigate(primaryDashboard)}
                      className="px-5 py-2.5 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
                    >
                      Return to My Dashboard
                    </button>
                    <button
                      onClick={() => navigate('partners')}
                      className="px-5 py-2.5 rounded-xl border border-[#dfd7c7] text-[#0c2340] text-xs font-semibold hover:bg-[#f6f4ee] cursor-pointer"
                    >
                      Apply as a Partner
                    </button>
                  </div>
                </div>
              ) : (
                <PartnerDashboardView navigate={navigate} />
              )
            )}

            {currentPath === 'customer-portal' && (
              !currentUser ? (
                <div className="max-w-xl mx-auto my-16 bg-white border border-[#dfd7c7] rounded-3xl p-8 text-center space-y-4 shadow-xs">
                  <span className="material-symbols-outlined text-[36px] text-[#c5a059]">person</span>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Member Sign-In Required</h2>
                  <p className="text-xs text-[#5a6b7c]">
                    Sign in or create an account to view cold-chain tracking, order history, and account security settings.
                  </p>
                  <button
                    onClick={() => openAuth('login')}
                    className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-white text-xs font-semibold hover:bg-[#0c2340] transition-colors cursor-pointer"
                  >
                    Sign In / Create Account
                  </button>
                </div>
              ) : (
                <CustomerPortalView navigate={navigate} />
              )
            )}

            {currentPath === 'admin' && (
              (!currentUser || !isAdmin) ? (
                <div className="max-w-xl mx-auto my-16 bg-white border border-[#dfd7c7] rounded-3xl p-8 text-center space-y-4 shadow-xs">
                  <span className="material-symbols-outlined text-[40px] text-[#c5a059]">verified_user</span>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Administrator Access Restricted</h2>
                  <p className="text-xs text-[#5a6b7c]">
                    This executive operations console is restricted to authorized Whole Harbor Wellness administrators.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    {!currentUser ? (
                      <button
                        onClick={() => openAuth('login')}
                        className="px-6 py-2.5 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
                      >
                        Administrator Sign In
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(primaryDashboard)}
                        className="px-6 py-2.5 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
                      >
                        Return to My Dashboard
                      </button>
                    )}
                    <button
                      onClick={() => navigate('home')}
                      className="px-5 py-2.5 rounded-xl border border-[#dfd7c7] text-[#5a6b7c] text-xs font-semibold hover:bg-[#f6f4ee] cursor-pointer"
                    >
                      Return to Storefront
                    </button>
                  </div>
                </div>
              ) : (
                <AdminDashboardView navigate={navigate} />
              )
            )}

            {currentPath === 'about' && (
              <AboutView initialSection={currentParam} navigate={navigate} />
            )}

            {currentPath === 'faq' && (
              <FAQView navigate={navigate} />
            )}

            {currentPath === 'contact' && (
              <ContactView navigate={navigate} />
            )}

            {currentPath === 'architecture' && (
              <ArchitectureView navigate={navigate} />
            )}
          </main>

          {/* Footer */}
          <Footer navigate={navigate} />
        </section>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentPath={currentPath}
        navigate={navigate}
        onOpenPerks={() => setPerksOpen(true)}
        onOpenGoals={() => setGoalsOpen(true)}
      />

      {/* Mobile Hamburger Slide-Over Menu Drawer */}
      {mobileMenuDrawer}

      {/* Global Modals & Drawers */}
      <CartDrawer
        onOpenCheckout={() => setCheckoutOpen(true)}
        navigate={navigate}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        navigate={navigate}
      />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        navigate={navigate}
      />

      <AuthModal
        isOpen={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
        navigate={navigate}
      />

      <GoalsModal
        isOpen={goalsOpen}
        onClose={() => setGoalsOpen(false)}
        navigate={navigate}
      />

      <PerksModal
        isOpen={perksOpen}
        onClose={() => setPerksOpen(false)}
        navigate={navigate}
      />

      {/* Floating Action Button & Slide-over Assistant */}
      <AskWHWDrawer
        currentPath={currentPath}
        navigate={navigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
