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
        <aside aria-label="Partner Referral Banner" className="w-full bg-[#c5a059] text-[#fffdfb] px-4 py-2 text-xs font-medium flex items-center justify-between z-50">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#dfd7c7]">verified</span>
              <span>
                Referred by <strong className="underline cursor-pointer" onClick={() => navigate('partner-page', activeReferral.partnerSlug)}>{activeReferral.partnerName}</strong> — VIP Member Discount ({(activeReferral.discountRate * 100).toFixed(0)}% Off) applied at checkout.
              </span>
            </div>
            <button
              onClick={clearReferral}
              className="text-[#dfd7c7] hover:text-white underline text-[11px] uppercase tracking-wider ml-4 cursor-pointer"
            >
              Clear Referral
            </button>
          </div>
        </aside>
      )}

      {/* Main Navigation Header */}
      <header className="sticky top-0 left-0 w-full z-40 bg-[#fffdfb]/95 backdrop-blur-md shadow-[0_1px_8px_rgba(41,35,31,0.04)] border-b border-[#dfd7c7]/40 transition-all">
        <div className="h-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Zone */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('home')} 
              className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
            >
              {/* Circular Whole Harbor Monogram Logo */}
              <div className="w-11 h-11 rounded-full border border-[#c5a059]/50 overflow-hidden bg-white shadow-xs transition-transform group-hover:scale-105 shrink-0 flex items-center justify-center">
                <img
                  src="/images/whw-logo.png"
                  alt="Whole Harbor Wellness Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl text-[#0c2340] tracking-tight font-semibold leading-none group-hover:text-[#c5a059] transition-colors">
                  Whole Harbor
                </span>
                <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#c5a059] font-bold mt-1">
                  Wellness
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1 p-1 bg-[#f6f4ee]/70 rounded-full">
              {navLinks.map(link => {
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#c5a059] text-[#fffdfb] shadow-xs' 
                        : 'text-[#5a6b7c] hover:text-[#0c2340] hover:bg-[#dfd7c7]/40'
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
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#5a6b7c] hover:text-[#0c2340] hover:bg-[#f6f4ee] transition-colors cursor-pointer"
                title="Explore products by wellness goal"
              >
                <span className="material-symbols-outlined text-[16px] text-[#c5a059]">tune</span>
                <span>By Goal</span>
              </button>
            )}

            {/* WHW Perks */}
            {onOpenPerks && (
              <button
                onClick={onOpenPerks}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#c5a059] bg-[#c5a059]/10 hover:bg-[#c5a059]/20 transition-colors cursor-pointer"
                title="Member Perks & Savings"
              >
                <span className="font-serif text-sm">✦</span>
                <span>Perks</span>
              </button>
            )}

            {/* Search Button */}
            <button
              onClick={onOpenSearch}
              aria-label="Search catalog"
              className="w-10 h-10 flex items-center justify-center rounded-full text-[#5a6b7c] hover:text-[#0c2340] hover:bg-[#f6f4ee] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            {/* Partner Portal Shortcut */}
            <button
              onClick={() => navigate('partner-portal')}
              className={`hidden md:inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                currentPath === 'partner-portal'
                  ? 'bg-[#c5a059] text-[#fffdfb]'
                  : 'text-[#5a6b7c] hover:text-[#0c2340] hover:bg-[#f6f4ee]'
              }`}
            >
              Partner Portal
            </button>

            {/* Shopping Bag Button */}
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Shopping Cart"
              className="relative w-10 h-10 flex items-center justify-center rounded-full text-[#5a6b7c] hover:text-[#0c2340] hover:bg-[#f6f4ee] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              {totalVialsOrKits > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-5 h-5 px-1 rounded-full bg-[#c5a059] text-[#fffdfb] text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in">
                  {totalVialsOrKits}
                </span>
              )}
            </button>

            {/* Account / Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-[#f6f4ee] transition-colors cursor-pointer focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-[#c5a059] text-[#fffdfb] flex items-center justify-center text-xs font-semibold uppercase">
                  {currentUser ? currentUser.displayName.slice(0, 1) : 'G'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#0c2340] leading-tight">
                    {currentUser ? currentUser.displayName.split(' ')[0] : 'Account'}
                  </span>
                  <span className="text-[10px] font-medium text-[#5a6b7c] uppercase tracking-wider">
                    {role}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-[#5a6b7c]">expand_more</span>
              </button>

              {/* Dropdown Menu */}
              {accountMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#fffdfb] border border-[#dfd7c7] shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setAccountMenuOpen(false)}
                >
                  <div className="pb-2 mb-2 border-b border-[#dfd7c7]/50">
                    <p className="text-xs font-semibold text-[#0c2340] truncate">
                      {currentUser?.displayName || 'Guest Visitor'}
                    </p>
                    <p className="text-[11px] text-[#5a6b7c] truncate">
                      {currentUser?.email || 'Not signed in'}
                    </p>
                    <div className="mt-1.5 inline-block px-2 py-0.5 rounded-md bg-[#dfd7c7] text-[#c5a059] text-[10px] font-semibold uppercase tracking-wider">
                      Role: {role}
                    </div>
                  </div>

                  {/* Navigation Targets */}
                  <div className="space-y-1 py-1">
                    <button
                      onClick={() => { navigate('customer-portal'); setAccountMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#0c2340] hover:bg-[#f6f4ee] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#c5a059]">local_shipping</span>
                      <span>My Orders &amp; Tracking</span>
                    </button>
                    {onOpenGoals && (
                      <button
                        onClick={() => { onOpenGoals(); setAccountMenuOpen(false); }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#0c2340] hover:bg-[#f6f4ee] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#c5a059]">tune</span>
                        <span>Shop by Wellness Goal</span>
                      </button>
                    )}
                    {onOpenPerks && (
                      <button
                        onClick={() => { onOpenPerks(); setAccountMenuOpen(false); }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#c5a059] hover:bg-[#f6f4ee] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <span className="font-serif text-sm">✦</span>
                        <span>Member Perks &amp; Savings</span>
                      </button>
                    )}
                    <button
                      onClick={() => { navigate('partner-portal'); setAccountMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#0c2340] hover:bg-[#f6f4ee] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#c5a059]">dashboard</span>
                      <span>Partner Portal</span>
                    </button>
                    <button
                      onClick={() => { navigate('admin'); setAccountMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#0c2340] hover:bg-[#f6f4ee] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#c5a059]">admin_panel_settings</span>
                      <span>Admin Control Center</span>
                    </button>
                    <button
                      onClick={() => { navigate('architecture'); setAccountMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#5a6b7c] hover:bg-[#f6f4ee] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#c5a059]">schema</span>
                      <span>Module 1 Architecture Specs</span>
                    </button>
                  </div>

                  {/* Role Simulator Switcher */}
                  <div className="pt-2 mt-2 border-t border-[#dfd7c7]/50">
                    <p className="text-[10px] uppercase font-semibold text-[#5a6b7c] tracking-wider mb-1 px-1">
                      Quick Switch Persona
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <button
                        onClick={() => { switchRole('CUSTOMER'); setAccountMenuOpen(false); }}
                        className={`px-2 py-1 rounded text-left ${role === 'CUSTOMER' ? 'bg-[#c5a059] text-white font-semibold' : 'hover:bg-[#f6f4ee]'}`}
                      >
                        Customer
                      </button>
                      <button
                        onClick={() => { switchRole('PARTNER_OWNER'); setAccountMenuOpen(false); }}
                        className={`px-2 py-1 rounded text-left ${role === 'PARTNER_OWNER' ? 'bg-[#c5a059] text-white font-semibold' : 'hover:bg-[#f6f4ee]'}`}
                      >
                        Partner
                      </button>
                      <button
                        onClick={() => { switchRole('ADMIN'); setAccountMenuOpen(false); }}
                        className={`px-2 py-1 rounded text-left ${role === 'ADMIN' ? 'bg-[#c5a059] text-white font-semibold' : 'hover:bg-[#f6f4ee]'}`}
                      >
                        Admin
                      </button>
                      <button
                        onClick={() => { switchRole('SALES_ADMIN'); setAccountMenuOpen(false); }}
                        className={`px-2 py-1 rounded text-left ${role === 'SALES_ADMIN' ? 'bg-[#c5a059] text-white font-semibold' : 'hover:bg-[#f6f4ee]'}`}
                      >
                        Sales Admin
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-[#dfd7c7]/50">
                    <button
                      onClick={() => { logout(); setAccountMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#c5a059] hover:bg-[#f6f4ee] rounded-lg transition-colors cursor-pointer"
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
              className="xl:hidden w-10 h-10 flex items-center justify-center rounded-full text-[#5a6b7c] hover:text-[#0c2340] hover:bg-[#f6f4ee] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-[#dfd7c7]/50 bg-[#fffdfb] px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider ${
                  currentPath === link.path
                    ? 'bg-[#c5a059] text-[#fffdfb]'
                    : 'text-[#0c2340] hover:bg-[#f6f4ee]'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 border-t border-[#dfd7c7]/40 flex flex-col gap-2">
              <button
                onClick={() => { navigate('partner-portal'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider bg-[#f6f4ee] text-[#c5a059]"
              >
                Partner Portal
              </button>
              <button
                onClick={() => { navigate('customer-portal'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider bg-[#f6f4ee] text-[#c5a059]"
              >
                Customer Orders &amp; Account
              </button>
              <button
                onClick={() => { navigate('admin'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider bg-[#f6f4ee] text-[#c5a059]"
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
