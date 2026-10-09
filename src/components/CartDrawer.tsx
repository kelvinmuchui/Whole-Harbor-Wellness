import React from 'react';
import { useCart } from '../context/CartContext.tsx';

interface CartDrawerProps {
  onOpenCheckout: () => void;
  navigate: (path: string, param?: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout, navigate }) => {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    volumeDiscount,
    partnerDiscount,
    shipping,
    tax,
    finalTotal,
    totalVialsOrKits,
    volumeDiscountPercentage,
    activeReferral
  } = useCart();

  if (!isOpen) return null;

  // Calculate next tier savings milestone
  let nextTierMessage = '';
  if (totalVialsOrKits < 2) {
    nextTierMessage = `Add ${2 - totalVialsOrKits} more item to unlock 5% volume savings!`;
  } else if (totalVialsOrKits < 4) {
    nextTierMessage = `Add ${4 - totalVialsOrKits} more items to unlock 8% volume savings!`;
  } else if (totalVialsOrKits < 6) {
    nextTierMessage = `Add ${6 - totalVialsOrKits} more items to unlock 12% maximum volume savings!`;
  } else {
    nextTierMessage = `Maximum volume savings unlocked (12% off applied)!`;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0c2340]/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#fffdfb] shadow-2xl flex flex-col border-l border-[#dfd7c7]">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#dfd7c7]/60 flex items-center justify-between bg-[#f6f4ee]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c5a059] text-[22px]">shopping_bag</span>
              <h2 className="font-serif text-lg font-semibold text-[#0c2340]">
                Your Wellness Protocol
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#c5a059] text-[#fffdfb] font-bold">
                {items.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#5a6b7c] hover:text-[#0c2340] hover:bg-[#dfd7c7]/50 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Volume Savings Banner */}
          <div className="bg-[#c5a059]/10 px-6 py-3 border-b border-[#5a6b7c]/20">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-[#c5a059]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">percent</span>
                Tier Savings Level: {volumeDiscountPercentage}%
              </span>
              <span className="text-[11px] font-semibold text-[#c5a059]">
                {totalVialsOrKits} Items In Cart
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-[#f6f4ee] h-2 rounded-full overflow-hidden border border-[#dfd7c7]">
              <div 
                className="bg-[#c5a059] h-full transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, (totalVialsOrKits / 6) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-[#5a6b7c] mt-1.5">{nextTierMessage}</p>
          </div>

          {/* Partner Referral Notice */}
          {activeReferral && (
            <div className="bg-[#5a6b7c]/15 px-6 py-2 border-b border-[#5a6b7c]/30 flex items-center justify-between text-xs text-[#c5a059]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#c5a059]">verified</span>
                <span>Partner VIP Discount: <strong>-{(activeReferral.discountRate * 100).toFixed(0)}%</strong></span>
              </div>
              <span className="font-serif text-[11px] text-[#c5a059]">{activeReferral.partnerName}</span>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#dfd7c7]/50">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-[#5a6b7c]">
                <div className="w-16 h-16 rounded-full bg-[#f6f4ee] flex items-center justify-center text-[#5a6b7c] mb-4">
                  <span className="material-symbols-outlined text-[32px]">science</span>
                </div>
                <h3 className="font-serif text-lg text-[#0c2340] mb-1">Your Protocol is Empty</h3>
                <p className="text-xs max-w-xs text-[#5a6b7c] mb-6">
                  Select metabolic kits or physician-guided longevity formulations from our catalog.
                </p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('shop');
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#c5a059] text-[#fffdfb] text-xs uppercase tracking-wider font-semibold hover:bg-[#0c2340] transition-colors cursor-pointer"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.productId}-${item.selectedStrength.label}`} className="py-4 flex gap-4">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-20 h-20 rounded-xl object-cover bg-[#f6f4ee] border border-[#dfd7c7] shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-serif font-medium text-[#0c2340] truncate">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.selectedStrength.label)}
                          className="text-[#5a6b7c] hover:text-[#c5a059] transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-[#f6f4ee] text-[#c5a059]">
                          {item.selectedStrength.label}
                        </span>
                        {item.selectedStrength.vialsCount > 1 && (
                          <span className="text-[10px] text-[#5a6b7c]">
                            ${(item.unitPrice / item.selectedStrength.vialsCount).toFixed(0)} / vial
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#dfd7c7]/30">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-[#dfd7c7] rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.selectedStrength.label, item.quantity - 1)}
                          className="px-2.5 py-1 text-xs text-[#5a6b7c] hover:bg-[#f6f4ee] transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-1 text-xs font-semibold text-[#0c2340]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.selectedStrength.label, item.quantity + 1)}
                          className="px-2.5 py-1 text-xs text-[#5a6b7c] hover:bg-[#f6f4ee] transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-semibold text-[#0c2340]">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="border-t border-[#dfd7c7] bg-[#f6f4ee]/70 p-6 space-y-3">
              <div className="space-y-1.5 text-xs text-[#5a6b7c]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#0c2340]">${subtotal.toFixed(2)}</span>
                </div>
                
                {volumeDiscount > 0 && (
                  <div className="flex justify-between text-[#c5a059] font-medium">
                    <span>Volume Discount ({volumeDiscountPercentage}%)</span>
                    <span>-${volumeDiscount.toFixed(2)}</span>
                  </div>
                )}

                {partnerDiscount > 0 && (
                  <div className="flex justify-between text-[#c5a059] font-medium">
                    <span>Partner Referral Discount</span>
                    <span>-${partnerDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <span>Cold-Chain Shipping</span>
                    <span className="material-symbols-outlined text-[13px] text-[#c5a059]" title="Refrigerated insulated express">ac_unit</span>
                  </span>
                  <span>{shipping === 0 ? <strong className="text-[#c5a059]">FREE</strong> : `$${shipping.toFixed(2)}`}</span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-[#dfd7c7] flex justify-between text-base font-serif font-bold text-[#0c2340]">
                  <span>Total Investment</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenCheckout();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#c5a059] text-[#fffdfb] text-xs font-semibold uppercase tracking-widest hover:bg-[#0c2340] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span>Proceed to Clinical Checkout</span>
                </button>
              </div>

              <p className="text-[10px] text-center text-[#5a6b7c] leading-tight">
                Dispatched with cold-chain refrigerated pack &amp; verified Certificate of Analysis (CoA).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
