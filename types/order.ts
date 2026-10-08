/**
 * Orders & Fulfillment Type Definitions
 */

import { ProductStrength } from './product.ts';

export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'REFUNDED';

export type PaymentStatus = 
  | 'PENDING' 
  | 'AUTHORIZED' 
  | 'PAID' 
  | 'FAILED' 
  | 'REFUNDED';

export type CommissionStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  productSlug: string;
  selectedStrength: ProductStrength;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. WH-ORD-2026-8921
  customerId?: string;
  customerUid?: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  volumeDiscount: number;
  partnerDiscount: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  
  // Partner Referral Attribution
  partnerId?: string;
  partnerSlug?: string;
  partnerName?: string;
  referralSource?: string;
  partnerCommission?: number;
  commissionStatus?: CommissionStatus;
  
  // Cold-Chain Logistics
  trackingNumber?: string;
  coldChainLogged?: boolean;
  createdAt: string;
  updatedAt?: string;
}
