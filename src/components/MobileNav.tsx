import React from 'react';
import { useCart } from '../context/CartContext.tsx';

interface MobileNavProps {
  currentPath: string;
  navigate: (path: string, param?: string) => void;
  onOpenPerks: () => void;
  onOpenGoals: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPath,
  navigate,
  onOpenPerks
}) => {
  const { totalVialsOrKits, setIsOpen: setCartOpen } = useCart();

  const isShopActive = currentPath === 'shop' || currentPath === 'home' || currentPath === 'product-detail';
  const isLearnActive = currentPath === 'learn';
  const isOrdersActive = currentPath === 'customer-portal';

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-[68px] pb-[calc(6px+env(safe-area-inset-bottom))] bg-[#fffdfb]/95 backdrop-blur-md border-t border-[#dfd7c7] grid grid-cols-5 items-center px-1 shadow-lg select-none"
      aria-label="Mobile navigation"
    >
      {/* Shop */}
      <button
        onClick={() => navigate('shop')}
        className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold cursor-pointer transition-colors ${
          isShopActive ? 'text-[#c5a059]' : 'text-[#5a6b7c] hover:text-[#0c2340]'
        }`}
      >
        <span className="font-serif text-lg leading-none">✦</span>
        <span>Shop</span>
      </button>

      {/* Cart */}
      <button
        onClick={() => setCartOpen(true)}
        className="relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-[#5a6b7c] hover:text-[#0c2340] cursor-pointer transition-colors"
      >
        <span className="font-serif text-lg leading-none">♧</span>
        <span>Cart</span>
        {totalVialsOrKits > 0 && (
          <i className="not-italic absolute top-0.5 right-3 min-w-4 h-4 px-1 rounded-full bg-[#c5a059] text-white text-[9px] font-bold flex items-center justify-center">
            {totalVialsOrKits}
          </i>
        )}
      </button>

      {/* Perks */}
      <button
        onClick={onOpenPerks}
        className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-[#5a6b7c] hover:text-[#0c2340] cursor-pointer transition-colors"
      >
        <span className="font-serif text-lg leading-none">◇</span>
        <span>Perks</span>
      </button>

      {/* Orders */}
      <button
        onClick={() => navigate('customer-portal')}
        className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold cursor-pointer transition-colors ${
          isOrdersActive ? 'text-[#c5a059]' : 'text-[#5a6b7c] hover:text-[#0c2340]'
        }`}
      >
        <span className="font-serif text-lg leading-none">□</span>
        <span>Orders</span>
      </button>

      {/* Learn */}
      <button
        onClick={() => navigate('learn')}
        className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold cursor-pointer transition-colors ${
          isLearnActive ? 'text-[#c5a059]' : 'text-[#5a6b7c] hover:text-[#0c2340]'
        }`}
      >
        <span className="font-serif text-lg leading-none">▤</span>
        <span>Learn</span>
      </button>
    </nav>
  );
};
