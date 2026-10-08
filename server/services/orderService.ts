/**
 * WHOLE HARBOR WELLNESS — ORDER CALCULATION & PRICING SERVICE
 * Implements multi-tier volume savings and cold-chain shipping rules
 */

import { VOLUME_DISCOUNT_TIERS, ORDER_CONSTANTS } from '../../config/constants.ts';
import { CartItem } from '../../types/order.ts';

/**
 * Computes tiered volume discount based on total kits in cart
 * 2-3 kits: 5% off
 * 4-5 kits: 8% off
 * 6+ kits: 12% off
 */
export function calculateVolumeDiscount(items: CartItem[]): {
  totalKits: number;
  discountRate: number;
  discountAmount: number;
} {
  const totalKits = items.reduce((sum, it) => sum + it.quantity, 0);
  const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);

  let discountRate = 0;
  for (const tier of VOLUME_DISCOUNT_TIERS) {
    if (totalKits >= tier.minKits) {
      discountRate = tier.discountRate;
      break;
    }
  }

  const discountAmount = Number((subtotal * discountRate).toFixed(2));
  return {
    totalKits,
    discountRate,
    discountAmount
  };
}

/**
 * Computes final financial breakdown for checkout
 */
export function calculateOrderTotals(
  items: CartItem[], 
  partnerDiscountRate = 0
): {
  subtotal: number;
  volumeDiscount: number;
  partnerDiscount: number;
  shipping: number;
  tax: number;
  total: number;
} {
  const subtotal = Number(items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0).toFixed(2));
  const { discountAmount: volumeDiscount } = calculateVolumeDiscount(items);

  const taxableSubtotal = Math.max(0, subtotal - volumeDiscount);
  const partnerDiscount = Number((taxableSubtotal * partnerDiscountRate).toFixed(2));

  const netOrderAmount = Math.max(0, taxableSubtotal - partnerDiscount);
  
  // Cold-Chain Express Shipping ($0 if over $500 threshold or empty)
  const shipping = netOrderAmount >= ORDER_CONSTANTS.FREE_SHIPPING_THRESHOLD || items.length === 0
    ? 0.00
    : ORDER_CONSTANTS.STANDARD_COLD_CHAIN_SHIPPING_FEE;

  // Approximate 8.25% sales tax on tangible products
  const tax = Number((netOrderAmount * ORDER_CONSTANTS.ESTIMATED_TAX_RATE).toFixed(2));
  const total = Number((netOrderAmount + shipping + tax).toFixed(2));

  return {
    subtotal,
    volumeDiscount,
    partnerDiscount,
    shipping,
    tax,
    total
  };
}
