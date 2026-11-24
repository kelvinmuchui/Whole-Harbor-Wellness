import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductStrength, ReferralSession } from '../types/index.ts';
import { analyticsService } from '../services/analyticsService.ts';
import { calculateOrderTotals, calculateVolumeDiscount } from '../../server/services/orderService.ts';

function readUrlReferralSource(): string | undefined {
  try {
    const hashPart = window.location.hash.split('?')[1] || '';
    const hashParams = new URLSearchParams(hashPart);
    const searchParams = new URLSearchParams(window.location.search);
    const src =
      hashParams.get('src') ||
      hashParams.get('utm_source') ||
      searchParams.get('src') ||
      searchParams.get('utm_source');
    return src ? src.slice(0, 64) : undefined;
  } catch {
    return undefined;
  }
}

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
    const syncReferralCookie = () => {
      let allowsAttributionCookie = true;
      try {
        const rawConsent = localStorage.getItem('whw_cookie_consent_v1');
        if (rawConsent) {
          const parsed = JSON.parse(rawConsent) as { mode?: 'all' | 'essential' };
          allowsAttributionCookie = parsed.mode !== 'essential';
        }
      } catch {
        allowsAttributionCookie = true;
      }

      if (activeReferral) {
        localStorage.setItem('wh_active_referral', JSON.stringify(activeReferral));
        if (allowsAttributionCookie) {
          document.cookie = `wh_partner_ref=${encodeURIComponent(activeReferral.partnerSlug)}; max-age=${30 * 86400}; path=/; SameSite=Lax`;
        } else {
          document.cookie = 'wh_partner_ref=; max-age=0; path=/;';
        }
      } else {
        localStorage.removeItem('wh_active_referral');
        document.cookie = 'wh_partner_ref=; max-age=0; path=/;';
      }
    };

    syncReferralCookie();
    window.addEventListener('whw-cookie-consent-changed', syncReferralCookie);
    return () => window.removeEventListener('whw-cookie-consent-changed', syncReferralCookie);
  }, [activeReferral]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const setPartnerReferral = (partner: { id: string; slug: string; name: string; memberDiscountRate?: number; commissionRate?: number; referralSource?: string }) => {
    const session: ReferralSession = {
      partnerId: partner.id,
      partnerSlug: partner.slug,
      partnerName: partner.name,
      discountRate: partner.memberDiscountRate || 0.15,
      commissionRate: partner.commissionRate || 0.25,
      referralSource: partner.referralSource || readUrlReferralSource() || 'partner-direct-link',
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

    analyticsService.trackAddToCart(product.name, strength.price * quantity, activeReferral?.partnerSlug);
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

  // Keep the cart and persisted order breakdown on the same pricing rules.
  const totalVialsOrKits = items.reduce((sum, item) => sum + item.quantity, 0);
  const partnerDiscountRate = activeReferral?.discountRate || 0;
  const { discountRate: volumeDiscountRate } = calculateVolumeDiscount(items);
  const { subtotal, volumeDiscount, partnerDiscount, shipping, tax, total } =
    calculateOrderTotals(items, partnerDiscountRate);

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
      referralSource: refData.referralSource || readUrlReferralSource() || 'partner-landing',
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
