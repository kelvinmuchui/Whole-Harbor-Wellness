import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
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
  const { currentUser } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('home');
  const [currentParam, setCurrentParam] = useState<string | undefined>(undefined);

  // Modals state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [perksOpen, setPerksOpen] = useState(false);

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) {
        setCurrentPath('home');
        setCurrentParam(undefined);
        return;
      }

      const parts = hash.split('/');
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

  // Dedicated Education Studio View (self-contained layout with sidebar)
  if (currentPath === 'learn') {
    return (
      <div className="min-h-screen bg-[var(--ivory)] text-[var(--ink)] font-sans">
        <LearnView initialTab={currentParam} navigate={navigate} />

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
          onClose={() => setAuthOpen(false)}
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
          onOpenAuth={() => setAuthOpen(true)}
        />

        {/* Right Content Area */}
        <section className="content">
          {/* Top Header Bar */}
          <header className="topbar">
            <div className="flex items-center gap-3">
              <div 
                onClick={() => navigate('home')} 
                className="md:hidden flex items-center gap-2.5 cursor-pointer"
              >
                <img
                  src="/images/whw-logo.png"
                  alt="Whole Harbor Wellness"
                  className="w-7 h-7 rounded-full object-cover border border-[#ead2ce]"
                />
                <span className="font-serif font-bold text-sm text-[var(--deep)]">Whole Harbor Wellness</span>
              </div>
              <p className="hidden md:block">Wellness • Recovery • Optimization</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="text-[var(--deep)] hover:text-[var(--rose)] px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer bg-white/70 border border-[var(--line)] rounded-full transition-all"
                title="Search formulations"
              >
                <span className="material-symbols-outlined text-[16px]">search</span>
                <span className="hidden sm:inline">Search</span>
              </button>

              <a
                href="https://wa.me/529841721536?text=Hi%20Kelvin%2C%20I%20have%20a%20question%20about%20Whole%20Harbor%20Wellness."
                target="_blank"
                rel="noreferrer"
                className="topbar-contact cursor-pointer"
              >
                Contact Kelvin
              </a>

              <button
                className="profile-shortcut cursor-pointer"
                onClick={() => {
                  if (currentUser) {
                    navigate('customer-portal');
                  } else {
                    setAuthOpen(true);
                  }
                }}
              >
                <span className="avatar">♙</span>
                <b>{currentUser ? currentUser.displayName.split(' ')[0] : 'Profile'}</b>
              </button>
            </div>
          </header>

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
              <PartnerDashboardView navigate={navigate} />
            )}

            {currentPath === 'customer-portal' && (
              <CustomerPortalView navigate={navigate} />
            )}

            {currentPath === 'admin' && (
              <AdminDashboardView navigate={navigate} />
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

        {/* Mobile Bottom Navigation */}
        <MobileNav
          currentPath={currentPath}
          navigate={navigate}
          onOpenPerks={() => setPerksOpen(true)}
          onOpenGoals={() => setGoalsOpen(true)}
        />
      </div>

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
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
