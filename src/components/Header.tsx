import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { UserRole } from '../types/index.ts';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string, param?: string) => void;
  onOpenSearch: () => void;
  onOpenGoals?: () => void;
  onOpenPerks?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate, onOpenSearch, onOpenGoals, onOpenPerks }) => {
  const { currentUser, role, switchRole, logout } = useAuth();
  const { totalVialsOrKits, setIsOpen, activeReferral, clearReferral } = useCart();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Shop', path: 'shop' },
    { label: 'Learn', path: 'learn' },
    { label: 'Wellness Programs', path: 'wellness-programs' },
    { label: 'Partners', path: 'partners' },
    { label: 'Approach', path: 'approach' },
    { label: 'About', path: 'about' }
  ];

  return (
    <>
      {/* Active Partner Referral Banner */}
      {activeReferral && (
        <aside aria-label="Partner Referral Banner" className="w-full bg-[#b87572] text-[#fffdfb] px-4 py-2 text-xs font-medium flex items-center justify-between z-50">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#ead2ce]">verified</span>
              <span>
                Referred by <strong className="underline cursor-pointer" onClick={() => navigate('partner-page', activeReferral.partnerSlug)}>{activeReferral.partnerName}</strong> — VIP Member Discount ({(activeReferral.discountRate * 100).toFixed(0)}% Off) applied at checkout.
              </span>
            </div>
            <button
              onClick={clearReferral}
              className="text-[#ead2ce] hover:text-white underline text-[11px] uppercase tracking-wider ml-4 cursor-pointer"
            >
              Clear Referral
            </button>
          </div>
        </aside>
      )}

      {/* Main Navigation Header */}
      <header className="sticky top-0 left-0 w-full z-40 bg-[#fffdfb]/95 backdrop-blur-md shadow-[0_1px_8px_rgba(41,35,31,0.04)] border-b border-[#ead2ce]/40 transition-all">
        <div className="h-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Zone */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('home')} 
              className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
            >
              {/* Circular Whole Harbor Monogram Logo */}
              <div className="w-10 h-10 rounded-full border border-[#b87572]/40 flex items-center justify-center bg-[#fff6f3] text-[#b87572] transition-transform group-hover:scale-105 shrink-0">
                <span className="material-symbols-outlined text-[20px]">spa</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl text-[#b87572] tracking-tight font-medium leading-none">
                  Whole Harbor
                </span>
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#7c6b69] font-semibold mt-1">
                  Wellness &amp; Health
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1 p-1 bg-[#fff6f3]/70 rounded-full">
              {navLinks.map(link => {
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#b87572] text-[#fffdfb] shadow-xs' 
                        : 'text-[#7c6b69] hover:text-[#744241] hover:bg-[#ead2ce]/40'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Explore by Goal */}
            {onOpenGoals && (
              <button
                onClick={onOpenGoals}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#7c6b69] hover:text-[#744241] hover:bg-[#fff6f3] transition-colors cursor-pointer"
                title="Explore products by wellness goal"
              >
                <span className="material-symbols-outlined text-[16px] text-[#b87572]">tune</span>
                <span>By Goal</span>
              </button>
            )}

            {/* WHW Perks */}
            {onOpenPerks && (
              <button
                onClick={onOpenPerks}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#b87572] bg-[#b87572]/10 hover:bg-[#b87572]/20 transition-colors cursor-pointer"
                title="Member Perks & Savings"
              >
                <span className="font-serif text-sm">♕</span>
                <span>Perks</span>
              </button>
            )}

            {/* Search Button */}
            <button
              onClick={onOpenSearch}
              aria-label="Search catalog"
              className="w-10 h-10 flex items-center justify-center rounded-full text-[#7c6b69] hover:text-[#744241] hover:bg-[#fff6f3] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            {/* Partner Portal Shortcut */}
            <button
              onClick={() => navigate('partner-portal')}
              className={`hidden md:inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                currentPath === 'partner-portal'
                  ? 'bg-[#b87572] text-[#fffdfb]'
                  : 'text-[#7c6b69] hover:text-[#744241] hover:bg-[#fff6f3]'
              }`}
            >
              Partner Portal
            </button>

            {/* Shopping Bag Button */}
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Shopping Cart"
              className="relative w-10 h-10 flex items-center justify-center rounded-full text-[#7c6b69] hover:text-[#744241] hover:bg-[#fff6f3] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              {totalVialsOrKits > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-5 h-5 px-1 rounded-full bg-[#b87572] text-[#fffdfb] text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in">
                  {totalVialsOrKits}
                </span>
              )}
            </button>

            {/* Account / Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-[#fff6f3] transition-colors cursor-pointer focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-[#b87572] text-[#fffdfb] flex items-center justify-center text-xs font-semibold uppercase">
                  {currentUser ? currentUser.displayName.slice(0, 1) : 'G'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#744241] leading-tight">
                    {currentUser ? currentUser.displayName.split(' ')[0] : 'Account'}
                  </span>
                  <span className="text-[10px] font-medium text-[#7c6b69] uppercase tracking-wider">
                    {role}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-[#7c6b69]">expand_more</span>
              </button>

              {/* Dropdown Menu */}
              {accountMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#fffdfb] border border-[#ead2ce] shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setAccountMenuOpen(false)}
                >
                  <div className="pb-2 mb-2 border-b border-[#ead2ce]/50">
                    <p className="text-xs font-semibold text-[#744241] truncate">
                      {currentUser?.displayName || 'Guest Visitor'}
                    </p>
                    <p className="text-[11px] text-[#7c6b69] truncate">
                      {currentUser?.email || 'Not signed in'}
                    </p>
                    <div className="mt-1.5 inline-block px-2 py-0.5 rounded-md bg-[#ead2ce] text-[#b87572] text-[10px] font-semibold uppercase tracking-wider">
                      Role: {role}
                    </div>
                  </div>

                  {/* Navigation Targets */}
                  <div className="space-y-1 py-1">
                    <button
                      onClick={() => { navigate('customer-portal'); setAccountMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#744241] hover:bg-[#fff6f3] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#b87572]">local_shipping</span>
                      <span>My Orders &amp; Tracking</span>
                    </button>
                    {onOpenGoals && (
                      <button
                        onClick={() => { onOpenGoals(); setAccountMenuOpen(false); }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#744241] hover:bg-[#fff6f3] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#b87572]">tune</span>
                        <span>Shop by Wellness Goal</span>
                      </button>
                    )}
                    {onOpenPerks && (
                      <button
                        onClick={() => { onOpenPerks(); setAccountMenuOpen(false); }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#b87572] hover:bg-[#fff6f3] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <span className="font-serif text-sm">♕</span>
                        <span>Member Perks &amp; Savings</span>
                      </button>
                    )}
                    <button
                      onClick={() => { navigate('partner-portal'); setAccountMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#744241] hover:bg-[#fff6f3] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#b87572]">dashboard</span>
                      <span>Partner Portal</span>
                    </button>
                    <button
                      onClick={() => { navigate('admin'); setAccountMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#744241] hover:bg-[#fff6f3] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#b87572]">admin_panel_settings</span>
                      <span>Admin Control Center</span>
                    </button>
                    <button
                      onClick={() => { navigate('architecture'); setAccountMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#7c6b69] hover:bg-[#fff6f3] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#b87572]">schema</span>
                      <span>Module 1 Architecture Specs</span>
                    </button>
                  </div>

                  {/* Role Simulator Switcher */}
                  <div className="pt-2 mt-2 border-t border-[#ead2ce]/50">
                    <p className="text-[10px] uppercase font-semibold text-[#7c6b69] tracking-wider mb-1 px-1">
                      Quick Switch Persona
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <button
                        onClick={() => { switchRole('CUSTOMER'); setAccountMenuOpen(false); }}
                        className={`px-2 py-1 rounded text-left ${role === 'CUSTOMER' ? 'bg-[#b87572] text-white font-semibold' : 'hover:bg-[#fff6f3]'}`}
                      >
                        Customer
                      </button>
                      <button
                        onClick={() => { switchRole('PARTNER_OWNER'); setAccountMenuOpen(false); }}
                        className={`px-2 py-1 rounded text-left ${role === 'PARTNER_OWNER' ? 'bg-[#b87572] text-white font-semibold' : 'hover:bg-[#fff6f3]'}`}
                      >
                        Partner
                      </button>
                      <button
                        onClick={() => { switchRole('ADMIN'); setAccountMenuOpen(false); }}
                        className={`px-2 py-1 rounded text-left ${role === 'ADMIN' ? 'bg-[#b87572] text-white font-semibold' : 'hover:bg-[#fff6f3]'}`}
                      >
                        Admin
                      </button>
                      <button
                        onClick={() => { switchRole('SALES_ADMIN'); setAccountMenuOpen(false); }}
                        className={`px-2 py-1 rounded text-left ${role === 'SALES_ADMIN' ? 'bg-[#b87572] text-white font-semibold' : 'hover:bg-[#fff6f3]'}`}
                      >
                        Sales Admin
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-[#ead2ce]/50">
                    <button
                      onClick={() => { logout(); setAccountMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#b87572] hover:bg-[#fff6f3] rounded-lg transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden w-10 h-10 flex items-center justify-center rounded-full text-[#7c6b69] hover:text-[#744241] hover:bg-[#fff6f3] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-[#ead2ce]/50 bg-[#fffdfb] px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider ${
                  currentPath === link.path
                    ? 'bg-[#b87572] text-[#fffdfb]'
                    : 'text-[#744241] hover:bg-[#fff6f3]'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 border-t border-[#ead2ce]/40 flex flex-col gap-2">
              <button
                onClick={() => { navigate('partner-portal'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider bg-[#fff6f3] text-[#b87572]"
              >
                Partner Portal
              </button>
              <button
                onClick={() => { navigate('customer-portal'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider bg-[#fff6f3] text-[#b87572]"
              >
                Customer Orders &amp; Account
              </button>
              <button
                onClick={() => { navigate('admin'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider bg-[#fff6f3] text-[#b87572]"
              >
                Admin Console
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
