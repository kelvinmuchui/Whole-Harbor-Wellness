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
        className="absolute inset-0 bg-[#744241]/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#fffdfb] shadow-2xl flex flex-col border-l border-[#ead2ce]">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#ead2ce]/60 flex items-center justify-between bg-[#fff6f3]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#b87572] text-[22px]">shopping_bag</span>
              <h2 className="font-serif text-lg font-semibold text-[#744241]">
                Your Wellness Protocol
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#b87572] text-[#fffdfb] font-bold">
                {items.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#7c6b69] hover:text-[#744241] hover:bg-[#ead2ce]/50 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Volume Savings Banner */}
          <div className="bg-[#b87572]/10 px-6 py-3 border-b border-[#7c6b69]/20">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-[#b87572]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">percent</span>
                Tier Savings Level: {volumeDiscountPercentage}%
              </span>
              <span className="text-[11px] font-semibold text-[#b87572]">
                {totalVialsOrKits} Items In Cart
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-[#fff6f3] h-2 rounded-full overflow-hidden border border-[#ead2ce]">
              <div 
                className="bg-[#b87572] h-full transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, (totalVialsOrKits / 6) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-[#7c6b69] mt-1.5">{nextTierMessage}</p>
          </div>

          {/* Partner Referral Notice */}
          {activeReferral && (
            <div className="bg-[#7c6b69]/15 px-6 py-2 border-b border-[#7c6b69]/30 flex items-center justify-between text-xs text-[#b87572]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#b87572]">verified</span>
                <span>Partner VIP Discount: <strong>-{(activeReferral.discountRate * 100).toFixed(0)}%</strong></span>
              </div>
              <span className="font-serif text-[11px] text-[#b87572]">{activeReferral.partnerName}</span>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#ead2ce]/50">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-[#7c6b69]">
                <div className="w-16 h-16 rounded-full bg-[#fff6f3] flex items-center justify-center text-[#7c6b69] mb-4">
                  <span className="material-symbols-outlined text-[32px]">science</span>
                </div>
                <h3 className="font-serif text-lg text-[#744241] mb-1">Your Protocol is Empty</h3>
                <p className="text-xs max-w-xs text-[#7c6b69] mb-6">
                  Select metabolic kits or physician-guided longevity formulations from our catalog.
                </p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('shop');
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#b87572] text-[#fffdfb] text-xs uppercase tracking-wider font-semibold hover:bg-[#744241] transition-colors cursor-pointer"
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
                    className="w-20 h-20 rounded-xl object-cover bg-[#fff6f3] border border-[#ead2ce] shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-serif font-medium text-[#744241] truncate">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.selectedStrength.label)}
                          className="text-[#7c6b69] hover:text-[#b87572] transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-[#fff6f3] text-[#b87572]">
                          {item.selectedStrength.label}
                        </span>
                        {item.selectedStrength.vialsCount > 1 && (
                          <span className="text-[10px] text-[#7c6b69]">
                            ${(item.unitPrice / item.selectedStrength.vialsCount).toFixed(0)} / vial
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#ead2ce]/30">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-[#ead2ce] rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.selectedStrength.label, item.quantity - 1)}
                          className="px-2.5 py-1 text-xs text-[#7c6b69] hover:bg-[#fff6f3] transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-1 text-xs font-semibold text-[#744241]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.selectedStrength.label, item.quantity + 1)}
                          className="px-2.5 py-1 text-xs text-[#7c6b69] hover:bg-[#fff6f3] transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-semibold text-[#744241]">
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
            <div className="border-t border-[#ead2ce] bg-[#fff6f3]/70 p-6 space-y-3">
              <div className="space-y-1.5 text-xs text-[#7c6b69]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#744241]">${subtotal.toFixed(2)}</span>
                </div>
                
                {volumeDiscount > 0 && (
                  <div className="flex justify-between text-[#b87572] font-medium">
                    <span>Volume Discount ({volumeDiscountPercentage}%)</span>
                    <span>-${volumeDiscount.toFixed(2)}</span>
                  </div>
                )}

                {partnerDiscount > 0 && (
                  <div className="flex justify-between text-[#b87572] font-medium">
                    <span>Partner Referral Discount</span>
                    <span>-${partnerDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <span>Cold-Chain Shipping</span>
                    <span className="material-symbols-outlined text-[13px] text-[#b87572]" title="Refrigerated insulated express">ac_unit</span>
                  </span>
                  <span>{shipping === 0 ? <strong className="text-[#b87572]">FREE</strong> : `$${shipping.toFixed(2)}`}</span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-[#ead2ce] flex justify-between text-base font-serif font-bold text-[#744241]">
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
                  className="w-full py-3.5 px-4 rounded-xl bg-[#b87572] text-[#fffdfb] text-xs font-semibold uppercase tracking-widest hover:bg-[#744241] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span>Proceed to Clinical Checkout</span>
                </button>
              </div>

              <p className="text-[10px] text-center text-[#7c6b69] leading-tight">
                Dispatched with cold-chain refrigerated pack &amp; verified Certificate of Analysis (CoA).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
