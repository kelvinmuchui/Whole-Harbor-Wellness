import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';

interface MobileNavProps {
  currentPath: string;
  navigate: (path: string, param?: string) => void;
  onOpenPerks: () => void;
  onOpenGoals?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPath,
  navigate,
  onOpenPerks
}) => {
  const { isAdmin } = useAuth();
  const { totalVialsOrKits, setIsOpen: setCartOpen } = useCart();

  const isShopActive =
    currentPath === 'shop' || currentPath === 'home' || currentPath === 'product-detail';
  const isOrdersActive = currentPath === 'customer-portal';
  const isLearnActive = currentPath === 'learn';
  const isAdminActive = currentPath === 'admin';

  return (
    <nav
      className={`mobile-nav ${
        isAdmin ? 'has-admin grid-cols-6' : 'grid-cols-5'
      } md:hidden fixed bottom-0 left-0 right-0 z-40 h-[74px] pb-[calc(6px+env(safe-area-inset-bottom))] bg-[#fffdfb]/95 backdrop-blur-md border-t border-[#dfd7c7] grid items-center px-1.5 shadow-[0_-8px_28px_rgba(12,35,64,0.08)] select-none`}
      aria-label="Mobile bottom navigation"
    >
      {/* 1. Shop */}
      <button
        type="button"
        onClick={() => navigate('shop')}
        className={`min-h-[48px] flex flex-col items-center justify-center gap-1 text-[11px] font-semibold cursor-pointer transition-colors ${
          isShopActive ? 'active text-[#c5a059]' : 'text-[#5a6b7c] hover:text-[#0c2340]'
        }`}
      >
        <span className="font-serif text-[21px] leading-none">♔</span>
        <span>Shop</span>
      </button>

      {/* 2. Cart */}
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="relative min-h-[48px] flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-[#5a6b7c] hover:text-[#0c2340] cursor-pointer transition-colors"
      >
        <span className="relative inline-flex items-center justify-center font-serif text-[21px] leading-none">
          ♧
          {totalVialsOrKits > 0 && (
            <b className="not-italic font-bold absolute -top-1.5 -right-3.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#c5a059] text-white font-sans text-[10px] flex items-center justify-center leading-none shadow-xs">
              {totalVialsOrKits}
            </b>
          )}
        </span>
        <span>Cart</span>
      </button>

      {/* 3. Perks */}
      <button
        type="button"
        onClick={onOpenPerks}
        className="min-h-[48px] flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-[#5a6b7c] hover:text-[#0c2340] cursor-pointer transition-colors"
      >
        <span className="font-serif text-[21px] leading-none">◇</span>
        <span>Perks</span>
      </button>

      {/* 4. Orders */}
      <button
        type="button"
        onClick={() => navigate('customer-portal')}
        className={`min-h-[48px] flex flex-col items-center justify-center gap-1 text-[11px] font-semibold cursor-pointer transition-colors ${
          isOrdersActive ? 'active text-[#c5a059]' : 'text-[#5a6b7c] hover:text-[#0c2340]'
        }`}
      >
        <span className="font-serif text-[21px] leading-none">□</span>
        <span>Orders</span>
      </button>

      {/* 5. Learn */}
      <button
        type="button"
        onClick={() => navigate('learn')}
        className={`min-h-[48px] flex flex-col items-center justify-center gap-1 text-[11px] font-semibold cursor-pointer transition-colors ${
          isLearnActive ? 'active text-[#c5a059]' : 'text-[#5a6b7c] hover:text-[#0c2340]'
        }`}
      >
        <span className="font-serif text-[21px] leading-none">▤</span>
        <span>Learn</span>
      </button>

      {/* 6. Admin (only when signed in as Admin) */}
      {isAdmin && (
        <button
          type="button"
          onClick={() => navigate('admin')}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 text-[11px] font-semibold cursor-pointer transition-colors ${
            isAdminActive ? 'active text-[#c5a059]' : 'text-[#5a6b7c] hover:text-[#0c2340]'
          }`}
        >
          <span className="text-[18px] leading-none">🔒</span>
          <span>Admin</span>
        </button>
      )}
    </nav>
  );
};

