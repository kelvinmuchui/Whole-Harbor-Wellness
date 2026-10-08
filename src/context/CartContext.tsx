import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductStrength, ReferralSession } from '../types/index.ts';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, strength: ProductStrength, quantity?: number) => void;
  updateQuantity: (productId: string, strengthLabel: string, delta: number) => void;
  removeFromCart: (productId: string, strengthLabel: string) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  // Volume and Referral Calculations
  totalVialsOrKits: number;
  subtotal: number;
  volumeDiscountRate: number;
  volumeDiscount: number;
  partnerDiscountRate: number;
  partnerDiscount: number;
  shipping: number;
  tax: number;
  total: number;
  finalTotal: number;
  volumeDiscountPercentage: number;
  // Active Partner Attribution
  activeReferral: ReferralSession | null;
  setPartnerReferral: (partner: { id: string; slug: string; name: string; memberDiscountRate?: number; commissionRate?: number }) => void;
  setReferral: (referral: any) => void;
  clearReferral: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('wh_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Referral Session
  const [activeReferral, setActiveReferral] = useState<ReferralSession | null>(() => {
    try {
      const saved = localStorage.getItem('wh_active_referral');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Valid for 30 days
        if (Date.now() - parsed.timestamp < 30 * 24 * 60 * 60 * 1000) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('wh_cart_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (activeReferral) {
      localStorage.setItem('wh_active_referral', JSON.stringify(activeReferral));
      // Also set standard cookie for cross-session attribution window
      document.cookie = `wh_partner_ref=${encodeURIComponent(activeReferral.partnerSlug)}; max-age=${30 * 86400}; path=/; SameSite=Lax`;
    } else {
      localStorage.removeItem('wh_active_referral');
      document.cookie = 'wh_partner_ref=; max-age=0; path=/;';
    }
  }, [activeReferral]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const setPartnerReferral = (partner: { id: string; slug: string; name: string; memberDiscountRate?: number; commissionRate?: number }) => {
    const session: ReferralSession = {
      partnerId: partner.id,
      partnerSlug: partner.slug,
      partnerName: partner.name,
      discountRate: partner.memberDiscountRate || 0.15,
      commissionRate: partner.commissionRate || 0.25,
      timestamp: Date.now()
    };
    setActiveReferral(session);
    showToast(`VIP Benefit Activated: Partner ${partner.name}`);
  };

  const clearReferral = () => {
    setActiveReferral(null);
  };

  const addToCart = (product: Product, strength: ProductStrength, quantity = 1) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.productId === product.id && item.selectedStrength.label === strength.label
      );
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += quantity;
        return copy;
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          selectedStrength: strength,
          unitPrice: strength.price,
          quantity,
          imageUrl: product.imageUrl
        }
      ];
    });

    showToast(`Added to Cart: ${product.name} (${strength.label})`);
  };

  const updateQuantity = (productId: string, strengthLabel: string, delta: number) => {
    setItems(prev => {
      return prev
        .map(item => {
          if (item.productId === productId && item.selectedStrength.label === strengthLabel) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string, strengthLabel: string) => {
    setItems(prev => prev.filter(i => !(i.productId === productId && i.selectedStrength.label === strengthLabel)));
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calculations
  const totalVialsOrKits = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Volume Tier Discount
  let volumeDiscountRate = 0;
  if (totalVialsOrKits >= 6) {
    volumeDiscountRate = 0.10; // 10% for 6+ kits
  } else if (totalVialsOrKits >= 4) {
    volumeDiscountRate = 0.08; // 8% for 4-5 kits
  } else if (totalVialsOrKits >= 2) {
    volumeDiscountRate = 0.05; // 5% for 2-3 kits
  }
  const volumeDiscount = Number((subtotal * volumeDiscountRate).toFixed(2));

  // Partner VIP member discount
  const partnerDiscountRate = activeReferral?.discountRate || 0;
  const partnerDiscount = Number(((subtotal - volumeDiscount) * partnerDiscountRate).toFixed(2));

  // Free Cold-Chain shipping for orders $500+ or if subtotal is 0
  const afterDiscount = subtotal - volumeDiscount - partnerDiscount;
  const shipping = afterDiscount >= 500 || items.length === 0 ? 0 : 15.00;

  // Approximate 8.25% sales tax on tangible formulations
  const taxableAmount = Math.max(0, afterDiscount);
  const tax = Number((taxableAmount * 0.0825).toFixed(2));
  const total = Number((taxableAmount + shipping + tax).toFixed(2));

  const setReferral = (refData: any) => {
    const partnerId = refData.partnerId || refData.id;
    const partnerSlug = refData.partnerSlug || refData.slug;
    const partnerName = refData.partnerName || refData.name;
    const discountRate = refData.discountRate || refData.memberDiscountRate || 0.15;
    const commissionRate = refData.commissionRate || 0.25;
    const session: ReferralSession = {
      partnerId,
      partnerSlug,
      partnerName,
      discountRate,
      commissionRate,
      timestamp: Date.now()
    };
    setActiveReferral(session);
    showToast(`VIP Benefit Activated: Partner ${partnerName}`);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isOpen,
        setIsOpen,
        toastMessage,
        showToast,
        totalVialsOrKits,
        subtotal,
        volumeDiscountRate,
        volumeDiscount,
        volumeDiscountPercentage: Math.round(volumeDiscountRate * 100),
        partnerDiscountRate,
        partnerDiscount,
        shipping,
        tax,
        total,
        finalTotal: total,
        activeReferral,
        setPartnerReferral,
        setReferral,
        clearReferral
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
